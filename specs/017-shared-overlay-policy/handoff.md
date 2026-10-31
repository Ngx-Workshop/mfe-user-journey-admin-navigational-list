# Handoff: shared overlay policy adoption

Status: Implemented locally; authenticated hosted acceptance pending.
Date: 2026-10-31
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered

Installed design-system 21.0.10 theme() supplies shared overlay policy. Removed
repeated global portal/page Material adapters, fixed-dark scheme, text/font and
ngx-design-system-backdrop rules from standalone styles. The root theme adapter
already supplies Material roles and typography; app-specific layout/styles remain.
Every owned mat-select uses ngx-design-system-overlay ngx-select-panel through
public panelClass. Menus/autocomplete/tooltips keep their existing markers, without
the select-only fix. No local animation-fill-mode declarations remain.

Navigation also passes its initial and two incremental production federation builds for both ./Component and ./Routes.

The shell removes its duplicate ngx-design-system-backdrop block. Its separate
blur-backdrop customization remains because document-editor consumers still use
it. Existing dialog defaults, fullscreen/solid treatments and current-menu-item
styles remain app-owned. Shell and both MFEs require ^21.0.10 for this policy;
all package/lock pins remain exactly as installed by the user. Stores/forms/HTTP,
routes, federation identities/exposures and all other shared versions are unchanged.

## Verification

- Full ChromeHeadless suite: 60/60 PASS. Shell suite: 7/7 PASS, including detached
  native select/dialog checks against actual shell globals in light/dark schemes.
- Navigation adds three actual-animation adoption checks for selection, outside
  click and Escape: light scheme/roles, retained values, final opacity zero,
  native detachment and visible reopening. Orchestrator retains the same coverage
  for type, placement and each shell override. No simulated terminal CSS fixes.
- Source layout and spec TypeScript checks PASS. Existing soft navigation
  component-length advisories remain. git diff --check PASS.
- Normal production builds PASS for shell and both MFEs with nonempty
  3rdpartylicenses.txt, preserving license extraction. Existing unused compilation
  entry and shell CommonJS/Mermaid warnings remain.
- Isolated browser checks use actual compiled MFE components with only the rebuilt
  shell stylesheet as their global CSS (remote global styles removed from temporary
  HTML). Navigation uses empty HTTP fixtures; orchestrator uses a temporary mock
  store/bootstrap. Light/dark select scheme, transparent backdrop, actual terminal
  fade opacity, detachment/reopen, 390px no-overflow and a shared dialog backdrop
  PASS with no page errors. Focused overlay screenshots inspected under
  /tmp/navigation-overlay-_.png and /tmp/orchestrator-overlay-_.png. The fixture omits
  shell startup/icon registration; it is not a full authenticated shell acceptance.

## Delivery and limits

Rebuild/restart the shell and both remotes so running globals and federation
requirements use the installed 21.0.10. Verify hosted dropdown dismissal/reopening,
light/dark dialogs and actual form/save flows before rollout acceptance. Local
compiled stylesheet and native-control tests do not certify auth, service writes
or deployed share-scope negotiation.

No publication, deployment, package regeneration or live data writes. Temporary
preview sources/server are removed after validation; existing dist servers were
not modified. Feature architecture/development docs and index are updated.
