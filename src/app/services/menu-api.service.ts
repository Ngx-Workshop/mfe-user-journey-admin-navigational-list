import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AuthTestDto,
  CreateMenuItemDto,
  MenuItemDto,
  ReorderDto,
  UpdateMenuItemDto,
} from '@tmdjr/service-navigational-list-contracts';
import { Observable } from 'rxjs';
import type {
  Domain,
  HierarchicalReorderDto,
  MenuFilter,
  State,
  StructuralSubtype,
} from '../types/menu.types';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly http = inject(HttpClient);
  // If you have an env token, swap this for that. Keep the trailing slash off.
  private readonly baseUrl = '/api/navigational-list';

  /**
   * Test authentication
   */
  authTest$(): Observable<AuthTestDto> {
    return this.http.get<AuthTestDto>(`${this.baseUrl}/auth-test`);
  }

  /**
   * Get all menu items with optional filters
   */
  findAll$(filters?: MenuFilter): Observable<MenuItemDto[]> {
    const params: Record<string, string | number | boolean> = {};

    if (filters?.domain) params['domain'] = filters.domain;
    if (filters?.structuralSubtype)
      params['structuralSubtype'] = filters.structuralSubtype;
    if (filters?.state) params['state'] = filters.state;
    if (filters?.archived !== undefined)
      params['archived'] = filters.archived;
    if (filters?.authRequired !== undefined)
      params['authRequired'] = filters.authRequired;

    return this.http.get<MenuItemDto[]>(this.baseUrl, { params });
  }

  /**
   * Get menu hierarchy for a domain
   */
  getMenuHierarchy$(
    domain: Domain,
    includeArchived = false
  ): Observable<any> {
    const params: Record<string, string | number | boolean> = {};
    if (includeArchived) {
      params['includeArchived'] = includeArchived;
    }
    return this.http.get<any>(`${this.baseUrl}/hierarchy/${domain}`, {
      params,
    });
  }

  /**
   * Get menu items by domain
   */
  findByDomain$(
    domain: Domain,
    includeArchived = false
  ): Observable<MenuItemDto[]> {
    const params: Record<string, string | number | boolean> = {};
    if (includeArchived) {
      params['includeArchived'] = includeArchived;
    }
    return this.http.get<MenuItemDto[]>(
      `${this.baseUrl}/domain/${domain}`,
      { params }
    );
  }

  /**
   * Get menu items by domain and structural subtype
   */
  findByDomainAndStructuralSubtype$(
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    includeArchived = false
  ): Observable<MenuItemDto[]> {
    const params: Record<string, string | number | boolean> = {};
    if (includeArchived) {
      params['includeArchived'] = includeArchived;
    }
    return this.http.get<MenuItemDto[]>(
      `${this.baseUrl}/domain/${domain}/structural-subtype/${structuralSubtype}`,
      { params }
    );
  }

  /**
   * Get menu items by domain, structural subtype, and state
   */
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

  /**
   * Reorder menu items within a specific domain/structural subtype/state
   */
  reorderMenuItems$(
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    reorderDto: ReorderDto
  ): Observable<MenuItemDto[]> {
    return this.http.post<MenuItemDto[]>(
      `${this.baseUrl}/domain/${domain}/structural-subtype/${structuralSubtype}/state/${state}/reorder`,
      reorderDto
    );
  }

  /**
   * Hierarchical reorder menu items within a specific domain/structural subtype/state
   * Supports complex hierarchical operations including changing parent-child relationships
   */
  reorderMenuItemsHierarchical$(
    domain: Domain,
    structuralSubtype: StructuralSubtype,
    state: State,
    reorderDto: HierarchicalReorderDto
  ): Observable<MenuItemDto[]> {
    return this.http.post<MenuItemDto[]>(
      `${this.baseUrl}/domain/${domain}/structural-subtype/${structuralSubtype}/state/${state}/reorder-hierarchical`,
      reorderDto
    );
  }

  /**
   * Get a single menu item by ID
   */
  findOne$(id: string): Observable<MenuItemDto> {
    return this.http.get<MenuItemDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new menu item
   */
  create$(dto: CreateMenuItemDto): Observable<MenuItemDto> {
    return this.http.post<MenuItemDto>(this.baseUrl, dto);
  }

  /**
   * Update an existing menu item
   */
  update$(
    id: string,
    dto: UpdateMenuItemDto
  ): Observable<MenuItemDto> {
    return this.http.patch<MenuItemDto>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * Delete a menu item
   */
  delete$(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Archive a menu item
   */
  archive$(id: string): Observable<MenuItemDto> {
    return this.http.patch<MenuItemDto>(
      `${this.baseUrl}/${id}/archive`,
      {}
    );
  }

  /**
   * Unarchive a menu item
   */
  unarchive$(id: string): Observable<MenuItemDto> {
    return this.http.patch<MenuItemDto>(
      `${this.baseUrl}/${id}/unarchive`,
      {}
    );
  }
}
