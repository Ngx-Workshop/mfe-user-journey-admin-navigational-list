import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { MenuItemsSortingService } from '../services/menu-items-sorting.service';
import {
  Domain,
  State,
  StructuralSubtype,
} from '../types/menu.types';

interface HierarchyNode {
  domain: Domain;
  structuralSubtypes: {
    [key in StructuralSubtype]?: {
      states: {
        [key in State]?: MenuItemDto[];
      };
    };
  };
}

@Component({
  selector: 'ngx-menu-items',
  standalone: true,
  imports: [CommonModule, MatIconModule, CdkDropList, CdkDrag],
  template: `
    <div
      class="menu-items"
      cdkDropList
      [cdkDropListData]="items"
      (cdkDropListDropped)="onDrop($event)"
    >
      @for (item of items; track item._id) {
      <div
        class="menu-item"
        [class.archived]="item.archived"
        cdkDrag
        [cdkDragData]="item"
      >
        <div class="drag-handle" cdkDragHandle>
          <mat-icon>drag_indicator</mat-icon>
        </div>
        <div class="item-info">
          <span class="item-text">{{ item.menuItemText }}</span>
          <span class="item-route">{{ item.routePath }}</span>
          <span class="item-sort">Sort: {{ item.sortId }}</span>
        </div>
        <div class="item-badges">
          @if (item.authRequired) {
          <span class="badge auth">Auth</span>
          } @if (item.archived) {
          <span class="badge archived">Archived</span>
          }
        </div>
      </div>
      } @empty {
      <div class="empty-state">
        <mat-icon>inbox</mat-icon>
        <span>No menu items in this state</span>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .menu-items {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-left: 2rem;
      }

      .menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 4px;
        background: var(--mat-sys-surface-variant);
        transition: all 0.2s ease;
        cursor: grab;
      }

      .menu-item:active {
        cursor: grabbing;
      }

      .menu-item.archived {
        opacity: 0.6;
        background: var(--mat-sys-surface-container);
      }

      .menu-item.cdk-drag-preview {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transform: rotate(2deg);
        border: 2px solid var(--mat-sys-primary);
        background: var(--mat-sys-surface);
      }

      .menu-item.cdk-drag-placeholder {
        opacity: 0.3;
        background: var(--mat-sys-surface-container-low);
        border: 2px dashed var(--mat-sys-outline);
      }

      .menu-item.cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .menu-items.cdk-drop-list-dragging
        .menu-item:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .drag-handle {
        display: flex;
        align-items: center;
        color: var(--mat-sys-on-surface-variant);
        margin-right: 0.75rem;
        cursor: grab;
      }

      .drag-handle:active {
        cursor: grabbing;
      }

      .drag-handle mat-icon {
        font-size: 1.25rem;
        height: 1.25rem;
        width: 1.25rem;
      }

      .item-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .item-text {
        font-weight: 500;
      }

      .item-route {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        font-family: monospace;
      }

      .item-sort {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .item-badges {
        display: flex;
        gap: 0.5rem;
      }

      .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 200;
      }

      .badge.auth {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }

      .badge.archived {
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        text-align: center;
        opacity: 0.7;
      }

      .empty-state mat-icon {
        font-size: 3rem;
        height: 3rem;
        width: 3rem;
        margin-bottom: 1rem;
      }

      @media (max-width: 768px) {
        .item-info {
          flex: 1;
        }

        .menu-item {
          flex-direction: column;
          align-items: stretch;
          gap: 0.5rem;
        }

        .drag-handle {
          align-self: flex-start;
          margin-right: 0;
          margin-bottom: 0.25rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemsComponent {
  @Input() items: MenuItemDto[] = [];
  @Input() hierarchyData: HierarchyNode[] = [];
  @Input() domain!: Domain;
  @Input() structuralSubtype!: StructuralSubtype;
  @Input() state!: State;
  @Output() reorderError = new EventEmitter<Error>();

  private readonly sortingService = inject(MenuItemsSortingService);

  onDrop(event: CdkDragDrop<MenuItemDto[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return; // No position change
    }

    const reorderedItems = [...event.container.data];
    moveItemInArray(
      reorderedItems,
      event.previousIndex,
      event.currentIndex
    );

    // Handle the reordering through the sorting service
    this.sortingService
      .handleReorder(
        this.hierarchyData,
        this.domain,
        this.structuralSubtype,
        this.state,
        reorderedItems
      )
      .subscribe({
        error: (error) => {
          console.error('Failed to reorder menu items:', error);
          this.reorderError.emit(error);
        },
      });
  }
}
