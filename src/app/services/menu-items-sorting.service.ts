import { inject, Injectable } from '@angular/core';
import {
  MenuItemDto,
  ReorderDto,
} from '@tmdjr/service-navigational-list-contracts';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Domain,
  HierarchicalReorderDto,
  HierarchicalReorderItemDto,
  State,
  StructuralSubtype,
} from '../types/menu.types';
import { MenuApiService } from './menu-api.service';

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

@Injectable({
  providedIn: 'root',
})
export class MenuItemsSortingService {
  private readonly menuApiService = inject(MenuApiService);

  /**
   * Recalculates sortId values for menu items to handle duplicates and maintain order
   */
  recalculateSortIds(items: MenuItemDto[]): MenuItemDto[] {
    return items.map((item, index) => ({
      ...item,
      sortId: (index + 1) * 10, // Use increments of 10 to allow future insertions
    }));
  }

  /**
   * Updates the local hierarchy data with reordered items for immediate UI feedback
   */
  updateLocalHierarchyData(
    hierarchyData: HierarchyNode[],
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    items: MenuItemDto[]
  ): void {
    const domainNode = hierarchyData.find(
      (node) => node.domain === domain
    );
    if (
      domainNode?.structuralSubtypes[structuralSubtype]?.states[state]
    ) {
      domainNode.structuralSubtypes[structuralSubtype]!.states[
        state
      ] = items;
    }
  }

  /**
   * Saves reordered items to the backend and returns an observable
   */
  saveReorderedItems(
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    items: MenuItemDto[]
  ): Observable<MenuItemDto[]> {
    const reorderDto: ReorderDto = {
      itemIds: items.map((item) => item._id),
    };

    return this.menuApiService.reorderMenuItems$(
      domain,
      structuralSubtype,
      state,
      reorderDto
    );
  }

  /**
   * Complete sorting flow: recalculate sort IDs, update local data, and save to backend
   */
  handleReorder(
    hierarchyData: HierarchyNode[],
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    items: MenuItemDto[]
  ): Observable<MenuItemDto[]> {
    // Recalculate sortId values to handle duplicates and maintain order
    const reorderedItems = this.recalculateSortIds(items);

    // Update the hierarchy data locally for immediate UI feedback
    this.updateLocalHierarchyData(
      hierarchyData,
      domain,
      structuralSubtype,
      state,
      reorderedItems
    );

    // Save the reordered items to the backend
    return this.saveReorderedItems(
      domain,
      structuralSubtype,
      state,
      reorderedItems
    ).pipe(
      tap((updatedItems) => {
        // Update local data with the response from server
        this.updateLocalHierarchyData(
          hierarchyData,
          domain,
          structuralSubtype,
          state,
          updatedItems
        );
      })
    );
  }

  /**
   * Flattens a hierarchical menu item tree into a flat array
   */
  flattenMenuItems(items: MenuItemDto[]): MenuItemDto[] {
    const flattened: MenuItemDto[] = [];

    const flatten = (menuItems: MenuItemDto[], parentId?: string) => {
      for (const item of menuItems) {
        flattened.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children, item._id);
        }
      }
    };

    flatten(items);
    return flattened;
  }

  /**
   * Builds a hierarchical structure from a flat array of menu items
   */
  buildHierarchy(items: MenuItemDto[]): MenuItemDto[] {
    const itemMap = new Map<string, MenuItemDto>();
    const rootItems: MenuItemDto[] = [];

    // Create a map of all items
    for (const item of items) {
      itemMap.set(item._id, { ...item, children: [] });
    }

    // Build the hierarchy
    for (const item of items) {
      const itemWithChildren = itemMap.get(item._id)!;

      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(itemWithChildren);
        } else {
          // Parent not found, treat as root item
          rootItems.push(itemWithChildren);
        }
      } else {
        // Root level item
        rootItems.push(itemWithChildren);
      }
    }

    return rootItems;
  }

  /**
   * Converts a flat array of menu items to hierarchical reorder format
   */
  convertToHierarchicalReorderFormat(
    items: MenuItemDto[]
  ): HierarchicalReorderItemDto[] {
    const convertItem = (
      item: MenuItemDto,
      sortId: number
    ): HierarchicalReorderItemDto => {
      const reorderItem: HierarchicalReorderItemDto = {
        id: item._id,
        sortId,
        parentId: item.parentId || undefined,
      };

      if (item.children && item.children.length > 0) {
        reorderItem.children = item.children.map((child, index) =>
          convertItem(child, index)
        );
      }

      return reorderItem;
    };

    return items.map((item, index) => convertItem(item, index));
  }

  /**
   * Saves hierarchical reordered items to the backend
   */
  saveHierarchicalReorderedItems(
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    items: HierarchicalReorderItemDto[]
  ): Observable<MenuItemDto[]> {
    const reorderDto: HierarchicalReorderDto = {
      items,
    };

    return this.menuApiService.reorderMenuItemsHierarchical$(
      domain,
      structuralSubtype,
      state,
      reorderDto
    );
  }

  /**
   * Complete hierarchical sorting flow for complex reordering operations
   */
  handleHierarchicalReorder(
    hierarchyData: HierarchyNode[],
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    items: MenuItemDto[]
  ): Observable<MenuItemDto[]> {
    // Convert the hierarchical items to the proper format
    const hierarchicalItems =
      this.convertToHierarchicalReorderFormat(items);

    // Update the hierarchy data locally for immediate UI feedback
    this.updateLocalHierarchyData(
      hierarchyData,
      domain,
      structuralSubtype,
      state,
      items
    );

    // Save the hierarchical reordered items to the backend
    return this.saveHierarchicalReorderedItems(
      domain,
      structuralSubtype,
      state,
      hierarchicalItems
    ).pipe(
      tap((updatedItems) => {
        // Update local data with the response from server
        this.updateLocalHierarchyData(
          hierarchyData,
          domain,
          structuralSubtype,
          state,
          updatedItems
        );
      })
    );
  }

  /**
   * Determines if a reorder operation requires hierarchical handling
   * Returns true if any items have parent-child relationships
   */
  requiresHierarchicalReorder(items: MenuItemDto[]): boolean {
    return items.some(
      (item) =>
        item.parentId || (item.children && item.children.length > 0)
    );
  }

  /**
   * Smart reorder handler that chooses between simple and hierarchical reordering
   */
  handleSmartReorder(
    hierarchyData: HierarchyNode[],
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    items: MenuItemDto[]
  ): Observable<MenuItemDto[]> {
    if (this.requiresHierarchicalReorder(items)) {
      return this.handleHierarchicalReorder(
        hierarchyData,
        domain,
        structuralSubtype,
        state,
        items
      );
    } else {
      return this.handleReorder(
        hierarchyData,
        domain,
        structuralSubtype,
        state,
        items
      );
    }
  }
}
