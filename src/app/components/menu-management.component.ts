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
import { catchError, of, tap } from 'rxjs';
import { MenuApiService } from '../services/menu-api.service';
import { MenuDialogService } from '../services/menu-dialog.service';
import {
  Domain,
  State,
  StructuralSubtype,
} from '../types/menu.types';
import { MenuHierarchyComponent } from './menu-hierarchy.component';
import { MenuListComponent } from './menu-list.component';
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
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Navigational List</h1>
        <!-- <p>
            Manage navigational menus for different domains,
            structural types, and states
          </p> -->
      </div>

      <mat-tab-group
        class="tabs"
        (selectedTabChange)="onTabChange($event.index)"
      >
        <!-- List View Tab -->
        <mat-tab label="List View">
          <ng-template matTabContent>
            <div class="tab-content">
              <div class="list-header">
                <h2>Menu Management</h2>
                <button mat-raised-button (click)="openCreate()">
                  <mat-icon>add</mat-icon> New Menu Item
                </button>
              </div>
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
        background: var(--mat-sys-surface);
      }

      .header {
        background: linear-gradient(
          135deg,
          var(--mat-sys-primary) 0%,
          var(--mat-sys-secondary-fixed) 100%
        );
        color: var(--mat-sys-on-primary);
        display: flex;
        padding: 0 1.125rem;
      }

      .header-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 2rem;
      }

      .header p {
        margin: 0;
        opacity: 0.9;
      }

      .tabs {
        max-width: 1400px;
        margin: 0 auto;
      }

      .tab-content {
        padding: 2rem;
      }

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      @media (max-width: 768px) {
        .header-content {
          padding: 0 1rem;
        }

        .tab-content {
          padding: 1rem;
        }

        .list-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuManagementComponent {
  private readonly menuApi = inject(MenuApiService);
  private readonly menuDialog = inject(MenuDialogService);
  private readonly snackBar = inject(MatSnackBar);

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

  openCreate(): void {
    this.menuDialog.openCreateDialog().subscribe((result) => {
      if (result) {
        // If a reload method is needed in the future, it can be added here
        // For now, we rely on the child components to handle their own state
      }
    });
  }

  loadHierarchy(): void {
    this.hierarchyLoading.set(true);

    // Load all menu items and organize them into hierarchy
    this.menuApi
      .findAll$({ archived: false })
      .pipe(
        tap(() => this.hierarchyLoading.set(false)),
        catchError((error) => {
          this.hierarchyLoading.set(false);
          this.snackBar.open('Failed to load hierarchy', 'Close', {
            duration: 3000,
          });
          console.error('Error loading hierarchy:', error);
          return of([]);
        })
      )
      .subscribe((items) => {
        const hierarchy = this.buildHierarchy(items);
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

  private buildHierarchy(items: MenuItemDto[]): HierarchyNode[] {
    const hierarchy: HierarchyNode[] = [];

    // Group by domain
    const domainGroups = items.reduce((acc, item) => {
      if (!acc[item.domain]) {
        acc[item.domain] = [];
      }
      acc[item.domain].push(item);
      return acc;
    }, {} as Record<Domain, MenuItemDto[]>);

    // Build hierarchy for each domain
    Object.entries(domainGroups).forEach(([domain, domainItems]) => {
      const node: HierarchyNode = {
        domain: domain as Domain,
        structuralSubtypes: {},
      };

      // Group by structural subtype
      const subtypeGroups = domainItems.reduce((acc, item) => {
        if (!acc[item.structuralSubtype]) {
          acc[item.structuralSubtype] = [];
        }
        acc[item.structuralSubtype].push(item);
        return acc;
      }, {} as Record<StructuralSubtype, MenuItemDto[]>);

      // Build states for each structural subtype
      Object.entries(subtypeGroups).forEach(
        ([subtype, subtypeItems]) => {
          node.structuralSubtypes[subtype as StructuralSubtype] = {
            states: {},
          };

          // Group by state
          const stateGroups = subtypeItems.reduce((acc, item) => {
            if (!acc[item.state]) {
              acc[item.state] = [];
            }
            acc[item.state].push(item);
            return acc;
          }, {} as Record<State, MenuItemDto[]>);

          // Sort items by sortId within each state
          Object.entries(stateGroups).forEach(
            ([state, stateItems]) => {
              node.structuralSubtypes[
                subtype as StructuralSubtype
              ]!.states[state as State] = stateItems.sort(
                (a, b) => a.sortId - b.sortId
              );
            }
          );
        }
      );

      hierarchy.push(node);
    });

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
