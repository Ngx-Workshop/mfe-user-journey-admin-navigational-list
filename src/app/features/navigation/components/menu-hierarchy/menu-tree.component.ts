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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { menuRouteUrl } from '../../utils/menu-route';
import { MenuItemWithChildren } from '../../models/menu.types';

@Component({
  selector: 'ngx-menu-tree',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="menu-tree__tree-group">
      <div
        class="menu-tree__tree-list"
        [attr.data-list-id]="listId"
        [id]="listId"
        cdkDropList
        [cdkDropListData]="items"
        [cdkDropListDisabled]="disabled"
        [cdkDropListConnectedTo]="connectedTo"
        [cdkDropListEnterPredicate]="enterPredicate"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (item of items; track item._id; let i = $index) {
          <div
            class="menu-tree__tree-item"
            cdkDrag
            [cdkDragData]="item"
            [cdkDragDisabled]="disabled"
            (cdkDragStarted)="onDragStarted()"
            (cdkDragEnded)="onDragEnded()"
          >
            <div class="menu-tree__item-row">
              <span class="menu-tree__handle" cdkDragHandle>
                <mat-icon fontIcon="drag_indicator" />
              </span>
              <div class="menu-tree__labels">
                <div class="menu-tree__menu-text">
                  {{ item.menuItemText }}
                </div>
                <div class="menu-tree__menu-route-container">
                  <a
                    [href]="routeUrl(item)"
                    target="_blank"
                    rel="noopener"
                    class="menu-tree__menu-route"
                    >{{ item.routePath }}</a
                  >
                </div>
              </div>
              <button
                mat-icon-button
                type="button"
                [attr.aria-label]="
                  'Move ' + item.menuItemText + ' up'
                "
                [disabled]="disabled || i === 0"
                (click)="moveRequested.emit({ item, position: i })"
              >
                <mat-icon>keyboard_arrow_up</mat-icon>
              </button>
              <button
                mat-icon-button
                type="button"
                [attr.aria-label]="
                  'Move ' + item.menuItemText + ' down'
                "
                [disabled]="disabled || i === items.length - 1"
                (click)="
                  moveRequested.emit({ item, position: i + 2 })
                "
              >
                <mat-icon>keyboard_arrow_down</mat-icon>
              </button>
            </div>
          </div>

          @if (item.children?.length) {
            <ngx-menu-tree
              [class.menu-tree--empty]="!item.children?.length"
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
      .menu-tree__handle {
        cursor: grab;
        color: var(--mat-sys-on-surface-variant);
      }
      .menu-tree__tree-list {
        padding: 0;
        min-height: 12px;
      }
      .menu-tree__tree-item {
        margin: 8px 0;
        border-radius: 10px;
      }
      .menu-tree__item-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 10px;
        background: var(--mat-sys-surface);
      }
      .menu-tree__labels {
        flex: 1;
        min-width: 0;
      }
      .menu-tree__menu-text {
        font-size: 0.9rem;
        font-weight: 500;
        overflow-wrap: anywhere;
      }
      .menu-tree__menu-route {
        color: var(--mat-sys-primary);
        font-size: 0.75rem;
        overflow-wrap: anywhere;
      }
      .menu-tree__tree-list > ngx-menu-tree {
        margin-left: 20px;
        padding-left: 12px;
        border-left: 2px solid var(--mat-sys-outline-variant);
      }
      .menu-tree__tree-item.cdk-drag-animating,
      .menu-tree__tree-list.cdk-drop-list-dragging
        .menu-tree__tree-item {
        transition: transform 200ms ease;
      }
      .menu-tree__tree-list.cdk-drop-list-receiving {
        outline: 2px dashed var(--mat-sys-primary);
        outline-offset: 4px;
        border-radius: 8px;
      }
      @media (max-width: 600px) {
        .menu-tree__item-row {
          flex-wrap: wrap;
          padding: 8px;
          gap: 0;
        }
        .menu-tree__labels {
          flex-basis: calc(100% - 32px);
        }
        .menu-tree__tree-list > ngx-menu-tree {
          margin-left: 8px;
          padding-left: 8px;
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
  readonly routeUrl = menuRouteUrl;
  @Input({ required: true }) items: MenuItemWithChildren[] = [];
  @Input({ required: true }) listId!: string;
  @Input() connectedTo: string[] = [];
  @Input() isDragging = false;
  @Input() disabled = false;
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
