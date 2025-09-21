import { CommonModule } from '@angular/common';
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
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="stats-header">
      <h2>Menu Statistics</h2>
      <button
        mat-raised-button
        (click)="onRefreshClick()"
        [disabled]="loading"
      >
        <mat-icon>analytics</mat-icon> Refresh Stats
      </button>
    </div>

    @if (loading) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <div class="stats-grid">
      @for (stat of statistics; track stat.title) {
      <mat-card class="stat-card">
        <mat-card-content>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
          @if (stat.description) {
          <div class="stat-description">
            {{ stat.description }}
          </div>
          }
        </mat-card-content>
      </mat-card>
      } @empty {
      <div class="empty-stats">
        <mat-icon>analytics</mat-icon>
        <h3>No statistics available</h3>
        <p>Click "Refresh Stats" to load menu statistics</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .stats-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .stat-card {
        text-align: center;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--mat-sys-primary);
      }

      .stat-title {
        font-size: 1rem;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .stat-description {
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        margin-top: 0.25rem;
      }

      .empty-stats {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        text-align: center;
        opacity: 0.7;
        grid-column: 1 / -1;
      }

      .empty-stats mat-icon {
        font-size: 3rem;
        height: 3rem;
        width: 3rem;
        margin-bottom: 1rem;
      }

      @media (max-width: 768px) {
        .stats-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
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
