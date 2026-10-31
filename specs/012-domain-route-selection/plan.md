# Plan

Stateless MfeRoutesApiService maps ADMIN/WORKSHOP to typed admin/workshop requests. A scoped form-view-model helper owns cancellable requests, explicit status/options, retry and a catalog-membership validator. Wire it after existing item population, preserve the initial edit route, clear on subsequent domain changes and revalidate without resetting other validators.

MenuItemBasicInfo receives route state and emits retry; Material autocomplete filters by name or slug, validates catalog membership and stores string slugs. Bind state/retry in both wizard and full form. Existing menu store remains the canonical navigation owner.

Verify API URL/type filtering/slug parity, invalid and stale selections, failed requests/retry, domain cancellation, actual Material selection, wizard gates, full suite/typecheck/layout and isolated production build. The static server already uses dist: use a separate output directory.

External dependency: service-mfe-orchestrator must expose GET /api/mfe-remotes/domain/:domain via the host gateway. Contracts 0.0.57 are already installed. No producer or publishing changes needed. Deployed integration remains pending.
