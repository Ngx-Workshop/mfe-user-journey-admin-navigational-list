import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormMode } from '../../types/menu.types';

@Component({
  selector: 'ngx-menu-item-form-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-actions">
      <button mat-button type="button" (click)="onCancel()">
        Cancel
      </button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        (click)="onSave()"
        [disabled]="isFormInvalid || loading"
      >
        <mat-icon>
          {{ mode === 'create' ? 'save' : 'edit' }}
        </mat-icon>
        {{ mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </div>
  `,
  styles: [
    `
      .dialog-actions {
        padding: 1rem 1.5rem;
        justify-content: flex-end;
        gap: 0.5rem;
        display: flex;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemFormActionsComponent {
  @Input({ required: true }) mode!: FormMode;
  @Input({ required: true }) isFormInvalid!: boolean;
  @Input({ required: true }) loading!: boolean;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    this.save.emit();
  }
}
