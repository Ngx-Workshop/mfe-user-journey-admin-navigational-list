import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuListViewModel } from '../../view-models/menu-list.view-model';

import { MenuWorkspaceViewModel } from '../../view-models/menu-workspace.view-model';
import { MenuReorderService } from '../../view-models/menu-reorder.service';
import { MenuSearchService } from '../../view-models/menu-search.service';
import { MenuEmptyStateComponent } from './menu-empty-state.component';
import {
  FilterChangeEvent,
  MenuFiltersComponent,
} from './menu-filters.component';
import { MenuWorkspaceResultsComponent } from './menu-workspace-results.component';
import { MenuItemActionEvent } from './menu-item-card.component';

@Component({
  selector: 'ngx-menu-list',
  providers: [
    MenuListViewModel,
    MenuWorkspaceViewModel,
    MenuReorderService,
  ],
  standalone: true,
  imports: [
    MatSnackBarModule,
    MatButtonModule,
    MatProgressBarModule,
    MenuFiltersComponent,
    MenuWorkspaceResultsComponent,
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

      <div class="menu-list__results">
        @if (loading() || vm.store.pending()) {
          <div class="menu-list__progress" role="status">
            <span>{{
              vm.store.pending()
                ? 'Saving your changes…'
                : vm.store.ready()
                  ? 'Refreshing menu items…'
                  : 'Loading your navigation…'
            }}</span>
            <mat-progress-bar
              mode="indeterminate"
              aria-label="Menu items loading"
            ></mat-progress-bar>
          </div>
        }

        <!-- Results Section -->
        @if (filtered().length > 0) {
          <ngx-menu-workspace-results />
        }

        <!-- Empty State -->
        @if (
          !loading() && !vm.store.error() && filtered().length === 0
        ) {
          <ngx-menu-empty-state
            [filtered]="hasFilters()"
            (resetClick)="clearAllFilters()"
            (createClick)="openCreate()"
          />
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .menu-list__list {
        display: grid;
        grid-template-columns: 248px minmax(0, 1fr);
        gap: 16px;
        height: max(
          420px,
          calc(100dvh - var(--menu-toolbar-top, 96px) - 144px)
        );
      }
      ngx-menu-filters {
        min-height: 0;
        overflow: auto;
        scrollbar-width: thin;
      }
      .menu-list__results {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--ngx-color-border);
        background: var(--ngx-color-surface-low);
      }
      ngx-menu-workspace-results {
        flex: 1;
        min-height: 0;
      }
      .menu-list__progress {
        flex-shrink: 0;
        padding: 8px 12px;
        color: var(--ngx-color-muted);
        font-size: 0.75rem;
      }
      .menu-list__progress span {
        display: block;
        margin-bottom: 6px;
      }
      @media (max-width: 900px) {
        .menu-list__list {
          grid-template-columns: minmax(0, 1fr);
          height: auto;
          gap: 12px;
        }
        ngx-menu-filters {
          overflow: visible;
        }
      }
    `,
  ],
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
  readonly hasFilters = this.searchService.hasFilters;

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

  onItemAction(event: MenuItemActionEvent): void {
    this.vm.act(event);
  }
  clearAllFilters(): void {
    this.searchService.clearAllFilters();
  }
  reload(): void {
    this.vm.store.refresh();
  }
  openCreate(): void {
    this.vm.openCreate();
  }
}
