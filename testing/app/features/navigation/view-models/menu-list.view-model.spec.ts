import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuStore } from '../../../../../src/app/features/navigation/state/menu.store';
import { provideRouter } from '@angular/router';
import { MenuListViewModel } from '../../../../../src/app/features/navigation/view-models/menu-list.view-model';
import { menuItem } from '../menu.fixture';

describe('MenuListViewModel copy feedback', () => {
  it('reports clipboard success and failure without issuing mutations, including while saving', () => {
    const clipboard = jasmine.createSpyObj('Clipboard', ['copy']);
    const snack = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      providers: [
        MenuListViewModel,
        { provide: Clipboard, useValue: clipboard },
        { provide: MatSnackBar, useValue: snack },
        {
          provide: MenuStore,
          useValue: { pending: () => true, loading: () => false },
        },
        provideRouter([]),
      ],
    });
    const vm = TestBed.inject(MenuListViewModel);
    const item = menuItem();
    clipboard.copy.and.returnValue(true);
    vm.act({ type: 'copy', item });
    expect(clipboard.copy).toHaveBeenCalledWith(item._id);
    expect(snack.open.calls.mostRecent().args[0]).toBe(
      'Menu item ID copied'
    );
    clipboard.copy.and.returnValue(false);
    vm.act({ type: 'copy', item });
    expect(snack.open.calls.mostRecent().args[0]).toContain(
      'Could not copy'
    );
  });
});
