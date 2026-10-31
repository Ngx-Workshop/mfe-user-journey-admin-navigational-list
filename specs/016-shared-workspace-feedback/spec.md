# Adopt shared workspace feedback

Status: Implemented locally; hosted acceptance pending
Date: 2026-10-31

Use the installed published design system 21.0.9 NgxActionBar, NgxSaveFeedback and
NgxInlineStatus in the existing app action-bar adapter.

- FR-001 / AC-001: All existing catalog and create/edit action bars use shared
  presentation while retaining routes, actions and host offsets. Wrapping updates
  dependent workspace sizing through the shared heightChange output.
- FR-002 / AC-002: Save notifications preserve existing text, timing and retry rules;
  the shared live region remains mounted through idle/saving/saved/error transitions.
- FR-003 / AC-003: Catalog-wide count wording, unknown/zero states and warning tones
  survive filtering/navigation. Shared announcements remain polite and atomic.
- FR-004 / AC-004: Application/spec compilation, changed interaction tests and normal
  production federation build pass; record inherited failures separately. Preserve package pins, DTOs and stores; raise only the design-system federation minimum to ^21.0.9.

Publication, deployment and live service writes are outside this scope. Preserve
user-owned package/lock changes. Hosted runtime acceptance is recorded separately.
