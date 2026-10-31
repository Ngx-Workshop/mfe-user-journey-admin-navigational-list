# Domain route selection

Status: Implemented; host integration pending. Requested 2026-10-30.

FR-001 / AC-001: Route Path searches user-journey MFE names/routes for the selected navigation domain and writes the shell's exact trim/lowercase/whitespace-to-hyphen slug, without a leading slash.
FR-002 / AC-002: Require a current-domain route selection before save or routing-step progression. Domain changes clear the route; obsolete requests cannot replace current options.
FR-003 / AC-003: Show loading, empty, missing-domain and retryable failure states. Retain existing edit values during loading/failure; validate against successful results. No hardcoded static shell or nested remote routes are added.
FR-004: Use installed orchestrator contracts ^0.0.57 and existing domain endpoint; preserve unrelated working changes, navigation DTOs and federation exports.

Assumptions: scope includes shared edit/dialog forms as well as creation. Existing arbitrary routes remain visible but require choosing a registered route before saving. The domain endpoint matches shell membership; filter structural remotes out because shells only generate journey routes. Archived handling follows shell endpoint behavior (no additional filter).

Constitution Check: stateless transport; scoped form reference state; inline Material UI; labelled keyboard autocomplete; deterministic HTTP/form tests. No live writes or deployment.
