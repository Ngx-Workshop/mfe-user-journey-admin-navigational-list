import { NgTemplateOutlet } from '@angular/common';
import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
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
    NgTemplateOutlet,
    NgxPanel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    @if (embedded) {
    <ng-container [ngTemplateOutlet]="fieldTemplate" />
    } @else {
    <ngx-panel
      heading="Classification"
      eyebrow="CONFIGURATION"
      shape="chamfered"
      background="solid"
    >
      <ng-container [ngTemplateOutlet]="fieldTemplate" />
    </ngx-panel>
    }
    <ng-template #fieldTemplate>
      <div
        class="menu-item-classification__form-section"
        [formGroup]="form"
      >
        <div class="menu-item-classification__form-row">
          @if (fields.includes('domain')) {
          <mat-form-field
            subscriptSizing="dynamic"
            appearance="outline"
          >
            <mat-label>Domain</mat-label>
            <mat-select
              panelClass="ngx-design-system-overlay ngx-select-panel"
              formControlName="domain"
            >
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
          } @if (fields.includes('structuralSubtype')) {
          <mat-form-field
            subscriptSizing="dynamic"
            appearance="outline"
          >
            <mat-label>Structural Subtype</mat-label>
            <mat-select
              panelClass="ngx-design-system-overlay ngx-select-panel"
              formControlName="structuralSubtype"
            >
              @for ( option of structuralSubtypeOptions; track
              option.value ) {
              <mat-option [value]="option.value">{{
                option.label
              }}</mat-option>
              }
            </mat-select>
            @if ( form.get('structuralSubtype')?.hasError('required')
            ) {
            <mat-error>Structural subtype is required</mat-error>
            }
          </mat-form-field>
          } @if (fields.includes('state')) {
          <mat-form-field
            subscriptSizing="dynamic"
            appearance="outline"
          >
            <mat-label>State</mat-label>
            <mat-select
              panelClass="ngx-design-system-overlay ngx-select-panel"
              formControlName="state"
            >
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
          }
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .menu-item-classification__form-section {
        display: grid;
        gap: var(--ngx-space-4);
      }

      .menu-item-classification__form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--ngx-color-primary);
      }

      .menu-item-classification__form-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: flex-start;
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
  @Input() embedded = false;
  @Input() fields: readonly (
    | 'domain'
    | 'structuralSubtype'
    | 'state'
  )[] = ['domain', 'structuralSubtype', 'state'];
  @Input({ required: true }) form!: MenuItemForm;
  @Input({ required: true }) domainOptions!: DomainOption[];
  @Input({ required: true })
  structuralSubtypeOptions!: StructuralSubtypeOption[];
  @Input({ required: true }) stateOptions!: StateOption[];
}
