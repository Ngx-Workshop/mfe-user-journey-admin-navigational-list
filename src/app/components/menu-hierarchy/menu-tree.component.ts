import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from '@angular/cdk/drag-drop';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MenuItemWithChildren } from '../../types/menu.types';

@Component({
  selector: 'ngx-menu-tree',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, MatIconModule],
  template: `
    <div class="tree-group">
      <div
        class="tree-list"
        [attr.data-list-id]="listId"
        [id]="listId"
        cdkDropList
        [cdkDropListData]="items"
        [cdkDropListConnectedTo]="connectedTo"
        [cdkDropListEnterPredicate]="enterPredicate"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (item of items; track item; let i = $index) {
        <div
          class="tree-item"
          cdkDrag
          [cdkDragData]="item"
          (cdkDragStarted)="onDragStarted()"
          (cdkDragEnded)="onDragEnded()"
        >
          <div class="item-row">
            <span class="handle" cdkDragHandle>
              <mat-icon fontIcon="drag_indicator" />
            </span>
            <div class="labels">
              <div class="menu-text">{{ item.menuItemText }}</div>
              <div class="menu-route-container">
                <a href="/" target="blank" class="menu-route">{{
                  item.routePath
                }}</a>
              </div>
            </div>
          </div>
        </div>

        @if(item.children?.length) {
        <ngx-menu-tree
          [class.empty]="!item.children?.length"
          [items]="item.children ?? []"
          [listId]="childListId(item)"
          [connectedTo]="connectedTo"
          [isDragging]="isDragging"
          (dropped)="dropped.emit($event)"
          (dragStarted)="onDragStarted()"
          (dragEnded)="onDragEnded()"
        />
        } }
      </div>
    </div>
  `,
  styles: [
    `
      .handle {
        cursor: grab;
        color: var(--mat-sys-on-surface-variant);
      }
      .tree-list {
        list-style: none;
        margin: 0;
        padding: 0 0 0 16px;
      }
      .tree-item {
        margin: 4px 0;
        border-radius: 6px;
      }
      .tree-list.cdk-drop-list-receiving {
        border: var(--mat-sys-primary-outline);
      }
      .tree-list.cdk-drop-list-dragging {
        transition: background 120ms ease;
      }
      .tree-list.cdk-drop-list-dragging
        .tree-item:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .tree-item.cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .item-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0.75rem;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 4px;
        background: var(--mat-sys-surface-variant);
      }

      .child-tree {
        margin-left: 24px;

        border-left: 2px dashed #e5e7eb;
      }
      .child-tree .tree-list {
        padding: 4px;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        background: var(--mat-sys-surface-variant);
      }

      .labels {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: baseline;
        font-weight: 100;
        width: 100%;
      }
      .menu-text {
        font-size: 1.3rem;
      }

      .menu-route-container {
        width: 100%;
        max-width: 250px;
      }
      .menu-route {
        margin: 0;
        font-size: 0.8rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuTreeComponent {
  @Input({ required: true }) items: MenuItemWithChildren[] = [];
  @Input({ required: true }) listId!: string;
  @Input() connectedTo: string[] = [];
  @Input() isDragging = false;
  @Output() dropped = new EventEmitter<
    CdkDragDrop<MenuItemWithChildren[]>
  >();
  @Output() dragStarted = new EventEmitter<void>();
  @Output() dragEnded = new EventEmitter<void>();

  // Allow entering any connected list (default) and always allow re-entering the same list.
  enterPredicate = () => true;

  onDragStarted() {
    this.dragStarted.emit();
  }

  onDragEnded() {
    this.dragEnded.emit();
  }

  onDrop(event: CdkDragDrop<MenuItemWithChildren[]>) {
    this.dropped.emit(event);
  }

  childListId(item: MenuItemWithChildren) {
    return `${this.listId}-${item._id}`;
  }
}
