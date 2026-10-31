# Handoff — Filter console rail

Implemented 2026-10-29.

Moved the single MenuStatistics instance from management into MenuFilters, immediately after search. Total/Active/Archived use compact three-column summary cells like the supplied MfeRemoteRail. Refresh and its loading/pending guard stay with the summary and bubble through the filter presentation to MenuList's existing reload method. Unknown initial counts use placeholders; canonical totals remain independent of filtering.

The console now uses public NgxPanel/NgxEntrance APIs: chamfered solid panel, CATALOG / FILTER eyebrow, Filter console heading and fade entrance. Its body uses the reference rail's measured viewport/chrome scrolling and listener/observer cleanup. Desktop rail width is 280–320px; removing the separate strip recovers 48px of tree space. Existing filters and mobile disclosure remain intact. The existing outlined create action is preserved.

Verified:

- Angular app typecheck and spec compilation: PASS.
- ChromeHeadless suite: 37/37 PASS. Updated the statistics journey to assert one summary nested inside the panel, no top-level duplicate, canonical totals during a no-match search, and refresh propagation. Existing reorder journey also checks that the relocated refresh is disabled during a pending write.
- Production build to /tmp/navigation-filter-rail-build: PASS. Existing unused MenuDialogService warning remains.
- Layout and git whitespace checks: PASS, with existing soft component-length warnings.
- Production fixture preview at 1280×900, 1280×768 and 390×844: no horizontal document overflow; one statistics instance inside the console. Counts 15/14/1 stayed unchanged while search showed one match plus two ancestors. Refresh retained the search. Mobile classification disclosure expanded successfully. No uncaught runtime errors observed.
- At 1280×768 the measured panel ended at y=752; the first tree row began at y=178 (previous y=226). Desktop and mobile screenshots were visually inspected.

All browser data came from the isolated temporary fixture server; no real service writes, deployment or publication. Authenticated host acceptance remains separate from these local checks. Styles continue relying on the shell's existing shared design-system contract.

## Destinations panel follow-up

Wrapped Destinations with the MfeRemoteCard design-system composition: stepped NgxPanel, grid background, primary tone, fade entrance and staggered accessible heading. Count/disclosure controls use ngxPanelHeader; guidance uses ngxPanelActions. Removed the old native outer border. The inner body measures panel chrome against its available desktop height; resize observation cleans up on destroy and mobile retains natural document scrolling. Explicit semantic text color preserves row readability inside the panel.

Final app/spec typechecks, all 37 ChromeHeadless tests, production build and whitespace check pass. Layout check passes with cohesive-component soft length warnings. Production desktop/mobile previews were visually inspected; the desktop panel ended at y=885 in a 900px viewport with a 589px list area. Ancestor search, filtered reorder guards, scoped action menu, archive/restore, arrow ordering and real pointer dragging passed against the isolated fixture server; no real records were changed. No uncaught browser runtime errors observed. Authenticated host acceptance remains pending; no publication or deployment.
