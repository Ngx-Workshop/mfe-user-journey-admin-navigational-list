import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import {
  DOMAIN,
  Domain,
  STATE,
  State,
  STRUCTURAL_SUBTYPE,
  StructuralSubtype,
} from '../types/menu.types';

// Small helper to build IDs consistently
const id = (parts: string[]) => parts.join(':');

// Base builder to reduce duplication
function makeItem(params: {
  id: string;
  text: string;
  route: string;
  sort: number;
  domain: Domain;
  subtype: StructuralSubtype;
  state: State;
  parentId?: string;
  archived?: boolean;
  authRequired?: boolean;
}): MenuItemDto {
  return {
    _id: params.id,
    menuItemText: params.text,
    routePath: params.route,
    tooltipText: params.text,
    description: `${params.text} page`,
    sortId: params.sort,
    authRequired: params.authRequired ?? false,
    archived: params.archived ?? false,
    domain: params.domain,
    structuralSubtype: params.subtype,
    state: params.state,
    parentId: params.parentId,
    // children populated by UI when building hierarchy; keep empty here
    children: [],
  } as unknown as MenuItemDto;
}

// Mock dataset: two domains with NAV items across states, including nesting
export const MOCK_MENU_ITEMS: MenuItemDto[] = [
  // ADMIN / NAV / FULL (root items)
  makeItem({
    id: id(['ADMIN', 'NAV', 'FULL', 'dashboard']),
    text: 'Dashboard',
    route: '/admin/dashboard',
    sort: 10,
    domain: DOMAIN.ADMIN,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
  }),
  makeItem({
    id: id(['ADMIN', 'NAV', 'FULL', 'users']),
    text: 'Users',
    route: '/admin/users',
    sort: 20,
    domain: DOMAIN.ADMIN,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
  }),
  makeItem({
    id: id(['ADMIN', 'NAV', 'FULL', 'settings']),
    text: 'Settings',
    route: '/admin/settings',
    sort: 30,
    domain: DOMAIN.ADMIN,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
  }),

  // Nesting under Users
  makeItem({
    id: id(['ADMIN', 'NAV', 'FULL', 'users:list']),
    text: 'User List',
    route: '/admin/users/list',
    sort: 10,
    domain: DOMAIN.ADMIN,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
    parentId: id(['ADMIN', 'NAV', 'FULL', 'users']),
  }),
  makeItem({
    id: id(['ADMIN', 'NAV', 'FULL', 'users:roles']),
    text: 'Roles',
    route: '/admin/users/roles',
    sort: 20,
    domain: DOMAIN.ADMIN,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
    parentId: id(['ADMIN', 'NAV', 'FULL', 'users']),
  }),
  // Nesting under Roles
  makeItem({
    id: id(['ADMIN', 'NAV', 'FULL', 'users:roles:create']),
    text: 'Create Role',
    route: '/admin/users/roles/create',
    sort: 10,
    domain: DOMAIN.ADMIN,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
    parentId: id(['ADMIN', 'NAV', 'FULL', 'users:roles']),
  }),

  // ADMIN / NAV / RELAXED (fewer items)
  makeItem({
    id: id(['ADMIN', 'NAV', 'RELAXED', 'dashboard']),
    text: 'Dashboard',
    route: '/admin/dashboard',
    sort: 10,
    domain: DOMAIN.ADMIN,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.RELAXED,
  }),
  makeItem({
    id: id(['ADMIN', 'NAV', 'RELAXED', 'users']),
    text: 'Users',
    route: '/admin/users',
    sort: 20,
    domain: DOMAIN.ADMIN,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.RELAXED,
  }),

  // WORKSHOP / NAV / FULL
  makeItem({
    id: id(['WORKSHOP', 'NAV', 'FULL', 'overview']),
    text: 'Overview',
    route: '/workshop/overview',
    sort: 10,
    domain: DOMAIN.WORKSHOP,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
  }),
  makeItem({
    id: id(['WORKSHOP', 'NAV', 'FULL', 'sessions']),
    text: 'Sessions',
    route: '/workshop/sessions',
    sort: 20,
    domain: DOMAIN.WORKSHOP,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
  }),
  makeItem({
    id: id(['WORKSHOP', 'NAV', 'FULL', 'resources']),
    text: 'Resources',
    route: '/workshop/resources',
    sort: 30,
    domain: DOMAIN.WORKSHOP,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
  }),
  // Children under Sessions
  makeItem({
    id: id(['WORKSHOP', 'NAV', 'FULL', 'sessions:calendar']),
    text: 'Calendar',
    route: '/workshop/sessions/calendar',
    sort: 10,
    domain: DOMAIN.WORKSHOP,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
    parentId: id(['WORKSHOP', 'NAV', 'FULL', 'sessions']),
  }),
  makeItem({
    id: id(['WORKSHOP', 'NAV', 'FULL', 'sessions:history']),
    text: 'History',
    route: '/workshop/sessions/history',
    sort: 20,
    domain: DOMAIN.WORKSHOP,
    subtype: STRUCTURAL_SUBTYPE.NAV,
    state: STATE.FULL,
    parentId: id(['WORKSHOP', 'NAV', 'FULL', 'sessions']),
  }),
];

// Convenience: group a subset for quick smoke-tests (root-only list)
export const MOCK_ROOT_ONLY: MenuItemDto[] = MOCK_MENU_ITEMS.filter(
  (m) =>
    !m.parentId && m.domain === DOMAIN.ADMIN && m.state === STATE.FULL
).sort((a, b) => a.sortId - b.sortId);
