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
    <section
      class="menu-statistics"
      aria-label="Catalog overview"
      [attr.aria-busy]="loading"
    >
      <span class="menu-statistics__label"
        ><span
          class="menu-statistics__indicator"
          aria-hidden="true"
        ></span
        >CATALOG OVERVIEW</span
      >
      <dl class="menu-statistics__counts">
        @for (stat of statistics.slice(0, 3); track stat.title) {
          <div class="menu-statistics__metric">
            <dt>{{ stat.title }}</dt>
            <dd>{{ stat.value }}</dd>
          </div>
        }
      </dl>
      <span class="menu-statistics__sync" role="status">{{
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
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .menu-statistics {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 24px;
        min-height: 48px;
        border-bottom: 1px solid var(--ngx-color-border);
      }
      .menu-statistics__label {
        display: flex;
        align-items: center;
        gap: 8px;
        font: var(--ngx-font-label);
        color: var(--ngx-color-muted);
        font-size: 0.65rem;
        letter-spacing: 0.08em;
      }
      .menu-statistics__indicator {
        width: 6px;
        height: 6px;
        background: var(--ngx-color-primary);
        box-shadow: 0 0 8px
          color-mix(
            in srgb,
            var(--ngx-color-primary) 40%,
            transparent
          );
      }
      .menu-statistics__counts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 24px;
        margin: 0;
      }
      .menu-statistics__metric {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }
      dt {
        color: var(--ngx-color-muted);
        font-size: 0.72rem;
      }
      dd {
        margin: 0;
        color: var(--ngx-color-primary);
        font: 600 1rem/1.5 var(--ngx-font-mono);
      }
      .menu-statistics__sync {
        margin-left: auto;
        color: var(--ngx-color-muted);
        font-size: 0.7rem;
      }
      @media (max-width: 900px) {
        .menu-statistics__label,
        .menu-statistics__sync {
          display: none;
        }
        .menu-statistics {
          gap: 4px;
        }
        .menu-statistics__counts {
          flex: 1;
          gap: 8px 16px;
        }
      }
      @media (max-width: 480px) {
        dt {
          font-size: 0.65rem;
        }
        .menu-statistics__counts {
          gap: 12px;
        }
        .menu-statistics__metric {
          flex-direction: column;
          gap: 0;
        }
        .menu-statistics {
          padding: 8px 0;
        }
      }
    `,
  ],
})
export class MenuStatisticsComponent {
  @Input() statistics: MenuStatistic[] = [];
  @Input() loading = false;
  @Input() busy = false;
  @Output() refreshClick = new EventEmitter<void>();
}
