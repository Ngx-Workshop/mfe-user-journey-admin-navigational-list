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
import {
  Domain,
  State,
  StructuralSubtype,
} from '../types/menu.types';
import { HeaderComponent } from './header.component';
import { MenuHierarchyManagerComponent } from './menu-hierarchy/menu-hierarchy-manager.component';
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
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MenuListComponent,
    MenuHierarchyManagerComponent,
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
              <ngx-menu-hierarchy-manager
                [menuHierarchy]="(hierarchyData | async) || []"
              />
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
      .tab-content {
        display: flex;
        justify-content: center;
      }
      ngx-menu-list,
      ngx-menu-hierarchy-manager,
      ngx-menu-statistics {
        padding: 1rem;
        flex: 0 1 clamp(480px, 70vw, 1400px);
        max-width: 100%;
      }

      :host ::ng-deep .tabs .mat-mdc-tab-header {
        position: sticky;
        top: 56px;
        z-index: 10;
        background: var(--mat-sys-surface);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuManagementComponent {
  private readonly menuApi = inject(MenuApiService);
  private readonly snackBar = inject(MatSnackBar);

  // State signals
  hierarchyLoading = signal(false);
  statsLoading = signal(false);
  statistics = signal<MenuStatistic[]>([]);

  hierarchyData = forkJoin([
    this.menuApi.getMenuHierarchy$('ADMIN', false),
    this.menuApi.getMenuHierarchy$('WORKSHOP', false),
  ]);

  onTabChange(index: number): void {
    // Load data when switching to hierarchy or stats tabs
    if (index === 2 && this.statistics().length === 0) {
      this.loadStatistics();
    }
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

  private calculateStatistics(items: MenuItemDto[]): MenuStatistic[] {
    const total = items.length;
    const active = items.filter((item) => !item.archived).length;
    const archived = items.filter((item) => item.archived).length;

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
