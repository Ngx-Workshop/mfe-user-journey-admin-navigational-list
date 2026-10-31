import { MenuUnplacedPanelComponent } from './menu-unplaced-panel.component';
import { observePanelBody } from '../../utils/panel-body-viewport';
import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  NgxEntrance,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { MenuListViewModel } from '../../view-models/menu-list.view-model';
import { MenuReorderService } from '../../view-models/menu-reorder.service';
import { MenuWorkspaceViewModel } from '../../view-models/menu-workspace.view-model';
import { MenuTreeComponent } from '../menu-hierarchy/menu-tree.component';
import { MenuItemCardComponent } from './menu-item-card.component';

@Component({
  selector: 'ngx-menu-workspace-results',
  imports: [
    MenuUnplacedPanelComponent,
    NgxPanel,
    NgxEntrance,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MenuTreeComponent,
    MenuItemCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="menu-workspace-layout"
      [class.menu-workspace-layout--repairs]="
        model.unplaced().length > 0
      "
    >
      <ngx-panel
        ngxEntrance="fade"
        heading="Destinations"
        headingMotion="stagger"
        headingMotionKey="destinations"
        eyebrow="NAVIGATION / STRUCTURE"
        shape="stepped"
        background="grid"
        tone="primary"
        aria-label="Navigation catalog and structure"
        [attr.aria-busy]="busy"
      >
        <div ngxPanelHeader class="menu-workspace__toolbar">
          <span class="menu-workspace__count"
            >{{ model.listCount() }}
            {{
              model.hasFilters()
                ? model.listCount() === 1
                  ? 'match'
                  : 'matches'
                : model.listCount() === 1
                  ? 'destination'
                  : 'destinations'
            }}</span
          >
          <div class="menu-workspace__tools">
            <button
              mat-icon-button
              type="button"
              aria-label="Expand all branches"
              matTooltip="Expand all branches"
              matTooltipClass="ngx-design-system-overlay"
              [disabled]="busy || dragging() || model.hasFilters()"
              (click)="model.expandAll()"
            >
              <mat-icon>unfold_more</mat-icon>
            </button>
            <button
              mat-icon-button
              type="button"
              aria-label="Collapse all branches"
              matTooltip="Collapse all branches"
              matTooltipClass="ngx-design-system-overlay"
              [disabled]="busy || dragging() || model.hasFilters()"
              (click)="model.collapseAll()"
            >
              <mat-icon>unfold_less</mat-icon>
            </button>
          </div>
        </div>
        <section
          class="menu-workspace"
          #workspaceBody
          [style.height.px]="bodyHeight()"
        >
          <!-- <p
          class="menu-workspace__status"
          role="status"
          aria-live="polite"
        >
          {{
            model.hasFilters()
              ? 'Matching destinations'
              : 'Ordered by menu position'
          }}
          @if (model.contextIds().size) {
            · {{ model.contextIds().size }} ancestors shown for
            context
          }
        </p> -->
          @if (model.hasFilters()) {
            <p class="menu-workspace__notice">
              Filters keep ancestor context. Clear filters to reorder
              complete sibling lists.
            </p>
          }
          <div
            class="menu-workspace__rows"
            #rows
            tabindex="0"
            role="region"
            aria-label="Scrollable destinations and hierarchy"
          >
            @if (
              !model.sections().length && !model.archived().length
            ) {
              <p class="menu-workspace__notice">
                No placed destinations match the current filters.
              </p>
            }
            @for (section of model.sections(); track section.id) {
              <section
                class="menu-workspace__section"
                [attr.aria-label]="
                  section.domainLabel +
                  ' ' +
                  section.placement +
                  ' ' +
                  section.state
                "
              >
                <h3>
                  {{ section.domainLabel }} <span>/</span>
                  {{ section.placement }} <span>/</span>
                  {{ section.state }}
                  <small>{{ section.count }} shown</small>
                </h3>
                <ngx-menu-tree
                  [items]="section.items"
                  [listId]="section.id"
                  [connectedTo]="
                    model.connected().get(section.id) || []
                  "
                  [collapsedIds]="model.visibleCollapsedIds()"
                  [contextIds]="model.contextIds()"
                  [isDragging]="dragging()"
                  [disabled]="busy"
                  [reorderDisabled]="model.hasFilters()"
                  (toggleRequested)="model.toggle($event)"
                  (moveRequested)="onMove($event)"
                  (dropped)="onDrop($event)"
                  (itemAction)="actions.act($event)"
                  (dragStarted)="reorder.onDragStarted()"
                  (dragEnded)="reorder.onDragEnded()"
                />
              </section>
            }
            @if (model.archived().length) {
              <section
                class="menu-workspace__section"
                aria-label="Archived destinations"
              >
                <h3>
                  Archived destinations
                  <small>{{ model.archived().length }}</small>
                </h3>
                @for (item of model.archived(); track item._id) {
                  <ngx-menu-item-card
                    [item]="item"
                    [disabled]="busy"
                    (action)="actions.act($event)"
                  />
                }
              </section>
            }
          </div>
        </section>
        <p ngxPanelActions class="menu-workspace__hint">
          <mat-icon>info_outline</mat-icon>Drag handles or use arrows
          to reorder. Use item actions to edit, archive or copy an ID.
          Changes save immediately.
        </p>
      </ngx-panel>
      @if (model.unplaced().length) {
        <ngx-menu-unplaced-panel
          [items]="model.unplaced()"
          [busy]="busy"
          (itemAction)="actions.act($event)"
        />
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        min-height: 0;
      }
      .menu-workspace-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
        height: 100%;
        min-height: 0;
        align-items: start;
      }
      .menu-workspace-layout--repairs {
        grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
        gap: 16px;
      }
      ngx-panel {
        height: auto;
      }
      .menu-workspace {
        color: var(--ngx-color-text);
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .menu-workspace__toolbar {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: var(--ngx-space-4);
        min-width: 0;
      }
      .menu-workspace__count {
        color: var(--ngx-color-primary);
        font: var(--ngx-font-label);
      }
      .menu-workspace__status {
        margin: 0 0 12px;
        color: var(--ngx-color-muted);
        font-size: 0.7rem;
      }
      .menu-workspace__tools {
        display: flex;
        flex-shrink: 0;
      }
      .menu-workspace__rows {
        flex: 1;
        min-height: 0;
        overflow: auto;
        scrollbar-width: thin;
        border: 1px solid var(--ngx-color-border);
      }
      .menu-workspace__rows:focus-visible {
        outline: 2px solid var(--ngx-color-primary);
        outline-offset: -2px;
      }
      h3 {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 8px;
        margin: 0;
        padding: 10px 12px;
        background: var(--ngx-color-surface);
        border-bottom: 1px solid var(--ngx-color-border);
        font: 500 0.75rem/1.5 var(--ngx-font-mono);
      }
      h3 span {
        color: var(--ngx-color-muted);
      }
      h3 small {
        margin-left: auto;
        color: var(--ngx-color-muted);
        font-size: 0.65rem;
      }
      .menu-workspace__notice {
        margin: 0;
        padding: 8px 12px;
        color: var(--ngx-color-warning);
        font-size: 0.72rem;
        border-bottom: 1px solid var(--ngx-color-border);
        line-height: 1.5;
      }
      .menu-workspace__hint {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 0;
        color: var(--ngx-color-muted);
        font-size: 0.7rem;
        line-height: 1.5;
      }
      .menu-workspace__hint mat-icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        font-size: 16px;
      }
      @media (max-width: 900px) {
        .menu-workspace-layout,
        .menu-workspace-layout--repairs {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: none;
          height: auto;
        }
        h3 {
          top: calc(
            var(--menu-toolbar-top, 76px) +
              var(--menu-action-bar-height, 64px)
          );
        }
        .menu-workspace {
          height: auto;
        }
        .menu-workspace__rows {
          overflow: visible;
        }
      }
    `,
  ],
})
export class MenuWorkspaceResultsComponent {
  readonly model = inject(MenuWorkspaceViewModel);
  readonly actions = inject(MenuListViewModel);
  readonly reorder = inject(MenuReorderService);
  readonly dragging = toSignal(this.reorder.isDragging$, {
    initialValue: false,
  });
  private readonly rows = viewChild<ElementRef<HTMLElement>>('rows');
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly workspaceBody =
    viewChild.required<ElementRef<HTMLElement>>('workspaceBody');
  readonly bodyHeight = signal<number | null>(null);
  constructor() {
    afterNextRender(() =>
      observePanelBody(
        this.element.nativeElement,
        this.workspaceBody().nativeElement,
        this.destroyRef,
        (height) => this.bodyHeight.set(height)
      )
    );
    afterRenderEffect(() => {
      this.model.filterKey();
      const rows = this.rows()?.nativeElement;
      if (rows) rows.scrollTop = 0;
    });
  }
  get busy(): boolean {
    return this.model.store.pending() || this.model.store.loading();
  }
  onMove(event: {
    item: import('../../models/menu.types').MenuItemWithChildren;
    position: number;
  }): void {
    if (!this.model.hasFilters())
      this.reorder.move(event.item, event.position);
  }
  onDrop(event: Parameters<MenuReorderService['drop']>[0]): void {
    if (!this.model.hasFilters()) this.reorder.drop(event);
  }
}
