import { MenuItemFormViewModel } from '../../view-models/menu-item-form.view-model';

import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import {
  DOMAIN_OPTIONS,
  FormMode,
  ROLE_OPTIONS,
  STATE_OPTIONS,
  STRUCTURAL_SUBTYPE_OPTIONS,
} from '../../models/menu.types';
import { MenuItemFormService } from '../../utils/menu-item-form.service';
import { MenuItemBasicInfoComponent } from './menu-item-basic-info.component';
import { MenuItemClassificationComponent } from './menu-item-classification.component';
import { MenuItemConfigurationComponent } from './menu-item-configuration.component';
import { MenuItemFormActionsComponent } from './menu-item-form-actions.component';
import { MenuItemFormHeaderComponent } from './menu-item-form-header.component';
import { MenuItemParentSelectionComponent } from './menu-item-parent-selection.component';
import { MenuItemSvgIconsComponent } from './menu-item-svg-icons.component';

export interface MenuItemFormDialogData {
  mode: FormMode;
  item?: MenuItemDto;
}

@Component({
  selector: 'ngx-menu-item-form',
  providers: [MenuItemFormService, MenuItemFormViewModel],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MenuItemFormHeaderComponent,
    MenuItemBasicInfoComponent,
    MenuItemClassificationComponent,
    MenuItemParentSelectionComponent,
    MenuItemConfigurationComponent,
    MenuItemSvgIconsComponent,
    MenuItemFormActionsComponent,
  ],
  template: `
    <ngx-menu-item-form-header
      [mode]="data.mode"
      [loading]="loading()"
    >
    </ngx-menu-item-form-header>

    <div class="menu-item-form__content">
      @if (vm.store.error()) {
        <div class="menu-item-form__error" role="alert">
          <mat-icon>error_outline</mat-icon
          ><span>{{ vm.store.error() }}</span>
          <button
            mat-button
            type="button"
            [disabled]="vm.store.loading()"
            (click)="vm.store.refresh()"
          >
            Reload data
          </button>
        </div>
      }
      <form
        [id]="vm.formId"
        (ngSubmit)="onSave()"
        [formGroup]="form"
        class="menu-item-form__form"
      >
        <ngx-menu-item-basic-info [form]="form">
        </ngx-menu-item-basic-info>

        <ngx-menu-item-classification
          [form]="form"
          [domainOptions]="domainOptions"
          [structuralSubtypeOptions]="structuralSubtypeOptions"
          [stateOptions]="stateOptions"
        >
        </ngx-menu-item-classification>

        <ngx-menu-item-parent-selection
          [form]="form"
          [parentOptions]="vm.parentOptions()"
          [loading]="vm.store.loading()"
        >
        </ngx-menu-item-parent-selection>

        <ngx-menu-item-configuration
          [form]="form"
          [roleOptions]="roleOptions"
        >
        </ngx-menu-item-configuration>

        <details class="menu-item-form__advanced">
          <summary>Optional SVG icons</summary>
          <ngx-menu-item-svg-icons [form]="form" />
        </details>
      </form>
    </div>

    <ngx-menu-item-form-actions
      [mode]="data.mode"
      [formId]="vm.formId"
      [saving]="loading()"
      [isFormInvalid]="form.invalid"
      [loading]="
        loading() ||
        vm.store.pending() ||
        vm.store.loading() ||
        !vm.store.ready()
      "
      (cancel)="onCancel()"
    >
    </ngx-menu-item-form-actions>
  `,
  styles: [
    `
      .menu-item-form__content {
        padding: 1rem 1.5rem;
      }

      .menu-item-form__error {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 12px;
        color: var(--mat-sys-on-error-container);
        background: var(--mat-sys-error-container);
      }
      .menu-item-form__error span {
        flex: 1;
        font-size: 0.875rem;
      }
      .menu-item-form__advanced summary {
        cursor: pointer;
        padding: 12px 0;
        font-weight: 500;
        color: var(--mat-sys-primary);
      }
      @media (max-width: 480px) {
        .menu-item-form__content {
          padding: 12px 16px;
        }
      }
      .menu-item-form__form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemFormComponent {
  readonly vm = inject(MenuItemFormViewModel);
  readonly loading = this.vm.saving;
  readonly form = this.vm.form;
  readonly data = this.vm.data;
  readonly domainOptions = DOMAIN_OPTIONS;
  readonly structuralSubtypeOptions = STRUCTURAL_SUBTYPE_OPTIONS;
  readonly stateOptions = STATE_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;

  onCancel(): void {
    this.vm.cancel();
  }
  onSave(): void {
    this.vm.save();
  }
}
