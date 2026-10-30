import { MenuItemActionEvent } from '../menu-list/menu-item-card.component';
import { MenuTreeRowComponent } from './menu-tree-row.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
} from '@angular/cdk/drag-drop';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MenuItemWithChildren } from '../../models/menu.types';

@Component({
  selector: 'ngx-menu-tree',
  standalone: true,
  imports: [MenuTreeRowComponent, CdkDropList, CdkDrag],
  template: `
    <div class="menu-tree__tree-group">
      <div
        class="menu-tree__tree-list"
        [attr.data-list-id]="listId"
        [id]="listId"
        cdkDropList
        [cdkDropListData]="items"
        [cdkDropListDisabled]="disabled || reorderDisabled"
        [cdkDropListConnectedTo]="connectedTo"
        [cdkDropListEnterPredicate]="enterPredicate"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (item of items; track item._id; let i = $index) {
          <div
            class="menu-tree__tree-item"
            cdkDrag
            [cdkDragData]="item"
            [cdkDragDisabled]="disabled || reorderDisabled"
            (cdkDragStarted)="onDragStarted()"
            (cdkDragEnded)="onDragEnded()"
          >
            <ngx-menu-tree-row
              [item]="item"
              [context]="contextIds.has(item._id)"
              [reorderDisabled]="reorderDisabled"
              (itemAction)="itemAction.emit($event)"
              [position]="i + 1"
              [siblingCount]="items.length"
              [controlsId]="childListId(item)"
              [collapsed]="collapsedIds.has(item._id)"
              [disabled]="disabled"
              [dragging]="isDragging"
              (moveRequested)="
                moveRequested.emit({ item, position: $event })
              "
              (toggleRequested)="toggleRequested.emit(item._id)"
            />
          </div>

          @if (item.children?.length && !collapsedIds.has(item._id)) {
            <ngx-menu-tree
              [collapsedIds]="collapsedIds"
              [contextIds]="contextIds"
              [reorderDisabled]="reorderDisabled"
              (itemAction)="itemAction.emit($event)"
              (toggleRequested)="toggleRequested.emit($event)"
              [items]="item.children ?? []"
              [listId]="childListId(item)"
              [connectedTo]="connectedTo"
              [isDragging]="isDragging"
              [disabled]="disabled"
              (moveRequested)="moveRequested.emit($event)"
              (dropped)="dropped.emit($event)"
              (dragStarted)="onDragStarted()"
              (dragEnded)="onDragEnded()"
            />
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .menu-tree__tree-list {
        min-height: 12px;
      }
      .menu-tree__tree-list > ngx-menu-tree {
        margin-left: 16px;
        padding-left: 4px;
        border-left: 1px solid var(--ngx-color-border);
      }
      .menu-tree__tree-item.cdk-drag-animating,
      .menu-tree__tree-list.cdk-drop-list-dragging
        .menu-tree__tree-item {
        transition: transform 180ms ease;
      }
      .menu-tree__tree-list.cdk-drop-list-receiving {
        outline: 1px dashed var(--ngx-color-primary);
        outline-offset: -1px;
      }
      .menu-tree__tree-item.cdk-drag-placeholder {
        opacity: 0.25;
      }
      @media (max-width: 600px) {
        .menu-tree__tree-list > ngx-menu-tree {
          margin-left: 8px;
          padding-left: 2px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .menu-tree__tree-item {
          transition: none !important;
        }
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
  @Input() disabled = false;
  @Input() reorderDisabled = false;
  @Input() contextIds: ReadonlySet<string> = new Set();
  @Output() itemAction = new EventEmitter<MenuItemActionEvent>();
  @Input() collapsedIds: ReadonlySet<string> = new Set();
  @Output() toggleRequested = new EventEmitter<string>();
  @Output() moveRequested = new EventEmitter<{
    item: MenuItemWithChildren;
    position: number;
  }>();
  @Output() dropped = new EventEmitter<
    CdkDragDrop<MenuItemWithChildren[]>
  >();
  @Output() dragStarted = new EventEmitter<void>();
  @Output() dragEnded = new EventEmitter<void>();

  // Reject unsupported classification moves and drops into a node’s descendants.
  enterPredicate = (
    drag: CdkDrag<MenuItemWithChildren>,
    drop: CdkDropList<MenuItemWithChildren[]>
  ) => {
    const item = drag.data;
    const prefix = `list-${item.domain}-${item.structuralSubtype}-${item.state}`;
    return (
      (drop.id === prefix || drop.id.startsWith(`${prefix}-`)) &&
      !drop.id.slice(prefix.length).split('-').includes(item._id)
    );
  };

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
