import { computed, Injectable, signal } from '@angular/core';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import {
  Domain,
  DOMAIN_OPTIONS,
  MenuFilter,
  Role,
  State,
  STATE_OPTIONS,
  STRUCTURAL_SUBTYPE_OPTIONS,
  StructuralSubtype,
} from '../types/menu.types';

export interface SearchFilters {
  searchText: string;
  domain: Domain | null;
  structuralSubtype: StructuralSubtype | null;
  state: State | null;
  role: Role | null;
  includeArchived: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MenuSearchService {
  // Filter signals
  private readonly _searchText = signal('');
  private readonly _filterDomain = signal<Domain | null>(null);
  private readonly _filterStructuralSubtype =
    signal<StructuralSubtype | null>(null);
  private readonly _filterState = signal<State | null>(null);
  private readonly _filterRole = signal<Role | null>(null);
  private readonly _includeArchived = signal(false);

  // Menu items signal
  private readonly _menuItems = signal<MenuItemDto[]>([]);

  // Public readonly signals
  readonly searchText = this._searchText.asReadonly();
  readonly filterDomain = this._filterDomain.asReadonly();
  readonly filterStructuralSubtype =
    this._filterStructuralSubtype.asReadonly();
  readonly filterState = this._filterState.asReadonly();
  readonly filterRole = this._filterRole.asReadonly();
  readonly includeArchived = this._includeArchived.asReadonly();
  readonly menuItems = this._menuItems.asReadonly();

  // Options for dropdowns
  readonly domainOptions = DOMAIN_OPTIONS;
  readonly structuralSubtypeOptions = STRUCTURAL_SUBTYPE_OPTIONS;
  readonly stateOptions = STATE_OPTIONS;

  // Computed filtered list
  readonly filteredItems = computed(() => {
    const items = this._menuItems();
    const search = this._searchText().toLowerCase();
    const domain = this._filterDomain();
    const structuralSubtype = this._filterStructuralSubtype();
    const state = this._filterState();
    const role = this._filterRole();
    const showArchived = this._includeArchived();

    return items.filter((item) => {
      // Text search
      if (search && !this.itemMatchesSearch(item, search)) {
        return false;
      }

      // Domain filter
      if (domain && item.domain !== domain) {
        return false;
      }

      // Structural subtype filter
      if (
        structuralSubtype &&
        item.structuralSubtype !== structuralSubtype
      ) {
        return false;
      }

      // State filter
      if (state && item.state !== state) {
        return false;
      }

      // Auth required filter
      if (role !== null && item.role !== role) {
        return false;
      }

      // Archived filter
      if (!showArchived && item.archived) {
        return false;
      }

      return true;
    });
  });

  // Computed filter for API calls
  readonly apiFilter = computed(
    (): MenuFilter => ({
      archived: this._includeArchived() ? undefined : false,
    })
  );

  // Current filter state as a computed object
  readonly currentFilters = computed(
    (): SearchFilters => ({
      searchText: this._searchText(),
      domain: this._filterDomain(),
      structuralSubtype: this._filterStructuralSubtype(),
      state: this._filterState(),
      role: this._filterRole(),
      includeArchived: this._includeArchived(),
    })
  );

  /**
   * Update the menu items list
   */
  setMenuItems(items: MenuItemDto[]): void {
    this._menuItems.set(items);
  }

  /**
   * Update search text filter
   */
  setSearchText(text: string): void {
    this._searchText.set(text);
  }

  /**
   * Update domain filter
   */
  setDomainFilter(domain: Domain | null): void {
    this._filterDomain.set(domain);
  }

  /**
   * Update structural subtype filter
   */
  setStructuralSubtypeFilter(
    subtype: StructuralSubtype | null
  ): void {
    this._filterStructuralSubtype.set(subtype);
  }

  /**
   * Update state filter
   */
  setStateFilter(state: State | null): void {
    this._filterState.set(state);
  }

  /**
   * Update auth required filter
   */
  setRoleFilter(role: Role | null): void {
    this._filterRole.set(role);
  }

  /**
   * Update include archived filter
   */
  setIncludeArchived(include: boolean): void {
    this._includeArchived.set(include);
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): void {
    this._searchText.set('');
    this._filterDomain.set(null);
    this._filterStructuralSubtype.set(null);
    this._filterState.set(null);
    this._filterRole.set(null);
    this._includeArchived.set(false);
  }

  /**
   * Set multiple filters at once
   */
  setFilters(filters: Partial<SearchFilters>): void {
    if (filters.searchText !== undefined) {
      this._searchText.set(filters.searchText);
    }
    if (filters.domain !== undefined) {
      this._filterDomain.set(filters.domain);
    }
    if (filters.structuralSubtype !== undefined) {
      this._filterStructuralSubtype.set(filters.structuralSubtype);
    }
    if (filters.state !== undefined) {
      this._filterState.set(filters.state);
    }
    if (filters.role !== undefined) {
      this._filterRole.set(filters.role);
    }
    if (filters.includeArchived !== undefined) {
      this._includeArchived.set(filters.includeArchived);
    }
  }

  /**
   * Check if an item matches the search text
   */
  private itemMatchesSearch(
    item: MenuItemDto,
    search: string
  ): boolean {
    return (
      item.menuItemText.toLowerCase().includes(search) ||
      item.routePath.toLowerCase().includes(search) ||
      (item.description?.toLowerCase().includes(search) ?? false) ||
      (item.tooltipText?.toLowerCase().includes(search) ?? false)
    );
  }

  /**
   * Check if any filters are currently active
   */
  hasActiveFilters(): boolean {
    return (
      this._searchText() !== '' ||
      this._filterDomain() !== null ||
      this._filterStructuralSubtype() !== null ||
      this._filterState() !== null ||
      this._filterRole() !== null ||
      this._includeArchived() !== false
    );
  }

  /**
   * Get the count of active filters
   */
  getActiveFilterCount(): number {
    let count = 0;
    if (this._searchText()) count++;
    if (this._filterDomain()) count++;
    if (this._filterStructuralSubtype()) count++;
    if (this._filterState()) count++;
    if (this._filterRole() !== null) count++;
    if (this._includeArchived()) count++;
    return count;
  }
}
