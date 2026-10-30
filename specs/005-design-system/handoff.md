# Handoff — 005 Design system

Implemented 2026-10-29 in mfe-user-journey-admin-navigational-list.

## Result

Reviewed the orchestrator's catalog/actions, form panels/fields, dialogs, theme and architecture. Applied installed design-system 21.0.8 public APIs to the navigation remote. Catalog search/filter controls retain their navigation-specific layout; statistics, create/edit sections and hierarchy groups use shared panels. Normal actions use shared buttons; card lifecycle labels use shared statuses. Material retains interaction, validation, focus management, pagination and keyboard ordering.

Removed the particle hero in favor of the compact catalog action-bar title. Added semantic styling and detached overlay hooks. The standalone theme also sets a zero toolbar offset; federated defaults match the orchestrator's shell header, with an override property for differing hosts. Existing package.json, package-lock.json and webpack.config.js edits belonged to the user and were preserved.

## Verified locally

- `npm run check:layout`: PASS; cohesive existing filters/card/tree/hierarchy views still exceed the soft 230-line target.
- `npm run typecheck`: PASS.
- `npx tsc -p tsconfig.spec.json --noEmit`: PASS.
- `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:ci`: 32/32 PASS after final source edits. Existing tests cover role/archive filtering, reset, submit association/payload, failures/retry, pagination, store and hierarchy boundaries. Updated the page-title expectation for the compact heading.
- `npm run build -- --output-path=/tmp/navigation-design-system-build`: PASS after final source edits; initial total approximately 340 kB; non-empty `3rdpartylicenses.txt` (29,824 bytes).
- `npm run test:bundle-watch`: initial and two incremental production builds PASS for both ./Component and ./Routes. Later changes were standalone toolbar offset, formatting and dead-code cleanup; no federation/build configuration changes.
- Chromium production previews using an isolated temporary GET-only fixture server: desktop catalog at 1440px; catalog, create form and hierarchy at 390px. Document width matched viewport in every view. Inspected screenshots; corrected standalone toolbar overlap. Fixture data/server/screenshots are outside shipped source. No backend writes performed.
- `git diff --check`: PASS.

## Limits and existing warnings

Authenticated shell/service acceptance is pending; local mocked tests and isolated previews do not establish deployed shared-runtime compatibility or real persistence. Shell must provide the public theme, scoped Material adapter and detached overlay assets, as it does for the orchestrator. Package sharing requirements were left as supplied by the user.

Build reports the existing unused MenuDialogService compilation warning (routed create/edit are the primary UI). Tests also emit the inherited reactive-form disabled-attribute warning. Neither check failed. No packages were published and no deployment was performed.
