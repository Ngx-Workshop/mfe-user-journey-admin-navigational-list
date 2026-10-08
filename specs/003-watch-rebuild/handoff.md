# Production watch rebuild fix

2026-10-08. Fixed locally; no deployment or backend writes.

## Cause and change

The reported chunk `517.7c2dd343ea2fd879.js` module 4360 is RxJS OperatorSubscriber. It extends module 7707's Subscriber export. In the failing output, module 7707 contains side-effect imports but no Subscriber definition/export. The runtime therefore attempts to extend undefined.

Reproduced with one isolated production watcher: clean output retained Subscriber; a timestamp-triggered incremental compilation removed it and direct federation loading failed with the exact class-extends error. This establishes a compiler-cache failure independent of HTTP caching or concurrent dist writers. The refactor's RxJS/federation dependency graph exposed this behavior. The earlier commonChunk fix addressed clean compilation only and was insufficient for watch rebuilds. Global export usage and disabling export pruning were also insufficient.

`webpack.prod.config.js` now sets Webpack `cache: false`. Cached per-runtime module code is regenerated on each production compilation. Existing production optimization, tree shaking, minification, hashing, package versions and exposed identities remain intact. Development build caching is unchanged. Rebuild time may increase; observed isolated rebuilds were approximately 3–4 seconds rather than 1 second.

## Verification

- Added `npm run test:bundle-watch`: an actual optimized watcher, isolated temporary output, initial plus two incremental compilations and fresh runtime evaluation of both Component/Routes exports each time. It checks App/default identity, compiled component definition and route-array exposure.
- The generated-factory check detects the original broken build. Fixed clean/repeated builds pass.
- Browser: direct ESM remote container init/get for Component and Routes passes after successive rebuilds. Standalone page also renders after rebuild; the temporary static preview correctly reports its unavailable API rather than a bootstrap exception. No existing service data was changed.
- Angular application/spec typechecks and whitespace check pass. Existing 28 ChromeHeadless tests pass. The layout check still flags the user-edited App header classes (`user-metadata-header__hero-content` / `__eyebrow`) against its menu-prefix rule, plus soft component-length warnings; these unrelated source edits were preserved.
- User's existing App/header and management edits preserved. Temporary watcher/server processes used for reproduction are cleaned up; the pre-existing user watcher is not stopped.

## Usage and limits

Restart the current production watcher once to pick up the webpack configuration change. Further source recompilations should not require a restart. Stop any orphaned old watcher before launching a second watcher writing the same dist directory: the inherited dev:bundle shell backgrounds `npm run watch`, so terminating only the static server may leave it running.

Full authenticated host/service write integration remains outside this fix. The regression VM supplies only import-time/script-loading DOM shims; browser verification separately confirms actual rendering.

## Constitution Check

Build-only fix, preserved contracts/exports, isolated generated-output regression, documented evidence and no unrelated source changes.
