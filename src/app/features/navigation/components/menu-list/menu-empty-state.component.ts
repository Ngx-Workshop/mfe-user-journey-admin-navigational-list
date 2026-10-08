import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-menu-empty-state',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <section class="menu-empty-state" role="status">
      <span class="menu-empty-state__icon"
        ><mat-icon>{{
          filtered ? 'search_off' : 'route'
        }}</mat-icon></span
      >
      <h2>
        {{
          filtered
            ? 'No matching menu items'
            : 'Build your navigation'
        }}
      </h2>
      <p>
        {{
          filtered
            ? 'Try a different search or reset your filters to see more items.'
            : 'Create your first menu item to connect people with the right places.'
        }}
      </p>
      @if (filtered) {
        <button mat-stroked-button (click)="resetClick.emit()">
          <mat-icon>filter_alt_off</mat-icon>Reset filters
        </button>
      } @else {
        <button mat-flat-button (click)="createClick.emit()">
          <mat-icon>add</mat-icon>Create Menu Item
        </button>
      }
    </section>
  `,
  styles: [
    `
      .menu-empty-state {
        padding: 56px 24px;
        margin-top: 24px;
        text-align: center;
        border: 1px dashed var(--mat-sys-outline-variant);
        border-radius: 16px;
      }
      .menu-empty-state__icon {
        display: inline-flex;
        padding: 16px;
        border-radius: 50%;
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
      .menu-empty-state h2 {
        margin: 20px 0 8px;
        font-weight: 500;
        font-size: 1.2rem;
      }
      .menu-empty-state p {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
        line-height: 1.6;
        max-width: 360px;
        margin: 0 auto 24px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuEmptyStateComponent {
  @Input() filtered = false;
  @Output() createClick = new EventEmitter<void>();
  @Output() resetClick = new EventEmitter<void>();
}
