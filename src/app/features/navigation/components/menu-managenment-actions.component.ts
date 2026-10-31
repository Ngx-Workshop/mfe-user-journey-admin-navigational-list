import { MenuSaveNotification } from '../models/menu-save-notification';
import {
  ChangeDetectionStrategy,
  Component,
  output,
  input,
  afterNextRender,
  DestroyRef,
  ElementRef,
  inject,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'menu-managenment-actions' },
  selector: 'ngx-menu-managenment-actions',
  template: `
    <h1 class="menu-managenment-actions__title">
      {{ title() }}
    </h1>
    <div
      class="menu-managenment-actions__unplaced"
      [class.menu-managenment-actions__unplaced--active]="(unplacedCount() ?? 0) > 0"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="menu-managenment-actions__unplaced-light" aria-hidden="true"></span>
      @if (unplacedCount(); as count) {
        <span><strong>{{ count }}</strong> unplaced {{ count === 1 ? 'destination' : 'destinations' }}</span>
      } @else if (unplacedCount() === 0) {
        <span><strong>0</strong> unplaced destinations</span>
      } @else {
        <span>Unplaced destinations: —</span>
      }
    </div>
    <div
      class="menu-managenment-actions__save"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      @if (saveNotification(); as notification) {
        @switch (notification.status) {
          @case ('saving') {
            <span>Saving {{ notification.name }}…</span>
          }
          @case ('saved') {
            <span class="menu-managenment-actions__saved"
              >Changes saved · {{ notification.name }}</span
            >
          }
          @case ('error') {
            <span class="menu-managenment-actions__save-error"
              >Could not save {{ notification.name }}. Try the action
              again.</span
            >
          }
        }
      }
    </div>
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
        flex: 0 1 auto;
        font: 600 1rem/1.4 var(--ngx-font-heading);
      }
      .menu-managenment-actions__unplaced {
        display: flex;
        align-items: center;
        gap: var(--ngx-space-2);
        color: var(--ngx-color-muted);
        font-family: var(--ngx-font-mono);
        font-size: 0.7rem;
      }
      .menu-managenment-actions__unplaced-light {
        flex: 0 0 0.5rem;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--ngx-color-border);
      }
      .menu-managenment-actions__unplaced--active {
        color: var(--ngx-color-warning);
      }
      .menu-managenment-actions__unplaced--active
        .menu-managenment-actions__unplaced-light {
        background: var(--ngx-color-warning);
        box-shadow: 0 0 0.5rem color-mix(in srgb, var(--ngx-color-warning) 50%, transparent);
      }
      .menu-managenment-actions__save {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        flex: 1;
        min-width: 0;
        gap: var(--ngx-space-2);
        color: var(--ngx-color-muted);
        font-size: 0.8rem;
        overflow-wrap: anywhere;
      }
      .menu-managenment-actions__saved {
        color: var(--ngx-color-success);
      }
      .menu-managenment-actions__save-error {
        color: var(--ngx-color-error);
      }
      @media (max-width: 720px) {
        .menu-managenment-actions__save:not(:empty) {
          order: 3;
          flex-basis: 100%;
        }
        :host {
          top: var(--menu-toolbar-top, 76px);
        }
      }
    `,
  ],
})
export class MenuManagenmentActions {
  readonly title = input('Navigation catalog');
  readonly unplacedCount = input<number | null>(null);
  readonly saveNotification = input<MenuSaveNotification>(null);
  constructor() {
    const host =
      inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const parent = host.parentElement!;
      const previous = parent.style.getPropertyValue(
        '--menu-action-bar-height'
      );
      const measure = () =>
        parent.style.setProperty(
          '--menu-action-bar-height',
          host.getBoundingClientRect().height + 'px'
        );
      const observer = new ResizeObserver(measure);
      observer.observe(host);
      measure();
      destroyRef.onDestroy(() => {
        observer.disconnect();
        previous
          ? parent.style.setProperty(
              '--menu-action-bar-height',
              previous
            )
          : parent.style.removeProperty('--menu-action-bar-height');
      });
    });
  }
  createUser = output<void>();
}
