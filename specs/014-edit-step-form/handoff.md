# Handoff — 2026-10-31

Both routed modes now render the existing three-step Create form. Edit preloads the existing record, uses Editing/Save changes/Saving labels, retains the archive control and exact saved position, and excludes self from sibling choices. Tooltip editing is available in Presentation. The route-ID key recreates the scoped editor and progression when switching records. Loading, retry and missing-record links remain host-relative.

Verification:
- All 52 ChromeHeadless tests pass. Added real-stepper edit coverage for prefill, archived/optional fields, current position, final-step PATCH, failure retention/retry, duplicate writes, pending navigation protection, ID changes and missing records. Updated existing direct/host-mounted routing tests to use wizard progression.
- Application Angular typecheck, test TypeScript compilation and layout check pass. Existing component line-count advisories remain; the cohesive inline wizard is 305 lines.
- Isolated production build passes at /tmp/navigation-edit-wizard-build with non-empty 3rdpartylicenses.txt. Existing unused menu-dialog.service.ts warning remains.
- Production watch regression passes all three builds, evaluating both ./Component and ./Routes each time.

No deployment, live navigation writes or authenticated host/service save acceptance was performed. Existing DTO/store/root-parent-clear contracts are reused; their live integration remains unverified. Existing unrelated checkout changes were preserved.

## Header and route-label follow-up — 2026-10-31

Archived now projects into the right-aligned panel header in edit mode and remains accessible across steps. Its live form value drives primary/secondary tone; pending/loading state disables the control. Route Path uses an always-floating Material label, preserving the autocomplete value and behavior while avoiding label overlap before focus.

Coverage checks header placement, toggling tone in both directions, pending disable, archived PATCH payload and an unfocused hydrated route field during/after route lookup. The existing presentation-control expectation was aligned with the currently hidden Tooltip field; its source visibility was preserved. Local verification results follow below.

All 53 ChromeHeadless tests pass. Angular application typecheck, test TypeScript compilation, layout and production build pass, with non-empty license output. The build retains the existing unused menu-dialog warning and layout retains soft line-count advisories. No live catalog writes, deployment or authenticated host visual verification was performed for this follow-up.

## Archive autosave — 2026-10-31

Checking or unchecking Archived immediately calls the existing archive/unarchive store action. It saves only archive status, stays on the edit page and preserves all other draft fields, including invalid/unfinished inputs. The action bar receives the store's saving/saved/error notification automatically. Pending/loading guards disable repeat commands and leaving during writes; failures restore checkbox/tone and allow retry.

All 54 ChromeHeadless tests pass, including both archive endpoints, pending duplicate/navigation protection, action-bar saving/saved feedback, invalid draft retention, failure rollback and retry. Application/test typechecks, layout and isolated production build pass; license output is non-empty. Existing line-count advisories and unused menu-dialog warning remain. No live navigation writes, deployment or authenticated host acceptance was performed.
