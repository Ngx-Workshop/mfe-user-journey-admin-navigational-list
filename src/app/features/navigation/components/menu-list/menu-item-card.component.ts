import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <article class="menu-item-card" [class.menu-item-card--archived]="item.archived" [attr.aria-label]="item.menuItemText">
      <div class="menu-item-card__heading">
        <span class="menu-item-card__domain"><mat-icon>{{ item.domain === 'ADMIN' ? 'admin_panel_settings' : 'school' }}</mat-icon>{{ item.domain === 'ADMIN' ? 'Admin' : 'Workshop' }}</span>
        <span class="menu-item-card__status" [class.menu-item-card__status--archived]="item.archived">{{ item.archived ? 'Archived' : 'Active' }}</span>
      </div>
      <h3>{{ item.menuItemText }}</h3>
      <a class="menu-item-card__route" [href]="routeUrl" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Open ' + item.menuItemText + ' in a new tab'">
        <span>{{ item.routePath }}</span><mat-icon>open_in_new</mat-icon>
      </a>
      <p class="menu-item-card__description">{{ item.description || 'No description added.' }}</p>
      <div class="menu-item-card__tags">
        <span>{{ placement }}</span><span>{{ displayState }}</span>
        <span><mat-icon>{{ item.role === 'none' ? 'public' : 'lock_outline' }}</mat-icon>{{ roleLabel }}</span>
      </div>
      <div class="menu-item-card__footer">
        <button mat-button (click)="onAction('edit')" [disabled]="disabled" [attr.aria-label]="'Edit ' + item.menuItemText"><mat-icon>edit</mat-icon>Edit</button>
        <button mat-button (click)="onAction(item.archived ? 'unarchive' : 'archive')" [disabled]="disabled"
          [attr.aria-label]="(item.archived ? 'Restore ' : 'Archive ') + item.menuItemText">
          <mat-icon>{{ item.archived ? 'unarchive' : 'archive' }}</mat-icon>{{ item.archived ? 'Restore' : 'Archive' }}
        </button>
        <button class="menu-item-card__copy" mat-icon-button (click)="onAction('copy')" matTooltip="Copy menu item ID"
          [attr.aria-label]="'Copy ID for ' + item.menuItemText"><mat-icon>content_copy</mat-icon></button>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .menu-item-card { display: flex; flex-direction: column; height: 100%; box-sizing: border-box; border: 1px solid var(--mat-sys-outline-variant); border-radius: 16px; padding: 20px 20px 8px; background: var(--mat-sys-surface); transition: border-color 160ms, box-shadow 160ms; }
    .menu-item-card:hover, .menu-item-card:focus-within { border-color: var(--mat-sys-primary); box-shadow: 0 4px 16px color-mix(in srgb, var(--mat-sys-shadow) 8%, transparent); }
    .menu-item-card--archived { background: var(--mat-sys-surface-container-low); }
    .menu-item-card__heading { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .menu-item-card__domain { display: inline-flex; align-items: center; gap: 6px; font-size: .75rem; color: var(--mat-sys-on-surface-variant); font-weight: 500; }
    .menu-item-card__domain mat-icon { width: 16px; height: 16px; font-size: 16px; }
    .menu-item-card__status { font-size: .7rem; padding: 4px 8px; border-radius: 6px; color: var(--mat-sys-on-primary-container); background: var(--mat-sys-primary-container); }
    .menu-item-card__status--archived { color: var(--mat-sys-on-surface-variant); background: var(--mat-sys-surface-container-highest); }
    h3 { margin: 18px 0 8px; font-size: 1.1rem; line-height: 1.4; font-weight: 600; overflow-wrap: anywhere; }
    .menu-item-card__route { display: flex; align-items: center; gap: 6px; width: fit-content; max-width: 100%; color: var(--mat-sys-primary); font-size: .8rem; text-decoration: none; }
    .menu-item-card__route span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .menu-item-card__route mat-icon { font-size: 14px; width: 14px; height: 14px; flex-shrink: 0; }
    .menu-item-card__route:hover { text-decoration: underline; }
    .menu-item-card__description { color: var(--mat-sys-on-surface-variant); font-size: .85rem; line-height: 1.6; margin: 14px 0 18px; overflow-wrap: anywhere; }
    .menu-item-card__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; padding-bottom: 18px; }
    .menu-item-card__tags span { display: inline-flex; align-items: center; gap: 4px; font-size: .7rem; line-height: 1.5; padding: 4px 8px; background: var(--mat-sys-surface-container); border-radius: 6px; color: var(--mat-sys-on-surface-variant); }
    .menu-item-card__tags mat-icon { font-size: 12px; width: 12px; height: 12px; }
    .menu-item-card__footer { border-top: 1px solid var(--mat-sys-outline-variant); display: flex; align-items: center; gap: 0; padding-top: 8px; }
    .menu-item-card__copy { margin-left: auto; color: var(--mat-sys-on-surface-variant); }
    @media (prefers-reduced-motion: reduce) { .menu-item-card { transition: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemCardComponent {
  @Input({ required: true }) item!: MenuItemDto;
  @Input() disabled = false;
  @Output() action = new EventEmitter<MenuItemActionEvent>();
  get placement(): string { return { HEADER: 'Header', NAV: 'Side navigation', FOOTER: 'Footer' }[this.item.structuralSubtype]; }
  get displayState(): string { return { FULL: 'Full', RELAXED: 'Relaxed', COMPACT: 'Compact' }[this.item.state]; }
  get roleLabel(): string { return this.item.role === 'none' ? 'Public access' : this.item.role.charAt(0).toUpperCase() + this.item.role.slice(1); }
  get routeUrl(): string { return menuRouteUrl(this.item); }
  onAction(type: MenuItemActionEvent['type']): void { this.action.emit({ type, item: this.item }); }
}
