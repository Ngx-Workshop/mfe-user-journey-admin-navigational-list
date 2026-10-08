import type { MenuItemForm } from '../../utils/menu-item-form.service';

import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  DomainOption,
  StateOption,
  StructuralSubtypeOption,
} from '../../models/menu.types';

@Component({
  selector: 'ngx-menu-item-classification',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  template: `
    <div class="menu-item-classification__form-section" [formGroup]="form">
      <h3>Classification</h3>

      <div class="menu-item-classification__form-row">
        <mat-form-field appearance="outline">
          <mat-label>Domain</mat-label>
          <mat-select formControlName="domain">
            @for (option of domainOptions; track option.value) {
            <mat-option [value]="option.value">{{
              option.label
            }}</mat-option>
            }
          </mat-select>
          @if (form.get('domain')?.hasError('required')) {
          <mat-error>Domain is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Structural Subtype</mat-label>
          <mat-select formControlName="structuralSubtype">
            @for (option of structuralSubtypeOptions; track
            option.value) {
            <mat-option [value]="option.value">{{
              option.label
            }}</mat-option>
            }
          </mat-select>
          @if (form.get('structuralSubtype')?.hasError('required')) {
          <mat-error>Structural subtype is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>State</mat-label>
          <mat-select formControlName="state">
            @for (option of stateOptions; track option.value) {
            <mat-option [value]="option.value">{{
              option.label
            }}</mat-option>
            }
          </mat-select>
          @if (form.get('state')?.hasError('required')) {
          <mat-error>State is required</mat-error>
          }
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [
    `
      .menu-item-classification__form-section {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
        padding: 1rem;
      }

      .menu-item-classification__form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--mat-sys-primary);
      }

      .menu-item-classification__form-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .menu-item-classification__form-row mat-form-field {
        flex: 1;
        min-width: min(200px, 100%);
      }

      @media (max-width: 768px) {
        .menu-item-classification__form-row {
          flex-direction: column;
        }

        .menu-item-classification__form-row mat-form-field {
          min-width: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemClassificationComponent {
  @Input({ required: true }) form!: MenuItemForm;
  @Input({ required: true }) domainOptions!: DomainOption[];
  @Input({ required: true })
  structuralSubtypeOptions!: StructuralSubtypeOption[];
  @Input({ required: true }) stateOptions!: StateOption[];
}
