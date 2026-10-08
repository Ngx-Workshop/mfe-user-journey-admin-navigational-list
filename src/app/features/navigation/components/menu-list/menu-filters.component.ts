import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Domain, DOMAIN_OPTIONS, Role, ROLE_OPTIONS, State, STATE_OPTIONS,
  STRUCTURAL_SUBTYPE_OPTIONS, StructuralSubtype } from '../../models/menu.types';

export type FilterChangeEvent =
  | { type: 'searchText'; value: string }
  | { type: 'domain'; value: Domain | null }
  | { type: 'structuralSubtype'; value: StructuralSubtype | null }
  | { type: 'state'; value: State | null }
  | { type: 'role'; value: Role | null }
  | { type: 'includeArchived'; value: boolean }
  | { type: 'clearAll' };

@Component({
  selector: 'ngx-menu-filters',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatIconModule],
  template: `
    <section class="menu-filters" aria-label="Filter menu items">
      <div class="menu-filters__heading">
        <div><h2>Find menu items</h2><p>{{ activeCount ? activeCount + ' filters active' : 'Search across your navigation or narrow by placement.' }}</p></div>
        <button mat-button [disabled]="!activeCount" (click)="onFilterChange('clearAll')">
          <mat-icon>filter_alt_off</mat-icon>Reset filters
        </button>
      </div>
      <div class="menu-filters__search-row">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search menu items</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput #searchInput placeholder="Search names, routes or descriptions" [value]="searchText"
            (input)="onFilterChange('searchText', searchInput.value)" />
          @if (searchText) {
            <button mat-icon-button matSuffix (click)="onFilterChange('searchText', '')" aria-label="Clear search"><mat-icon>close</mat-icon></button>
          }
        </mat-form-field>
        <mat-checkbox [checked]="includeArchived" (change)="onFilterChange('includeArchived', $event.checked)">Include archived</mat-checkbox>
      </div>
      <div class="menu-filters__fields">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Domain</mat-label>
          <mat-select [value]="filterDomain" [canSelectNullableOptions]="true" (valueChange)="onFilterChange('domain', $event)">
            <mat-option [value]="null">All domains</mat-option>
            @for (option of domainOptions; track option.value) { <mat-option [value]="option.value">{{ option.label }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Placement</mat-label>
          <mat-select [value]="filterStructuralSubtype" [canSelectNullableOptions]="true" (valueChange)="onFilterChange('structuralSubtype', $event)">
            <mat-option [value]="null">All placements</mat-option>
            @for (option of structuralSubtypeOptions; track option.value) { <mat-option [value]="option.value">{{ option.label }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Display state</mat-label>
          <mat-select [value]="filterState" [canSelectNullableOptions]="true" (valueChange)="onFilterChange('state', $event)">
            <mat-option [value]="null">All states</mat-option>
            @for (option of stateOptions; track option.value) { <mat-option [value]="option.value">{{ option.label }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Role required</mat-label>
          <mat-select [value]="filterRole" [canSelectNullableOptions]="true" (valueChange)="onFilterChange('role', $event)">
            <mat-option [value]="null">All roles</mat-option>
            @for (option of roleOptions; track option.value) { <mat-option [value]="option.value">{{ option.label }}</mat-option> }
          </mat-select>
        </mat-form-field>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .menu-filters { padding: 24px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 16px; background: var(--mat-sys-surface-container-low); }
    .menu-filters__heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
    .menu-filters__heading h2 { font-size: 1rem; font-weight: 600; margin: 0 0 4px; }
    .menu-filters__heading p { margin: 0; font-size: .85rem; color: var(--mat-sys-on-surface-variant); }
    .menu-filters__search-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 20px; margin-bottom: 16px; }
    .menu-filters__fields { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    mat-form-field { width: 100%; min-width: 0; }
    @media (max-width: 800px) { .menu-filters__fields { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 480px) {
      .menu-filters { padding: 16px; }
      .menu-filters__heading { align-items: flex-start; flex-direction: column; gap: 8px; }
      .menu-filters__search-row { grid-template-columns: 1fr; gap: 8px; }
      .menu-filters__fields { gap: 12px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuFiltersComponent {
  @Input() searchText = '';
  @Input() filterDomain: Domain | null = null;
  @Input() filterStructuralSubtype: StructuralSubtype | null = null;
  @Input() filterState: State | null = null;
  @Input() filterRole: Role | null = null;
  @Input() includeArchived = false;
  @Output() filterChange = new EventEmitter<FilterChangeEvent>();
  readonly domainOptions = DOMAIN_OPTIONS;
  readonly structuralSubtypeOptions = STRUCTURAL_SUBTYPE_OPTIONS;
  readonly stateOptions = STATE_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;
  get activeCount(): number {
    return [this.searchText.trim(), this.filterDomain, this.filterStructuralSubtype,
      this.filterState, this.filterRole, this.includeArchived].filter(Boolean).length;
  }
  onFilterChange<T extends FilterChangeEvent['type']>(type: T, value?: Extract<FilterChangeEvent, { type: T }> extends { value: infer V } ? V : never): void {
    this.filterChange.emit({ type, value } as FilterChangeEvent);
  }
}
