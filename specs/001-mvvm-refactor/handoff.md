# MVVM refactor handoff

Date: 2026-10-07 (America/New_York).
Status: Implemented; local verification complete. Authenticated host/service write integration pending.

## Completed

- Migrated local Spec Kit constitution, templates, workflow, agent/prompt wrappers and optional Bash helpers; all navigation-specific context is local.
- Organized source under features/navigation and tests under testing/app, preserving federation exports and legacy routes.
- Stateless HTTP transport, root MenuStore and scoped list/search/form/reorder view models. One canonical record collection drives filters, parent choices, hierarchy and statistics.
- Latest-read cancellation, guarded/replayed mutation streams, refresh after writes, retained data/edits after failures, retry states and save lifecycle protection.
- Typed forms/filter events, cycle-safe parent choices, authoritative reorder refresh, rejected invalid destinations and labeled keyboard sibling ordering.
- All 17 component files keep inline HTML/SCSS, OnPush and BEM. Largest component: 219 lines; no line-count exception needed.
- Fixed production standalone bundle startup by enabling commonChunk to avoid duplicate stripped RxJS modules. Explicitly shared Angular RxJS interop/operators and aligned Material/CDK versions with installed 21.1.0. Preserved remoteEntry.js, legacy remote name, default/named App and named Routes.

## Verification evidence

- `npm run check:layout`: passed (feature boundaries, inline views, BEM, separate tests).
- `npm run typecheck`: passed (strict Angular/template compilation).
- `npx tsc -p tsconfig.spec.json --noEmit`: passed.
- `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:ci`: **20 tests passed** in ChromeHeadless. Includes HTTP filters/root sort payload, store refresh/failure/duplicate and teardown handling, archive propagation, parent clearing, typed form validation/retained edits, parent cycles, list filtering, rendered error/retry and all three tab views, keyboard ordering and invalid drop rejection.
- `npm run build -- --output-path=/tmp/navigation-verified-build`: production build passed, hash 337f76adb7096c4d. Isolated output avoids contention with the user's existing dist watcher. Earlier normal production builds also passed.
- Bash helper syntax checks passed. `SPECIFY_FEATURE=001-mvvm-refactor .specify/scripts/bash/check-prerequisites.sh --json --paths-only` resolved this feature without creating a branch or overwriting files.
- Browser: inspected supplied host URL, which showed User Management, and followed the shell's Mission Controls → Navigational List to `/navigational-list` (53 existing active records). This is host baseline inspection, not proof of loading the refactored remote.
- Browser: isolated optimized production bundle rendered navigation management, list/error/retry, hierarchy and statistics tabs, and create dialog. The standalone server has no API proxy, so the request fails truthfully and create remains disabled before data loads. No existing navigation records were modified. Initial blank-preview failure was reproduced, diagnosed and fixed with commonChunk; subsequent optimized production rendering passed.

## Compatibility and remaining integration

No dependency versions, package lock, backend contracts, sibling repositories, deployment workflows or remote identities changed. Material/CDK federation requirements were corrected to match this checkout; the host must supply compatible singletons. Existing delete command remains supported while the inherited card delete button remains hidden.

Restart an existing bundle watcher to pick up angular.json/webpack.config.js changes. Then load this remote in the authenticated host at `/navigational-list`. With disposable fixture records, verify create/edit, archive/unarchive, deletion through supported intent, sibling reorder and parent-to-root movement, and confirm all tabs update after each write. These live service writes were not performed on existing records.

Parent clearing is a PATCH followed by sort and is not atomic. If sort fails, other fields may already be saved; the form remains open and offers retry/reload. A future atomic backend operation is a separate service-owned change, not a requirement for this local refactor. Orphans/cyclic data with no reachable root stay visible in the list for repair but do not appear in the hierarchy.

## Constitution Check

All six principles addressed with local evidence. Remaining host/service checks are explicitly separated from completed implementation and isolated verification. No deployment or package publication performed.
