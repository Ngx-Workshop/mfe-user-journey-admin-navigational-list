import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MenuStore } from '../state/menu.store';
import { MenuResultsViewModel } from '../view-models/menu-results.view-model';
import { MenuSearchService } from '../view-models/menu-search.service';
import { MenuListComponent } from './menu-list/menu-list.component';
import { MenuManagenmentActions } from './menu-managenment-actions.component';
import { MenuStatisticsComponent } from './menu-statistics.component';

@Component({
  selector: 'ngx-menu-management',
  providers: [MenuSearchService, MenuResultsViewModel],
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MenuListComponent,
    MenuStatisticsComponent,
    MenuManagenmentActions,
  ],
  template: `
    <ngx-menu-managenment-actions>
      <div class="menu-management__spacer"></div>
      <a mat-flat-button routerLink="hierarchy">
        <mat-icon>account_tree</mat-icon>Manage Hierarchy
      </a>
      <a mat-flat-button routerLink="create">
        <mat-icon>add</mat-icon>Create Menu Item
      </a>
    </ngx-menu-managenment-actions>
    <main class="menu-management">
      <!-- <div class="menu-management__toolbar">
        <div>
          <h2>Navigation workspace</h2>
          <p>
            @if (store.ready()) {
            {{ activeCount() }} active ·
            {{ store.items().length - activeCount() }} archived }
            @else { Manage menu items, placement and access. }
          </p>
        </div>
      </div> -->
      @if (store.error()) {
        <div class="menu-management__error" role="alert">
          <mat-icon>error_outline</mat-icon
          ><span>{{ store.error() }}</span>
          <button
            mat-button
            (click)="store.refresh()"
            [disabled]="store.loading()"
          >
            Retry
          </button>
        </div>
      }
      <ngx-menu-statistics
        [statistics]="store.ready() ? store.statistics() : []"
        [loading]="store.loading()"
        (refreshClick)="store.refresh()"
      />
      <div class="menu-management__content">
        <ngx-menu-list />
      </div>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--mat-sys-on-surface);
      }
      .menu-management__spacer {
        flex: 1;
      }
      .menu-management {
        max-width: 1440px;
        margin: auto;
        padding: 2.5rem 2rem;
      }
      .menu-management__hero-content {
        max-width: 1200px;
        padding: 28px 32px;
        margin: auto;
      }
      .menu-management__hero-content h1 {
        margin: 0;
        font-size: clamp(1.6rem, 3vw, 2rem);
        font-weight: 500;
        letter-spacing: -0.025em;
      }
      .menu-management__hero-content p {
        margin: 8px 0 0;
        font-size: 0.95rem;
      }
      .menu-management__toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 28px 0 24px;
      }
      .menu-management__toolbar h2 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 6px;
      }
      .menu-management__toolbar p {
        font-size: 0.875rem;
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
      }
      .menu-management__toolbar button {
        flex-shrink: 0;
      }
      .menu-management__content {
        padding-top: 24px;
      }
      .menu-management__content > * {
        display: block;
        min-width: 0;
      }
      .menu-management__error {
        display: flex;
        align-items: center;
        gap: 12px;
        border-radius: 12px;
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
        padding: 12px 16px;
        margin-bottom: 16px;
      }
      .menu-management__error span {
        flex: 1;
      }
      @media (max-width: 600px) {
        .menu-management {
          padding: 0 16px 32px;
        }
        .menu-management__hero-content {
          padding: 24px 16px;
        }
        .menu-management__toolbar {
          align-items: stretch;
          flex-direction: column;
          gap: 16px;
          padding: 24px 0;
        }
        .menu-management__error {
          flex-wrap: wrap;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuManagementComponent {
  readonly store = inject(MenuStore);
  readonly activeCount = computed(
    () => this.store.items().filter((item) => !item.archived).length
  );
  constructor() {
    this.store.ensureLoaded();
  }
}
