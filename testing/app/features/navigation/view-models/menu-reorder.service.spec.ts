import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { MenuReorderService } from '../../../../../src/app/features/navigation/view-models/menu-reorder.service';
import { menuItem } from '../menu.fixture';

describe('MenuReorderService', () => {
  let vm: MenuReorderService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), MenuReorderService,
      { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
      ]
    });
    vm = TestBed.inject(MenuReorderService); http = TestBed.inject(HttpTestingController);
    vm.store.refresh(); http.expectOne('/api/navigational-list').flush([menuItem(), menuItem({ _id: 'child', parentId: menuItem()._id })]);
  });
  afterEach(() => http.verify());
  const drop = (id: string, items = [menuItem()]) => ({
    item: { data: menuItem() }, container: { id, data: items }, currentIndex: 1,
  }) as CdkDragDrop<MenuItemDto[]>;
  it('rejects cross-classification and descendant destinations without HTTP writes', () => {
    vm.drop(drop('list-WORKSHOP-NAV-FULL'));
    vm.drop(drop(`list-ADMIN-NAV-FULL-${menuItem()._id}-child`)); http.expectNone('/api/navigational-list/sort');
    expect(vm.store.pending()).toBeFalse();
  });
  it('keeps rendered data intact on a rejected reorder', () => {
    const items = [menuItem(), menuItem({ _id: 'second' })];
    vm.drop(drop('list-ADMIN-NAV-FULL', items));
    const pending = http.expectOne('/api/navigational-list/sort');
    expect(pending.request.body.sortId).toBe(2);
    expect(items[0]._id).toBe(menuItem()._id);
    pending.flush('failed', { status: 500, statusText: 'Error' });
    expect(vm.store.items()[0].sortId).toBe(1); expect(vm.store.pending()).toBeFalse();
  });
});
