import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnter,
  CdkDragExit,
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
      [class]="'nesting-level-' + nestingLevel"
      [style.margin-left]="nestingLevel > 0 ? '0' : '2rem'"
      cdkDropList
      [cdkDropListData]="items"
      [cdkDropListConnectedTo]="getConnectedDropLists()"
      (cdkDropListDropped)="onDrop($event)"
      (cdkDropListEntered)="onDragEnter($event)"
      (cdkDropListExited)="onDragExit($event)"
      [id]="getDropListId()"
    >
      <!-- Drag instructions that appear when dragging -->
      @if (isDragActive) {
      <div class="drag-instructions">
        <mat-icon>info</mat-icon>
        <span
          >Drag onto items above to create parent-child relationships,
          or drag between items to reorder</span
        >
      </div>
      } @for (item of items; track item._id) {
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
            [class.show-nesting-hint]="
              isDragActive && dragOverItemId !== item._id
            "
            cdkDropList
            [cdkDropListData]="[item]"
            [cdkDropListConnectedTo]="
              getConnectedDropListsForParent(item)
            "
            [cdkDropListSortingDisabled]="true"
            (cdkDropListDropped)="onDropOntoItem($event, item)"
            (cdkDropListEntered)="onDragEnterItem(item)"
            (cdkDropListExited)="onDragExitItem(item)"
            [id]="'parent-zone-' + item._id"
          >
            <div class="drop-indicator">
              <mat-icon>subdirectory_arrow_right</mat-icon>
              @if (currentDraggedItemId !== item._id) {
              <span
                >Drop here to nest under "{{
                  item.menuItemText
                }}"</span
              >
              }
            </div>
          </div>

          <div
            class="menu-item"
            [class.archived]="item.archived"
            [class.has-children]="
              item.children && item.children.length > 0
            "
            [class.drag-target]="dragOverItemId === item._id"
            cdkDrag
            [cdkDragData]="item"
            (cdkDragStarted)="onDragStarted(item)"
            (cdkDragEnded)="onDragEnded()"
          >
            <div class="drag-handle" cdkDragHandle>
              <mat-icon>drag_indicator</mat-icon>
            </div>
            <div class="item-info">
              <span class="item-text">{{ item.menuItemText }}</span>
              <span class="item-route">{{ item.routePath }}</span>
              <!-- <span class="item-sort">Sort: {{ item.sortId }}</span>
              @if (item.parentId) {
              <span class="item-parent"
                >Parent: {{ item.parentId }}</span
              >
              } -->
            </div>
            <div class="item-badges">
              @if (item.authRequired) {
              <span class="badge auth">Auth</span>
              } @if (item.archived) {
              <span class="badge archived">Archived</span>
              } @if (item.children && item.children.length > 0) {
              <span class="badge children"
                >{{ item.children.length }} children</span
              >
              }
            </div>
          </div>
        </div>

        <!-- Recursive template for children with enhanced grouping -->
        @if (item.children && item.children.length > 0) {
        <div class="children-container">
          <!-- <div class="children-header">
            <mat-icon class="children-icon"
              >subdirectory_arrow_right</mat-icon
            >
            <span class="children-label"
              >{{ item.children.length }} nested item{{
                item.children.length === 1 ? '' : 's'
              }}</span
            >
          </div> -->
          <ngx-menu-items
            [items]="item.children"
            [hierarchyData]="hierarchyData"
            [domain]="domain"
            [structuralSubtype]="structuralSubtype"
            [state]="state"
            [nestingLevel]="nestingLevel + 1"
            [parentId]="item._id"
            [ancestorListIds]="getChildAncestorListIds()"
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
  styleUrls: ['./menu-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemsComponent {
  @Input() items: MenuItemDto[] = [];
  @Input() hierarchyData: HierarchyNode[] = [];
  @Input() domain!: Domain;
  @Input() structuralSubtype!: StructuralSubtype;
  @Input() state!: State;
  @Input() nestingLevel: number = 0; // Track nesting depth for proper indentation
  @Input() parentId?: string; // Parent ID for this items list (undefined for root)
  @Input() ancestorListIds: string[] = [];
  @Output() reorderError = new EventEmitter<Error>();

  private readonly sortingService = inject(MenuItemsSortingService);

  // Track drag-over state for visual feedback
  dragOverItemId: string | null = null;
  isDragActive = false;
  currentDraggedItemId: string | null = null;
  private static instanceSeq = 0;
  private _dropListId?: string;

  /**
   * Generates a unique ID for this drop list instance
   */
  getDropListId(): string {
    if (!this._dropListId) {
      const seq = ++MenuItemsComponent.instanceSeq;
      this._dropListId = `menu-items-${this.domain}-${this.structuralSubtype}-${this.state}-lvl-${this.nestingLevel}-seq-${seq}`;
    }
    return this._dropListId;
  }

  /**
   * Gets connected drop list IDs for cross-level drag and drop
   */
  getConnectedDropLists(): string[] {
    const currentZones = this.items.map(
      (i) => `parent-zone-${i._id}`
    );
    return [...currentZones, ...this.ancestorListIds];
  }

  /**
   * Connected lists for a specific item's parent drop zone
   * Ensure it's connected back to the main list and peers
   */
  getConnectedDropListsForParent(item: MenuItemDto): string[] {
    const parentZones = this.getConnectedDropLists().filter(
      (id) => id !== `parent-zone-${item._id}`
    );
    return [
      this.getDropListId(),
      ...parentZones,
      ...this.ancestorListIds,
    ];
  }

  /**
   * Handles drag start event
   */
  onDragStarted(item: MenuItemDto): void {
    this.isDragActive = true;
    this.currentDraggedItemId = item._id;
  }

  /**
   * Handles drag end event
   */
  onDragEnded(): void {
    this.isDragActive = false;
    this.dragOverItemId = null;
    this.currentDraggedItemId = null;
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
  onDropOntoItem(
    event: CdkDragDrop<any>,
    targetItem: MenuItemDto
  ): void {
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
  private isDescendant(
    item: MenuItemDto,
    ancestorId: string
  ): boolean {
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
    const findInItems = (
      items: MenuItemDto[]
    ): MenuItemDto | null => {
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
  private createParentChildRelationship(
    childItem: MenuItemDto,
    parentItem: MenuItemDto
  ): void {
    const rootItems = this.getRootStateItems();
    const updatedItems = this.relocateItemAsChild(
      rootItems,
      childItem._id,
      parentItem._id
    );
    this.persistHierarchical(updatedItems);
  }

  /**
   * Updates the parent ID of an item in the hierarchy
   */
  private updateItemParent(
    items: MenuItemDto[],
    itemId: string,
    newParentId: string
  ): MenuItemDto[] {
    return items.map((item) => {
      if (item._id === itemId) {
        return { ...item, parentId: newParentId };
      }
      if (item.children) {
        return {
          ...item,
          children: this.updateItemParent(
            item.children,
            itemId,
            newParentId
          ),
        };
      }
      return item;
    });
  }

  /**
   * Removes the item from its current location and nests under the new parent.
   */
  private relocateItemAsChild(
    items: MenuItemDto[],
    itemId: string,
    newParentId: string
  ): MenuItemDto[] {
    // First, extract the target item and return a tree without it
    const { treeWithoutItem, extracted } = this.extractItem(
      items,
      itemId
    );
    if (!extracted) {
      return items;
    }

    // Mark new parent
    extracted.parentId = newParentId;

    // Insert into the new parent's children
    const insertIntoParent = (list: MenuItemDto[]): MenuItemDto[] => {
      return list.map((node) => {
        if (node._id === newParentId) {
          const children = node.children ? [...node.children] : [];
          children.push(extracted);
          return { ...node, children };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: insertIntoParent(node.children),
          };
        }
        return node;
      });
    };

    return insertIntoParent(treeWithoutItem);
  }

  private extractItem(
    items: MenuItemDto[],
    itemId: string
  ): { treeWithoutItem: MenuItemDto[]; extracted?: MenuItemDto } {
    let found: MenuItemDto | undefined;

    const walk = (list: MenuItemDto[]): MenuItemDto[] => {
      const result: MenuItemDto[] = [];
      for (const node of list) {
        if (node._id === itemId) {
          found = { ...node, children: node.children || [] };
          // skip adding to result -> effectively removes it
          continue;
        }
        if (node.children && node.children.length > 0) {
          result.push({ ...node, children: walk(node.children) });
        } else {
          result.push(node);
        }
      }
      return result;
    };

    const pruned = walk(items);
    return { treeWithoutItem: pruned, extracted: found };
  }

  onDrop(event: CdkDragDrop<MenuItemDto[]>): void {
    const rootItems = this.getRootStateItems();

    // Moving between containers (e.g., un-nesting to root or another parent)
    if (event.previousContainer !== event.container) {
      const draggedItem = event.item.data as MenuItemDto;
      const newParentId = this.parentId; // undefined means root list
      const { treeWithoutItem, extracted } = this.extractItem(
        rootItems,
        draggedItem._id
      );
      if (!extracted) return;
      extracted.parentId = newParentId;

      const updated = this.insertIntoListAt(
        treeWithoutItem,
        newParentId,
        extracted,
        event.currentIndex
      );
      this.persistHierarchical(updated);
      return;
    }

    if (event.previousIndex === event.currentIndex) return;

    const updatedItems = this.applyReorderToParentList(
      rootItems,
      this.parentId,
      event.previousIndex,
      event.currentIndex
    );
    this.persistHierarchical(updatedItems);
  }

  /**
   * Persist a full-state hierarchical update via sortingService
   */
  private persistHierarchical(items: MenuItemDto[]): void {
    this.sortingService
      .handleHierarchicalReorder(
        this.hierarchyData,
        this.domain,
        this.structuralSubtype,
        this.state,
        items
      )
      .subscribe({
        error: (error) => {
          console.error('Failed to reorder menu items:', error);
          this.reorderError.emit(error);
        },
      });
  }

  /**
   * Get the root items array for the current domain/subtype/state
   */
  private getRootStateItems(): MenuItemDto[] {
    const domainNode = this.hierarchyData.find(
      (n) => n.domain === this.domain
    );
    const list =
      domainNode?.structuralSubtypes[this.structuralSubtype]?.states[
        this.state
      ];
    return list ?? this.items;
  }

  /**
   * Apply a reorder within a parent group and return updated root list
   */
  private applyReorderToParentList(
    items: MenuItemDto[],
    targetParentId: string | undefined,
    from: number,
    to: number
  ): MenuItemDto[] {
    if (!targetParentId) {
      const root = [...items];
      moveItemInArray(root, from, to);
      return root;
    }
    const reorderInChildren = (list: MenuItemDto[]): MenuItemDto[] =>
      list.map((n) => {
        if (n._id === targetParentId) {
          const children = n.children ? [...n.children] : [];
          moveItemInArray(children, from, to);
          return { ...n, children };
        }
        if (n.children && n.children.length) {
          return { ...n, children: reorderInChildren(n.children) };
        }
        return n;
      });
    return reorderInChildren(items);
  }

  private insertIntoListAt(
    items: MenuItemDto[],
    targetParentId: string | undefined,
    nodeToInsert: MenuItemDto,
    index: number
  ): MenuItemDto[] {
    const insertInto = (list: MenuItemDto[]): MenuItemDto[] => {
      if (!targetParentId) {
        const root = [...list];
        root.splice(index, 0, nodeToInsert);
        return root;
      }
      return list.map((n) => {
        if (n._id === targetParentId) {
          const children = n.children ? [...n.children] : [];
          children.splice(index, 0, nodeToInsert);
          return { ...n, children };
        }
        if (n.children && n.children.length) {
          return { ...n, children: insertInto(n.children) };
        }
        return n;
      });
    };
    return insertInto(items);
  }

  // Provide ancestor container IDs to children so they can connect to root/outer lists
  getChildAncestorListIds(): string[] {
    return [this.getDropListId(), ...this.ancestorListIds];
  }
}
