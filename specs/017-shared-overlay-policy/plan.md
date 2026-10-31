# Plan

Remove repeated portal scopes and ngx-design-system-backdrop rules from styles.scss;
theme() in published 21.0.10 already emits the policy and root Material adapter.
The old combined page/overlay adapter hardcoded a dark scheme and is redundant with
root theme(). Keep app-specific layout, dialog sizing and standalone shell offsets.

Apply ngx-select-panel only to mat-select panelClass (not menus/autocomplete/tooltips).
The orchestrator removes three inline final-frame rules and restores Emulated
encapsulation with :host/local selectors. Existing closing tests use the real shared
stylesheet from angular.json. Add navigation adoption coverage and shell stylesheet
integration coverage. Raise only design-system requiredVersion to ^21.0.10 in the
shell and both remotes, preserving installed manifests/locks and other shared contracts.

Constitution check: shared public CSS/Material class APIs only, stateless presentation,
unchanged domain behavior and federation exposures; mirrored tests and inline BEM
styles preserved. No deviations. Shell retains its separate document-editor legacy
blur-backdrop customization. Use production builds, existing interaction tests, real
terminal fade frames and compiled shell stylesheet fixtures for local acceptance.
