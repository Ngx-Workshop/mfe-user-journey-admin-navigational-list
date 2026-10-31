import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Asset, AssetManagerComponent, assetPreviewUrl } from '@tmdjr/ngx-asset-manager';

@Component({
  selector: 'ngx-menu-icon-picker-dialog',
  imports: [MatButtonModule, MatDialogModule, AssetManagerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Choose {{ label }} image</h2>
    <mat-dialog-content class="menu-icon-picker__content">
      <ngx-asset-manager
        title="Menu images"
        view="full"
        mode="both"
        [assetTypes]="['image']"
        accept="image/*"
        (assetSelected)="selectImage($event)"
        (uploaded)="selectImage($event)"
      />
      @if (error()) {
        <p class="menu-icon-picker__error" role="alert">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="undefined">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .menu-icon-picker__content { min-height: 120px; }
    .menu-icon-picker__error { color: var(--ngx-color-error); }
  `],
})
export class MenuIconPickerDialogComponent {
  readonly label = inject<string>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MenuIconPickerDialogComponent, string>);
  readonly error = signal('');

  selectImage(asset: Asset): void {
    const url = assetPreviewUrl(asset);
    if (!url) {
      this.error.set('This image has no usable URL. Select a ready image or cancel to enter a URL manually.');
      return;
    }
    this.dialogRef.close(url);
  }
}
