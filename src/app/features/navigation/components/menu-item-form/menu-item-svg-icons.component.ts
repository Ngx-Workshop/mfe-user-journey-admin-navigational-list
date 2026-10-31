import { NgTemplateOutlet } from '@angular/common';
import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
import type { MenuItemForm } from '../../utils/menu-item-form.service';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MenuIconPickerDialogComponent } from './menu-icon-picker-dialog.component';

@Component({
  selector: 'ngx-menu-item-svg-icons',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxPanel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIcon,
  ],
  template: `
    @if (embedded) {
    <ng-container [ngTemplateOutlet]="fields" />
    } @else {
    <ngx-panel
      heading="Menu icons (optional)"
      eyebrow="CONFIGURATION"
      shape="chamfered"
      background="solid"
    >
      <ng-container [ngTemplateOutlet]="fields" />
    </ngx-panel>
    }
    <ng-template #fields>
      <div
        class="menu-item-svg-icons__form-section"
        [class.menu-item-svg-icons__form-section--paired]="
          columns === 2
        "
        [formGroup]="form"
      >
        <mat-form-field
          subscriptSizing="dynamic"
          appearance="outline"
          class="menu-item-svg-icons__full-width"
        >
          <mat-label>Navigation icon</mat-label>
          <input
            matInput
            formControlName="navSvgPath"
            placeholder="home, devicon-angular-plain, or image URL"
          />
          <button
            mat-button
            matSuffix
            type="button"
            [disabled]="form.controls.navSvgPath.disabled"
            aria-label="Choose navigation icon image"
            (click)="chooseImage('navSvgPath')"
          >
            <mat-icon>image</mat-icon>
          </button>
          <mat-hint
            >Material icon name, Devicon classes, or image
            URL</mat-hint
          >
        </mat-form-field>

        <mat-form-field
          subscriptSizing="dynamic"
          appearance="outline"
          class="menu-item-svg-icons__full-width"
        >
          <mat-label>Header icon</mat-label>
          <input
            matInput
            formControlName="headerSvgPath"
            placeholder="home, devicon-angular-plain, or image URL"
          />
          <button
            mat-button
            matSuffix
            type="button"
            [disabled]="form.controls.headerSvgPath.disabled"
            aria-label="Choose header icon image"
            (click)="chooseImage('headerSvgPath')"
          >
            <mat-icon>image</mat-icon>
          </button>
          <mat-hint
            >Material icon name, Devicon classes, or image
            URL</mat-hint
          >
        </mat-form-field>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .menu-item-svg-icons__form-section {
        display: grid;
        gap: var(--ngx-space-4);
      }

      .menu-item-svg-icons__form-section--paired {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      @media (max-width: 768px) {
        .menu-item-svg-icons__form-section--paired {
          grid-template-columns: minmax(0, 1fr);
        }
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
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private picker:
    | MatDialogRef<MenuIconPickerDialogComponent, string>
    | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.picker?.close());
  }

  chooseImage(field: 'navSvgPath' | 'headerSvgPath'): void {
    const control = this.form.controls[field];
    if (control.disabled || this.picker) return;
    const picker = this.dialog.open<
      MenuIconPickerDialogComponent,
      string,
      string
    >(MenuIconPickerDialogComponent, {
      data:
        field === 'navSvgPath' ? 'navigation icon' : 'header icon',
      width: '960px',
      maxWidth: '96vw',
      panelClass: 'ngx-design-system-overlay',
      backdropClass: 'ngx-design-system-backdrop',
    });
    this.picker = picker;
    picker
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((url) => {
        this.picker = undefined;
        if (!url || control.disabled) return;
        control.setValue(url);
        control.markAsDirty();
        control.markAsTouched();
      });
  }

  @Input() embedded = false;
  @Input() columns: 1 | 2 = 1;
  @Input({ required: true }) form!: MenuItemForm;
}
