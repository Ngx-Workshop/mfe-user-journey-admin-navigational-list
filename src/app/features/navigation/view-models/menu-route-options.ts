import { inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ValidatorFn } from '@angular/forms';
import {
  catchError,
  distinctUntilChanged,
  map,
  of,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { MfeRoutesApiService } from '../api/mfe-routes-api.service';
import { MenuItemForm } from '../utils/menu-item-form.service';

export interface MenuRouteOption {
  value: string;
  label: string;
}
export interface MenuRouteState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  options: MenuRouteOption[];
}

/** Scoped reference data and validation for a single menu form. */
export function createMenuRouteOptions(form: MenuItemForm) {
  const api = inject(MfeRoutesApiService);
  const state = signal<MenuRouteState>({
    status: 'idle',
    options: [],
  });
  const retry = new Subject<void>();
  const route = form.controls.routePath;
  const membership: ValidatorFn = (control) =>
    state().status === 'ready' &&
    state().options.some((option) => option.value === control.value)
      ? null
      : { unavailableRoute: true };
  route.addValidators(membership);
  let first = true;
  form.controls.domain.valueChanges
    .pipe(
      startWith(form.controls.domain.value),
      distinctUntilChanged(),
      switchMap((domain) => {
        if (!first) route.setValue('');
        first = false;
        if (!domain)
          return of<MenuRouteState>({ status: 'idle', options: [] });
        return retry.pipe(
          startWith(undefined),
          switchMap(() =>
            api.list(domain).pipe(
              map((remotes) => {
                const options = new Map<string, MenuRouteOption>();
                for (const remote of remotes) {
                  if (remote.type !== 'user-journey') continue;
                  // Match the shells' toSlug exactly, including punctuation handling.
                  const value = remote.name
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, '-');
                  if (value)
                    options.set(value, { value, label: remote.name });
                }
                return {
                  status: 'ready',
                  options: [...options.values()].sort((a, b) =>
                    a.label.localeCompare(b.label)
                  ),
                } as MenuRouteState;
              }),
              catchError(() =>
                of<MenuRouteState>({ status: 'error', options: [] })
              ),
              startWith<MenuRouteState>({
                status: 'loading',
                options: [],
              })
            )
          )
        );
      }),
      takeUntilDestroyed()
    )
    .subscribe((value) => {
      state.set(value);
      route.updateValueAndValidity();
    });
  return { state: state.asReadonly(), reload: () => retry.next() };
}
