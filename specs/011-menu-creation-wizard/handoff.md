# Handoff — Menu creation wizard

## Input density — 2026-10-30

The create page's inline SCSS applies `mat.form-field-density(-1)` on `:host`, inheriting density variables into all child form sections while retaining the default density for edit/dialog consumers. The public mixin emits a 52px container height and matching padding. Isolated production build, layout checks and whitespace checks pass; browser appearance was not rechecked for this styling adjustment. The existing unused MenuDialogService and soft component-length warnings remain.

Implemented 2026-10-30.

## Delivered

The create route now renders a three-step vertical linear wizard: Destination details → Placement and parent → Access and ordering. It follows CreateMfePage's stepped glass panel, viewport background, lazy Material step content and chevron footer actions. A single typed form retains all existing fields, including optional tooltip/SVG icons, archive flag, role, parent and sort position.

CreateMenuItemViewModel scopes progression and validity gates while reusing the existing MenuItemFormViewModel/factory for validation, parent choices, DTOs, persistence, error retention, notifications and completion navigation. The final native submit button is associated with the form; early submits cannot create. Pending commands block duplicate creation and the existing route guard blocks leaving during a write.

Existing section views offer embedded presentation for the wizard, avoiding nested panels. Default edit/dialog panels and behavior remain unchanged. The route's existing initial catalog load/retry still supplies parent options. Successful creation returns to the catalog within the current route mount.

## Verified locally

- App Angular typecheck, spec TypeScript compilation, source layout and git whitespace checks: PASS. The cohesive create page slightly exceeds the soft 230-line target.
- ChromeHeadless suite: 43/43 PASS, including new wizard UI tests for linear gating, invalid earlier steps, backward retention, final-step-only native submission, association/payload, pending navigation guard, duplicate prevention and failed-create retry. Existing edit/dialog/parent-selection tests still pass.
- Production build to /tmp/navigation-create-wizard-build: PASS, with non-empty third-party license output. Existing unused MenuDialogService build warning and inherited reactive-form disabled warnings remain.
- Federation production watch: initial and two incremental builds PASS for ./Component and ./Routes.
- Chromium production fixture preview at 1280×1000: exactly one wizard panel, no horizontal overflow. All three steps and error state visually inspected. At 390×844, document width remained 390px and the form used normal document scrolling.
- Browser flow: details/placement initially gated; back navigation retained entries; switching domain cleared an incompatible parent; pending create disabled resubmission and showed saving feedback; a simulated rejected POST retained /create, final step, entered name and enabled retry. Retry succeeded and returned to / with the new destination visible.
- Captured fixture payload preserved name, route, description, tooltip, ADMIN/NAV/FULL classification, selected parent, role=admin, sortId=2, archived=false and optional SVG path. Independent browser reruns each exercised one rejected attempt and one accepted fixture creation. No uncaught runtime errors observed.

The temporary fixture server and all simulated writes were isolated outside shipped source. No real navigation records were created. Authenticated host/service acceptance remains pending; no deployment or publication performed. Existing unrelated working changes were preserved.

## Field grouping revision — 2026-10-30

Regrouped creation into Identity and access (menu text, domain/structural/state, role), Route and position (route, parent/sort), and Presentation (tooltip, navigation/header SVG paths, description). Progression gates follow the new groups. Parent/sort and SVG fields share desktop rows and stack on mobile. Creation retains archived=false; default edit/dialog field presentation remains unchanged.

Verification: Angular and spec typechecks, 43/43 ChromeHeadless tests, production build, layout check and whitespace check pass. Browser checks confirm the exact field order, route validation, paired desktop fields, mobile stacking without horizontal overflow, retained values and successful fixture creation with the complete payload. Final browser checks reported no runtime errors. All browser writes used an isolated temporary fixture service; no real records were changed.


## Position selector and live heading — 2026-10-30

Creation now pairs Domain/Role and Parent Item/Position After. Structural subtype/state retain their own paired row. The heading updates with Menu Item Text using the requested prefix. Position After begins with None=0 and lists active direct siblings in the selected parent's classification (root siblings for no parent). Context changes reset sort to zero. Child choices map to a numeric gap after the selected child; the existing create API saves sort values without resequencing. Edit/dialog numeric controls and payload contracts remain unchanged.

Verified: 44/44 ChromeHeadless tests; Angular/spec typechecks; production build; layout and whitespace checks. Tests cover exact field sequence, sibling scoping/order, None, selected numeric POST payload, parent/classification resets and reactive heading. Production fixture browser checks confirm both desktop paired rows, a live heading, 390px mobile stacking without horizontal overflow, paired SVG fields and no uncaught errors. No live service writes or host integration were performed. The existing unused MenuDialogService build warning and soft component size warnings remain.
