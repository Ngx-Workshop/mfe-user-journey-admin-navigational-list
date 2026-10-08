import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Domain,
  Role,
  State,
  StructuralSubtype,
} from '../models/menu.types';
import { MenuStore } from '../state/menu.store';

/** List-scoped UI state; canonical menu records remain in MenuStore. */
@Injectable()
export class MenuSearchService {
  private readonly store = inject(MenuStore);
  private readonly text = signal('');
  private readonly domain = signal<Domain | null>(null);
  private readonly subtype = signal<StructuralSubtype | null>(null);
  private readonly state = signal<State | null>(null);
  private readonly role = signal<Role | null>(null);
  private readonly archived = signal(false);
  readonly searchText = this.text.asReadonly();
  readonly filterDomain = this.domain.asReadonly();
  readonly filterStructuralSubtype = this.subtype.asReadonly();
  readonly filterState = this.state.asReadonly();
  readonly filterRole = this.role.asReadonly();
  readonly includeArchived = this.archived.asReadonly();

  readonly filteredItems = computed(() => {
    const search = this.text().trim().toLowerCase();
    return this.store
      .items()
      .filter(
        (item) =>
          (!search ||
            [
              item.menuItemText,
              item.routePath,
              item.description,
              item.tooltipText,
            ].some((value) =>
              value?.toLowerCase().includes(search)
            )) &&
          (!this.domain() || item.domain === this.domain()) &&
          (!this.subtype() ||
            item.structuralSubtype === this.subtype()) &&
          (!this.state() || item.state === this.state()) &&
          (this.role() === null || item.role === this.role()) &&
          (this.archived() || !item.archived)
      );
  });

  setSearchText(value: string): void {
    this.text.set(value);
  }
  setDomainFilter(value: Domain | null): void {
    this.domain.set(value);
  }
  setStructuralSubtypeFilter(value: StructuralSubtype | null): void {
    this.subtype.set(value);
  }
  setStateFilter(value: State | null): void {
    this.state.set(value);
  }
  setRoleFilter(value: Role | null): void {
    this.role.set(value);
  }
  setIncludeArchived(value: boolean): void {
    this.archived.set(value);
  }
  clearAllFilters(): void {
    this.text.set('');
    this.domain.set(null);
    this.subtype.set(null);
    this.state.set(null);
    this.role.set(null);
    this.archived.set(false);
  }
}
