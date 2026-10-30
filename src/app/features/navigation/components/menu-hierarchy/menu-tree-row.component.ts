import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MenuItemActionEvent } from '../menu-list/menu-item-card.component';
import { MenuItemWithChildren } from '../../models/menu.types';
import { menuRouteUrl } from '../../utils/menu-route';
@Component({
  selector: 'ngx-menu-tree-row',
  imports: [
    CdkDragHandle,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div
    class="menu-tree-row__item-row"
    [class.menu-tree-row__item-row--context]="context()"
  >
    <span
      class="menu-tree-row__handle"
      cdkDragHandle
      aria-hidden="true"
    >
      <mat-icon fontIcon="drag_indicator" />
    </span>
    @if (item().children?.length) {
      <button
        class="menu-tree-row__toggle"
        mat-icon-button
        type="button"
        [attr.aria-label]="
          (collapsed() ? 'Expand ' : 'Collapse ') +
          item().menuItemText
        "
        [attr.aria-expanded]="!collapsed()"
        [attr.aria-controls]="controlsId()"
        [disabled]="disabled() || dragging() || reorderDisabled()"
        (click)="toggleRequested.emit()"
      >
        <mat-icon>{{
          collapsed() ? 'chevron_right' : 'expand_more'
        }}</mat-icon>
      </button>
    } @else {
      <span class="menu-tree-row__leaf" aria-hidden="true"></span>
    }
    <span
      class="menu-tree-row__position"
      [attr.aria-label]="
        reorderDisabled()
          ? 'Filtered destination'
          : 'Sibling position'
      "
      >{{ reorderDisabled() ? '·' : position() }}</span
    >
    <div class="menu-tree-row__labels">
      <div class="menu-tree-row__menu-text">
        {{ item().menuItemText }}
        @if (context()) {
          <span class="menu-tree-row__context">Ancestor context</span>
        }
        @if (item().children?.length) {
          <span class="menu-tree-row__children"
            >{{ item().children!.length }}
            {{
              item().children!.length === 1 ? 'child' : 'children'
            }}</span
          >
        }
      </div>
      <div class="menu-tree-row__menu-route-container">
        <a
          [href]="routeUrl(item())"
          target="_blank"
          rel="noopener"
          class="menu-tree-row__menu-route"
          >{{ item().routePath }}</a
        >
      </div>
    </div>
    <span
      class="menu-tree-row__access"
      [title]="
        item().role === 'none'
          ? 'Public access'
          : item().role + ' access'
      "
      >{{ item().role === 'none' ? 'Public' : item().role }}</span
    >
    <div class="menu-tree-row__actions">
      <button
        mat-icon-button
        type="button"
        [attr.aria-label]="'Move ' + item().menuItemText + ' up'"
        [disabled]="
          disabled() || reorderDisabled() || position() === 1
        "
        (click)="moveRequested.emit(position() - 1)"
      >
        <mat-icon>keyboard_arrow_up</mat-icon>
      </button>
      <button
        mat-icon-button
        type="button"
        [attr.aria-label]="'Move ' + item().menuItemText + ' down'"
        [disabled]="
          disabled() ||
          reorderDisabled() ||
          position() === siblingCount()
        "
        (click)="moveRequested.emit(position() + 1)"
      >
        <mat-icon>keyboard_arrow_down</mat-icon>
      </button>
      <button
        mat-icon-button
        type="button"
        (click)="act('edit')"
        [disabled]="disabled()"
        [attr.aria-label]="'Edit ' + item().menuItemText"
        matTooltip="Edit item or change parent"
        matTooltipClass="ngx-design-system-overlay"
      >
        <mat-icon>edit</mat-icon>
      </button>
      <button
        mat-icon-button
        type="button"
        [matMenuTriggerFor]="actionsMenu"
        [disabled]="disabled()"
        [attr.aria-label]="'Actions for ' + item().menuItemText"
      >
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu
        #actionsMenu="matMenu"
        class="ngx-design-system-overlay"
      >
        <button
          mat-menu-item
          [disabled]="disabled()"
          (click)="act('archive')"
        >
          <mat-icon>archive</mat-icon>Archive
        </button>
        <button mat-menu-item (click)="act('copy')">
          <mat-icon>content_copy</mat-icon>Copy ID
        </button>
      </mat-menu>
    </div>
  </div>`,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        display: block;
        min-width: 0;
        @include mat.icon-button-density(-3);
      }
      .menu-tree-row__item-row--context .menu-tree-row__menu-text {
        color: var(--ngx-color-muted);
      }
      .menu-tree-row__context {
        margin-left: 8px;
        color: var(--ngx-color-warning);
        font-size: 0.65rem;
      }
      .menu-tree-row__access {
        flex-shrink: 0;
        color: var(--ngx-color-muted);
        font-size: 0.65rem;
        margin: 0 8px;
      }
      .menu-tree-row__handle {
        display: flex;
        align-items: center;
        cursor: grab;
        color: var(--ngx-color-muted);
        touch-action: none;
      }
      .menu-tree-row__handle mat-icon {
        width: 16px;
        height: 16px;
        font-size: 16px;
      }
      .menu-tree-row__item-row {
        display: flex;
        align-items: center;
        gap: 4px;
        min-height: 52px;
        padding: 4px 8px;
        border-bottom: 1px solid var(--ngx-color-border);
        background: var(--ngx-color-surface-low);
      }
      .menu-tree-row__item-row:hover,
      .menu-tree-row__item-row:focus-within {
        background: var(--ngx-color-surface);
      }
      .menu-tree-row__leaf {
        width: 36px;
        flex-shrink: 0;
      }
      .menu-tree-row__toggle {
        flex-shrink: 0;
      }
      .menu-tree-row__position {
        min-width: 20px;
        text-align: center;
        color: var(--ngx-color-muted);
        font: 0.65rem/1.5 var(--ngx-font-mono);
      }
      .menu-tree-row__labels {
        flex: 1;
        min-width: 0;
      }
      .menu-tree-row__menu-text {
        font-size: 0.8rem;
        font-weight: 500;
        overflow-wrap: anywhere;
      }
      .menu-tree-row__children {
        margin-left: 8px;
        white-space: nowrap;
        color: var(--ngx-color-muted);
        font-size: 0.65rem;
      }
      .menu-tree-row__menu-route {
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--ngx-color-primary);
        text-decoration: none;
        font: 0.65rem/1.5 var(--ngx-font-mono);
      }
      .menu-tree-row__menu-route:hover {
        text-decoration: underline;
      }
      .menu-tree-row__actions {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      @media (max-width: 600px) {
        .menu-tree-row__item-row {
          flex-wrap: wrap;
          padding: 4px;
        }
        .menu-tree-row__labels {
          min-width: 100px;
        }
        .menu-tree-row__access {
          display: none;
        }
        .menu-tree-row__children {
          display: block;
          margin-left: 0;
        }
        .menu-tree-row__actions {
          margin-left: auto;
        }
      }
    `,
  ],
})
export class MenuTreeRowComponent {
  readonly routeUrl = menuRouteUrl;
  readonly item = input.required<MenuItemWithChildren>();
  readonly position = input.required<number>();
  readonly siblingCount = input.required<number>();
  readonly controlsId = input.required<string>();
  readonly collapsed = input(false);
  readonly disabled = input(false);
  readonly dragging = input(false);
  readonly reorderDisabled = input(false);
  readonly context = input(false);
  readonly itemAction = output<MenuItemActionEvent>();
  act(type: MenuItemActionEvent['type']): void {
    this.itemAction.emit({ type, item: this.item() });
  }
  readonly moveRequested = output<number>();
  readonly toggleRequested = output<void>();
}
