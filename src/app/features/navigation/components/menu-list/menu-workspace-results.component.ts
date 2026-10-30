import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MenuWorkspaceViewModel } from '../../view-models/menu-workspace.view-model';
import { MenuListViewModel } from '../../view-models/menu-list.view-model';
import { MenuReorderService } from '../../view-models/menu-reorder.service';
import { MenuTreeComponent } from '../menu-hierarchy/menu-tree.component';
import { MenuItemCardComponent } from './menu-item-card.component';

@Component({
  selector: 'ngx-menu-workspace-results',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MenuTreeComponent,
    MenuItemCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="menu-workspace"
      aria-label="Navigation catalog and structure"
      [attr.aria-busy]="busy"
    >
      <div class="menu-workspace__toolbar">
        <div>
          <h2>
            Destinations <span>{{ model.filtered().length }}</span>
          </h2>
          <p role="status" aria-live="polite">
            {{
              model.hasFilters()
                ? 'Matching destinations'
                : 'Ordered by menu position'
            }}
            @if (model.contextIds().size) {
              · {{ model.contextIds().size }} ancestors shown for
              context
            }
          </p>
        </div>
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
              [connectedTo]="model.connected().get(section.id) || []"
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
        @if (model.unplaced().length) {
          <section
            class="menu-workspace__section"
            aria-label="Items needing hierarchy repair"
          >
            <h3>
              Unplaced destinations
              <small>{{ model.unplaced().length }}</small>
            </h3>
            <p class="menu-workspace__notice">
              These items have an unavailable parent or invalid
              ancestry. Edit their parent to place them in the
              structure.
            </p>
            @for (item of model.unplaced(); track item._id) {
              <ngx-menu-item-card
                [item]="item"
                [disabled]="busy"
                (action)="actions.act($event)"
              />
            }
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
      <p class="menu-workspace__hint">
        <mat-icon>info_outline</mat-icon>Drag handles or use arrows to
        reorder. Use item actions to edit, archive or copy an ID.
        Changes save immediately.
      </p>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 0;
      }
      .menu-workspace {
        height: 100%;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .menu-workspace__toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--ngx-color-border);
        background: var(--ngx-color-surface);
      }
      h2 {
        margin: 0;
        font: 600 0.9rem/1.5 var(--ngx-font-heading);
      }
      h2 span {
        color: var(--ngx-color-primary);
        margin-left: 8px;
      }
      .menu-workspace__toolbar p {
        margin: 4px 0 0;
        font-size: 0.7rem;
        color: var(--ngx-color-muted);
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
      }
      .menu-workspace__rows:focus-visible {
        outline: 2px solid var(--ngx-color-primary);
        outline-offset: -2px;
      }
      h3 {
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
        padding: 10px 12px;
        border-top: 1px solid var(--ngx-color-border);
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
  constructor() {
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
