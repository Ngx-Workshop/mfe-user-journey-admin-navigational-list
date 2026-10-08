import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuItemFormService } from '../../../../../src/app/features/navigation/utils/menu-item-form.service';
import { MenuItemFormViewModel } from '../../../../../src/app/features/navigation/view-models/menu-item-form.view-model';
import { menuItem } from '../menu.fixture';

describe('MenuItemFormViewModel', () => {
  let vm: MenuItemFormViewModel;
  let http: HttpTestingController;
  let dialog: {
    close: jasmine.Spy;
    disableClose: boolean;
    id: string;
  };
  const parent = menuItem({ _id: 'bbbbbbbbbbbbbbbbbbbbbbbb' });
  beforeEach(() => {
    dialog = {
      id: 'test-dialog',
      close: jasmine.createSpy('close'),
      disableClose: false,
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MenuItemFormService,
        MenuItemFormViewModel,
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            item: menuItem({ parentId: parent._id }),
          },
        },
        { provide: MatDialogRef, useValue: dialog },
        {
          provide: MatSnackBar,
          useValue: { open: jasmine.createSpy('open') },
        },
      ],
    });
    vm = TestBed.inject(MenuItemFormViewModel);
    http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/navigational-list')
      .flush([parent, menuItem({ parentId: parent._id })]);
    TestBed.tick();
  });
  afterEach(() => http.verify());

  it('keeps existing parents until loaded and resets them on classification change', () => {
    expect(vm.form.controls.parentId.value).toBe(parent._id);
    expect(vm.parentOptions().map((o) => o.value)).toEqual([
      '',
      parent._id,
    ]);
    vm.form.controls.domain.setValue('WORKSHOP');
    TestBed.tick();
    expect(vm.parentOptions().length).toBe(1);
    expect(vm.form.controls.parentId.value).toBe('');
  });
  it('prevents duplicate saves and retains edits after a failure', () => {
    vm.form.controls.menuItemText.setValue('New text');
    vm.save();
    vm.save();
    expect(dialog.disableClose).toBeTrue();
    const request = http.expectOne(
      `/api/navigational-list/${menuItem()._id}`
    );
    expect(request.request.body.menuItemText).toBe('New text');
    request.flush('failed', { status: 500, statusText: 'Error' });
    expect(vm.saving()).toBeFalse();
    expect(dialog.disableClose).toBeFalse();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(vm.form.controls.menuItemText.value).toBe('New text');
    vm.save();
    http
      .expectOne(`/api/navigational-list/${menuItem()._id}`)
      .flush(menuItem());
    http.expectOne('/api/navigational-list').flush([menuItem()]);
    expect(dialog.close).toHaveBeenCalledWith(true);
  });
});
