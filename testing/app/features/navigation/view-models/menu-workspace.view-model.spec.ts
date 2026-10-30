import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MenuWorkspaceViewModel } from '../../../../../src/app/features/navigation/view-models/menu-workspace.view-model';
import { MenuSearchService } from '../../../../../src/app/features/navigation/view-models/menu-search.service';
import { menuItem } from '../menu.fixture';
const rows = [
  menuItem({ _id: 'parent', menuItemText: 'Workspace' }),
  menuItem({
    _id: 'child',
    menuItemText: 'Child destination',
    parentId: 'parent',
    role: 'admin',
  }),
  menuItem({ _id: 'sibling', menuItemText: 'Settings', sortId: 2 }),
  menuItem({
    _id: 'orphan',
    menuItemText: 'Unplaced',
    parentId: 'missing',
  }),
  menuItem({
    _id: 'cycle',
    menuItemText: 'Cycle',
    parentId: 'cycle',
  }),
  menuItem({
    _id: 'archived',
    menuItemText: 'Archived link',
    archived: true,
  }),
];
describe('Unified navigation workspace', () => {
  let vm: MenuWorkspaceViewModel;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MenuSearchService,
        MenuWorkspaceViewModel,
      ],
    });
    vm = TestBed.inject(MenuWorkspaceViewModel);
    vm.store.ensureLoaded();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/navigational-list')
      .flush(rows);
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('preserves canonical sibling order and keeps unplaced/cyclic records available for repair', () => {
    expect(vm.sections()[0].items.map((item) => item._id)).toEqual([
      'parent',
      'sibling',
    ]);
    expect(vm.unplaced().map((item) => item._id)).toEqual([
      'orphan',
      'cycle',
    ]);
    expect(vm.filtered().length).toBe(5);
    expect(vm.archived()).toEqual([]);
    expect(vm.store.items()[0].parentId).toBeUndefined();
  });
  it('keeps nonmatching ancestors when a child matches without including them in the match count', () => {
    vm.search.setSearchText('Child destination');
    expect(vm.filtered().map((item) => item._id)).toEqual(['child']);
    expect(vm.contextIds()).toEqual(new Set(['parent']));
    expect(vm.sections()[0].items[0].children?.[0]._id).toBe('child');
    expect(vm.hasFilters()).toBeTrue();
  });
  it('retains ancestor context across role filters and includes archived matches separately', () => {
    vm.search.setRoleFilter('admin');
    expect(vm.contextIds()).toEqual(new Set(['parent']));
    vm.search.clearAllFilters();
    vm.search.setIncludeArchived(true);
    expect(vm.archived().map((item) => item._id)).toEqual([
      'archived',
    ]);
    expect(vm.filtered().length).toBe(6);
  });
  it('auto-expands matches and restores prior disclosure after clearing filters', () => {
    vm.collapseAll();
    expect(vm.connected().get('list-ADMIN-NAV-FULL')).toEqual([
      'list-ADMIN-NAV-FULL',
    ]);
    vm.search.setSearchText('Child');
    expect(vm.visibleCollapsedIds().size).toBe(0);
    vm.search.clearAllFilters();
    expect(vm.visibleCollapsedIds().has('parent')).toBeTrue();
    vm.expandAll();
    expect(vm.connected().get('list-ADMIN-NAV-FULL')).toContain(
      'list-ADMIN-NAV-FULL-parent'
    );
  });
  it('does not turn a matching parent into a match for all descendants', () => {
    vm.search.setSearchText('Workspace');
    expect(vm.sections()[0].items[0].children).toEqual([]);
    expect(vm.contextIds().size).toBe(0);
  });
});
