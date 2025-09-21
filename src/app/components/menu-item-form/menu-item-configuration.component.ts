import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ngx-menu-item-configuration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="form-section" [formGroup]="form">
      <h3>Configuration</h3>

      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Sort ID *</mat-label>
          <input
            matInput
            type="number"
            formControlName="sortId"
            placeholder="Numeric sort order"
          />
          @if (form.get('sortId')?.hasError('required')) {
          <mat-error>Sort ID is required</mat-error>
          } @if (form.get('sortId')?.hasError('min')) {
          <mat-error>Sort ID must be 0 or greater</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-checkbox formControlName="authRequired">
          Authentication Required
        </mat-checkbox>

        <mat-checkbox formControlName="archived">
          Archived
        </mat-checkbox>
      </div>
    </div>
  `,
  styles: [
    `
      .form-section {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
        padding: 1rem;
      }

      .form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--mat-sys-primary);
      }

      .form-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .form-row mat-form-field {
        flex: 1;
        min-width: 200px;
      }

      .form-row mat-checkbox {
        display: flex;
        align-items: center;
        margin: 1rem 0;
      }

      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
        }

        .form-row mat-form-field {
          min-width: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemConfigurationComponent {
  @Input({ required: true }) form!: FormGroup;
}
