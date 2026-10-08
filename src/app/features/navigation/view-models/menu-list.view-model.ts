import { Clipboard } from '@angular/cdk/clipboard';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { MenuItemActionEvent } from '../components/menu-list/menu-item-card.component';
import { MenuStore } from '../state/menu.store';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class MenuListViewModel {
  private readonly clipboard = inject(Clipboard);
  readonly store = inject(MenuStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  openCreate(): void {
    void this.router.navigate(['create'], { relativeTo: this.route });
  }

  act({ type, item }: MenuItemActionEvent): void {
    if (type === 'copy') {
      const copied = this.clipboard.copy(item._id);
      this.snackBar.open(
        copied
          ? 'Menu item ID copied'
          : 'Could not copy the ID. Please try again.',
        'Close',
        { duration: 3000 }
      );
      return;
    }
    if (this.store.pending() || this.store.loading()) return;
    if (type === 'edit') {
      void this.router.navigate(['edit', item._id], { relativeTo: this.route });
      return;
    }
    if (
      type === 'delete' &&
      !confirm(
        'Are you sure you want to delete this menu item? This action cannot be undone.'
      )
    )
      return;
    const request: Observable<unknown> =
      type === 'archive'
        ? this.store.archive$(item._id)
        : type === 'unarchive'
          ? this.store.unarchive$(item._id)
          : this.store.delete$(item._id);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () =>
        this.snackBar.open(
          type === 'archive'
            ? 'Menu item archived'
            : type === 'unarchive'
              ? 'Menu item restored'
              : 'Menu item deleted',
          'Close',
          { duration: 3000 }
        ),
      error: () =>
        this.snackBar.open(
          'Unable to update menu item. Please retry.',
          'Close',
          { duration: 4000 }
        ),
    });
  }
}
