import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { MenuApiService } from '../services/menu-api.service';
import { MenuItemsSortingService } from '../services/menu-items-sorting.service';
import {
  Domain,
  State,
  StructuralSubtype,
} from '../types/menu.types';
import { HeaderComponent } from './header.component';
import { MenuHierarchyComponent } from './menu-hierarchy/menu-hierarchy.component';
import { MenuListComponent } from './menu-list/menu-list.component';
import {
  MenuStatistic,
  MenuStatisticsComponent,
} from './menu-statistics.component';

interface HierarchyNode {
  domain: Domain;
  structuralSubtypes: {
    [key in StructuralSubtype]?: {
      states: {
        [key in State]?: MenuItemDto[];
      };
    };
  };
}

@Component({
  selector: 'ngx-menu-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MenuListComponent,
    MenuHierarchyComponent,
    MenuStatisticsComponent,
    HeaderComponent,
  ],
  template: `
    <div class="container">
      <ngx-menu-management-header class="header">
      </ngx-menu-management-header>
      <mat-tab-group
        class="tabs"
        (selectedTabChange)="onTabChange($event.index)"
      >
        <!-- List View Tab -->
        <mat-tab label="List View">
          <ng-template matTabContent>
            <div class="tab-content">
              <ngx-menu-list></ngx-menu-list>
            </div>
          </ng-template>
        </mat-tab>

        <!-- Hierarchy View Tab -->
        <mat-tab label="Hierarchy View">
          <ng-template matTabContent>
            <div class="tab-content">
              <ngx-menu-hierarchy
                [hierarchyData]="hierarchyData()"
                [loading]="hierarchyLoading()"
                (refreshClick)="loadHierarchy()"
              ></ngx-menu-hierarchy>
            </div>
          </ng-template>
        </mat-tab>

        <!-- Statistics Tab -->
        <mat-tab label="Statistics">
          <ng-template matTabContent>
            <div class="tab-content">
              <ngx-menu-statistics
                [statistics]="statistics()"
                [loading]="statsLoading()"
                (refreshClick)="loadStatistics()"
              ></ngx-menu-statistics>
            </div>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .container {
        min-height: 100vh;
      }

      /* Make the tab header sticky at the top */
      :host ::ng-deep .tabs .mat-mdc-tab-header {
        position: sticky;
        top: 56px;
        z-index: 10;
        // width: 100vw;
        background: var(--mat-sys-surface);
        /* Optional: add subtle shadow when stuck */
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
      }

      .tab-content {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      @media (max-width: 768px) {
        .tab-content {
          padding: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuManagementComponent {
  private readonly menuApi = inject(MenuApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sortingService = inject(MenuItemsSortingService);

  // State signals
  hierarchyLoading = signal(false);
  statsLoading = signal(false);
  hierarchyData = signal<HierarchyNode[]>([]);
  statistics = signal<MenuStatistic[]>([]);

  onTabChange(index: number): void {
    // Load data when switching to hierarchy or stats tabs
    if (index === 1 && this.hierarchyData().length === 0) {
      this.loadHierarchy();
    } else if (index === 2 && this.statistics().length === 0) {
      this.loadStatistics();
    }
  }

  loadHierarchy(): void {
    this.hierarchyLoading.set(true);

    // Fetch hierarchy for both ADMIN and WORKSHOP domains
    const adminHierarchy$ = this.menuApi.getMenuHierarchy$(
      'ADMIN',
      false
    );
    const workshopHierarchy$ = this.menuApi.getMenuHierarchy$(
      'WORKSHOP',
      false
    );

    // Combine both API calls
    forkJoin({
      admin: adminHierarchy$,
      workshop: workshopHierarchy$,
    })
      .pipe(
        tap(() => this.hierarchyLoading.set(false)),
        catchError((error) => {
          this.hierarchyLoading.set(false);
          this.snackBar.open('Failed to load hierarchy', 'Close', {
            duration: 3000,
          });
          console.error('Error loading hierarchy:', error);
          return of({ admin: null, workshop: null });
        })
      )
      .subscribe(({ admin, workshop }) => {
        const hierarchy = this.processHierarchyResponse(
          admin,
          workshop
        );
        this.hierarchyData.set(hierarchy);
      });
  }

  loadStatistics(): void {
    this.statsLoading.set(true);

    this.menuApi
      .findAll$()
      .pipe(
        tap(() => this.statsLoading.set(false)),
        catchError((error) => {
          this.statsLoading.set(false);
          this.snackBar.open('Failed to load statistics', 'Close', {
            duration: 3000,
          });
          console.error('Error loading statistics:', error);
          return of([]);
        })
      )
      .subscribe((items) => {
        const stats = this.calculateStatistics(items);
        this.statistics.set(stats);
      });
  }

  private processHierarchyResponse(
    admin: any,
    workshop: any
  ): HierarchyNode[] {
    const hierarchy: HierarchyNode[] = [];

    // Process ADMIN domain if available
    if (admin && admin.domain) {
      const adminNode: HierarchyNode = {
        domain: admin.domain as Domain,
        structuralSubtypes: {},
      };

      // Process each structural subtype
      Object.entries(admin.structuralSubtypes || {}).forEach(
        ([subtype, subtypeData]: [string, any]) => {
          adminNode.structuralSubtypes[subtype as StructuralSubtype] =
            {
              states: {},
            };

          // Process each state
          Object.entries(subtypeData.states || {}).forEach(
            ([state, stateItems]: [string, any]) => {
              const items = Array.isArray(stateItems)
                ? stateItems
                : [];
              // Sort items by sortId and build hierarchy
              const sorted = items.sort(
                (a: MenuItemDto, b: MenuItemDto) =>
                  a.sortId - b.sortId
              );
              const nested =
                this.sortingService.buildHierarchy(sorted);
              adminNode.structuralSubtypes[
                subtype as StructuralSubtype
              ]!.states[state as State] = nested;
            }
          );
        }
      );

      hierarchy.push(adminNode);
    }

    // Process WORKSHOP domain if available
    if (workshop && workshop.domain) {
      const workshopNode: HierarchyNode = {
        domain: workshop.domain as Domain,
        structuralSubtypes: {},
      };

      // Process each structural subtype
      Object.entries(workshop.structuralSubtypes || {}).forEach(
        ([subtype, subtypeData]: [string, any]) => {
          workshopNode.structuralSubtypes[
            subtype as StructuralSubtype
          ] = {
            states: {},
          };

          // Process each state
          Object.entries(subtypeData.states || {}).forEach(
            ([state, stateItems]: [string, any]) => {
              const items = Array.isArray(stateItems)
                ? stateItems
                : [];
              // Sort items by sortId and build hierarchy
              const sorted = items.sort(
                (a: MenuItemDto, b: MenuItemDto) =>
                  a.sortId - b.sortId
              );
              const nested =
                this.sortingService.buildHierarchy(sorted);
              workshopNode.structuralSubtypes[
                subtype as StructuralSubtype
              ]!.states[state as State] = nested;
            }
          );
        }
      );

      hierarchy.push(workshopNode);
    }

    return hierarchy;
  }

  private calculateStatistics(items: MenuItemDto[]): MenuStatistic[] {
    const total = items.length;
    const active = items.filter((item) => !item.archived).length;
    const archived = items.filter((item) => item.archived).length;
    const authRequired = items.filter(
      (item) => item.authRequired
    ).length;

    const domainCounts = items.reduce((acc, item) => {
      acc[item.domain] = (acc[item.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const subtypeCounts = items.reduce((acc, item) => {
      acc[item.structuralSubtype] =
        (acc[item.structuralSubtype] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { title: 'Total Menu Items', value: total },
      {
        title: 'Active Items',
        value: active,
        description: 'Non-archived items',
      },
      { title: 'Archived Items', value: archived },
      {
        title: 'Auth Required',
        value: authRequired,
        description: 'Items requiring authentication',
      },
      { title: 'Admin Domain', value: domainCounts['ADMIN'] || 0 },
      {
        title: 'Workshop Domain',
        value: domainCounts['WORKSHOP'] || 0,
      },
      { title: 'Header Items', value: subtypeCounts['HEADER'] || 0 },
      { title: 'Navigation Items', value: subtypeCounts['NAV'] || 0 },
      { title: 'Footer Items', value: subtypeCounts['FOOTER'] || 0 },
    ];
  }
}
