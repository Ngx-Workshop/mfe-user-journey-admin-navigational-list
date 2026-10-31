import {
  MenuStatistic,
  MenuStatisticsComponent,
} from '../menu-statistics.component';
import {
  NgxPanel,
  NgxEntrance,
  NgxButton,
} from '@tmdjr/ngx-workshop-design-system';
import {
  afterNextRender,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
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
    NgxPanel,
    NgxEntrance,
    MenuStatisticsComponent,
    NgxButton,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MenuFilterFieldsComponent,
    MatCheckboxModule,
    MatIconModule,
  ],
  template: `
    <ngx-panel
      ngxEntrance="fade"
      heading="Filter console"
      eyebrow="CATALOG / FILTER"
      shape="chamfered"
      background="solid"
    >
      <aside
        #filterBody
        class="menu-filters"
        aria-label="Filter menu items"
        [style.max-height.px]="bodyHeight()"
      >
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
              (input)="
                onFilterChange('searchText', searchInput.value)
              "
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
        </div>
        <ngx-menu-statistics
          [statistics]="statistics"
          [loading]="loading"
          [busy]="busy"
          (refreshClick)="refreshClick.emit()"
        />
        <div class="menu-filters__filter-state">
          <span>{{ activeCount }} filters active</span>
        </div>
        <mat-checkbox
          [checked]="includeArchived"
          (change)="onFilterChange('includeArchived', $event.checked)"
          >Include archived</mat-checkbox
        >

        <button
          class="menu-filters__toggle"
          mat-button
          type="button"
          [attr.aria-expanded]="expanded()"
          aria-controls="menu-filter-fields"
          (click)="expanded.set(!expanded())"
        >
          <mat-icon>{{
            expanded() ? 'expand_less' : 'tune'
          }}</mat-icon
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
      </aside>
    </ngx-panel>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        position: sticky;
        top: calc(
          var(--menu-toolbar-top, 96px) +
            var(--menu-action-bar-height, 64px) + 12px
        );
        display: block;
        min-width: 0;
        align-self: start;
        @include mat.form-field-overrides(
          (
            container-height: 44px,
            container-vertical-padding: 10px,
          )
        );
      }
      .menu-filters {
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow-y: auto;
        scrollbar-width: thin;
      }
      .menu-filters__filter-state {
        display: flex;
        justify-content: space-between;
        color: var(--ngx-color-muted);
        font: var(--ngx-font-label);
        font-size: 0.65rem;
        border-top: 1px solid var(--ngx-color-border);
        padding-top: 12px;
      }
      ngx-menu-statistics,
      .menu-filters__search-row,
      .menu-filters__fields,
      mat-checkbox,
      .menu-filters__reset,
      .menu-filters__toggle,
      .menu-filters__filter-state {
        flex-shrink: 0;
      }
      .menu-filters__search-row {
        display: grid;
        gap: 8px;
        margin: 0.75rem 0 0.5rem;
      }
      .menu-filters__fields {
        margin-top: 12px;
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
        :host {
          position: static;
          width: 100%;
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
          align-self: flex-end;
          margin-top: 8px;
        }
        .menu-filters__reset:disabled {
          display: none;
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
  @Input() statistics: MenuStatistic[] = [];
  @Input() loading = false;
  @Input() busy = false;
  @Output() refreshClick = new EventEmitter<void>();
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterBody =
    viewChild.required<ElementRef<HTMLElement>>('filterBody');
  readonly bodyHeight = signal<number | null>(null);
  constructor() {
    afterNextRender(() => {
      const host = this.element.nativeElement;
      const body = this.filterBody().nativeElement;
      const viewport = host.ownerDocument.defaultView!;
      let frame = 0;
      const measure = () => {
        const bounds = host.getBoundingClientRect();
        const chrome =
          bounds.height - body.getBoundingClientRect().height;
        const available = Math.max(
          0,
          Math.floor(viewport.innerHeight - bounds.top - chrome - 16)
        );
        this.bodyHeight.set(
          viewport.innerWidth <= 900
            ? Math.min(480, available)
            : available
        );
      };
      const schedule = () => {
        viewport.cancelAnimationFrame(frame);
        frame = viewport.requestAnimationFrame(measure);
      };
      const observer = new ResizeObserver(schedule);
      observer.observe(host);
      observer.observe(body);
      viewport.addEventListener('resize', schedule);
      viewport.addEventListener('scroll', schedule, {
        capture: true,
        passive: true,
      });
      measure();
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        viewport.cancelAnimationFrame(frame);
        viewport.removeEventListener('resize', schedule);
        viewport.removeEventListener('scroll', schedule, true);
      });
    });
  }
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
