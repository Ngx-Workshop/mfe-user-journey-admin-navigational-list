import { inject, Injectable } from '@angular/core';
import {
  MenuItemDto,
  ReorderDto,
} from '@tmdjr/service-navigational-list-contracts';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Domain,
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
}
