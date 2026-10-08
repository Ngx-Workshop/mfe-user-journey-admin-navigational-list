import { computed, Injectable, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';

export type MenuSort = 'name' | 'position' | 'updated';

/** Page-local presentation state, independent of canonical data and HTTP. */
@Injectable()
export class MenuResultsViewModel {
  private readonly records = signal<MenuItemDto[]>([]);
  readonly sort = signal<MenuSort>('name');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(12);
  readonly total = computed(() => this.records().length);
  readonly sorted = computed(() => [...this.records()].sort((a, b) => {
    const comparison = this.sort() === 'position' ? a.sortId - b.sortId
      : this.sort() === 'updated' ? (Date.parse(b.lastUpdated) || 0) - (Date.parse(a.lastUpdated) || 0)
      : a.menuItemText.localeCompare(b.menuItemText);
    return comparison || a.menuItemText.localeCompare(b.menuItemText) || a._id.localeCompare(b._id);
  }));
  readonly visible = computed(() => this.sorted().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));

  setItems(items: MenuItemDto[]): void {
    const before = this.records().map(item => item._id).join(',');
    this.records.set(items);
    if (before !== items.map(item => item._id).join(',')) this.pageIndex.set(0);
  }
  setSort(sort: MenuSort): void { this.sort.set(sort); this.pageIndex.set(0); }
  page(event: PageEvent): void {
    this.pageIndex.set(event.pageSize === this.pageSize() ? event.pageIndex : 0);
    this.pageSize.set(event.pageSize);
  }
}
