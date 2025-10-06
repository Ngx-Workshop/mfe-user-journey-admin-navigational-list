import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreateMenuItemDto,
  MenuHierarchyResponseDto,
  MenuItemDto,
  SortMenuItemDto,
  UpdateMenuItemDto,
} from '@tmdjr/service-navigational-list-contracts';
import { map, Observable } from 'rxjs';
import type {
  Domain,
  MenuFilter,
  MenuHierarchyWithChildren,
  MenuItemWithChildren,
  State,
  StructuralSubtype,
} from '../types/menu.types';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/navigational-list';

  private buildNode(
    item: MenuItemDto,
    allItems: MenuItemDto[]
  ): MenuItemWithChildren {
    const children = allItems
      .filter((child) => child.parentId === item._id)
      .map((child) => this.buildNode(child, allItems));
    return {
      ...item,
      children: children.length ? children : undefined,
    };
  }

  private buildTree(
    menuItems: MenuItemDto[]
  ): MenuItemWithChildren[] {
    return menuItems
      .filter((item) => !item.parentId)
      .map((rootItem) => this.buildNode(rootItem, menuItems));
  }

  private marshalHierarchy(
    hierarchy: MenuHierarchyResponseDto
  ): MenuHierarchyWithChildren {
    return {
      ...hierarchy,
      structuralSubtypes: {
        ...Object.fromEntries(
          Object.entries(hierarchy.structuralSubtypes).map(
            ([subtype, { states }]) => [
              subtype,
              {
                states: states
                  ? Object.fromEntries(
                      Object.entries(states).map(([state, items]) => [
                        state,
                        this.buildTree(items),
                      ])
                    )
                  : undefined,
              },
            ]
          )
        ),
      },
    };
  }

  findAll$(filters?: MenuFilter): Observable<MenuItemDto[]> {
    const params: Record<string, string | number | boolean> = {};

    if (filters?.domain) params['domain'] = filters.domain;
    if (filters?.structuralSubtype)
      params['structuralSubtype'] = filters.structuralSubtype;
    if (filters?.state) params['state'] = filters.state;
    if (filters?.archived !== undefined)
      params['archived'] = filters.archived;

    return this.http.get<MenuItemDto[]>(this.baseUrl, { params });
  }

  getMenuHierarchy$(
    domain: Domain,
    includeArchived = false
  ): Observable<MenuHierarchyWithChildren> {
    const params: Record<string, string | number | boolean> = {};
    if (includeArchived) {
      params['includeArchived'] = includeArchived;
    }
    return this.http
      .get<MenuHierarchyResponseDto>(
        `${this.baseUrl}/hierarchy/${domain}`,
        { params }
      )
      .pipe(
        // Transform to MenuHierarchyWithChildren
        map((hierarchy) => this.marshalHierarchy(hierarchy))
      );
  }

  findByDomainStructuralSubtypeAndState$(
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    includeArchived = false
  ): Observable<MenuItemDto[]> {
    const params: Record<string, string | number | boolean> = {};
    if (includeArchived) {
      params['includeArchived'] = includeArchived;
    }
    return this.http.get<MenuItemDto[]>(
      `${this.baseUrl}/domain/${domain}/structural-subtype/${structuralSubtype}/state/${state}`,
      { params }
    );
  }

  reorderMenuItems$(
    sortMenuItemDto: SortMenuItemDto
  ): Observable<MenuItemDto> {
    return this.http.post<MenuItemDto>(
      `${this.baseUrl}/sort`,
      sortMenuItemDto
    );
  }

  create$(dto: CreateMenuItemDto): Observable<MenuItemDto> {
    return this.http.post<MenuItemDto>(this.baseUrl, dto);
  }

  update$(
    id: string,
    dto: UpdateMenuItemDto
  ): Observable<MenuItemDto> {
    return this.http.patch<MenuItemDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete$(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  archive$(id: string): Observable<MenuItemDto> {
    return this.http.patch<MenuItemDto>(
      `${this.baseUrl}/${id}/archive`,
      {}
    );
  }

  unarchive$(id: string): Observable<MenuItemDto> {
    return this.http.patch<MenuItemDto>(
      `${this.baseUrl}/${id}/unarchive`,
      {}
    );
  }
}
