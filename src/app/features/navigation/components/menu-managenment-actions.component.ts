import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'menu-managenment-actions' },
  selector: 'ngx-menu-managenment-actions',
  template: `
    <h1 class="menu-managenment-actions__title">
      {{ title() }}
    </h1>
    <ng-content></ng-content>
  `,
  styles: [
    `
      :host {
        position: sticky;
        top: var(--menu-toolbar-top, 96px);
        z-index: 10;
        display: flex;
        align-items: center;
        gap: var(--ngx-space-4);
        flex-wrap: wrap;
        min-height: 64px;
        padding: 0.5rem 1rem;
        background: color-mix(
          in srgb,
          var(--ngx-color-canvas) 85%,
          transparent
        );
        border-bottom: 1px solid var(--ngx-color-border);
        backdrop-filter: blur(16px);
        box-shadow: 0 8px 24px rgba(20, 24, 40, 0.04);
      }

      .menu-managenment-actions__title {
        margin: 0;
        flex: 1;
        font: 600 1rem/1.4 var(--ngx-font-heading);
      }
      @media (max-width: 720px) {
        :host {
          top: var(--menu-toolbar-top, 76px);
        }
      }
    `,
  ],
})
export class MenuManagenmentActions {
  readonly title = input('Navigation catalog');
  createUser = output<void>();
}
