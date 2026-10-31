import { MenuSaveNotification } from '../models/menu-save-notification';
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
import { hierarchyIds } from '../utils/menu-workspace';
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
  private readonly saveState = signal<MenuSaveNotification>(null);
  readonly saveNotification = this.saveState.asReadonly();
  private savedTimer: ReturnType<typeof setTimeout> | undefined;
  private clearSavedTimer(): void {
    if (this.savedTimer !== undefined) {
      clearTimeout(this.savedTimer);
      this.savedTimer = undefined;
    }
  }
  private itemName(id: string): string {
    return (
      this.items().find((item) => item._id === id)?.menuItemText ??
      'menu item'
    );
  }

  readonly items = this.data.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly pending = this.isPending.asReadonly();
  readonly error = this.failure.asReadonly();
  readonly hierarchy = computed(() => menuHierarchy(this.items()));
  readonly unplaced = computed(() => {
    const reachable = hierarchyIds(this.hierarchy());
    return this.items().filter((item) => !item.archived && !reachable.has(item._id));
  });
  readonly statistics = computed(() => menuStatistics(this.items()));

  constructor() {
    this.destroyRef.onDestroy(() => this.clearSavedTimer());
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
    return this.command(
      () => this.api.create$(dto),
      dto.menuItemText
    );
  }
  update$(id: string, dto: UpdateMenuItemDto) {
    return this.command(
      () => {
        const clearParent =
          Object.hasOwn(dto, 'parentId') &&
          !!this.items().find((item) => item._id === id)?.parentId &&
          !dto.parentId;
        return this.api.update$(id, dto).pipe(
          switchMap((item) =>
            clearParent
              ? this.api.reorderMenuItems$({
                  _id: id,
                  sortId: dto.sortId ?? item.sortId,
                })
              : [item]
          )
        );
      },
      dto.menuItemText ?? this.itemName(id)
    );
  }
  archive$(id: string) {
    return this.command(
      () => this.api.archive$(id),
      this.itemName(id)
    );
  }
  unarchive$(id: string) {
    return this.command(
      () => this.api.unarchive$(id),
      this.itemName(id)
    );
  }
  delete$(id: string) {
    return this.command(
      () => this.api.delete$(id),
      this.itemName(id)
    );
  }
  reorder$(dto: SortMenuItemDto) {
    return this.command(
      () => this.api.reorderMenuItems$(dto),
      this.itemName(dto._id)
    );
  }

  private command<T>(
    request: () => Observable<T>,
    name: string
  ): Observable<T> {
    return defer(() => {
      if (this.pending()) return EMPTY;
      this.clearSavedTimer();
      this.saveState.set({ status: 'saving', name });
      this.isPending.set(true);
      this.failure.set(null);
      return request().pipe(
        tap(() => {
          this.saveState.set({ status: 'saved', name });
          this.savedTimer = setTimeout(() => {
            this.saveState.set(null);
            this.savedTimer = undefined;
          }, 3000);
          this.refresh();
        }),
        catchError((error) => {
          this.saveState.set({ status: 'error', name });
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
