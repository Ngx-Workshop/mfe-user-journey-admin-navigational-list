import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
  CdkDragEnter,
  CdkDragExit,
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
      [cdkDropListConnectedTo]="getConnectedDropLists()"
      (cdkDropListDropped)="onDrop($event)"
      (cdkDropListEntered)="onDragEnter($event)"
      (cdkDropListExited)="onDragExit($event)"
      [id]="getDropListId()"
    >
      @for (item of items; track item._id) {
      <div class="menu-item-container">
        <!-- Main menu item with enhanced drop zones -->
        <div
          class="menu-item-wrapper"
          [class.drag-over]="dragOverItemId === item._id"
          [class.drag-active]="isDragActive"
        >
          <!-- Drop zone for making this item a parent -->
          <div
            class="drop-zone-parent"
            cdkDropList
            [cdkDropListData]="[item]"
            [cdkDropListConnectedTo]="getConnectedDropLists()"
            (cdkDropListDropped)="onDropOntoItem($event, item)"
            (cdkDropListEntered)="onDragEnterItem(item)"
            (cdkDropListExited)="onDragExitItem(item)"
            [id]="'parent-zone-' + item._id"
          >
            <div class="drop-indicator">
              <mat-icon>arrow_downward</mat-icon>
              <span>Drop here to make child of "{{ item.menuItemText }}"</span>
            </div>
          </div>

          <div
            class="menu-item"
            [class.archived]="item.archived"
            [class.has-children]="item.children && item.children.length > 0"
            [class.drag-target]="dragOverItemId === item._id"
            cdkDrag
            [cdkDragData]="item"
            (cdkDragStarted)="onDragStarted()"
            (cdkDragEnded)="onDragEnded()"
          >
            <div class="drag-handle" cdkDragHandle>
              <mat-icon>drag_indicator</mat-icon>
            </div>
            <div class="item-info">
              <span class="item-text">{{ item.menuItemText }}</span>
              <span class="item-route">{{ item.routePath }}</span>
              <span class="item-sort">Sort: {{ item.sortId }}</span>
              @if (item.parentId) {
              <span class="item-parent">Parent: {{ item.parentId }}</span>
              }
            </div>
            <div class="item-badges">
              @if (item.authRequired) {
              <span class="badge auth">Auth</span>
              } @if (item.archived) {
              <span class="badge archived">Archived</span>
              } @if (item.children && item.children.length > 0) {
              <span class="badge children">{{ item.children.length }} children</span>
              }
            </div>
          </div>
        </div>

        <!-- Recursive template for children with connected drop lists -->
        @if (item.children && item.children.length > 0) {
        <div class="children-container">
          <ngx-menu-items
            [items]="item.children"
            [hierarchyData]="hierarchyData"
            [domain]="domain"
            [structuralSubtype]="structuralSubtype"
            [state]="state"
            (reorderError)="reorderError.emit($event)"
          ></ngx-menu-items>
        </div>
        }
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

      .menu-item-container {
        display: flex;
        flex-direction: column;
      }

      .menu-item-wrapper {
        position: relative;
        transition: all 0.3s ease;
      }

      .menu-item-wrapper.drag-active {
        transform: scale(0.98);
      }

      .menu-item-wrapper.drag-over {
        background: var(--mat-sys-primary-container);
        border-radius: 8px;
        padding: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      /* Drop zone styling */
      .drop-zone-parent {
        position: absolute;
        top: -8px;
        left: 0;
        right: 0;
        height: 16px;
        background: transparent;
        border-radius: 4px;
        opacity: 0;
        transition: all 0.2s ease;
        z-index: 10;
        pointer-events: none;
      }

      .drag-active .drop-zone-parent {
        pointer-events: all;
      }

      .drop-zone-parent.cdk-drop-list-dragging {
        opacity: 1;
        background: var(--mat-sys-primary-container);
        border: 2px dashed var(--mat-sys-primary);
      }

      .drop-zone-parent.cdk-drop-list-receiving-drag {
        opacity: 1;
        background: var(--mat-sys-secondary-container);
        border: 2px solid var(--mat-sys-secondary);
        height: 32px;
        top: -16px;
      }

      .drop-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        color: var(--mat-sys-on-primary-container);
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .drop-zone-parent.cdk-drop-list-receiving-drag .drop-indicator {
        opacity: 1;
      }

      .drop-indicator mat-icon {
        font-size: 1rem;
        height: 1rem;
        width: 1rem;
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
        position: relative;
        z-index: 5;
      }

      .menu-item.has-children {
        border-left: 4px solid var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
      }

      .menu-item.drag-target {
        border-color: var(--mat-sys-secondary);
        background: var(--mat-sys-secondary-container);
        transform: translateY(2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
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
        z-index: 1000;
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

      /* Enhanced drag state */
      .menu-items.cdk-drop-list-dragging .menu-item-wrapper {
        border: 1px dashed var(--mat-sys-outline);
        border-radius: 8px;
        margin: 4px 0;
      }

      .menu-items.cdk-drop-list-dragging .menu-item-wrapper:hover {
        background: var(--mat-sys-tertiary-container);
        border-color: var(--mat-sys-tertiary);
      }

      .children-container {
        margin-top: 0.5rem;
        margin-left: 1.5rem;
        padding-left: 1rem;
        border-left: 2px dashed var(--mat-sys-outline-variant);
        position: relative;
      }

      .children-container::before {
        content: '';
        position: absolute;
        top: -0.5rem;
        left: -2px;
        bottom: 0;
        width: 2px;
        background: var(--mat-sys-outline-variant);
        opacity: 0.5;
      }

      .drag-handle {
        display: flex;
        align-items: center;
        color: var(--mat-sys-on-surface-variant);
        margin-right: 0.75rem;
        cursor: grab;
        transition: color 0.2s ease;
      }

      .drag-handle:hover {
        color: var(--mat-sys-primary);
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
        flex: 1;
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

      .item-parent {
        font-size: 0.75rem;
        color: var(--mat-sys-secondary);
        font-family: monospace;
      }

      .item-badges {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 200;
        white-space: nowrap;
      }

      .badge.auth {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }

      .badge.archived {
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }

      .badge.children {
        background: var(--mat-sys-tertiary-container);
        color: var(--mat-sys-on-tertiary-container);
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

        .children-container {
          margin-left: 0.5rem;
        }

        .item-badges {
          justify-content: flex-start;
        }

        .drop-indicator span {
          display: none;
        }

        .drop-zone-parent.cdk-drop-list-receiving-drag {
          height: 24px;
          top: -12px;
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

  // Track drag-over state for visual feedback
  dragOverItemId: string | null = null;
  isDragActive = false;

  /**
   * Generates a unique ID for this drop list instance
   */
  getDropListId(): string {
    return `menu-items-${this.domain}-${this.structuralSubtype}-${this.state}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets connected drop list IDs for cross-level drag and drop
   */
  getConnectedDropLists(): string[] {
    // For now, return empty array - we'll enhance this if needed
    // In a complex scenario, you might want to connect to parent/sibling lists
    return [];
  }

  /**
   * Handles drag start event
   */
  onDragStarted(): void {
    this.isDragActive = true;
  }

  /**
   * Handles drag end event
   */
  onDragEnded(): void {
    this.isDragActive = false;
    this.dragOverItemId = null;
  }

  /**
   * Handles drag enter on drop list
   */
  onDragEnter(event: CdkDragEnter): void {
    // Optional: Add logic for when drag enters the main list
  }

  /**
   * Handles drag exit from drop list
   */
  onDragExit(event: CdkDragExit): void {
    // Optional: Add logic for when drag exits the main list
  }

  /**
   * Handles drag enter on a specific item (for nesting)
   */
  onDragEnterItem(item: MenuItemDto): void {
    this.dragOverItemId = item._id;
  }

  /**
   * Handles drag exit from a specific item
   */
  onDragExitItem(item: MenuItemDto): void {
    if (this.dragOverItemId === item._id) {
      this.dragOverItemId = null;
    }
  }

  /**
   * Handles dropping an item onto another item to create parent-child relationship
   */
  onDropOntoItem(event: CdkDragDrop<any>, targetItem: MenuItemDto): void {
    const draggedItem = event.item.data as MenuItemDto;
    
    // Prevent dropping item onto itself
    if (draggedItem._id === targetItem._id) {
      return;
    }

    // Prevent dropping parent onto its own child (circular reference)
    if (this.isDescendant(targetItem, draggedItem._id)) {
      console.warn('Cannot create circular reference');
      return;
    }

    // Create new hierarchy by making draggedItem a child of targetItem
    this.createParentChildRelationship(draggedItem, targetItem);
  }

  /**
   * Checks if an item is a descendant of another item
   */
  private isDescendant(item: MenuItemDto, ancestorId: string): boolean {
    if (item.parentId === ancestorId) {
      return true;
    }
    
    if (item.parentId) {
      // Find the parent item and check recursively
      const parent = this.findItemInHierarchy(item.parentId);
      if (parent) {
        return this.isDescendant(parent, ancestorId);
      }
    }
    
    return false;
  }

  /**
   * Finds an item by ID in the current hierarchy
   */
  private findItemInHierarchy(itemId: string): MenuItemDto | null {
    const findInItems = (items: MenuItemDto[]): MenuItemDto | null => {
      for (const item of items) {
        if (item._id === itemId) {
          return item;
        }
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInItems(this.items);
  }

  /**
   * Creates a parent-child relationship between two items
   */
  private createParentChildRelationship(childItem: MenuItemDto, parentItem: MenuItemDto): void {
    // Create updated hierarchy data
    const updatedItems = this.updateItemParent(this.items, childItem._id, parentItem._id);
    
    // Use the hierarchical reorder service to save the changes
    this.sortingService
      .handleHierarchicalReorder(
        this.hierarchyData,
        this.domain,
        this.structuralSubtype,
        this.state,
        updatedItems
      )
      .subscribe({
        next: () => {
          console.log('Successfully created parent-child relationship');
        },
        error: (error) => {
          console.error('Failed to create parent-child relationship:', error);
          this.reorderError.emit(error);
        },
      });
  }

  /**
   * Updates the parent ID of an item in the hierarchy
   */
  private updateItemParent(items: MenuItemDto[], itemId: string, newParentId: string): MenuItemDto[] {
    return items.map(item => {
      if (item._id === itemId) {
        return { ...item, parentId: newParentId };
      }
      if (item.children) {
        return {
          ...item,
          children: this.updateItemParent(item.children, itemId, newParentId)
        };
      }
      return item;
    });
  }

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

    // Handle the reordering through the sorting service using smart reorder
    this.sortingService
      .handleSmartReorder(
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
