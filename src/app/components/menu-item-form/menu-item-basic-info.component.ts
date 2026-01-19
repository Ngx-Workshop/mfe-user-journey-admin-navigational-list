
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ngx-menu-item-basic-info',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
],
  template: `
    <div class="form-section" [formGroup]="form">
      <h3>Basic Information</h3>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Menu Item Text *</mat-label>
        <input
          matInput
          formControlName="menuItemText"
          placeholder="Display text for the menu item"
        />
        @if (form.get('menuItemText')?.hasError('required')) {
        <mat-error>Menu item text is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Route Path *</mat-label>
        <input
          matInput
          formControlName="routePath"
          placeholder="/example-route"
        />
        @if (form.get('routePath')?.hasError('required')) {
        <mat-error>Route path is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Description</mat-label>
        <textarea
          matInput
          formControlName="description"
          rows="3"
          placeholder="Optional description"
        ></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Tooltip Text</mat-label>
        <input
          matInput
          formControlName="tooltipText"
          placeholder="Optional tooltip text"
        />
      </mat-form-field>
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

      .full-width {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemBasicInfoComponent {
  @Input({ required: true }) form!: FormGroup;
}
