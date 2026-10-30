import {
  MenuHierarchyWithChildren,
  MenuItemWithChildren,
} from '../models/menu.types';

/** Retain matching nodes and ancestor context without changing canonical sibling order. */
export function filterHierarchy(
  groups: MenuHierarchyWithChildren[],
  matches: ReadonlySet<string>
): MenuHierarchyWithChildren[] {
  const prune = (
    items: MenuItemWithChildren[]
  ): MenuItemWithChildren[] =>
    items.flatMap((item) => {
      const children = prune(item.children ?? []);
      return matches.has(item._id) || children.length
        ? [{ ...item, children }]
        : [];
    });
  return groups.map((group) => ({
    ...group,
    structuralSubtypes: Object.fromEntries(
      Object.entries(group.structuralSubtypes).map(
        ([placement, data]) => [
          placement,
          {
            states: Object.fromEntries(
              Object.entries(data.states ?? {}).map(
                ([state, items]) => [state, prune(items)]
              )
            ),
          },
        ]
      )
    ),
  }));
}

export function hierarchyIds(
  groups: MenuHierarchyWithChildren[]
): Set<string> {
  const ids = new Set<string>();
  const collect = (items: MenuItemWithChildren[]) =>
    items.forEach((item) => {
      ids.add(item._id);
      collect(item.children ?? []);
    });
  groups.forEach((group) =>
    Object.values(group.structuralSubtypes).forEach((data) =>
      Object.values(data.states ?? {}).forEach(collect)
    )
  );
  return ids;
}
