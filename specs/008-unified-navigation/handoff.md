# Handoff — Unified navigation workspace

Implemented 2026-10-29.

## Delivered

Catalog search, filters, editing, lifecycle actions and ID copying now share the ordered hierarchy list. Desktop retains the slim overview/filter rail and scrollable result workspace. Each populated domain/placement/state group contains a complete recursive tree. Per-branch/global disclosure and pointer/keyboard reordering remain available without changing pages.

Filtered results retain required ancestors, identify them as context and count real matches separately. Matching branches expand automatically; clearing filters restores prior disclosure. Both presentation controls and move/drop orchestration block reordering while filters hide siblings. Edit/archive/copy remain available. Archived matches can be restored in this workspace; unreachable/cyclic active records appear in a repair section rather than disappearing.

The separate hierarchy page/scope selector and paginated flat-grid/results state have been retired. Complete sibling order replaces pagination/arbitrary sorting. /hierarchy redirects to the unified catalog relative to its current host mount. Create/edit, default App, named Routes, federation exposures and service DTO/endpoints remain compatible. Existing dependency/webpack and earlier migration edits were preserved.

## Verification

- App Angular typecheck, spec TypeScript compilation, source layout and git whitespace checks: PASS.
- ChromeHeadless suite: 37/37 PASS after final source edits. Obsolete pagination/scope-selection tests were replaced with unified-view tests. Coverage includes ancestor retention without match inflation, role filtering, archive visibility, unplaced/cyclic repair, disclosure restoration, filtered command rejection, reorder failure/retry, busy guards, archive/restore through row actions, legacy redirects beneath a host mount and direct edit navigation.
- Production build to isolated /tmp/navigation-unified-build: PASS after final edits. Non-empty third-party license output retained.
- Production watch initial build plus two incremental rebuilds: PASS ./Component and ./Routes factories.
- Production Chromium fixture preview at 1280×900: unified catalog starts at / after opening /hierarchy; first row at y=226, 13 structured active fixture records plus an unplaced active record accessible in the same workspace. Document width remained 1280px.
- Ancestor search: User management produced one match plus two labeled ancestors, with reorder controls disabled and editing available.
- Scoped action menu, archive removing its tree row, include-archived revealing restore, restore returning to the tree: PASS against a temporary in-memory fixture server.
- Keyboard reorder and real pointer drag sent expected sortId=3 and sortId=1 fixture writes. No real service records were changed.
- Mobile 390×844: document width remained 390px, with compact filter disclosure and document scrolling. Desktop/search/mobile screenshots visually inspected. No uncaught browser runtime errors observed.

## Limits

Authenticated host/service acceptance remains pending. Browser persistence was simulated by an isolated temporary fixture server; tests use HttpTestingController. No packages were published and no deployment was performed.

The known unused MenuDialogService production warning and inherited reactive-form disabled warnings remain. Cohesive filter/row/results components exceed the soft 230-line target; layout checks pass. Design-system runtime/global overlay styles and shell offset requirements remain unchanged.
