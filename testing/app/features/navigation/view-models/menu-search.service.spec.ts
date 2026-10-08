import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MenuStore } from '../../../../../src/app/features/navigation/state/menu.store';
import { MenuSearchService } from '../../../../../src/app/features/navigation/view-models/menu-search.service';
import { menuItem } from '../menu.fixture';

describe('MenuSearchService', () => {
  it('reveals archived items immediately and combines classification, role and text filters', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MenuSearchService,
      ],
    });
    const store = TestBed.inject(MenuStore);
    const vm = TestBed.inject(MenuSearchService);
    const http = TestBed.inject(HttpTestingController);
    store.refresh();
    http
      .expectOne('/api/navigational-list')
      .flush([
        menuItem(),
        menuItem({
          _id: 'other',
          archived: true,
          role: 'admin',
          menuItemText: 'Settings',
        }),
      ]);
    expect(vm.filteredItems().length).toBe(1);
    vm.setIncludeArchived(true);
    expect(vm.filteredItems().length).toBe(2);
    vm.setSearchText('settings');
    vm.setRoleFilter('admin');
    vm.setDomainFilter('ADMIN');
    expect(vm.filteredItems().map((i) => i._id)).toEqual(['other']);
    vm.clearAllFilters();
    expect(vm.filteredItems().length).toBe(1);
    http.verify();
  });
});
