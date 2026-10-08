import type { MenuItemForm } from '../../utils/menu-item-form.service';

import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  ParentOption
} from '../../models/menu.types';

@Component({
  selector: 'ngx-menu-item-parent-selection',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="menu-item-parent-selection__form-section" [formGroup]="form">
      <h3>Hierarchy</h3>

      <div class="menu-item-parent-selection__form-row">
        <mat-form-field appearance="outline">
          <mat-label>Parent Item</mat-label>
          <mat-select
            formControlName="parentId"
            [disabled]="loading"
          >
            @for (option of parentOptions; track option.value) {
            <mat-option
              [value]="option.value"
              [disabled]="option.disabled"
            >
              {{ option.label }}
            </mat-option>
            }
          </mat-select>
          <mat-hint>
            Select a parent item to create a hierarchical
            relationship, or choose "None" for a root-level item.
          </mat-hint>
          @if (loading) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
          }
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [
    `
      .menu-item-parent-selection__form-section {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
        padding: 1rem;
      }

      .menu-item-parent-selection__form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--mat-sys-primary);
      }

      .menu-item-parent-selection__form-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .menu-item-parent-selection__form-row mat-form-field {
        flex: 1;
        min-width: min(240px, 100%);
      }

      mat-spinner {
        margin-right: 8px;
      }

      @media (max-width: 768px) {
        .menu-item-parent-selection__form-row {
          flex-direction: column;
        }

        .menu-item-parent-selection__form-row mat-form-field {
          min-width: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemParentSelectionComponent {
  @Input({ required: true }) form!: MenuItemForm;
  @Input() parentOptions: ParentOption[] = [];
  @Input() loading = false;
}
