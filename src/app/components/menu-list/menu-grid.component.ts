
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
import {
  MenuItemActionEvent,
  MenuItemCardComponent,
} from './menu-item-card.component';

@Component({
  selector: 'ngx-menu-grid',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MenuItemCardComponent
],
  template: `
    <div class="results">
      <div class="results-header">
        <button
          mat-icon-button
          (click)="refreshClick.emit()"
          matTooltip="Refresh list"
          aria-label="Refresh"
        >
          <mat-icon>refresh</mat-icon>
        </button>
        <h4>Results ({{ items.length }})</h4>
      </div>

      <div class="grid">
        @for (item of items; track item._id) {
        <ngx-menu-item-card
          [item]="item"
          (action)="itemAction.emit($event)"
        />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .results {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
      }

      .results-header {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      @media (max-width: 768px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuGridComponent {
  @Input({ required: true }) items: MenuItemDto[] = [];

  @Output() itemAction = new EventEmitter<MenuItemActionEvent>();
  @Output() refreshClick = new EventEmitter<void>();
}
