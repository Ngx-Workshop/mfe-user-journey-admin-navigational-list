import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormMode } from '../../models/menu.types';

@Component({
  selector: 'ngx-menu-item-form-actions',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="menu-item-form-actions__dialog-actions">
      <button
        mat-button
        [disabled]="saving"
        type="button"
        (click)="onCancel()"
      >
        Cancel
      </button>
      <button
        mat-flat-button
        color="primary"
        type="submit"
        [attr.form]="formId"
        [disabled]="isFormInvalid || loading"
      >
        <mat-icon>
          {{ mode === 'create' ? 'save' : 'edit' }}
        </mat-icon>
        {{
          saving
            ? 'Saving…'
            : mode === 'create'
              ? 'Create Menu Item'
              : 'Save changes'
        }}
      </button>
    </div>
  `,
  styles: [
    `
      .menu-item-form-actions__dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid var(--mat-sys-outline-variant);
        justify-content: flex-end;
        gap: 0.5rem;
        display: flex;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemFormActionsComponent {
  @Input({ required: true }) formId = '';
  @Input() saving = false;
  @Input({ required: true }) mode!: FormMode;
  @Input({ required: true }) isFormInvalid!: boolean;
  @Input({ required: true }) loading!: boolean;

  @Output() cancel = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }
}
