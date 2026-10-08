# Polished navigation handoff

Implemented locally on 2026-10-07 for the corrected host route `/navigational-list`.

## Changes

- Responsive workspace header, primary creation action, active/archive counts, themed errors and consistent content width.
- Compact search/classification controls, real named-role filtering, visible defaults, active-filter count and reset actions.
- Scannable cards with active/archive badges, description, placement/state/access metadata, explicit edit/archive/restore controls and working copy-ID feedback.
- Name, position and recent-update sorting; 12/24/48-item pagination with deterministic ordering and page reset after changed filters.
- Retained cards during refresh, protected mutation controls, distinct no-match/catalog-empty states and meaningful saving feedback.
- Responsive form sections, associated native submit footer, correct required markers, optional icon disclosure and styled retained-edit errors.
- Hierarchy guidance, labeled sibling arrow actions, domain-aware destination links and responsive themed statistics.

HTTP transport, canonical store, published DTOs and federation identity remain unchanged by this UX feature. Page-local presentation state stays in the scoped results view model. Inline views, BEM and focused components continue to apply.

## Verification

- Strict Angular application compilation, spec TypeScript compilation, layout/boundary check and whitespace check pass.
- 28 ChromeHeadless regressions pass, including named role selection/no-match reset, sort/page resets, truthful copy success/failure, native form/footer submission, domain-aware links, existing store lifecycle and hierarchy behavior.
- Optimized production build passes using isolated output, avoiding contention with the existing local bundle watcher.
- Browser review of actual optimized UI with synthetic records and a local Material theme at 1280×720 and 390×844. List, create/edit dialog, hierarchy and statistics reviewed. Mobile document width equals viewport width. Enter in a valid edit form submits; deliberately unsupported fixture PATCH returns an error and the dialog retains edited text. No existing service records were modified.
- Screenshots: [desktop](../../docs/ux-preview/desktop.jpg), [mobile](../../docs/ux-preview/mobile.jpg). These show a standalone local fixture preview; the host supplies its own theme and surrounding shell.

## Integration limits

Changes are local and uncommitted; no deployment or backend changes. Restart the existing bundle watcher if it has not picked up the earlier refactor's federation/build configuration, then refresh the authenticated host. Authenticated successful writes and complete shell/federation integration still require disposable service records; prior refactor handoff records that limitation and the non-atomic parent-clearing contract.

## Constitution Check

Feature meets the established boundaries, inline view/BEM standards and isolated validation requirements. Synthetic preview assets are documentation only; fixture server/theme are temporary files outside the repository.
