# Handoff — Mission Control hierarchy

Implemented 2026-10-29.

## Delivered

Replaced nested domain/placement/state panels with a compact scope rail and focused recursive tree. NAV scopes are preferred initially; valid selection and branch disclosure survive canonical refreshes. The workspace shows reachable active totals, scope counts, root counts, numbered sibling rows, child counts and connecting indentation.

Added per-branch and global disclosure controls, adjacent labeled up/down actions, direct relative edit links for parent changes, guarded refresh and explicit save/load/error feedback. Desktop tree/rail scroll within the remaining viewport; narrow screens use horizontal scope browsing and normal page scrolling. Selecting a different scope returns its tree to the top, while equivalent refreshes preserve the scroll position.

Fixed rendered root drop IDs: they now use raw ADMIN/WORKSHOP classifications, matching existing predicates, connected IDs and the reorder parser. Collapsed descendant lists are excluded from connectivity. Existing endpoint/payload/domain-store contracts and cross-classification/descendant guards remain intact; no optimistic array mutation is introduced.

The manager, presentational scope rail, recursive list and presentational row are separate components; scoped hierarchy selection/disclosure belongs to MenuHierarchyViewModel. Earlier catalog/design-system/dependency changes were preserved.

## Verified locally

- `npm run typecheck`, spec TypeScript compilation, `npm run check:layout` and `git diff --check`: PASS. The cohesive workspace manager remains above the soft 230-line target.
- ChromeHeadless tests: 35/35 PASS after final changes, including three new hierarchy workspace tests covering classification IDs/selection, collapse/connectivity and arrow payloads/duplicate guards. Existing cross-classification/descendant rejection and error recovery tests still pass.
- Production build to isolated `/tmp/navigation-hierarchy-build`: PASS after final changes, with non-empty third-party license output. An initial concurrent verification run hit a temporary Angular cache directory error; sequential verification completed successfully.
- Production Chromium preview at 1280×768: first selected-tree row at y=191, all seven nested fixture destinations visible. Expand/collapse-all changed rendered rows between seven destinations and three roots.
- Real pointer drag and arrow clicks against a temporary in-memory fixture server: Reports-down sent sortId=3, dragging Reports to first root position sent sortId=1; fixture refresh rendered the new order. These are simulated persistence checks, not real service writes.
- Mobile 390×844: document width remained 390px, scope choices scrolled horizontally and all nested rows remained readable. Domain-aware edit href resolved to `/edit/<id>` in standalone mode.
- No uncaught browser runtime errors observed. Desktop/mobile screenshots visually inspected; desktop preview saved in the chat visualization folder.

## Limits

Authenticated shell/service ordering and persistence acceptance remains pending. Browser fixtures and simulated sort writes were isolated outside shipped source; no real navigation records were changed. Host styles/shared runtime and shell offsets retain existing requirements. Orphan/cyclic/unreachable and archived records remain outside the hierarchy, as before.

Existing unused MenuDialogService build warning and inherited reactive-form disabled warnings remain. No package publication or deployment was performed.
