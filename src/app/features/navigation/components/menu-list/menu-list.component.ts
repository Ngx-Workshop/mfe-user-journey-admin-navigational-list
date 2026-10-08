import {
  ChangeDetectionStrategy,
  Component,
  inject,
  computed,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatSnackBarModule
} from '@angular/material/snack-bar';
import { MenuListViewModel } from '../../view-models/menu-list.view-model';

import { MenuSearchService } from '../../view-models/menu-search.service';
import { MenuEmptyStateComponent } from './menu-empty-state.component';
import {
  FilterChangeEvent,
  MenuFiltersComponent,
} from './menu-filters.component';
import { MenuGridComponent } from './menu-grid.component';
import { MenuItemActionEvent } from './menu-item-card.component';

@Component({
  selector: 'ngx-menu-list',
  providers: [MenuSearchService, MenuListViewModel],
  standalone: true,
  imports: [
    MatSnackBarModule,
    MatButtonModule,
    MatProgressBarModule,
    MenuFiltersComponent,
    MenuGridComponent,
    MenuEmptyStateComponent,
    MatIconModule,
  ],
  template: `
    <div class="menu-list__list">
      <!-- Filters Section -->
      <ngx-menu-filters
        [searchText]="searchText()"
        [filterDomain]="filterDomain()"
        [filterStructuralSubtype]="filterStructuralSubtype()"
        [filterState]="filterState()"
        [filterRole]="filterRole()"
        [includeArchived]="includeArchived()"
        (filterChange)="onFilterChange($event)"
      />

      @if (loading() || vm.store.pending()) {
      <div class="menu-list__progress" role="status">
        <span>{{ vm.store.pending() ? 'Saving your changes…' : vm.store.ready() ? 'Refreshing menu items…' : 'Loading your navigation…' }}</span>
        <mat-progress-bar mode="indeterminate" aria-label="Menu items loading"></mat-progress-bar>
      </div>
      }

      <!-- Results Section -->
      @if (filtered().length > 0) {
      <ngx-menu-grid
        [items]="filtered()"
        [busy]="loading() || vm.store.pending()"
        (itemAction)="onItemAction($event)"
        (refreshClick)="reload()"
      />
      }

      <!-- Empty State -->
      @if (!loading() && !vm.store.error() && filtered().length === 0) {
      <ngx-menu-empty-state [filtered]="hasFilters()" (resetClick)="clearAllFilters()" (createClick)="openCreate()" />
      }
    </div>
  `,
  styles: [`
    .menu-list__progress { margin-top: 20px; color: var(--mat-sys-on-surface-variant); font-size: .85rem; }
    .menu-list__progress span { display: block; margin-bottom: 10px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuListComponent {
  readonly vm = inject(MenuListViewModel);
  private readonly searchService = inject(MenuSearchService);
  readonly loading = this.vm.store.loading;

  // Expose search service properties
  readonly searchText = this.searchService.searchText;
  readonly filterDomain = this.searchService.filterDomain;
  readonly filterStructuralSubtype =
    this.searchService.filterStructuralSubtype;
  readonly filterState = this.searchService.filterState;
  readonly filterRole = this.searchService.filterRole;
  readonly includeArchived = this.searchService.includeArchived;
  readonly filtered = this.searchService.filteredItems;
  readonly hasFilters = computed(() => !!(this.searchText().trim() || this.filterDomain()
    || this.filterStructuralSubtype() || this.filterState() || this.filterRole() || this.includeArchived()));

  constructor() {
    this.vm.store.ensureLoaded();
  }

  // Handle filter changes from the filters component
  onFilterChange(event: FilterChangeEvent): void {
    switch (event.type) {
      case 'searchText':
        this.searchService.setSearchText(event.value);
        break;
      case 'domain':
        this.searchService.setDomainFilter(event.value);
        break;
      case 'structuralSubtype':
        this.searchService.setStructuralSubtypeFilter(event.value);
        break;
      case 'state':
        this.searchService.setStateFilter(event.value);
        break;
      case 'role':
        this.searchService.setRoleFilter(event.value);
        break;
      case 'includeArchived':
        this.searchService.setIncludeArchived(event.value);
        break;
      case 'clearAll':
        this.clearAllFilters();
        break;
    }
  }

  onItemAction(event: MenuItemActionEvent): void { this.vm.act(event); }
  clearAllFilters(): void { this.searchService.clearAllFilters(); }
  reload(): void { this.vm.store.refresh(); }
  openCreate(): void { this.vm.openCreate(); }
}
