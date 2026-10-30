import {
  NgxStatus,
  NgxButton,
} from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';

import { menuRouteUrl } from '../../utils/menu-route';

export interface MenuItemActionEvent {
  type: 'edit' | 'archive' | 'unarchive' | 'delete' | 'copy';
  item: MenuItemDto;
}

@Component({
  selector: 'ngx-menu-item-card',
  imports: [
    NgxStatus,
    NgxButton,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <article
      class="menu-item-card"
      [class.menu-item-card--archived]="item.archived"
      [attr.aria-label]="item.menuItemText"
    >
      <div class="menu-item-card__identity">
        <h3 [title]="item.description || item.menuItemText">
          {{ item.menuItemText }}
        </h3>
        <a
          class="menu-item-card__route"
          [href]="routeUrl"
          target="_blank"
          rel="noopener noreferrer"
          [attr.aria-label]="
            'Open ' + item.menuItemText + ' in a new tab'
          "
        >
          <span>{{ item.routePath }}</span
          ><mat-icon>open_in_new</mat-icon>
        </a>
      </div>
      <div class="menu-item-card__classification">
        <span class="menu-item-card__domain"
          >{{ item.domain === 'ADMIN' ? 'Admin' : 'Workshop' }}
          <span aria-hidden="true">/</span> {{ placement }}</span
        >
        <span class="menu-item-card__access"
          >{{ displayState }} · {{ roleLabel }}</span
        >
      </div>
      <ngx-status
        class="menu-item-card__status"
        [label]="item.archived ? 'Archived' : 'Active'"
        [tone]="item.archived ? 'warning' : 'success'"
      />
      <div class="menu-item-card__actions">
        <button
          mat-flat-button
          ngxButton
          surface="outline"
          type="button"
          (click)="onAction('edit')"
          [disabled]="disabled"
          [attr.aria-label]="'Edit ' + item.menuItemText"
        >
          Edit
        </button>
        <button
          mat-icon-button
          type="button"
          (click)="onAction(item.archived ? 'unarchive' : 'archive')"
          [disabled]="disabled"
          [matTooltip]="
            item.archived ? 'Restore item' : 'Archive item'
          "
          matTooltipClass="ngx-design-system-overlay"
          [attr.aria-label]="
            (item.archived ? 'Restore ' : 'Archive ') +
            item.menuItemText
          "
        >
          <mat-icon>{{
            item.archived ? 'unarchive' : 'archive'
          }}</mat-icon>
        </button>
        <button
          mat-icon-button
          type="button"
          (click)="onAction('copy')"
          matTooltip="Copy menu item ID"
          matTooltipClass="ngx-design-system-overlay"
          [attr.aria-label]="'Copy ID for ' + item.menuItemText"
        >
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .menu-item-card {
        display: grid;
        grid-template-columns:
          minmax(150px, 1.4fr) minmax(150px, 1fr)
          82px auto;
        align-items: center;
        gap: 16px;
        padding: 14px 16px;
        border-bottom: 1px solid var(--ngx-color-border);
        border-left: 2px solid transparent;
        background: var(--ngx-color-surface-low);
        transition:
          background 150ms,
          border-color 150ms;
      }
      .menu-item-card:hover,
      .menu-item-card:focus-within {
        background: var(--ngx-color-surface);
        border-left-color: var(--ngx-color-primary);
      }
      .menu-item-card--archived {
        border-left-color: var(--ngx-color-warning);
      }
      .menu-item-card__identity,
      .menu-item-card__classification {
        min-width: 0;
      }
      h3 {
        margin: 0 0 6px;
        font-size: 0.88rem;
        line-height: 1.4;
        font-weight: 600;
        overflow-wrap: anywhere;
      }
      .menu-item-card__route {
        display: flex;
        align-items: center;
        gap: 6px;
        width: fit-content;
        max-width: 100%;
        color: var(--ngx-color-primary);
        font: 0.7rem/1.5 var(--ngx-font-mono);
        text-decoration: none;
      }
      .menu-item-card__route span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .menu-item-card__route mat-icon {
        flex-shrink: 0;
        width: 12px;
        height: 12px;
        font-size: 12px;
      }
      .menu-item-card__route:hover {
        text-decoration: underline;
      }
      .menu-item-card__classification {
        display: grid;
        gap: 6px;
        font-size: 0.72rem;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }
      .menu-item-card__domain span {
        margin: 0 4px;
        color: var(--ngx-color-border);
      }
      .menu-item-card__access {
        color: var(--ngx-color-muted);
      }
      .menu-item-card__actions {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      @media (min-width: 901px) and (max-width: 1200px) {
        .menu-item-card {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
          gap: 8px;
        }
        .menu-item-card__status {
          grid-column: 3;
          grid-row: 1;
        }
        .menu-item-card__actions {
          grid-column: 1 / -1;
          justify-content: flex-end;
        }
      }
      @media (max-width: 640px) {
        .menu-item-card {
          grid-template-columns: minmax(0, 1fr) auto;
          padding: 12px;
          gap: 10px;
        }
        .menu-item-card__identity {
          grid-column: 1;
        }
        .menu-item-card__status {
          grid-column: 2;
          grid-row: 1;
        }
        .menu-item-card__classification {
          grid-column: 1;
        }
        .menu-item-card__actions {
          grid-column: 1 / -1;
          flex-wrap: wrap;
          justify-content: flex-end;
          max-width: none;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .menu-item-card {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemCardComponent {
  @Input({ required: true }) item!: MenuItemDto;
  @Input() disabled = false;
  @Output() action = new EventEmitter<MenuItemActionEvent>();
  get placement(): string {
    return {
      HEADER: 'Header',
      NAV: 'Side navigation',
      FOOTER: 'Footer',
    }[this.item.structuralSubtype];
  }
  get displayState(): string {
    return { FULL: 'Full', RELAXED: 'Relaxed', COMPACT: 'Compact' }[
      this.item.state
    ];
  }
  get roleLabel(): string {
    return this.item.role === 'none'
      ? 'Public access'
      : this.item.role.charAt(0).toUpperCase() +
          this.item.role.slice(1);
  }
  get routeUrl(): string {
    return menuRouteUrl(this.item);
  }
  onAction(type: MenuItemActionEvent['type']): void {
    this.action.emit({ type, item: this.item });
  }
}
