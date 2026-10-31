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
export interface MenuStatistic {
  title: string;
  value: string | number;
  description?: string;
}
@Component({
  selector: 'ngx-menu-statistics',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="Catalog overview" [attr.aria-busy]="loading">
      <dl class="menu-statistics__counts">
        @for (label of labels; track label; let i = $index) {
          <div
            class="menu-statistics__metric"
            [attr.aria-label]="statistics[i]?.title || label"
          >
            <dt>{{ label }}</dt>
            <dd>{{ statistics[i]?.value ?? '—' }}</dd>
          </div>
        }
      </dl>
      <div class="menu-statistics__sync">
        <span role="status">{{
          loading
            ? 'Syncing catalog…'
            : statistics.length
              ? 'Catalog loaded'
              : 'Awaiting catalog'
        }}</span>
        <button
          mat-icon-button
          type="button"
          aria-label="Refresh catalog"
          matTooltip="Refresh catalog"
          matTooltipClass="ngx-design-system-overlay"
          [disabled]="loading || busy"
          (click)="refreshClick.emit()"
        >
          <mat-icon>sync</mat-icon>
        </button>
      </div>
    </section>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        display: block;
        min-width: 0;
        @include mat.icon-button-density(-3);
      }
      .menu-statistics__counts {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.35rem;
        margin: 0;
      }
      .menu-statistics__metric {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 0.6rem 0.45rem;
        color: var(--ngx-color-muted);
        background: var(--ngx-color-surface);
        border: 1px solid var(--ngx-color-border);
        border-radius: var(--ngx-radius);
        text-align: center;
      }
      dt {
        font-size: 0.65rem;
      }
      dd {
        order: -1;
        margin: 0;
        color: var(--ngx-color-text);
        font: 600 1rem/1.5 var(--ngx-font-mono);
        overflow-wrap: anywhere;
      }
      .menu-statistics__sync {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 4px 0 8px;
        color: var(--ngx-color-muted);
        font-size: 0.65rem;
      }
    `,
  ],
})
export class MenuStatisticsComponent {
  readonly labels = ['Total', 'Active', 'Archived'];
  @Input() statistics: MenuStatistic[] = [];
  @Input() loading = false;
  @Input() busy = false;
  @Output() refreshClick = new EventEmitter<void>();
}
