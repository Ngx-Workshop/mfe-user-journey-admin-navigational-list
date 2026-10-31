import { computed, inject, Injectable, signal } from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { merge, startWith } from 'rxjs';
import { MenuItemFormViewModel } from '../view-models/menu-item-form.view-model';

/** Shared create/edit progression; the shared form VM retains validation, parent choices and persistence. */
@Injectable()
export class CreateMenuItemViewModel {
  readonly editor = inject(MenuItemFormViewModel);
  readonly form = this.editor.form;
  readonly editing = this.editor.data.mode === 'edit';
  readonly submitLabel = this.editing ? 'Save changes' : 'Create menu item';
  readonly savingLabel = this.editing ? 'Saving…' : 'Creating…';
  readonly step = signal(0);
  private readonly formEvents = toSignal(
    this.form.events.pipe(startWith(null))
  );
  readonly archived = computed(() => {
    this.formEvents();
    return this.form.controls.archived.value;
  });
  readonly heading = computed(() => {
    this.formEvents();
    return `${this.editing ? 'Editing' : 'Creating'} menu item: ${this.form.controls.menuItemText.value}`;
  });
  readonly positionOptions = computed(() => {
    this.formEvents();
    const { parentId, domain, structuralSubtype, state } =
      this.form.getRawValue();
    const siblings = this.editor.store
      .items()
      .filter(
        (item) =>
          item._id !== this.editor.data.item?._id &&
          !item.archived &&
          (item.parentId || '') === parentId &&
          item.domain === domain &&
          item.structuralSubtype === structuralSubtype &&
          item.state === state
      )
      .sort(
        (a, b) => a.sortId - b.sortId || a._id.localeCompare(b._id)
      );
    const options = siblings.map((item) => {
      // Creation does not resequence siblings; use a gap to avoid colliding
      // with the next sibling's sort value. The DTO accepts numeric positions.
      const next = siblings.find(
        (sibling) => sibling.sortId > item.sortId
      );
      return {
        id: item._id,
        label: item.menuItemText,
        value: next
          ? (item.sortId + next.sortId) / 2
          : item.sortId + 1,
      };
    });
    const original = this.editor.data.item;
    // An untouched edit must retain its exact persisted sort value, including gaps.
    if (
      original && original.sortId !== 0 &&
      (original.parentId || '') === parentId &&
      original.domain === domain &&
      original.structuralSubtype === structuralSubtype &&
      original.state === state &&
      !options.some((option) => option.value === original.sortId)
    ) {
      options.unshift({
        id: 'current-position',
        label: 'Current position',
        value: original.sortId,
      });
    }
    return options;
  });
  constructor() {
    const controls = this.form.controls;
    merge(
      controls.parentId.valueChanges,
      controls.domain.valueChanges,
      controls.structuralSubtype.valueChanges,
      controls.state.valueChanges
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => controls.sortId.setValue(0));
  }
  readonly identityValid = computed(() => {
    this.formEvents();
    return (
      this.form.controls.menuItemText.valid &&
      this.form.controls.domain.valid &&
      this.form.controls.structuralSubtype.valid &&
      this.form.controls.state.valid &&
      this.form.controls.role.valid
    );
  });
  readonly routingValid = computed(() => {
    this.formEvents();
    return (
      this.form.controls.routePath.valid &&
      this.form.controls.parentId.valid &&
      this.form.controls.sortId.valid
    );
  });
  readonly valid = computed(() => {
    this.formEvents();
    return this.form.valid;
  });
  readonly busy = computed(
    () =>
      this.editor.saving() ||
      this.editor.store.pending() ||
      this.editor.store.loading() ||
      !this.editor.store.ready()
  );
  readonly canContinue = computed(
    () =>
      !this.busy() &&
      (this.step() === 0
        ? this.identityValid()
        : this.step() === 1 &&
          this.identityValid() &&
          this.routingValid())
  );
  readonly canSave = computed(
    () =>
      this.step() === 2 &&
      this.valid() &&
      this.identityValid() &&
      this.routingValid() &&
      !this.busy()
  );
  setArchived(archived: boolean): void {
    this.editor.setArchived(archived);
  }
  next(): void {
    if (this.canContinue()) this.step.update((step) => step + 1);
  }
  selectStep(step: number): void {
    if (
      !this.busy() &&
      step >= 0 &&
      step <= 2 &&
      (step === 0 || this.identityValid()) &&
      (step < 2 || this.routingValid())
    )
      this.step.set(step);
  }
  submit(): void {
    if (this.canSave()) this.editor.save();
  }
}
