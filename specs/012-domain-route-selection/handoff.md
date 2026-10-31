# Domain route selection handoff

Status: Implemented; host integration pending. Updated 2026-10-30.

## Delivered

Route Path now searches the selected domain's registered user-journey MFE names
and slugs. Option values use the shell's exact trim/lowercase/whitespace slug
algorithm with no leading slash. Uppercase navigation domains map to lowercase
orchestrator endpoint parameters. Duplicate slugs are coalesced and structural
remotes are excluded; archive filtering matches the shells' existing request.

The shared form VM owns per-form lookup, status, retry and membership validation.
Domain changes cancel obsolete requests and clear the route. Loading, failures,
missing domain, empty catalogs and unmatched searches have explicit feedback.
Initial edit values remain visible through loading/failure; invalid legacy routes
must be replaced with a current catalog slug before saving. No persisted records
are rewritten automatically. Full edit/dialog and creation wizard forms are wired.
Typing is reflected in the reactive control immediately; arbitrary text cannot
leave a previous valid selected route eligible for submission.

## Verification

- All 48 ChromeHeadless tests pass, including HTTP cancellation, domain mapping,
  shell slug parity, structural exclusion, duplicate slugs, membership validation,
  retained failed edits/retry, empty results and real Material autocomplete interaction.
- Existing wizard/routed/dialog tests now flush MFE lookups and assert slug payloads.
- Layout, Angular typecheck and test TypeScript compilation pass.
- Isolated production build passes at /tmp/navigation-domain-verified-build, with
  the existing unused menu-dialog.service.ts warning. Non-empty license output verified.
- The running static server's dist directory was not replaced. Other working-tree
  changes, installed contract version, package manifest and lockfile were preserved.

## Integration boundary and next action

Uses the already installed @tmdjr/ngx-mfe-orchestrator-contracts ^0.0.57 and
GET /api/mfe-remotes/domain/admin|workshop. The host/gateway must expose the
service's existing domain endpoint. No publishing or producer changes performed.

Authenticated gateway/service/federation interaction was not exercised. In the
host, choose Admin and select an MFE, confirm saved routePath is its slug, then
change to Workshop and confirm the old route clears and choices refresh. Check
an existing legacy route remains visible and requires a valid choice before save.
Static shell routes, nested remote routes and external URLs are outside this catalog.

Architecture and development context plus the feature index were updated. No
constitution changes or deviations required.


## Hosted autocomplete correction — 2026-10-30

Hosted inspection found the API returned the expected MFEs and options were
rendered, but the Material panel remained `mat-mdc-autocomplete-hidden` with
`aria-expanded=false`. The module re-export path supplied a different MatOption
identity from the shared autocomplete's content query across federation.
Import standalone MatAutocomplete, MatAutocompleteTrigger and MatOption together
from @angular/material/autocomplete so the query and rendered options use the same
shared entry point. Added an accessible Show available routes suffix button that
clears the search filter, focuses the input and explicitly opens the options.

Verified in the signed-in admin shell using the local bundle override: clicking
the arrow visibly lists Admin MFEs; selecting Document Editor writes document-editor
and enables Continue to presentation. No record was created or saved. Existing
wizard identity/classification values were restored after loading the new bundle.
The full 48-test suite passes, including explicit dropdown-button opening, and the
production build passes with the existing unused menu-dialog warning. The running
watch/server now serves the fix; no deployment or publishing was performed.
