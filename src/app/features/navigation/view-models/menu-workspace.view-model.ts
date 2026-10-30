import { computed, inject, Injectable, signal } from '@angular/core';
import { MenuItemWithChildren } from '../models/menu.types';
import { MenuStore } from '../state/menu.store';
import {
  connectedListIds,
  hierarchyScopes,
} from '../utils/hierarchy-view';
import {
  filterHierarchy,
  hierarchyIds,
} from '../utils/menu-workspace';
import { MenuSearchService } from './menu-search.service';
const EXPANDED: ReadonlySet<string> = new Set();

@Injectable()
export class MenuWorkspaceViewModel {
  readonly store = inject(MenuStore);
  readonly search = inject(MenuSearchService);
  readonly collapsedIds = signal<ReadonlySet<string>>(new Set());
  readonly filtered = this.search.filteredItems;
  readonly hasFilters = this.search.hasFilters;
  private readonly matchIds = computed(
    () => new Set(this.filtered().map((item) => item._id))
  );
  readonly hierarchy = computed(() =>
    filterHierarchy(this.store.hierarchy(), this.matchIds())
  );
  readonly sections = computed(() =>
    hierarchyScopes(this.hierarchy())
  );
  readonly contextIds = computed(
    () =>
      new Set(
        [...hierarchyIds(this.hierarchy())].filter(
          (id) => !this.matchIds().has(id)
        )
      )
  );
  readonly unplaced = computed(() => {
    const reachable = hierarchyIds(this.store.hierarchy());
    return this.filtered().filter(
      (item) => !item.archived && !reachable.has(item._id)
    );
  });
  readonly archived = computed(() =>
    this.filtered().filter((item) => item.archived)
  );
  readonly visibleCollapsedIds = computed(() =>
    this.hasFilters() ? EXPANDED : this.collapsedIds()
  );
  readonly connected = computed(() =>
    connectedListIds(
      new Map(this.hierarchy().map((group) => [group.domain, group])),
      this.visibleCollapsedIds()
    )
  );
  readonly filterKey = computed(() =>
    [
      this.search.searchText(),
      this.search.filterDomain(),
      this.search.filterStructuralSubtype(),
      this.search.filterState(),
      this.search.filterRole(),
      this.search.includeArchived(),
    ].join(':')
  );
  toggle(id: string): void {
    this.collapsedIds.update((ids) => {
      const next = new Set(ids);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  expandAll(): void {
    this.collapsedIds.set(new Set());
  }
  collapseAll(): void {
    const parents = (items: MenuItemWithChildren[]): string[] =>
      items.flatMap((item) =>
        item.children?.length
          ? [item._id, ...parents(item.children)]
          : []
      );
    this.collapsedIds.set(
      new Set(
        this.sections().flatMap((section) => parents(section.items))
      )
    );
  }
}
