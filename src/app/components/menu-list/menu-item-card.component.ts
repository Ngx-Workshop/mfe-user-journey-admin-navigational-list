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
        <mat-card-title>{{ item.menuItemText }}</mat-card-title>
        <mat-card-subtitle>
          <mat-chip-set>
            <mat-chip>{{ item.domain }}</mat-chip>
            <mat-chip>{{ item.structuralSubtype }}</mat-chip>
            <mat-chip>{{ item.state }}</mat-chip>
            @if (item.authRequired) {
            <mat-chip color="warn">Auth Required</mat-chip>
            } @if (item.archived) {
            <mat-chip color="accent">Archived</mat-chip>
            }
          </mat-chip-set>
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <p><strong>Route:</strong> {{ item.routePath }}</p>
        @if (item.description) {
        <p><strong>Description:</strong> {{ item.description }}</p>
        } @if (item.tooltipText) {
        <p><strong>Tooltip:</strong> {{ item.tooltipText }}</p>
        }
        <p><strong>Sort ID:</strong> {{ item.sortId }}</p>
        <p>
          <strong>Last Updated:</strong>
          {{ item.lastUpdated | date : 'short' }}
        </p>
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
        <button mat-button color="warn" (click)="onAction('delete')">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
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
