
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-menu-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="empty">
      <mat-icon>inbox</mat-icon>
      <p>No menu items match your criteria</p>
      <button
        mat-flat-button
        color="primary"
        (click)="createClick.emit()"
      >
        <mat-icon>add</mat-icon> Create First Menu Item
      </button>
    </div>
  `,
  styles: [
    `
      .empty {
        text-align: center;
        padding: 3rem;
        opacity: 0.7;
      }

      .empty mat-icon {
        font-size: 4rem;
        height: 4rem;
        width: 4rem;
        margin-bottom: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuEmptyStateComponent {
  @Output() createClick = new EventEmitter<void>();
}
