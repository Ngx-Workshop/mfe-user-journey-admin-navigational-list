import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { FormMode } from '../../models/menu.types';

@Component({
  selector: 'ngx-menu-item-form-actions',
  standalone: true,
  imports: [NgxButton, MatButtonModule, MatIconModule],
  template: `
    <div class="menu-item-form-actions__dialog-actions">
      <button
        mat-flat-button
        ngxButton
        surface="outline"
        [disabled]="saving"
        type="button"
        (click)="onCancel()"
      >
        Cancel
      </button>
      <button
        mat-flat-button
        ngxButton
        color="primary"
        type="submit"
        surface="outline"
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
        border-top: 1px solid var(--ngx-color-border);
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
