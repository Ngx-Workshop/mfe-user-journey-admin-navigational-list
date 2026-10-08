import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { BehaviorSubject, combineLatest, map, of } from 'rxjs';
import {
  MenuHierarchyWithChildren,
  MenuItemWithChildren,
  State,
  StructuralSubtype,
} from '../../models/menu.types';
import { MenuReorderService } from '../../view-models/menu-reorder.service';
import { MenuTreeComponent } from './menu-tree.component';

import {
  connectedListIds,
  DOMAIN_URL_MAP,
  NameIcon,
  STATE_ICON_MAP,
  SUBTYPE_ICON_MAP,
} from '../../utils/hierarchy-view';
type MenuHierarchyMap = Map<string, MenuHierarchyWithChildren>;

type ViewModel = {
  menuHierarchy: MenuHierarchyMap;
  structuralSubtypes: Map<StructuralSubtype, NameIcon>;
  states: Map<State, NameIcon>;
  isDragging: boolean;
  connectedListIds?: Map<string, string[]>;
  handleDrop?: (event: CdkDragDrop<MenuItemWithChildren[]>) => void;
};
@Component({
  selector: 'ngx-menu-hierarchy-manager',
  providers: [MenuReorderService],
  standalone: true,
  imports: [
    DragDropModule,
    MatDividerModule,
    MatChipsModule,
    MenuTreeComponent,
    MatExpansionModule,
    MatIcon,
    MatCardModule,
    AsyncPipe,
    KeyValuePipe,
  ],
  template: `
    <div class="menu-hierarchy-manager__intro">
      <h2>Navigation hierarchy</h2>
      <p>
        Explore placement and display states. Drag items or use the
        arrow buttons to reorder siblings. Change a parent in the item
        editor.
      </p>
    </div>
    @if (viewModel$ | async; as vm) {
      <div cdkDropListGroup>
        @for (
          group of vm.menuHierarchy | keyvalue;
          track group.key;
          let gi = $index
        ) {
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>domain</mat-icon>
                {{
                  group.value.domain === 'ADMIN'
                    ? 'Admin navigation'
                    : 'Workshop navigation'
                }}
              </mat-card-title>
              <mat-card-subtitle>
                <a
                  [href]="group.key"
                  target="_blank"
                  rel="noopener"
                  >{{ group.key }}</a
                >
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <mat-accordion
                class="menu-hierarchy-manager__subtype-expansion-panel"
              >
                @for (
                  subtype of vm.structuralSubtypes | keyvalue;
                  track subtype.key
                ) {
                  @if (
                    group.value.structuralSubtypes[subtype.key];
                    as structuralSubtype
                  ) {
                    <mat-expansion-panel>
                      <mat-expansion-panel-header>
                        <mat-panel-title>
                          <!-- <mat-icon>{{ subtype.value.icon }}</mat-icon> -->
                          {{ subtype.value.name }}
                        </mat-panel-title>
                      </mat-expansion-panel-header>
                      <mat-accordion
                        class="menu-hierarchy-manager__state-expansion-panel"
                      >
                        @for (
                          state of vm.states | keyvalue;
                          track state.key
                        ) {
                          @if (
                            structuralSubtype.states?.[state.key];
                            as statesArr
                          ) {
                            <mat-expansion-panel>
                              <mat-expansion-panel-header>
                                <mat-panel-title>
                                  <mat-icon>{{
                                    state.value.icon
                                  }}</mat-icon>
                                  {{ state.value.name }}
                                </mat-panel-title>
                                <mat-panel-description
                                  >{{ statesArr.length }} root
                                  items</mat-panel-description
                                >
                              </mat-expansion-panel-header>
                              <ngx-menu-tree
                                [items]="statesArr"
                                listId="list-{{
                                  group.value.domain === 'ADMIN'
                                    ? 'Admin navigation'
                                    : 'Workshop navigation'
                                }}-{{ subtype.key }}-{{ state.key }}"
                                [connectedTo]="
                                  vm.connectedListIds.get(
                                    listId(
                                      group.value.domain,
                                      subtype.key,
                                      state.key
                                    )
                                  ) || []
                                "
                                [isDragging]="vm.isDragging"
                                [disabled]="
                                  reorder.store.pending() ||
                                  reorder.store.loading()
                                "
                                (moveRequested)="
                                  reorder.move(
                                    $event.item,
                                    $event.position
                                  )
                                "
                                (dropped)="vm.handleDrop($event)"
                                (dragStarted)="
                                  reorder.onDragStarted()
                                "
                                (dragEnded)="reorder.onDragEnded()"
                              ></ngx-menu-tree>
                            </mat-expansion-panel>
                          }
                        }
                      </mat-accordion>
                    </mat-expansion-panel>
                  }
                }
              </mat-accordion>
            </mat-card-content>
          </mat-card>
        }
      </div>
    } @else {
      <p role="status">Loading navigation hierarchy…</p>
    }
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      .menu-hierarchy-manager__intro {
        margin-bottom: 24px;
      }
      .menu-hierarchy-manager__intro h2 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 8px;
      }
      .menu-hierarchy-manager__intro p {
        margin: 0;
        max-width: 680px;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--mat-sys-on-surface-variant);
      }
      mat-card {
        margin-bottom: 32px;
      }
      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.15rem;
      }
      mat-card-subtitle a {
        color: var(--mat-sys-primary);
        font-size: 0.85rem;
        overflow-wrap: anywhere;
        text-underline-offset: 3px;
      }
      mat-card-subtitle {
        font-weight: 500;
        margin-bottom: 1.125rem;
      }
      mat-panel-title {
        font-weight: 500;
      }
      mat-panel-title mat-icon {
        vertical-align: middle;
        margin-right: 1rem;
      }

      .menu-hierarchy-manager__state-expansion-panel {
        @include mat.expansion-overrides(
          (
            container-text-color: var(
                --mat-sys-on-secondary-container
              ),
            container-background-color: var(
                --mat-sys-surface-container-highest
              ),
          )
        );
      }

      .menu-hierarchy-manager__subtype-expansion-panel {
        @include mat.expansion-overrides(
          (
            container-text-color: var(
                --mat-sys-on-secondary-container
              ),
            container-background-color: var(
                --mat-sys-surface-container
              ),
            container-elevation-shadow: var(--mat-sys-level0),
          )
        );
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuHierarchyManagerComponent {
  reorder = inject(MenuReorderService);

  @Input({ required: true, alias: 'menuHierarchy' })
  set _menuHierarchy(menuHierarchy: MenuHierarchyWithChildren[]) {
    const map = new Map<string, MenuHierarchyWithChildren>();
    for (const group of menuHierarchy) {
      map.set(DOMAIN_URL_MAP.get(group.domain) ?? 'Unknown', {
        ...group,
      });
    }
    this.menuHierarchy.next(map);
  }

  private menuHierarchy = new BehaviorSubject<MenuHierarchyMap>(
    new Map()
  );
  private structuralSubtypes = of(SUBTYPE_ICON_MAP);
  private states = of(STATE_ICON_MAP);

  viewModel$ = combineLatest({
    menuHierarchy: this.menuHierarchy,
    structuralSubtypes: this.structuralSubtypes,
    states: this.states,
    isDragging: this.reorder.isDragging$,
  }).pipe(
    map((data: ViewModel) => ({
      ...data,
      connectedListIds: connectedListIds(data.menuHierarchy),
      handleDrop: this.handleDrop.bind(this),
    }))
  );

  listId(domain: string, subtype: string, state: string) {
    return `list-${domain}-${subtype}-${state}`;
  }

  private handleDrop(event: CdkDragDrop<MenuItemWithChildren[]>) {
    void this.reorder.drop(event);
  }
}
