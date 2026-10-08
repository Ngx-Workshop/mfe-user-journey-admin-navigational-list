import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreateMenuItemDto,
  MenuHierarchyResponseDto,
  MenuItemDto,
  SortMenuItemDto,
  UpdateMenuItemDto,
} from '@tmdjr/service-navigational-list-contracts';
import { Observable } from 'rxjs';
import type {
  Domain,
  MenuFilter,
  State,
  StructuralSubtype,
} from '../models/menu.types';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/navigational-list';

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
  ): Observable<MenuHierarchyResponseDto> {
    const params: Record<string, string | number | boolean> = {};
    if (includeArchived) {
      params['includeArchived'] = includeArchived;
    }
    return this.http.get<MenuHierarchyResponseDto>(
      `${this.baseUrl}/hierarchy/${domain}`,
      { params }
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
