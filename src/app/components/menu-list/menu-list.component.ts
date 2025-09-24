import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { catchError, of, switchMap, tap } from 'rxjs';
import { MenuApiService } from '../../services/menu-api.service';
import { MenuDialogService } from '../../services/menu-dialog.service';
import { MenuSearchService } from '../../services/menu-search.service';
import { MenuEmptyStateComponent } from './menu-empty-state.component';
import {
  FilterChangeEvent,
  MenuFiltersComponent,
} from './menu-filters.component';
import { MenuGridComponent } from './menu-grid.component';
import { MenuItemActionEvent } from './menu-item-card.component';

@Component({
  selector: 'ngx-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MenuFiltersComponent,
    MenuGridComponent,
    MenuEmptyStateComponent,
  ],
  template: `
    @if (loading()) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <div class="list">
      <!-- Filters Section -->
      <ngx-menu-filters
        [searchText]="searchText()"
        [filterDomain]="filterDomain()"
        [filterStructuralSubtype]="filterStructuralSubtype()"
        [filterState]="filterState()"
        [filterAuthRequired]="filterAuthRequired()"
        [includeArchived]="includeArchived()"
        (filterChange)="onFilterChange($event)"
      />

      <!-- Results Section -->
      @if (!loading() && filtered().length > 0) {
      <ngx-menu-grid
        [items]="filtered()"
        (itemAction)="onItemAction($event)"
        (refreshClick)="reload()"
      />
      }

      <!-- Empty State -->
      @if (!loading() && filtered().length === 0) {
      <ngx-menu-empty-state (createClick)="openCreate()" />
      }
    </div>
  `,
  styles: [
    `
      .list {
        display: block;
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      @media (max-width: 768px) {
        .list {
          padding: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuListComponent {
  private readonly menuApi = inject(MenuApiService);
  private readonly menuDialog = inject(MenuDialogService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly searchService = inject(MenuSearchService);

  // State signals
  loading = signal(false);

  // Expose search service properties
  readonly searchText = this.searchService.searchText;
  readonly filterDomain = this.searchService.filterDomain;
  readonly filterStructuralSubtype =
    this.searchService.filterStructuralSubtype;
  readonly filterState = this.searchService.filterState;
  readonly filterAuthRequired = this.searchService.filterAuthRequired;
  readonly includeArchived = this.searchService.includeArchived;
  readonly filtered = this.searchService.filteredItems;

  constructor() {
    this.loadMenuItems();
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
      case 'authRequired':
        this.searchService.setAuthRequiredFilter(event.value);
        break;
      case 'includeArchived':
        this.searchService.setIncludeArchived(event.value);
        break;
      case 'clearAll':
        this.clearAllFilters();
        break;
    }
  }

  // Handle item actions from the grid component
  onItemAction(event: MenuItemActionEvent): void {
    switch (event.type) {
      case 'edit':
        this.editItem(event.item);
        break;
      case 'archive':
        this.archiveItem(event.item._id);
        break;
      case 'unarchive':
        this.unarchiveItem(event.item._id);
        break;
      case 'delete':
        this.deleteItem(event.item._id);
        break;
    }
  }

  clearAllFilters(): void {
    this.searchService.clearAllFilters();
  }

  private loadMenuItems(): void {
    this.loading.set(true);

    const filters = this.searchService.apiFilter();

    this.menuApi
      .findAll$(filters)
      .pipe(
        catchError((error) => {
          this.snackBar.open('Failed to load menu items', 'Close', {
            duration: 3000,
          });
          console.error('Error loading menu items:', error);
          return of([]);
        }),
        tap(() => this.loading.set(false))
      )
      .subscribe((items) => {
        this.searchService.setMenuItems(items);
      });
  }

  reload(): void {
    this.loadMenuItems();
  }

  openCreate(): void {
    this.menuDialog.openCreateDialog().subscribe((result) => {
      if (result) {
        this.reload();
      }
    });
  }

  editItem(item: MenuItemDto): void {
    this.menuDialog.openEditDialog(item).subscribe((result) => {
      if (result) {
        this.reload();
      }
    });
  }

  archiveItem(id: string): void {
    this.menuApi
      .archive$(id)
      .pipe(
        switchMap(() => {
          this.snackBar.open('Menu item archived', 'Close', {
            duration: 2000,
          });
          return this.menuApi.findAll$();
        }),
        catchError((error) => {
          this.snackBar.open('Failed to archive menu item', 'Close', {
            duration: 3000,
          });
          console.error('Error archiving menu item:', error);
          return of([]);
        })
      )
      .subscribe((items) => {
        this.searchService.setMenuItems(items);
      });
  }

  unarchiveItem(id: string): void {
    this.menuApi
      .unarchive$(id)
      .pipe(
        switchMap(() => {
          this.snackBar.open('Menu item unarchived', 'Close', {
            duration: 2000,
          });
          return this.menuApi.findAll$();
        }),
        catchError((error) => {
          this.snackBar.open(
            'Failed to unarchive menu item',
            'Close',
            { duration: 3000 }
          );
          console.error('Error unarchiving menu item:', error);
          return of([]);
        })
      )
      .subscribe((items) => {
        this.searchService.setMenuItems(items);
      });
  }

  deleteItem(id: string): void {
    if (
      confirm(
        'Are you sure you want to delete this menu item? This action cannot be undone.'
      )
    ) {
      this.menuApi
        .delete$(id)
        .pipe(
          switchMap(() => {
            this.snackBar.open('Menu item deleted', 'Close', {
              duration: 2000,
            });
            return this.menuApi.findAll$();
          }),
          catchError((error) => {
            this.snackBar.open(
              'Failed to delete menu item',
              'Close',
              { duration: 3000 }
            );
            console.error('Error deleting menu item:', error);
            return of([]);
          })
        )
        .subscribe((items) => {
          this.searchService.setMenuItems(items);
        });
    }
  }
}
