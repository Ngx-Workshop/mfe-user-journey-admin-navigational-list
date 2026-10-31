import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  NgxActionBar,
  NgxInlineStatus,
  NgxSaveFeedback,
} from '@tmdjr/ngx-workshop-design-system';
import { MenuSaveNotification } from '../models/menu-save-notification';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'menu-managenment-actions' },
  selector: 'ngx-menu-managenment-actions',
  imports: [NgxActionBar, NgxInlineStatus, NgxSaveFeedback],
  template: `
    <ngx-action-bar
      [heading]="title()"
      (heightChange)="heightChange.emit($event)"
    >
      <ngx-inline-status
        ngxActionBarIndicators
        [label]="unplacedLabel()"
        [tone]="(unplacedCount() ?? 0) > 0 ? 'warning' : 'neutral'"
        [announce]="true"
      />
      <ngx-save-feedback
        ngxActionBarFeedback
        [state]="saveNotification()?.status ?? 'idle'"
        [name]="saveNotification()?.name ?? ''"
        [message]="saveMessage()"
      />
      <ng-content />
    </ngx-action-bar>
  `,
  styles: [
    `
      :host {
        display: contents;
        --ngx-action-bar-top: var(--menu-toolbar-top, 96px);
      }
      @media (max-width: 720px) {
        :host {
          --ngx-action-bar-top: var(--menu-toolbar-top, 76px);
        }
      }
    `,
  ],
})
export class MenuManagenmentActions {
  readonly title = input('Navigation catalog');
  readonly unplacedCount = input<number | null>(null);
  readonly saveNotification = input<MenuSaveNotification>(null);
  readonly heightChange = output<number>();
  readonly unplacedLabel = computed(() => {
    const count = this.unplacedCount();
    return count === null
      ? 'Unplaced destinations: —'
      : `${count} unplaced ${count === 1 ? 'destination' : 'destinations'}`;
  });
  readonly saveMessage = computed(() => {
    const notification = this.saveNotification();
    return notification?.status === 'error'
      ? `Could not save ${notification.name}. Try the action again.`
      : '';
  });
}
