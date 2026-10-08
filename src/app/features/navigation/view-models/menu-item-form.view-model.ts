import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, startWith } from 'rxjs';
import { MenuItemFormDialogData } from '../components/menu-item-form/menu-item-form.component';
import { MenuStore } from '../state/menu.store';
import { MenuItemFormService } from '../utils/menu-item-form.service';

@Injectable()
export class MenuItemFormViewModel {
  readonly store = inject(MenuStore);
  readonly data = inject<MenuItemFormDialogData>(MAT_DIALOG_DATA);
  private readonly forms = inject(MenuItemFormService);
  private readonly dialog = inject(MatDialogRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  readonly formId = `${this.dialog.id}-menu-form`;
  readonly form = this.forms.createMenuItemForm();
  readonly saving = signal(false);
  private readonly values = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())));
  readonly parentOptions = computed(() => {
    const values = this.values();
    return this.forms.getParentOptions(values?.domain ?? '', values?.structuralSubtype ?? '',
      values?.state ?? '', this.store.items(), this.data.item?._id);
  });

  constructor() {
    this.store.ensureLoaded();
    if (this.data.item) this.forms.populateForm(this.form, this.data.item);
    effect(() => {
      const options = this.parentOptions();
      const parent = this.form.controls.parentId.value;
      // Do not clear valid existing selections before the initial load succeeds.
      if (!this.store.loading() && !this.store.error() && parent && !options.some(o => o.value === parent)) {
        this.form.controls.parentId.setValue('');
      }
    });
  }

  cancel(): void { if (!this.saving()) this.dialog.close(); }

  save(): void {
    if (this.saving() || this.store.pending() || !this.store.ready() || this.store.loading() || !this.forms.validateForm(this.form)) return;
    const value = this.form.getRawValue();
    if (!value.domain || !value.structuralSubtype || !value.state) return;
    const parentId = this.parentOptions().some(option => option.value === value.parentId) ? value.parentId : '';
    const dto = this.forms.toDto({ ...value, parentId, domain: value.domain, structuralSubtype: value.structuralSubtype, state: value.state });
    const id = this.data.item?._id;
    if (this.data.mode === 'edit' && !id) return;
    this.saving.set(true);
    this.dialog.disableClose = true;
    const request = this.data.mode === 'edit' ? this.store.update$(id!, dto) : this.store.create$(dto);
    request.pipe(
      finalize(() => { this.saving.set(false); this.dialog.disableClose = false; }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => this.dialog.close(true),
      error: () => this.snackBar.open('Failed to save menu item. Your edits are retained.', 'Close', { duration: 4000 }),
    });
  }
}
