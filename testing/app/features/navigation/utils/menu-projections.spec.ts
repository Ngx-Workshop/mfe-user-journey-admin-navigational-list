import { TestBed } from '@angular/core/testing';
import { MenuItemFormService } from '../../../../../src/app/features/navigation/utils/menu-item-form.service';
import { connectedListIds } from '../../../../../src/app/features/navigation/utils/hierarchy-view';
import { menuHierarchy, buildTree, descendantIds } from '../../../../../src/app/features/navigation/utils/menu-projections';
import { menuItem } from '../menu.fixture';

describe('Menu projections', () => {
  it('sorts nested items without mutating input', () => {
    const items = [menuItem({ _id: 'b', sortId: 2 }), menuItem({ _id: 'a', sortId: 1 }), menuItem({ _id: 'child', parentId: 'a' })];
    const tree = buildTree(items);
    expect(tree.map(i => i._id)).toEqual(['a', 'b']); expect(tree[0].children![0]._id).toBe('child');
    expect(items[0]._id).toBe('b'); expect(items[0]).not.toBe(tree[1]);
  });
  it('terminates malformed cycles and excludes self and all descendants from parent options', () => {
    TestBed.configureTestingModule({ providers: [MenuItemFormService] });
    const items = [menuItem({ _id: 'a', parentId: 'b' }), menuItem({ _id: 'b', parentId: 'a' }), menuItem({ _id: 'valid' })];
    expect([...descendantIds(items, 'a')]).toEqual(['a', 'b']);
    expect(TestBed.inject(MenuItemFormService).getParentOptions('ADMIN', 'NAV', 'FULL', items, 'a').map(o => o.value)).toEqual(['', 'valid']);
  });
  it('connects only child lists rendered by the hierarchy view', () => {
    const hierarchy = menuHierarchy([menuItem({ _id: 'root' }), menuItem({ _id: 'leaf', parentId: 'root' })]);
    const map = new Map(hierarchy.map(group => [group.domain, group]));
    expect(connectedListIds(map).get('list-ADMIN-NAV-FULL')).toEqual(['list-ADMIN-NAV-FULL', 'list-ADMIN-NAV-FULL-root']);
  });

  it('validates required classification and omits empty Mongo parent identifiers', () => {
    TestBed.configureTestingModule({ providers: [MenuItemFormService] });
    const forms = TestBed.inject(MenuItemFormService);
    const form = forms.createMenuItemForm();
    expect(forms.validateForm(form)).toBeFalse();
    forms.populateForm(form, menuItem());
    expect(forms.validateForm(form)).toBeTrue();
    const dto = forms.toDto(menuItem({ parentId: '' }));
    expect(dto.parentId).toBeUndefined();
    expect(dto.role).toBe('none');
  });

});
