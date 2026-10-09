import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MenuHierarchyManagerComponent } from '../components/menu-hierarchy/menu-hierarchy-manager.component';
import { MenuManagenmentActions } from '../components/menu-managenment-actions.component';
import { MenuStore } from '../state/menu.store';

@Component({
  selector: 'ngx-menu-hierarchy-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MenuHierarchyManagerComponent,
    MenuManagenmentActions,
  ],
  template: `
    <ngx-menu-managenment-actions>
      <a mat-flat-button routerLink=".."
        ><mat-icon>arrow_back</mat-icon>Back to Menu Items</a
      >
    </ngx-menu-managenment-actions>
    <main class="menu-hierarchy-page">
      <h2>Menu hierarchy</h2>
      @if (store.error()) {
      <p role="alert">
        {{ store.error() }}
        <button
          mat-button
          (click)="store.refresh()"
          [disabled]="store.loading()"
        >
          Retry
        </button>
      </p>
      } @if (store.loading()) {
      <p role="status">Loading hierarchy…</p>
      } @if (store.ready()) {
      <ngx-menu-hierarchy-manager
        [menuHierarchy]="store.hierarchy()"
      />
      }
    </main>
  `,
  styles: [
    `
      .menu-hierarchy-page {
        max-width: 1440px;
        margin: auto;
        padding: 2rem;
      }
      @media (max-width: 600px) {
        .menu-hierarchy-page {
          padding: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuHierarchyPageComponent {
  readonly store = inject(MenuStore);
  constructor() {
    this.store.ensureLoaded();
  }
}
