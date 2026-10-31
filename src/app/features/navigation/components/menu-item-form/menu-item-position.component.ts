import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import type { MenuItemForm } from '../../utils/menu-item-form.service';

@Component({
  selector: 'ngx-menu-item-position',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [formGroup]="form">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Position After</mat-label>
        <mat-select formControlName="sortId" panelClass="ngx-design-system-overlay">
          <mat-option [value]="0">None</mat-option>
          @for (option of options; track option.id) {
            <mat-option [value]="option.value">{{ option.label }}</mat-option>
          }
        </mat-select>
        <mat-hint>Choose an item to follow, or None to place first.</mat-hint>
      </mat-form-field>
    </div>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    mat-form-field { width: 100%; }
  `],
})
export class MenuItemPositionComponent {
  @Input({ required: true }) form!: MenuItemForm;
  @Input() options: readonly { id: string; label: string; value: number }[] = [];
}
