import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { MenuStore } from '../state/menu.store';
import { MenuSearchService } from '../view-models/menu-search.service';
import { MenuListComponent } from './menu-list/menu-list.component';
import { MenuManagenmentActions } from './menu-managenment-actions.component';
import { MenuStatisticsComponent } from './menu-statistics.component';

@Component({
  selector: 'ngx-menu-management',
  providers: [MenuSearchService],
  imports: [
    NgxButton,
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
      <a
        mat-flat-button
        ngxButton
        surface="outline"
        shape="chevron"
        routerLink="create"
      >
        <mat-icon>add</mat-icon>Create Menu Item
      </a>
    </ngx-menu-managenment-actions>
    <main class="menu-management">
      @if (store.error()) {
      <div class="menu-management__error" role="alert">
        <mat-icon>error_outline</mat-icon
        ><span>{{ store.error() }}</span>
        <button
          mat-flat-button
          ngxButton
          surface="outline"
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
        [busy]="store.pending()"
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
        color: var(--ngx-color-text);
      }
      .menu-management {
        width: 100%;
        margin: auto;
        padding: 0 var(--ngx-space-4) var(--ngx-space-4);
      }
      .menu-management__content {
        padding-top: 12px;
      }
      .menu-management__content > * {
        display: block;
        min-width: 0;
      }
      .menu-management__error {
        display: flex;
        align-items: center;
        gap: 12px;
        border-radius: var(--ngx-radius);
        background: var(--ngx-color-surface-high);
        color: var(--ngx-color-error);
        padding: 12px 16px;
        margin-bottom: 16px;
      }
      .menu-management__error span {
        flex: 1;
      }
      @media (max-width: 600px) {
        .menu-management {
          padding: 0 0.75rem 1rem;
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
  constructor() {
    this.store.ensureLoaded();
  }
}
