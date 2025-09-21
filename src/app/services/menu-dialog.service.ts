import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { Observable } from 'rxjs';
import {
  MenuItemFormComponent,
  MenuItemFormDialogData,
} from '../components/menu-item-form.component';

@Injectable({
  providedIn: 'root',
})
export class MenuDialogService {
  private readonly dialog = inject(MatDialog);

  /**
   * Opens the menu item form dialog in create mode
   * @returns Observable that emits when dialog is closed with result
   */
  openCreateDialog(): Observable<boolean | undefined> {
    const dialogData: MenuItemFormDialogData = {
      mode: 'create',
    };

    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: dialogData,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Opens the menu item form dialog in edit mode
   * @param item The menu item to edit
   * @returns Observable that emits when dialog is closed with result
   */
  openEditDialog(item: MenuItemDto): Observable<boolean | undefined> {
    const dialogData: MenuItemFormDialogData = {
      mode: 'edit',
      item: item,
    };

    const dialogRef = this.dialog.open(MenuItemFormComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: dialogData,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Opens the menu item form dialog with custom configuration
   * @param data The dialog data configuration
   * @param config Optional dialog configuration overrides
   * @returns Observable that emits when dialog is closed with result
   */
  openDialog(
    data: MenuItemFormDialogData,
    config?: {
      width?: string;
      maxWidth?: string;
      disableClose?: boolean;
    }
  ): Observable<boolean | undefined> {
    const dialogConfig = {
      width: config?.width || '800px',
      maxWidth: config?.maxWidth || '90vw',
      disableClose: config?.disableClose || false,
      data,
    };

    const dialogRef = this.dialog.open(
      MenuItemFormComponent,
      dialogConfig
    );

    return dialogRef.afterClosed();
  }
}
