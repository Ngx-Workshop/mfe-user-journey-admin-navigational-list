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
import { MenuReorderService } from '../../services/menu-reorder.service';
import {
  Domain,
  MenuHierarchyWithChildren,
  MenuItemWithChildren,
  State,
  StructuralSubtype,
} from '../../types/menu.types';
import { MenuTreeComponent } from './menu-tree.component';

type NameIcon = { name: string; icon: string };
type MenuHierarchyMap = Map<string, MenuHierarchyWithChildren>;

const DOMAIN_URL_MAP: Map<Domain, string> = new Map<Domain, string>([
  ['ADMIN', 'https://admin.ngx-workshop.io'],
  ['WORKSHOP', 'https://beta.ngx-workshop.io'],
]);

const SUBTYPE_ICON_MAP = new Map<StructuralSubtype, NameIcon>([
  ['HEADER', { name: 'Header', icon: 'page_header' }],
  ['NAV', { name: 'Side Navigation', icon: 'side_navigation' }],
  ['FOOTER', { name: 'Footer', icon: 'page_footer' }],
]);

const STATE_ICON_MAP = new Map<State, NameIcon>([
  ['FULL', { name: 'Full', icon: 'fullscreen' }],
  ['RELAXED', { name: 'Relaxed', icon: 'fullscreen_exit' }],
  ['COMPACT', { name: 'Compact', icon: 'compress' }],
]);

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
    @if (viewModel$ | async; as vm) {
    <div cdkDropListGroup>
      @for (group of vm.menuHierarchy | keyvalue; track group.key; let
      gi = $index) {
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>domain</mat-icon>
            {{ group.value.domain }}
          </mat-card-title>
          <mat-card-subtitle>
            <a [href]="group.key" target="blank">{{ group.key }}</a>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-accordion class="subtype-expansion-panel">
            @for (subtype of vm.structuralSubtypes | keyvalue; track
            subtype.key) {
            @if(group.value.structuralSubtypes[subtype.key]; as
            structuralSubtype) {
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <!-- <mat-icon>{{ subtype.value.icon }}</mat-icon> -->
                  {{ subtype.value.name }}
                </mat-panel-title>
              </mat-expansion-panel-header>
              <mat-accordion class="state-expansion-panel">
                @for (state of vm.states | keyvalue; track state.key)
                { @if (structuralSubtype.states?.[state.key]; as
                statesArr) {
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>{{ state.value.icon }}</mat-icon>
                      {{ state.value.name }}
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  <ngx-menu-tree
                    [items]="statesArr"
                    listId="list-{{ group.value.domain }}-{{
                      subtype.key
                    }}-{{ state.key }}"
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
                    (dropped)="vm.handleDrop($event)"
                    (dragStarted)="reorder.onDragStarted()"
                    (dragEnded)="reorder.onDragEnded()"
                  ></ngx-menu-tree>
                </mat-expansion-panel>
                } }
              </mat-accordion>
            </mat-expansion-panel>
            } }
          </mat-accordion>
        </mat-card-content>
      </mat-card>
      }
    </div>
    } @else {
    <div>Loading...</div>
    }
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      mat-card {
        margin-bottom: 32px;
      }
      mat-card-subtitle {
        font-weight: 100;
        margin-bottom: 1.125rem;
      }
      mat-panel-title {
        font-weight: 100;
      }
      mat-panel-title mat-icon {
        vertical-align: middle;
        margin-right: 1rem;
      }

      .state-expansion-panel {
        @include mat.expansion-overrides(
          (
            container-text-color:
              var(--mat-sys-on-secondary-container),
            container-background-color:
              var(--mat-sys-surface-container-highest),
          )
        );
      }

      .subtype-expansion-panel {
        @include mat.expansion-overrides(
          (
            container-text-color:
              var(--mat-sys-on-secondary-container),
            container-background-color:
              var(--mat-sys-surface-container),
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
      connectedListIds: this.connectedListIds(data),
      handleDrop: this.handleDrop.bind(this),
    }))
  );

  listId(domain: string, subtype: string, state: string) {
    return `list-${domain}-${subtype}-${state}`;
  }

  private connectedListIds({
    menuHierarchy,
    states,
    structuralSubtypes,
  }: ViewModel): Map<string, string[]> {
    const map = new Map<string, string[]>();
    const collect = (
      rootId: string,
      items: MenuItemWithChildren[]
    ): string[] => {
      const ids: string[] = [rootId];
      const addDeep = (
        prefix: string,
        arr: MenuItemWithChildren[]
      ) => {
        for (const item of arr) {
          const childId = `${prefix}-${item._id}`;
          ids.push(childId);
          if (item.children?.length) addDeep(childId, item.children);
        }
      };
      addDeep(rootId, items);
      return ids;
    };

    for (const [_, group] of menuHierarchy) {
      for (const [subtype] of structuralSubtypes) {
        const st = group.structuralSubtypes?.[subtype];
        if (!st) continue;
        for (const [state] of states) {
          const arr = st.states?.[state];
          if (!arr) continue;
          const rootId = this.listId(group.domain, subtype, state);
          map.set(rootId, collect(rootId, arr));
        }
      }
    }
    return map;
  }

  private handleDrop(event: CdkDragDrop<MenuItemWithChildren[]>) {
    void this.reorder.drop(event);
  }
}
