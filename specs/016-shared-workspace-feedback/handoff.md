# Handoff: shared workspace feedback adoption

Status: Implemented locally; hosted acceptance pending.
Updated: 2026-10-31
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered

Replaced duplicated action-bar templates, save feedback and indicators with published
21.0.9 NgxActionBar, NgxSaveFeedback and NgxInlineStatus. The existing action adapter
retains app-specific wording and action outputs. Shared heightChange feeds local
workspace sizing signals; sticky offsets retain host overrides and narrow defaults.
Store/request/notification timing, counts, forms and routes are unchanged. Persistent
shared live regions survive state changes. Two new adapter tests cover actual shared
component integration; older integration selectors now use shared component hosts.
Architecture/development docs and feature index are updated.

## Verification

- Application Angular typecheck, spec TypeScript compilation and source layout: PASS.
- Full ChromeHeadless suite: 57/57 PASS.
- Normal isolated production build: PASS, license extraction enabled and both
  remoteEntry.js and nonempty third-party license output retained.
- Navigation production watch: initial and two incremental builds PASS for both
  ./Component and ./Routes.
- Isolated production fixture browser: 1440px catalog and 390px catalog/create/edit
  PASS. Shared measured height matches --menu-action-bar-height, no horizontal
  overflow, projected route links remain visible, and simulated failed reorder
  retains existing recovery instructions without a generic save-retry action.
- Production license file: 29,850 bytes.
- Desktop and mobile screenshots visually inspected at /tmp/shared-navigation-*.png
  and /tmp/shared-orchestrator-*.png as applicable. Browser checks reported no page errors.
- Final whitespace checks: PASS. Existing unused compilation entries and navigation
  soft component-size advisories remain.

## Runtime handoff

Only the design-system minimum federation requirement changed, from ^21.0.7 to
^21.0.9, because the new exports require that release. Other shared requirements and
all Component/Routes exposures retain their contracts. User-owned package.json and
package-lock.json installation changes were preserved without regeneration.

The local mfe-shell-admin package still pins 21.0.8. Its owner must install the
published 21.0.9 or a newer compatible release and provide that shared singleton
before hosted rollout; then verify routed catalog/create/edit, responsive sticky
content, live feedback and actual authenticated save/retry behavior. The shell was
not modified. Existing local fixture verification does not establish hosted version
negotiation, authorization or service persistence.

No publication, deployment, live catalog writes or uploaded assets. Temporary
preview sources and servers were removed after verification. X001 remains the
external shell/runtime and authenticated host acceptance step.
