import { NgTemplateOutlet } from '@angular/common';
import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
import type { MenuItemForm } from '../../utils/menu-item-form.service';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import type { MenuRouteState } from '../../view-models/menu-route-options';

@Component({
  selector: 'ngx-menu-item-basic-info',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgxPanel,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatIcon,
    MatButtonModule,
  ],
  template: `
    @if (embedded) {
    <ng-container [ngTemplateOutlet]="fieldTemplate" />
    } @else {
    <ngx-panel
      heading="Basic information"
      eyebrow="CONFIGURATION"
      shape="chamfered"
      background="solid"
    >
      <ng-container [ngTemplateOutlet]="fieldTemplate" />
    </ngx-panel>
    }
    <ng-template #fieldTemplate>
      <div
        class="menu-item-basic-info__form-section"
        [formGroup]="form"
      >
        @if (fields.includes('menuItemText')) {
        <mat-form-field
          subscriptSizing="dynamic"
          appearance="outline"
          class="menu-item-basic-info__full-width"
        >
          <mat-label>Menu Item Text</mat-label>
          <input
            matInput
            formControlName="menuItemText"
            placeholder="Display text for the menu item"
          />
          @if (form.get('menuItemText')?.hasError('required')) {
          <mat-error>Menu item text is required</mat-error>
          }
        </mat-form-field>
        } @if (fields.includes('routePath')) {
        <mat-form-field
          floatLabel="always"
          subscriptSizing="dynamic"
          appearance="outline"
          class="menu-item-basic-info__full-width"
        >
          <mat-label>Route Path</mat-label>
          <input
            matInput
            formControlName="routePath"
            placeholder="Search available routes"
            #routeInput
            #routeTrigger="matAutocompleteTrigger"
            [matAutocomplete]="routeOptions"
            [matAutocompleteDisabled]="routeState.status !== 'ready'"
            [readonly]="routeState.status !== 'ready'"
            (input)="routeQuery = $any($event.target).value"
            (focus)="routeQuery = ''"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            aria-label="Show available routes"
            [disabled]="routeState.status !== 'ready'"
            (click)="showRoutes(routeInput, routeTrigger)"
          >
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-autocomplete
            autoActiveFirstOption
            #routeOptions="matAutocomplete"
            class="ngx-design-system-overlay"
            (optionSelected)="routeQuery = ''"
          >
            @for (option of filteredRoutes(); track option.value) {
            <mat-option [value]="option.value"
              >{{ option.label }} ({{ option.value }})</mat-option
            >
            } @empty {
            <mat-option disabled>No matching routes</mat-option>
            }
          </mat-autocomplete>
          <mat-hint aria-live="polite">
            @switch (routeState.status) { @case ('idle') { Choose a
            domain to see its routes. } @case ('loading') { Loading
            available routes… } @case ('error') { Routes could not be
            loaded. Retry to choose a route. } @case ('ready') { @if
            (!routeState.options.length) { No MFE routes are available
            for this domain. } @else { Choose an available route for
            this domain. } } }
          </mat-hint>
          @if (form.get('routePath')?.hasError('required')) {
          <mat-error>Route path is required</mat-error>
          } @else if (
          form.controls.routePath.hasError('unavailableRoute') ) {
          <mat-error
            >Choose an available route for the selected
            domain.</mat-error
          >
          }
        </mat-form-field>
        } @if ( fields.includes('routePath') && routeState.status ===
        'error' ) {
        <button
          mat-stroked-button
          type="button"
          (click)="retryRoutes.emit()"
        >
          Retry routes
        </button>
        } @if (fields.includes('description')) {
        <mat-form-field
          subscriptSizing="dynamic"
          appearance="outline"
          class="menu-item-basic-info__full-width"
        >
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Optional description"
          ></textarea>
        </mat-form-field>
        } @if (fields.includes('tooltipText')) {
        <mat-form-field
          subscriptSizing="dynamic"
          appearance="outline"
          class="menu-item-basic-info__full-width"
        >
          <mat-label>Tooltip Text</mat-label>
          <input
            matInput
            formControlName="tooltipText"
            placeholder="Optional tooltip text"
          />
        </mat-form-field>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      .menu-item-basic-info__form-section {
        display: grid;
        gap: var(--ngx-space-4);
      }

      .menu-item-basic-info__form-section h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--ngx-color-primary);
      }

      .menu-item-basic-info__full-width {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemBasicInfoComponent {
  @Input() routeState: MenuRouteState = {
    status: 'idle',
    options: [],
  };
  @Output() readonly retryRoutes = new EventEmitter<void>();
  routeQuery = '';
  showRoutes(
    input: HTMLInputElement,
    trigger: MatAutocompleteTrigger
  ) {
    this.routeQuery = '';
    input.focus();
    trigger.openPanel();
  }
  filteredRoutes() {
    const query = this.routeQuery.trim().toLowerCase();
    return this.routeState.options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.includes(query)
    );
  }
  @Input() embedded = false;
  @Input() fields: readonly (
    | 'menuItemText'
    | 'routePath'
    | 'description'
    | 'tooltipText'
  )[] = ['menuItemText', 'routePath', 'description', 'tooltipText'];
  @Input({ required: true }) form!: MenuItemForm;
}
