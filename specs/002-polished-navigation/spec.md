# Polished navigation management

Date: 2026-10-07. Scope: existing `/navigational-list` remote.

## Requirements
- UX-001 Clear page hierarchy, purpose, primary create action and responsive content width using the host Material theme.
- UX-002 Compact labeled filters with real role values, visible defaults and active-filter feedback; clear filters when results are empty.
- UX-003 Scannable cards with status, role, classification, description, route and working accessible copy-ID feedback. Preserve edit/archive/restore intents; disable actions during mutations.
- UX-004 Deterministic sort and pagination with accurate counts and resets after filtering; retain current items while refreshing.
- UX-005 Distinct initial loading, refresh, mutation, failed load, empty catalog and no matches. Forms and hierarchy remain usable on narrow screens with meaningful labels.

## Acceptance
- Role selection emits a role string, filtering/paging/sorting cooperate without extra requests, copy success/failure is truthful, empty search offers reset, pending mutations disable repeated actions.
- Strict compilation, layout check, regression suite and production build pass. Inspect actual production UI with disposable local fixtures at desktop/mobile widths; do not write existing live records.

## Constitution Check
Preserve MVVM/store ownership, inline views, BEM, approximate component length, federation/API compatibility and test isolation. No deployment or server changes.
