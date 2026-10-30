# 008 — Unified navigation catalog and hierarchy

Requested 2026-10-29: merge the navigation catalog and hierarchy management list.

- R1: Provide one Mission Control workspace with catalog search/filtering, complete ordered hierarchy, editing, lifecycle actions and ID copying. Remove the separate hierarchy navigation action.
- R2: Display active reachable records grouped by domain/placement/display state. Keep sibling order and complete sibling lists; do not split branches with pagination or arbitrary sorting.
- R3: Search and role/classification filters retain required ancestor context, identify context rows and count actual matches separately. Automatically reveal matching branches while preserving prior disclosure when filters clear.
- R4: Suspend pointer/keyboard reorder while filters hide records. Guard both emitted move and drop intent. Keep edit/lifecycle actions available; never persist indices from a pruned tree.
- R5: Keep archived records discoverable/restorable and unplaced/cyclic records accessible for repair. Preserve loading, failure/retry, empty and busy behavior.
- R6: Redirect legacy hierarchy URLs to the unified workspace within the current host mount; preserve create/edit routes and federation/DTO/API contracts.
- R7: Retain responsive desktop viewport scrolling, mobile document flow, labeled keyboard controls and scoped detached overlays.
