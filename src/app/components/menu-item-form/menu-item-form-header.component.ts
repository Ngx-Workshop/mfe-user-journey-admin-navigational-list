import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormMode } from '../../types/menu.types';

@Component({
  selector: 'ngx-menu-item-form-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        {{
          mode === 'create' ? 'Create Menu Item' : 'Edit Menu Item'
        }}
      </h2>
    </div>

    @if (loading) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemFormHeaderComponent {
  @Input({ required: true }) mode!: FormMode;
  @Input({ required: true }) loading!: boolean;
}
