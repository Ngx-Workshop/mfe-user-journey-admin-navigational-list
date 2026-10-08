import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormMode } from '../../models/menu.types';

@Component({
  selector: 'ngx-menu-item-form-header',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule, MatDialogModule],
  template: `
    <div class="menu-item-form-header__dialog-header">
      <h2 mat-dialog-title>
        {{
          mode === 'create' ? 'Create Menu Item' : 'Edit Menu Item'
        }}
      </h2>
      <p>
        {{
          mode === 'create'
            ? 'Add a destination, then choose where it appears and who can access it.'
            : 'Update this destination and its placement. Your changes apply when you save.'
        }}
      </p>
    </div>

    @if (loading) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
  `,
  styles: [
    `
      .menu-item-form-header__dialog-header h2 {
        padding: 0;
        margin: 0 0 8px;
        font-size: 1.35rem;
        font-weight: 600;
      }
      .menu-item-form-header__dialog-header p {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.6;
        color: var(--mat-sys-on-surface-variant);
      }
      .menu-item-form-header__dialog-header {
        padding: 20px 24px 16px;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemFormHeaderComponent {
  @Input({ required: true }) mode!: FormMode;
  @Input({ required: true }) loading!: boolean;
}
