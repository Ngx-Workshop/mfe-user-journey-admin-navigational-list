# 005 — Navigation design system migration

Requested 2026-10-29. Implemented locally; authenticated host acceptance pending.

- R1: Follow the migrated MFE orchestrator's public design-system integration: semantic tokens, scoped Material adapter, panels, buttons and statuses.
- R2: Retain the navigation catalog's search, four classification filters, archived toggle, sorting, pagination and responsive card grid. Do not replace these with the orchestrator's selection rail.
- R3: Apply the same treatment to create/edit sections and hierarchy workspaces. Keep accessible Material controls, validation, native form submission and keyboard ordering.
- R4: Preserve MVVM ownership, API/DTOs, routes and federation exports. Preserve the user's dependency and webpack edits.
- R5: Scope detached selects/tooltips/dialogs/snackbars with the shared overlay hooks; supply standalone theme fallback.

Acceptance: existing journey tests continue to cover local filtering, role selection, reset, form submission, failure/retry, pagination and state refresh. Production output renders at desktop/mobile sizes and retains Component/Routes factories across rebuilds. Real hosted service writes are a separate acceptance step.
