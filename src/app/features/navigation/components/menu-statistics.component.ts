
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface MenuStatistic {
  title: string;
  value: string | number;
  description?: string;
}

@Component({
  selector: 'ngx-menu-statistics',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule
  ],
  template: `
    <div class="menu-statistics__stats-header">
      <h2>Menu Statistics</h2>
      <button
        mat-stroked-button
        (click)="onRefreshClick()"
        [disabled]="loading"
      >
        <mat-icon>analytics</mat-icon> Refresh Stats
      </button>
    </div>

    @if (loading) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <div class="menu-statistics__stats-grid">
      @for (stat of statistics; track stat.title) {
      <mat-card class="menu-statistics__stat-card">
        <mat-card-content>
          <div class="menu-statistics__stat-value">{{ stat.value }}</div>
          <div class="menu-statistics__stat-title">{{ stat.title }}</div>
          @if (stat.description) {
          <div class="menu-statistics__stat-description">
            {{ stat.description }}
          </div>
          }
        </mat-card-content>
      </mat-card>
      } @empty {
      <div class="menu-statistics__empty-stats">
        <mat-icon>analytics</mat-icon>
        <h3>No statistics available</h3>
        <p>Click "Refresh Stats" to load menu statistics</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .menu-statistics__stats-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .menu-statistics__stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
      }

      .menu-statistics__stat-card {
        text-align: left;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        box-shadow: none;
      }

      .menu-statistics__stat-value {
        font-size: 2.25rem;
        font-weight: 600;
        color: var(--mat-sys-primary);
      }

      .menu-statistics__stat-title {
        font-size: 1rem;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .menu-statistics__stat-description {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 0.25rem;
      }

      .menu-statistics__empty-stats {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        text-align: left;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        box-shadow: none;
        opacity: 0.7;
        grid-column: 1 / -1;
      }

      .menu-statistics__empty-stats mat-icon {
        font-size: 3rem;
        height: 3rem;
        width: 3rem;
        margin-bottom: 1rem;
      }

      @media (max-width: 768px) {
        .menu-statistics__stats-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .menu-statistics__stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 380px) { .menu-statistics__stats-grid { grid-template-columns: 1fr; } }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuStatisticsComponent {
  @Input() statistics: MenuStatistic[] = [];
  @Input() loading = false;
  @Output() refreshClick = new EventEmitter<void>();

  onRefreshClick(): void {
    this.refreshClick.emit();
  }
}
