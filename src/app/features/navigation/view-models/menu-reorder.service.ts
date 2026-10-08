import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { BehaviorSubject } from 'rxjs';
import { MenuStore } from '../state/menu.store';
import { descendantIds } from '../utils/menu-projections';

@Injectable()
export class MenuReorderService {
  readonly store = inject(MenuStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dragging = new BehaviorSubject(false);
  readonly isDragging$ = this.dragging.asObservable();

  onDragStarted(): void {
    this.dragging.next(true);
  }
  onDragEnded(): void {
    this.dragging.next(false);
  }

  drop(event: CdkDragDrop<MenuItemDto[]>): void {
    const item: MenuItemDto = event.item.data;
    const match =
      /^list-(ADMIN|WORKSHOP)-(HEADER|NAV|FOOTER)-(FULL|RELAXED|COMPACT)(?:-(.+))?$/.exec(
        event.container.id
      );
    if (
      !match ||
      match[1] !== item.domain ||
      match[2] !== item.structuralSubtype ||
      match[3] !== item.state
    )
      return;
    const parentId = match[4]?.split('-').at(-1);
    if (
      parentId &&
      descendantIds(this.store.items(), item._id).has(parentId)
    )
      return;
    this.persist(item, event.currentIndex + 1, parentId);
  }

  move(item: MenuItemDto, sortId: number): void {
    if (sortId < 1) return;
    this.persist(item, sortId, item.parentId);
  }

  private persist(
    item: MenuItemDto,
    sortId: number,
    parentId?: string
  ): void {
    if (this.store.pending() || this.store.loading()) return;
    // The server resequences siblings. Keep rendered arrays intact until refresh.
    this.store
      .reorder$({ _id: item._id, sortId, parentId })
      .subscribe({
        error: () =>
          this.snackBar.open(
            'Failed to reorder menu items. Please retry.',
            'Close',
            { duration: 4000 }
          ),
      });
  }
}
