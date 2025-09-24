import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { MenuItemFormService } from '../../services/menu-item-form.service';
import {
  DOMAIN_OPTIONS,
  FormMode,
  STATE_OPTIONS,
  STRUCTURAL_SUBTYPE_OPTIONS,
} from '../../types/menu.types';
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
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" class="form">
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
          [currentItemId]="data.item?._id"
        >
        </ngx-menu-item-parent-selection>

        <ngx-menu-item-configuration [form]="form">
        </ngx-menu-item-configuration>

        <ngx-menu-item-svg-icons [form]="form">
        </ngx-menu-item-svg-icons>
      </form>
    </mat-dialog-content>

    <ngx-menu-item-form-actions
      [mode]="data.mode"
      [isFormInvalid]="form.invalid"
      [loading]="loading()"
      (cancel)="onCancel()"
      (save)="onSave()"
    >
    </ngx-menu-item-form-actions>
  `,
  styles: [
    `
      .dialog-content {
        padding: 1rem 1.5rem;
        max-height: 70vh;
        overflow-y: auto;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemFormComponent {
  private readonly formService = inject(MenuItemFormService);
  private readonly dialogRef = inject(
    MatDialogRef<MenuItemFormComponent>
  );

  loading = signal(false);

  // Options for dropdowns
  domainOptions = DOMAIN_OPTIONS;
  structuralSubtypeOptions = STRUCTURAL_SUBTYPE_OPTIONS;
  stateOptions = STATE_OPTIONS;

  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MenuItemFormDialogData
  ) {
    this.form = this.formService.createMenuItemForm();

    // If editing, populate the form
    if (this.data.mode === 'edit' && this.data.item) {
      this.formService.populateForm(this.form, this.data.item);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.formService.validateForm(this.form)) {
      return;
    }

    this.loading.set(true);
    const itemId = this.data.item?._id;

    this.formService
      .saveMenuItem(this.form, this.data.mode, itemId)
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.dialogRef.close(result);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
