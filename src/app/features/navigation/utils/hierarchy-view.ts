import {
  Domain,
  MenuHierarchyWithChildren,
  MenuItemWithChildren,
  State,
  StructuralSubtype,
} from '../models/menu.types';
export type NameIcon = { name: string; icon: string };
type MenuHierarchyMap = Map<string, MenuHierarchyWithChildren>;

export const DOMAIN_URL_MAP: Map<Domain, string> = new Map<
  Domain,
  string
>([
  ['ADMIN', 'https://admin.ngx-workshop.io'],
  ['WORKSHOP', 'https://beta.ngx-workshop.io'],
]);

export const SUBTYPE_ICON_MAP = new Map<StructuralSubtype, NameIcon>([
  ['HEADER', { name: 'Header', icon: 'page_header' }],
  ['NAV', { name: 'Side Navigation', icon: 'side_navigation' }],
  ['FOOTER', { name: 'Footer', icon: 'page_footer' }],
]);

export const STATE_ICON_MAP = new Map<State, NameIcon>([
  ['FULL', { name: 'Full', icon: 'fullscreen' }],
  ['RELAXED', { name: 'Relaxed', icon: 'fullscreen_exit' }],
  ['COMPACT', { name: 'Compact', icon: 'compress' }],
]);

export function connectedListIds(
  menuHierarchy: MenuHierarchyMap
): Map<string, string[]> {
  const result = new Map<string, string[]>();
  const collect = (
    id: string,
    items: MenuItemWithChildren[]
  ): string[] => [
    id,
    ...items
      .filter((item) => item.children?.length)
      .flatMap((item) =>
        collect(`${id}-${item._id}`, item.children!)
      ),
  ];
  for (const group of menuHierarchy.values()) {
    for (const [subtype, data] of Object.entries(
      group.structuralSubtypes
    )) {
      for (const [state, items] of Object.entries(
        data.states ?? {}
      )) {
        const id = `list-${group.domain}-${subtype}-${state}`;
        result.set(id, collect(id, items));
      }
    }
  }
  return result;
}
