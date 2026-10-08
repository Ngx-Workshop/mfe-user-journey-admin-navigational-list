import { MenuResultsViewModel } from '../../../../../src/app/features/navigation/view-models/menu-results.view-model';
import { menuItem } from '../menu.fixture';

describe('MenuResultsViewModel', () => {
  const rows = Array.from({ length: 25 }, (_, i) => menuItem({ _id: String(i), menuItemText: `Item ${String(i).padStart(2, '0')}`, sortId: 25 - i }));
  it('paginates without mutating canonical records and resets when filters change the dataset', () => {
    const vm = new MenuResultsViewModel(); vm.setItems(rows);
    vm.page({ pageIndex: 2, pageSize: 12, length: 25 });
    expect(vm.visible().map(i => i._id)).toEqual(['24']);
    vm.setItems([...rows]); expect(vm.pageIndex()).toBe(2);
    vm.setItems(rows.slice(0, 2));
    expect(vm.pageIndex()).toBe(0); expect(vm.visible().length).toBe(2);
    expect(rows[0].sortId).toBe(25);
  });
  it('resets pagination for sorting and page-size changes', () => {
    const vm = new MenuResultsViewModel(); vm.setItems(rows);
    vm.page({ pageIndex: 1, pageSize: 12, length: 25 }); vm.setSort('position');
    expect(vm.pageIndex()).toBe(0); expect(vm.visible()[0]._id).toBe('24');
    vm.page({ pageIndex: 1, pageSize: 24, length: 25 });
    expect(vm.pageIndex()).toBe(0); expect(vm.visible().length).toBe(24);
  });
  it('orders recently updated items first with deterministic ties', () => {
    const vm = new MenuResultsViewModel();
    vm.setItems([menuItem({ _id: 'old', lastUpdated: '2020-01-01', menuItemText: 'Z' }), menuItem({ _id: 'new', lastUpdated: '2026-01-01', menuItemText: 'A' })]);
    vm.setSort('updated'); expect(vm.visible().map(i => i._id)).toEqual(['new', 'old']);
  });
});
