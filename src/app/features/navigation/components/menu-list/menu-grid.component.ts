import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { MenuResultsViewModel } from '../../view-models/menu-results.view-model';
import { MenuItemActionEvent, MenuItemCardComponent } from './menu-item-card.component';

@Component({
  selector: 'ngx-menu-grid',
  providers: [MenuResultsViewModel],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MenuItemCardComponent,
    MatPaginatorModule, MatFormFieldModule, MatSelectModule],
  template: `
    <section class="menu-grid" aria-label="Menu item results" [attr.aria-busy]="busy">
      <div class="menu-grid__toolbar">
        <div><h2>Menu items <span class="menu-grid__count">{{ vm.total() }}</span></h2>
          <p role="status" aria-live="polite">{{ vm.total() }} {{ vm.total() === 1 ? 'item matches' : 'items match' }} your filters</p>
        </div>
        <div class="menu-grid__controls">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Sort by</mat-label>
            <mat-select [value]="vm.sort()" (valueChange)="vm.setSort($event)">
              <mat-option value="name">Name A–Z</mat-option>
              <mat-option value="position">Menu order</mat-option>
              <mat-option value="updated">Recently updated</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-icon-button (click)="refreshClick.emit()" [disabled]="busy" matTooltip="Refresh menu items" aria-label="Refresh"><mat-icon>refresh</mat-icon></button>
        </div>
      </div>
      <div class="menu-grid__cards">
        @for (item of vm.visible(); track item._id) {
          <ngx-menu-item-card [item]="item" [disabled]="busy" (action)="itemAction.emit($event)" />
        }
      </div>
      <mat-paginator class="menu-grid__pagination" aria-label="Menu item pages" [length]="vm.total()"
        [pageIndex]="vm.pageIndex()" [pageSize]="vm.pageSize()" [pageSizeOptions]="[12, 24, 48]"
        [showFirstLastButtons]="true" [disabled]="busy" (page)="vm.page($event)" />
    </section>
  `,
  styles: [`
    :host { display: block; }
    .menu-grid__toolbar { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin: 28px 0 20px; }
    .menu-grid__toolbar h2 { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; font-weight: 600; margin: 0 0 6px; }
    .menu-grid__toolbar p { margin: 0; font-size: .8rem; color: var(--mat-sys-on-surface-variant); }
    .menu-grid__count { border-radius: 6px; background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); font-size: .75rem; padding: 3px 8px; }
    .menu-grid__controls { display: flex; align-items: center; gap: 8px; }
    .menu-grid__controls mat-form-field { width: 190px; }
    .menu-grid__cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
    .menu-grid__pagination { margin-top: 20px; border-top: 1px solid var(--mat-sys-outline-variant); background: transparent; padding-top: 8px; }
    @media (max-width: 1000px) { .menu-grid__cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) {
      .menu-grid__cards { grid-template-columns: 1fr; gap: 16px; }
      .menu-grid__toolbar { align-items: stretch; flex-direction: column; gap: 16px; }
      .menu-grid__controls mat-form-field { flex: 1; width: auto; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuGridComponent {
  readonly vm = inject(MenuResultsViewModel);
  @Input({ required: true }) set items(value: MenuItemDto[]) { this.vm.setItems(value); }
  @Input() busy = false;
  @Output() itemAction = new EventEmitter<MenuItemActionEvent>();
  @Output() refreshClick = new EventEmitter<void>();
}
