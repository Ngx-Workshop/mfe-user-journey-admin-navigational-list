import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MenuFilterFieldsComponent,
  ClassificationFilterChange,
} from './menu-filter-fields.component';
import {
  Domain,
  Role,
  State,
  StructuralSubtype,
} from '../../models/menu.types';

export type FilterChangeEvent =
  | { type: 'searchText'; value: string }
  | ClassificationFilterChange
  | { type: 'includeArchived'; value: boolean }
  | { type: 'clearAll' };

@Component({
  selector: 'ngx-menu-filters',
  imports: [
    NgxButton,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MenuFilterFieldsComponent,
    MatCheckboxModule,
    MatIconModule,
  ],
  template: `
    <section class="menu-filters" aria-label="Filter menu items">
      <div class="menu-filters__heading">
        <h2><mat-icon>tune</mat-icon>Filter console</h2>
        <span class="menu-filters__count"
          >{{ activeCount }} active</span
        >
      </div>
      <div class="menu-filters__search-row">
        <mat-form-field
          appearance="outline"
          subscriptSizing="dynamic"
        >
          <mat-label>Search menu items</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            #searchInput
            placeholder="Search names, routes or descriptions"
            [value]="searchText"
            (input)="onFilterChange('searchText', searchInput.value)"
          />
          @if (searchText) {
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
        <mat-checkbox
          [checked]="includeArchived"
          (change)="onFilterChange('includeArchived', $event.checked)"
          >Include archived</mat-checkbox
        >
      </div>
      <button
        class="menu-filters__toggle"
        mat-button
        type="button"
        [attr.aria-expanded]="expanded()"
        aria-controls="menu-filter-fields"
        (click)="expanded.set(!expanded())"
      >
        <mat-icon>{{ expanded() ? 'expand_less' : 'tune' }}</mat-icon
        >{{ expanded() ? 'Hide filters' : 'Filters' }} ·
        {{ activeCount }} active
      </button>
      <div
        id="menu-filter-fields"
        class="menu-filters__fields"
        [class.menu-filters__fields--expanded]="expanded()"
      >
        <ngx-menu-filter-fields
          [filterDomain]="filterDomain"
          [filterStructuralSubtype]="filterStructuralSubtype"
          [filterState]="filterState"
          [filterRole]="filterRole"
          (filterChange)="filterChange.emit($event)"
        />
      </div>
      <button
        class="menu-filters__reset"
        mat-flat-button
        ngxButton
        surface="outline"
        type="button"
        [disabled]="!activeCount"
        (click)="onFilterChange('clearAll')"
      >
        <mat-icon>filter_alt_off</mat-icon>Reset filters
      </button>
    </section>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        display: block;
        min-width: 0;
        @include mat.form-field-overrides(
          (
            container-height: 44px,
            container-vertical-padding: 10px,
          )
        );
      }
      .menu-filters {
        border: 1px solid var(--ngx-color-border);
        border-top: 2px solid var(--ngx-color-primary);
        background: var(--ngx-color-surface);
        padding: 16px 12px;
      }
      .menu-filters__heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 16px;
      }
      h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font: 600 0.8rem/1.5 var(--ngx-font-heading);
      }
      h2 mat-icon {
        width: 18px;
        height: 18px;
        font-size: 18px;
        color: var(--ngx-color-primary);
      }
      .menu-filters__count {
        color: var(--ngx-color-muted);
        font: var(--ngx-font-label);
        font-size: 0.6rem;
        white-space: nowrap;
      }
      .menu-filters__search-row {
        display: grid;
        gap: 8px;
        margin-bottom: 16px;
      }
      .menu-filters__fields {
        display: grid;
        gap: 16px;
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
        font-size: 0.8rem;
      }
      .menu-filters__reset {
        width: 100%;
        margin-top: 16px;
      }
      .menu-filters__toggle {
        display: none;
      }
      @media (max-width: 900px) {
        .menu-filters {
          padding: 12px;
        }
        .menu-filters__heading {
          display: none;
        }
        .menu-filters__search-row {
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          margin-bottom: 0;
          gap: 8px;
        }
        .menu-filters__toggle {
          display: inline-flex;
          margin-top: 8px;
        }
        .menu-filters__fields {
          display: none;
          margin-top: 16px;
          --menu-filter-columns: 2;
        }
        .menu-filters__fields--expanded {
          display: grid;
        }
        .menu-filters__reset {
          width: auto;
          float: right;
          margin-top: 8px;
        }
        .menu-filters__reset:disabled {
          display: none;
        }
        .menu-filters::after {
          content: '';
          display: block;
          clear: both;
        }
      }
      @media (max-width: 480px) {
        .menu-filters__search-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuFiltersComponent {
  readonly expanded = signal(false);
  @Input() searchText = '';
  @Input() filterDomain: Domain | null = null;
  @Input() filterStructuralSubtype: StructuralSubtype | null = null;
  @Input() filterState: State | null = null;
  @Input() filterRole: Role | null = null;
  @Input() includeArchived = false;
  @Output() filterChange = new EventEmitter<FilterChangeEvent>();
  get activeCount(): number {
    return [
      this.searchText.trim(),
      this.filterDomain,
      this.filterStructuralSubtype,
      this.filterState,
      this.filterRole,
      this.includeArchived,
    ].filter(Boolean).length;
  }
  onFilterChange<T extends FilterChangeEvent['type']>(
    type: T,
    value?: Extract<FilterChangeEvent, { type: T }> extends {
      value: infer V;
    }
      ? V
      : never
  ): void {
    this.filterChange.emit({ type, value } as FilterChangeEvent);
  }
}
