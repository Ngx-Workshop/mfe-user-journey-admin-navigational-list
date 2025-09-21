import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import {
  Domain,
  DOMAIN_OPTIONS,
  State,
  STATE_OPTIONS,
  STRUCTURAL_SUBTYPE_OPTIONS,
  StructuralSubtype,
} from '../types/menu.types';

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
  selector: 'ngx-menu-hierarchy',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="hierarchy-header">
      <h2>Menu Hierarchy</h2>
      <button
        mat-raised-button
        (click)="onRefreshClick()"
        [disabled]="loading"
      >
        <mat-icon>refresh</mat-icon> Refresh Hierarchy
      </button>
    </div>

    @if (loading) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <div class="hierarchy-container">
      @for (node of hierarchyData; track node.domain) {
      <mat-card class="domain-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>domain</mat-icon>
            {{ getDomainLabel(node.domain) }}
          </mat-card-title>
          <mat-card-subtitle>
            Domain: {{ node.domain }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-accordion>
            @for (structuralSubtype of getStructuralSubtypes(node);
            track structuralSubtype) {
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>{{
                    getStructuralSubtypeIcon(structuralSubtype)
                  }}</mat-icon>
                  {{ getStructuralSubtypeLabel(structuralSubtype) }}
                </mat-panel-title>
                <mat-panel-description>
                  {{
                    getStructuralSubtypeItemCount(
                      node,
                      structuralSubtype
                    )
                  }}
                  items
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="states-container">
                @for (state of getStates(node, structuralSubtype);
                track state) {
                <div class="state-section">
                  <h4>
                    <mat-icon>{{ getStateIcon(state) }}</mat-icon>
                    {{ getStateLabel(state) }}
                  </h4>
                  <div class="menu-items">
                    @for (item of getMenuItems(node,
                    structuralSubtype, state); track item._id) {
                    <div
                      class="menu-item"
                      [class.archived]="item.archived"
                    >
                      <div class="item-info">
                        <span class="item-text">{{
                          item.menuItemText
                        }}</span>
                        <span class="item-route">{{
                          item.routePath
                        }}</span>
                        <span class="item-sort"
                          >Sort: {{ item.sortId }}</span
                        >
                      </div>
                      <div class="item-badges">
                        @if (item.authRequired) {
                        <span class="badge auth">Auth</span>
                        } @if (item.archived) {
                        <span class="badge archived">Archived</span>
                        }
                      </div>
                    </div>
                    } @empty {
                    <div class="empty-state">
                      <mat-icon>inbox</mat-icon>
                      <span>No menu items in this state</span>
                    </div>
                    }
                  </div>
                </div>
                }
              </div>
            </mat-expansion-panel>
            }
          </mat-accordion>
        </mat-card-content>
      </mat-card>
      } @empty {
      <div class="empty-hierarchy">
        <mat-icon>folder_open</mat-icon>
        <h3>No menu hierarchy data</h3>
        <p>Click "Refresh Hierarchy" to load the menu structure</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .hierarchy-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .hierarchy-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .domain-card {
        width: 100%;
      }

      .domain-card mat-card-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .states-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem 0;
      }

      .state-section h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 0.5rem 0;
        color: var(--mat-sys-primary);
      }

      .menu-items {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-left: 2rem;
      }

      .menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 4px;
        background: var(--mat-sys-surface-variant);
      }

      .menu-item.archived {
        opacity: 0.6;
        background: var(--mat-sys-surface-container);
      }

      .item-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .item-text {
        font-weight: 500;
      }

      .item-route {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        font-family: monospace;
      }

      .item-sort {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .item-badges {
        display: flex;
        gap: 0.5rem;
      }

      .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .badge.auth {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }

      .badge.archived {
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }

      .empty-state,
      .empty-hierarchy {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        text-align: center;
        opacity: 0.7;
      }

      .empty-state mat-icon,
      .empty-hierarchy mat-icon {
        font-size: 3rem;
        height: 3rem;
        width: 3rem;
        margin-bottom: 1rem;
      }

      @media (max-width: 768px) {
        .hierarchy-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .item-info {
          flex: 1;
        }

        .menu-item {
          flex-direction: column;
          align-items: stretch;
          gap: 0.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuHierarchyComponent {
  @Input() hierarchyData: HierarchyNode[] = [];
  @Input() loading = false;
  @Output() refreshClick = new EventEmitter<void>();

  // Options for display
  private readonly domainOptions = DOMAIN_OPTIONS;
  private readonly structuralSubtypeOptions =
    STRUCTURAL_SUBTYPE_OPTIONS;
  private readonly stateOptions = STATE_OPTIONS;

  onRefreshClick(): void {
    this.refreshClick.emit();
  }

  getDomainLabel(domain: Domain): string {
    return (
      this.domainOptions.find((opt) => opt.value === domain)?.label ||
      domain
    );
  }

  getStructuralSubtypeLabel(subtype: StructuralSubtype): string {
    return (
      this.structuralSubtypeOptions.find(
        (opt) => opt.value === subtype
      )?.label || subtype
    );
  }

  getStateLabel(state: State): string {
    return (
      this.stateOptions.find((opt) => opt.value === state)?.label ||
      state
    );
  }

  getStructuralSubtypeIcon(subtype: StructuralSubtype): string {
    switch (subtype) {
      case 'HEADER':
        return 'web_asset';
      case 'NAV':
        return 'menu';
      case 'FOOTER':
        return 'horizontal_rule';
      default:
        return 'category';
    }
  }

  getStateIcon(state: State): string {
    switch (state) {
      case 'FULL':
        return 'fullscreen';
      case 'RELAXED':
        return 'fullscreen_exit';
      case 'COMPACT':
        return 'compress';
      default:
        return 'view_agenda';
    }
  }

  getStructuralSubtypes(node: HierarchyNode): StructuralSubtype[] {
    return Object.keys(
      node.structuralSubtypes
    ) as StructuralSubtype[];
  }

  getStates(
    node: HierarchyNode,
    subtype: StructuralSubtype
  ): State[] {
    return Object.keys(
      node.structuralSubtypes[subtype]?.states || {}
    ) as State[];
  }

  getMenuItems(
    node: HierarchyNode,
    subtype: StructuralSubtype,
    state: State
  ): MenuItemDto[] {
    return node.structuralSubtypes[subtype]?.states[state] || [];
  }

  getStructuralSubtypeItemCount(
    node: HierarchyNode,
    subtype: StructuralSubtype
  ): number {
    const subtypeData = node.structuralSubtypes[subtype];
    if (!subtypeData) return 0;

    return Object.values(subtypeData.states).reduce(
      (total, items) => total + (items?.length || 0),
      0
    );
  }
}
