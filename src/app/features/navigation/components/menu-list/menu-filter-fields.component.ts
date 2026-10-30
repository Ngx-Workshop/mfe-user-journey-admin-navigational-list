import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  Domain,
  DOMAIN_OPTIONS,
  Role,
  ROLE_OPTIONS,
  State,
  STATE_OPTIONS,
  StructuralSubtype,
  STRUCTURAL_SUBTYPE_OPTIONS,
} from '../../models/menu.types';

export type ClassificationFilterChange =
  | { type: 'domain'; value: Domain | null }
  | { type: 'structuralSubtype'; value: StructuralSubtype | null }
  | { type: 'state'; value: State | null }
  | { type: 'role'; value: Role | null };

@Component({
  selector: 'ngx-menu-filter-fields',
  imports: [MatFormFieldModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="menu-filter-fields">
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>Domain</mat-label>
      <mat-select
        panelClass="ngx-design-system-overlay"
        [value]="filterDomain"
        [canSelectNullableOptions]="true"
        (valueChange)="
          filterChange.emit({ type: 'domain', value: $event })
        "
      >
        <mat-option [value]="null">All domains</mat-option>
        @for (option of domainOptions; track option.value) {
          <mat-option [value]="option.value">{{
            option.label
          }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>Placement</mat-label>
      <mat-select
        panelClass="ngx-design-system-overlay"
        [value]="filterStructuralSubtype"
        [canSelectNullableOptions]="true"
        (valueChange)="
          filterChange.emit({
            type: 'structuralSubtype',
            value: $event,
          })
        "
      >
        <mat-option [value]="null">All placements</mat-option>
        @for (
          option of structuralSubtypeOptions;
          track option.value
        ) {
          <mat-option [value]="option.value">{{
            option.label
          }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>Display state</mat-label>
      <mat-select
        panelClass="ngx-design-system-overlay"
        [value]="filterState"
        [canSelectNullableOptions]="true"
        (valueChange)="
          filterChange.emit({ type: 'state', value: $event })
        "
      >
        <mat-option [value]="null">All states</mat-option>
        @for (option of stateOptions; track option.value) {
          <mat-option [value]="option.value">{{
            option.label
          }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>Role required</mat-label>
      <mat-select
        panelClass="ngx-design-system-overlay"
        [value]="filterRole"
        [canSelectNullableOptions]="true"
        (valueChange)="
          filterChange.emit({ type: 'role', value: $event })
        "
      >
        <mat-option [value]="null">All roles</mat-option>
        @for (option of roleOptions; track option.value) {
          <mat-option [value]="option.value">{{
            option.label
          }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  </div>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .menu-filter-fields {
        display: grid;
        grid-template-columns: repeat(
          var(--menu-filter-columns, 1),
          minmax(0, 1fr)
        );
        gap: 16px;
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class MenuFilterFieldsComponent {
  @Input() filterDomain: Domain | null = null;
  @Input() filterStructuralSubtype: StructuralSubtype | null = null;
  @Input() filterState: State | null = null;
  @Input() filterRole: Role | null = null;
  @Output() filterChange =
    new EventEmitter<ClassificationFilterChange>();
  readonly domainOptions = DOMAIN_OPTIONS;
  readonly structuralSubtypeOptions = STRUCTURAL_SUBTYPE_OPTIONS;
  readonly stateOptions = STATE_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;
}
