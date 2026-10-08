import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CreateMenuItemDto,
  MenuItemDto,
  SortMenuItemDto,
  UpdateMenuItemDto,
} from '@tmdjr/service-navigational-list-contracts';
import {
  catchError,
  defer,
  EMPTY,
  finalize,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { MenuApiService } from '../api/menu-api.service';
import {
  menuHierarchy,
  menuStatistics,
} from '../utils/menu-projections';

@Injectable({ providedIn: 'root' })
export class MenuStore {
  private readonly api = inject(MenuApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();
  private readonly data = signal<MenuItemDto[]>([]);
  private readonly isLoading = signal(false);
  private readonly isPending = signal(false);
  private readonly failure = signal<string | null>(null);
  private readonly initialized = signal(false);
  readonly ready = this.initialized.asReadonly();

  readonly items = this.data.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly pending = this.isPending.asReadonly();
  readonly error = this.failure.asReadonly();
  readonly hierarchy = computed(() => menuHierarchy(this.items()));
  readonly statistics = computed(() => menuStatistics(this.items()));

  constructor() {
    this.reload$
      .pipe(
        switchMap(() =>
          defer(() => {
            this.isLoading.set(true);
            this.failure.set(null);
            return this.api.findAll$().pipe(
              tap((items) => {
                this.data.set(items);
                this.initialized.set(true);
              }),
              catchError(() => {
                this.failure.set(
                  'Failed to load menu items. Please retry.'
                );
                return EMPTY;
              }),
              finalize(() => this.isLoading.set(false))
            );
          })
        ),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  ensureLoaded(): void {
    if (!this.initialized() && !this.loading()) this.refresh();
  }

  refresh(): void {
    this.reload$.next();
  }

  create$(dto: CreateMenuItemDto) {
    return this.command(() => this.api.create$(dto));
  }
  update$(id: string, dto: UpdateMenuItemDto) {
    return this.command(() => {
      const clearParent =
        Object.hasOwn(dto, 'parentId') &&
        !!this.items().find((item) => item._id === id)?.parentId &&
        !dto.parentId;
      return this.api
        .update$(id, dto)
        .pipe(
          switchMap((item) =>
            clearParent
              ? this.api.reorderMenuItems$({
                  _id: id,
                  sortId: dto.sortId ?? item.sortId,
                })
              : [item]
          )
        );
    });
  }
  archive$(id: string) {
    return this.command(() => this.api.archive$(id));
  }
  unarchive$(id: string) {
    return this.command(() => this.api.unarchive$(id));
  }
  delete$(id: string) {
    return this.command(() => this.api.delete$(id));
  }
  reorder$(dto: SortMenuItemDto) {
    return this.command(() => this.api.reorderMenuItems$(dto));
  }

  private command<T>(request: () => Observable<T>): Observable<T> {
    return defer(() => {
      if (this.pending()) return EMPTY;
      this.isPending.set(true);
      this.failure.set(null);
      return request().pipe(
        tap(() => this.refresh()),
        catchError((error) => {
          this.failure.set(
            'Unable to save menu changes. Please retry.'
          );
          throw error;
        }),
        finalize(() => this.isPending.set(false)),
        takeUntilDestroyed(this.destroyRef)
      );
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));
  }
}
