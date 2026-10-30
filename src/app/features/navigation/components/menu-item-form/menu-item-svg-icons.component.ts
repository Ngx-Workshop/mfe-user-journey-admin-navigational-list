import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
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
    NgxPanel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <ngx-panel
      heading="SVG icons (optional)"
      eyebrow="CONFIGURATION"
      shape="chamfered"
      background="solid"
    >
      <div
        class="menu-item-svg-icons__form-section"
        [formGroup]="form"
      >
        <mat-form-field
          subscriptSizing="dynamic"
          appearance="outline"
          class="menu-item-svg-icons__full-width"
        >
          <mat-label>Navigation SVG Path</mat-label>
          <textarea
            matInput
            formControlName="navSvgPath"
            rows="2"
            placeholder="SVG path for navigation"
          ></textarea>
        </mat-form-field>

        <mat-form-field
          subscriptSizing="dynamic"
          appearance="outline"
          class="menu-item-svg-icons__full-width"
        >
          <mat-label>Header SVG Path</mat-label>
          <textarea
            matInput
            formControlName="headerSvgPath"
            rows="2"
            placeholder="SVG path for header"
          ></textarea>
        </mat-form-field>
      </div>
    </ngx-panel>
  `,
  styles: [
    `
      .menu-item-svg-icons__form-section {
        display: grid;
        gap: var(--ngx-space-4);
      }

      .menu-item-svg-icons__form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--ngx-color-primary);
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
