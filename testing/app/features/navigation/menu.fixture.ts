import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
export const menuItem = (
  overrides: Partial<MenuItemDto> = {}
): MenuItemDto => ({
  _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
  menuItemText: 'Dashboard',
  routePath: '/dashboard',
  domain: 'ADMIN',
  structuralSubtype: 'NAV',
  state: 'FULL',
  role: 'none',
  description: '',
  sortId: 1,
  version: 1,
  __v: 0,
  archived: false,
  lastUpdated: '2026-10-07T00:00:00.000Z',
  ...overrides,
});
