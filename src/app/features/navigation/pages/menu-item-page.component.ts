import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ActivatedRoute,
  CanDeactivateFn,
  RouterLink,
} from '@angular/router';
import {
  MenuItemFormComponent,
  MenuItemFormDialogData,
} from '../components/menu-item-form/menu-item-form.component';
import { MenuManagenmentActions } from '../components/menu-managenment-actions.component';
import { MenuStore } from '../state/menu.store';

@Component({
  selector: 'ngx-menu-item-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MenuItemFormComponent,
    MenuManagenmentActions,
  ],
  template: `
    <ngx-menu-managenment-actions>
      <!-- Need  -->
      <a
        mat-flat-button
        [routerLink]="[data().mode === 'edit' ? '../../' : '../']"
        ><mat-icon>arrow_back</mat-icon>Back to Menu Items</a
      >
    </ngx-menu-managenment-actions>
    <main class="menu-item-page">
      @if (store.loading() && !store.ready()) {
        <p role="status">Loading menu item…</p>
      } @else if (!store.ready() && store.error()) {
        <p role="alert">{{ store.error() }}</p>
        <button mat-button (click)="store.refresh()">Retry</button>
        <a mat-button routerLink="..">Back to Menu Items asdfasdf</a>
      } @else if (data().mode === 'edit' && !data().item) {
        <h2>Menu item not found</h2>
        <p>This menu item is no longer available.</p>
        <a mat-button routerLink="..">Back to Menu Items</a>
      } @else {
        @for (key of [params().get('id')]; track key) {
          <ngx-menu-item-form />
        }
      }
    </main>
  `,
  styles: [
    `
      .menu-item-page {
        max-width: 960px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemPageComponent {
  readonly store = inject(MenuStore);
  private readonly route = inject(ActivatedRoute);
  readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly data = computed<MenuItemFormDialogData>(() => ({
    mode: this.route.snapshot.data['mode'],
    item: this.store
      .items()
      .find((item) => item._id === this.params().get('id')),
  }));
  constructor() {
    this.store.ensureLoaded();
  }
}

// Keep in-flight writes on the page until the store has completed them.
export const menuItemSavingGuard: CanDeactivateFn<
  MenuItemPageComponent
> = (page) => !page.store.pending();
