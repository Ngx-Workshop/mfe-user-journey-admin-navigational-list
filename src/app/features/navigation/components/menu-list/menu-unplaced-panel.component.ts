import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  NgxEntrance,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { observePanelBody } from '../../utils/panel-body-viewport';
import {
  MenuItemActionEvent,
  MenuItemCardComponent,
} from './menu-item-card.component';

@Component({
  selector: 'ngx-menu-unplaced-panel',
  imports: [NgxPanel, NgxEntrance, MenuItemCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-panel
      ngxEntrance="fade"
      heading="Unplaced destinations"
      eyebrow="HIERARCHY / REPAIR"
      shape="beveled"
      background="solid"
      tone="secondary"
      aria-label="Items needing hierarchy repair"
      [attr.aria-busy]="busy()"
    >
      <span ngxPanelHeader class="menu-unplaced__count"
        >{{ items().length }}
        {{ items().length === 1 ? 'item' : 'items' }}</span
      >
      <section
        class="menu-unplaced__body"
        #body
        [style.height.px]="bodyHeight()"
      >
        <p class="menu-unplaced__notice">
          These items have an unavailable parent or invalid ancestry.
          Edit their parent to place them in the structure.
        </p>
        <div
          class="menu-unplaced__items"
          tabindex="0"
          role="region"
          aria-label="Scrollable unplaced destinations"
        >
          @for (item of items(); track item._id) {
          <ngx-menu-item-card
            [item]="item"
            [disabled]="busy()"
            (action)="itemAction.emit($event)"
          />
          }
        </div>
      </section>
    </ngx-panel>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        min-height: 0;
      }
      ngx-panel {
        height: auto;
      }
      .menu-unplaced__count {
        color: var(--ngx-color-secondary);
        font: var(--ngx-font-label);
      }
      .menu-unplaced__body {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .menu-unplaced__notice {
        margin: 0 0 12px;
        color: var(--ngx-color-warning);
        font-size: 0.75rem;
        line-height: 1.6;
      }
      .menu-unplaced__items {
        flex: 1;
        min-height: 0;
        overflow: auto;
        scrollbar-width: thin;
      }
      .menu-unplaced__items:focus-visible {
        outline: 2px solid var(--ngx-color-primary);
        outline-offset: -2px;
      }
      @media (max-width: 900px) {
        :host {
          height: auto;
        }
        .menu-unplaced__items {
          overflow: visible;
        }
      }
    `,
  ],
})
export class MenuUnplacedPanelComponent {
  readonly items = input.required<MenuItemDto[]>();
  readonly busy = input(false);
  readonly itemAction = output<MenuItemActionEvent>();
  readonly bodyHeight = signal<number | null>(null);
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly body =
    viewChild.required<ElementRef<HTMLElement>>('body');
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    afterNextRender(() =>
      observePanelBody(
        this.element.nativeElement,
        this.body().nativeElement,
        this.destroyRef,
        (height) => this.bodyHeight.set(height)
      )
    );
  }
}
