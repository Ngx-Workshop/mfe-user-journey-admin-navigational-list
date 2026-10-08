# Navigational list MVVM refactor

Date: 2026-10-07. Audience: administrators managing navigation.

## Requirements
- FR-001 Preserve create/edit/delete/archive/unarchive, filters, hierarchy and statistics using published DTOs.
- FR-002 Stateless HTTP API separated from root singleton canonical state; components access the store through scoped view models where needed.
- FR-003 Successful writes refresh list, hierarchy, statistics and parent choices; failures preserve data/edits and expose retryable errors. Prevent concurrent duplicate writes.
- FR-004 Inline templates/styles, BEM classes, focused orchestration/presentation and approximately 230 lines per component.
- FR-005 Parent candidates exclude self/descendants; classification changes cannot select stale parents. Reordering prevents cycles and unsupported cross-classification drops, handles errors and offers keyboard controls.
- FR-006 Preserve federation exports, routes, API prefix and DTOs; adapt local Spec Kit context without copying unrelated histories.

## Acceptance
- AC-001 Fetch all items once into canonical state; archived toggle works without needing an unrelated refresh; all tabs update after mutations.
- AC-002 Failed load offers retry; failed mutation retains visible items; failed save keeps form open; duplicate save submits once.
- AC-003 Parent choices follow current classification and exclude descendants, including malformed cycles; reorder waits for persistence and refreshes canonical state.
- AC-004 Strict compilation, production build, meaningful HTTP/store/form/view tests and layout check pass.

## Scope and assumptions
The supplied /user-management/user-metadata URL is host context; source ownership here is navigation management. Preserve legacy hello-world remote route. No backend changes or deployment. Live host/service validation is recorded separately from isolated tests.

## Constitution Check
All six principles apply. Inline style requirement is already met by inherited components. Source inspection found duplicated fetches, unhandled reorder promises, stale archived filtering, untyped form plumbing and obsolete starter tests.
