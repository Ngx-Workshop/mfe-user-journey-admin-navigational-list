import type { MenuItemForm } from '../../utils/menu-item-form.service';

import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ngx-menu-item-svg-icons',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="menu-item-svg-icons__form-section" [formGroup]="form">
      <h3>SVG Icons (Optional)</h3>

      <mat-form-field appearance="outline" class="menu-item-svg-icons__full-width">
        <mat-label>Navigation SVG Path</mat-label>
        <textarea
          matInput
          formControlName="navSvgPath"
          rows="2"
          placeholder="SVG path for navigation"
        ></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline" class="menu-item-svg-icons__full-width">
        <mat-label>Header SVG Path</mat-label>
        <textarea
          matInput
          formControlName="headerSvgPath"
          rows="2"
          placeholder="SVG path for header"
        ></textarea>
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      .menu-item-svg-icons__form-section {
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
        padding: 1rem;
      }

      .menu-item-svg-icons__form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--mat-sys-primary);
      }

      .menu-item-svg-icons__full-width {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemSvgIconsComponent {
  @Input({ required: true }) form!: MenuItemForm;
}
