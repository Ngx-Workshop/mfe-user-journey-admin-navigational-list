import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  Domain,
  DOMAIN_OPTIONS,
  State,
  STATE_OPTIONS,
  STRUCTURAL_SUBTYPE_OPTIONS,
  StructuralSubtype,
} from '../../types/menu.types';

export interface FilterChangeEvent {
  type:
    | 'searchText'
    | 'domain'
    | 'structuralSubtype'
    | 'state'
    | 'authRequired'
    | 'includeArchived'
    | 'clearAll'
    | 'create';
  value?: any;
}

@Component({
  selector: 'ngx-menu-filters',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  template: `
    <div class="filters">
      <h3>Filters</h3>

      <div class="filter-row">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input
            matInput
            placeholder="Filter by name, route, or description"
            [value]="searchText"
            (input)="
              onFilterChange('searchText', $any($event.target).value)
            "
          />
          @if(searchText) {
          <button
            mat-icon-button
            matSuffix
            (click)="onFilterChange('searchText', '')"
            aria-label="Clear search"
          >
            <mat-icon>close</mat-icon>
          </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Domain</mat-label>
          <mat-select
            [value]="filterDomain"
            (valueChange)="onFilterChange('domain', $event)"
          >
            <mat-option [value]="null">All</mat-option>
            @for (option of domainOptions; track option.value) {
            <mat-option [value]="option.value">{{
              option.label
            }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Structural Type</mat-label>
          <mat-select
            [value]="filterStructuralSubtype"
            (valueChange)="
              onFilterChange('structuralSubtype', $event)
            "
          >
            <mat-option [value]="null">All</mat-option>
            @for (option of structuralSubtypeOptions; track
            option.value) {
            <mat-option [value]="option.value">{{
              option.label
            }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>State</mat-label>
          <mat-select
            [value]="filterState"
            (valueChange)="onFilterChange('state', $event)"
          >
            <mat-option [value]="null">All</mat-option>
            @for (option of stateOptions; track option.value) {
            <mat-option [value]="option.value">{{
              option.label
            }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <div class="filter-row">
        <mat-checkbox
          [checked]="includeArchived"
          (change)="onFilterChange('includeArchived', $event.checked)"
        >
          Include Archived
        </mat-checkbox>

        <mat-form-field appearance="outline">
          <mat-label>Auth Required</mat-label>
          <mat-select
            [value]="filterAuthRequired"
            (valueChange)="onFilterChange('authRequired', $event)"
          >
            <mat-option [value]="null">All</mat-option>
            <mat-option [value]="true">Required</mat-option>
            <mat-option [value]="false">Not Required</mat-option>
          </mat-select>
        </mat-form-field>

        <button
          mat-raised-button
          (click)="onFilterChange('clearAll')"
        >
          <mat-icon>clear_all</mat-icon> Clear All
        </button>

        <button
          mat-flat-button
          color="primary"
          (click)="onFilterChange('create')"
        >
          <mat-icon>add</mat-icon> New Menu Item
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .filters {
        background: var(--mat-sys-surface-variant);
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }

      .filters h3 {
        margin-top: 0;
        margin-bottom: 1rem;
      }

      .filter-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;
      }

      .filter-row:last-child {
        margin-bottom: 0;
      }

      .filter-row mat-form-field {
        min-width: 200px;
      }

      @media (max-width: 768px) {
        .filter-row {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-row mat-form-field {
          min-width: auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuFiltersComponent {
  @Input() searchText = '';
  @Input() filterDomain: Domain | null = null;
  @Input() filterStructuralSubtype: StructuralSubtype | null = null;
  @Input() filterState: State | null = null;
  @Input() filterAuthRequired: boolean | null = null;
  @Input() includeArchived = false;

  @Output() filterChange = new EventEmitter<FilterChangeEvent>();

  // Options for dropdowns
  readonly domainOptions = DOMAIN_OPTIONS;
  readonly structuralSubtypeOptions = STRUCTURAL_SUBTYPE_OPTIONS;
  readonly stateOptions = STATE_OPTIONS;

  onFilterChange(type: FilterChangeEvent['type'], value?: any): void {
    this.filterChange.emit({ type, value });
  }
}
