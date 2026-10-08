import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import {
  DOMAIN_OPTIONS,
  MenuHierarchyWithChildren,
  MenuItemWithChildren,
} from '../models/menu.types';

/** Build only reachable roots; guard malformed cyclic data without mutating DTOs. */
export function buildTree(
  items: MenuItemDto[],
  parentId?: string,
  ancestors = new Set<string>()
): MenuItemWithChildren[] {
  return items
    .filter(
      (item) =>
        (item.parentId || undefined) === parentId &&
        !ancestors.has(item._id)
    )
    .sort((a, b) => a.sortId - b.sortId)
    .map((item) => ({
      ...item,
      children: buildTree(
        items,
        item._id,
        new Set([...ancestors, item._id])
      ),
    }));
}

export function menuHierarchy(
  items: MenuItemDto[]
): MenuHierarchyWithChildren[] {
  return DOMAIN_OPTIONS.map(({ value: domain }) => {
    const structuralSubtypes: MenuHierarchyWithChildren['structuralSubtypes'] =
      {};
    const active = items.filter(
      (item) => item.domain === domain && !item.archived
    );
    for (const subtype of new Set(
      active.map((item) => item.structuralSubtype)
    )) {
      const items = active.filter(
        (item) => item.structuralSubtype === subtype
      );
      const states: Record<string, MenuItemWithChildren[]> = {};
      for (const state of new Set(items.map((item) => item.state))) {
        states[state] = buildTree(
          items.filter((item) => item.state === state)
        );
      }
      structuralSubtypes[subtype] = { states };
    }
    return { domain, structuralSubtypes };
  });
}

export function menuStatistics(items: MenuItemDto[]) {
  const count = (test: (item: MenuItemDto) => boolean) =>
    items.filter(test).length;
  return [
    { title: 'Total Menu Items', value: items.length },
    {
      title: 'Active Items',
      value: count((i) => !i.archived),
      description: 'Non-archived items',
    },
    { title: 'Archived Items', value: count((i) => i.archived) },
    {
      title: 'Admin Domain',
      value: count((i) => i.domain === 'ADMIN'),
    },
    {
      title: 'Workshop Domain',
      value: count((i) => i.domain === 'WORKSHOP'),
    },
    {
      title: 'Header Items',
      value: count((i) => i.structuralSubtype === 'HEADER'),
    },
    {
      title: 'Navigation Items',
      value: count((i) => i.structuralSubtype === 'NAV'),
    },
    {
      title: 'Footer Items',
      value: count((i) => i.structuralSubtype === 'FOOTER'),
    },
  ];
}

export function descendantIds(
  items: MenuItemDto[],
  id: string
): Set<string> {
  const found = new Set([id]);
  const queue = [id];
  while (queue.length) {
    const parent = queue.pop();
    for (const item of items) {
      if (item.parentId === parent && !found.has(item._id)) {
        found.add(item._id);
        queue.push(item._id);
      }
    }
  }
  return found;
}
