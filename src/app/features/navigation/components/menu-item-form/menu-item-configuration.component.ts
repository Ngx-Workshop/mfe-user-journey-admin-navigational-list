import { NgTemplateOutlet } from '@angular/common';
import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
import type { MenuItemForm } from '../../utils/menu-item-form.service';

import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RoleOption } from '../../models/menu.types';

@Component({
  selector: 'ngx-menu-item-configuration',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxPanel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  template: `
    @if (embedded) {
      <ng-container [ngTemplateOutlet]="fieldTemplate" />
    } @else {
      <ngx-panel
        heading="Configuration"
        eyebrow="CONFIGURATION"
        shape="chamfered"
        background="solid"
      >
        <ng-container [ngTemplateOutlet]="fieldTemplate" />
      </ngx-panel>
    }
    <ng-template #fieldTemplate>
      <div
        class="menu-item-configuration__form-section"
        [formGroup]="form"
      >
        @if (fields.includes('sortId')) {
          <div class="menu-item-configuration__form-row">
            <mat-form-field
              subscriptSizing="dynamic"
              appearance="outline"
            >
              <mat-label>Sort ID</mat-label>
              <input
                matInput
                type="number"
                formControlName="sortId"
                placeholder="Numeric sort order"
              />
              @if (form.get('sortId')?.hasError('required')) {
                <mat-error>Sort ID is required</mat-error>
              }
              @if (form.get('sortId')?.hasError('min')) {
                <mat-error>Sort ID must be 0 or greater</mat-error>
              }
            </mat-form-field>
          </div>
        }

        @if (fields.includes('role') || fields.includes('archived')) {
          <div class="menu-item-configuration__form-row">
            @if (fields.includes('role')) {
              <mat-form-field
                subscriptSizing="dynamic"
                appearance="outline"
              >
                <mat-label>Role required</mat-label>
                <mat-select
                  panelClass="ngx-design-system-overlay"
                  formControlName="role"
                >
                  @for (option of roleOptions; track option.value) {
                    <mat-option [value]="option.value">{{
                      option.label
                    }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
            @if (fields.includes('archived')) {
              <mat-checkbox formControlName="archived">
                Archived
              </mat-checkbox>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      .menu-item-configuration__form-section {
        display: grid;
        gap: var(--ngx-space-4);
      }

      .menu-item-configuration__form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--ngx-color-primary);
      }

      .menu-item-configuration__form-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .menu-item-configuration__form-row mat-form-field {
        flex: 1;
        min-width: min(200px, 100%);
      }

      .menu-item-configuration__form-row mat-checkbox {
        display: flex;
        align-items: center;
        margin: 1rem 0;
      }

      @media (max-width: 768px) {
        .menu-item-configuration__form-row {
          flex-direction: column;
        }

        .menu-item-configuration__form-row mat-form-field {
          min-width: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemConfigurationComponent {
  @Input() embedded = false;
  @Input() fields: readonly ('sortId' | 'role' | 'archived')[] = [
    'sortId',
    'role',
    'archived',
  ];
  @Input({ required: true }) form!: MenuItemForm;
  @Input({ required: true }) roleOptions!: RoleOption[];
}
