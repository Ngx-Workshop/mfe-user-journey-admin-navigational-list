import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';

export interface MenuItemActionEvent {
  type: 'edit' | 'archive' | 'unarchive' | 'delete';
  item: MenuItemDto;
}

@Component({
  selector: 'ngx-menu-item-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
  ],
  template: `
    <mat-card class="menu-item-card" [class.archived]="item.archived">
      <mat-card-header>
        <mat-card-title class="menu-item-card-title">
          {{ item.menuItemText }}
          @if (item.role) {
          <mat-chip class="auth-chip">{{ item.role }}</mat-chip>
          }
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <a href="{{ item.routePath }}" target="_blank">{{
          item.routePath
        }}</a>
        <div class="copy-id-container">
          <pre>{{ item._id }}</pre>
          <mat-icon class="copy-id">content_copy</mat-icon>
        </div>

        <mat-chip-set>
          <mat-chip>{{ item.domain }}</mat-chip>
          <mat-chip>{{ item.structuralSubtype }}</mat-chip>
          <mat-chip>{{ item.state }}</mat-chip>
        </mat-chip-set>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button (click)="onAction('edit')">
          <mat-icon>edit</mat-icon> Edit
        </button>
        @if (item.archived) {
        <button mat-button (click)="onAction('unarchive')">
          <mat-icon>unarchive</mat-icon> Unarchive
        </button>
        } @else {
        <button mat-button (click)="onAction('archive')">
          <mat-icon>archive</mat-icon> Archive
        </button>
        }
        <!-- <button mat-button color="warn" (click)="onAction('delete')">
          <mat-icon>delete</mat-icon> Delete
        </button> -->
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      .auth-chip {
        @include mat.chips-overrides(
          (
            label-text-color: orange,
            outline-color: orange,
          )
        );
      }

      ::ng-deep .mat-mdc-card-header-text {
        width: 100%;
      }
      :host {
        .mat-mdc-card-header .mat-mdc-card-header-text {
          width: 100% !important;
        }
        .menu-item-card-title {
          display: flex;
          width: 100%;
          justify-content: space-between;
        }
        .menu-item-card {
          transition: all 0.2s ease;
        }
        .menu-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .menu-item-card.archived {
          opacity: 0.7;
        }
        .copy-id-container {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          .copy-id {
            font-size: 0.9rem;
            width: 0.9rem;
            height: 0.9rem;
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemCardComponent {
  @Input({ required: true }) item!: MenuItemDto;

  @Output() action = new EventEmitter<MenuItemActionEvent>();

  onAction(type: MenuItemActionEvent['type']): void {
    this.action.emit({ type, item: this.item });
  }
}
