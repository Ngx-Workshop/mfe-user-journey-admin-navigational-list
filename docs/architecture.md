# Navigational list architecture

This Angular 21.1 zoneless, standalone remote manages administrator navigation records for ADMIN and WORKSHOP domains, HEADER/NAV/FOOTER structures and FULL/RELAXED/COMPACT states. It owns list/filtering, create/edit pages, hierarchy ordering, archive/unarchive/delete commands and statistics. The shell owns authentication, outer navigation and remote composition; server authorization remains authoritative.

## MVVM boundaries

`src/app/features/navigation` contains:

| Directory | Responsibility |
| --- | --- |
| `api` | MenuApiService: stateless typed HttpClient transport, no UI/domain state or subscriptions |
| `state` | Root MenuStore: canonical records, loading/error/pending/ready signals, latest-request load cancellation, mutation guard and refresh |
| `view-models` | Scoped MenuSearchService, MenuListViewModel, MenuWorkspaceViewModel and MenuItemFormViewModel; scoped reorder orchestration; dialog launcher |
| `models` | Published DTO-derived types and classification constants |
| `utils` | Form construction/payload mapping, cycle-safe ancestry, sorted tree/statistic projections, hierarchy labels/connectivity |
| `components` | Inline views; management/list/form/hierarchy orchestrate; management scopes search; list scopes workspace/action/reorder orchestration; filter/statistics/tree/row/form sections present inputs and emit intent |

`app.ts` scopes the design-system theme and composes the routed outlet. `app.routes.ts` exports named Routes with the unified list, `create`, and `edit/:id` child pages; legacy `hierarchy` redirects to the list relative to the current mount. Standalone bootstrap provides routing; the admin host must use the `./Routes` exposure (`useRoutes: true`). Direct `./Component` consumers retain list rendering. The host mounts this remote at `/navigational-list` (the earlier `/user-management/user-metadata` link belongs to another remote).

HTTP → store signals → computed hierarchy/statistics and scoped view models → views. UI intent → view model/store command → HTTP → refresh canonical records. No components inject the HTTP service. Parent selection is presentational and receives reactive options from the form view model. Filters remain workspace-local while domain data is shared. Returning to a destroyed list resets filters.

## State and lifecycle

The initial unfiltered GET includes archived items; filtering remains local. Statistics count all records; hierarchy uses active records only. Store refresh uses switchMap to cancel obsolete reads. Read/write failures retain canonical data; errors have explicit retry controls. Successful commands refresh all derived views. A pending guard rejects duplicate concurrent commands; replayed command streams keep started writes alive across view teardown and are bounded by the root lifecycle. Dialog subscriptions clean up on destruction and save protects backdrop/Escape/cancel until completion.

Parent choices exclude self, descendants, archived items and other classifications. A cycle-safe traversal handles malformed data. Hierarchy drag destinations remain inside a classification and cannot target descendants. Rendered arrays are not optimistically changed; the server resequences siblings. Labeled sibling up/down buttons support keyboard ordering. Use parent selection in the form for reparenting to leaf items.

## Integration contracts

- Base URL `/api/navigational-list`: GET/POST collection, PATCH/DELETE `/:id`, PATCH `/:id/archive` and `/:id/unarchive`, POST `/sort`.
- Transport retains typed hierarchy and classification GET endpoints for callers; current views derive these from canonical records.
- Published `@tmdjr/service-navigational-list-contracts` DTOs. Sort writes `_id`, optional `parentId`, `sortId`; the backend handles sibling resequencing. Do not send classification changes to sort.
- Clearing an existing parent uses PATCH with omitted parentId followed by POST `/sort` with omitted parentId. Empty-string parent IDs fail backend Mongo-ID validation. This sequence is not atomic: if the second call fails, other edits may already have persisted; retain edits and offer retry/reload. No backend change was made.
- Default/named App, named Routes, `remoteEntry.js`, `./Component`, `./Routes` and legacy `ngx-seed-mfe` name are preserved. Material/CDK required versions now match installed 21.1.0. Angular RxJS interop and RxJS operators are explicitly shared. The common chunk is enabled for standalone/exposed entry points. Production disables Webpack module caching because cached incremental compilations can strip required RxJS/Angular exports; clean builds alone do not detect that regression. Host compatibility must be checked against its shared runtime.

Tests under `testing/app` mirror source. `npm run check:layout` checks source boundaries, inline component views and BEM; 230 lines is a soft design target.

## Navigation workspace UX

The catalog and hierarchy are one Mission Control workspace: a Filter console containing search, compact total/active/archived counts, refresh and classification filters, alongside a grouped recursive destination tree. Groups identify domain, placement and display state; complete sibling lists retain canonical menu order. Pagination and arbitrary flat sorting were retired because they split parent/child context and make reorder indices ambiguous.

MenuWorkspaceViewModel derives display trees from MenuSearchService matches and canonical active hierarchy. Text/role filters retain ancestor paths without counting those ancestors as matches; context rows are labeled. Matching branches automatically expand. Clearing filters restores prior disclosure. Filtered views suspend drag/drop and sibling arrows, and orchestration also rejects filtered move/drop intents. Editing, archive and copy remain available on tree rows through the catalog action view model. Unplaced/cyclic/unreachable active matches remain accessible in a dedicated repair panel; archived matches appear in a separate section with restore actions when included.

Desktop uses a 280–320px filter rail and viewport-bounded result region. Header and guidance remain outside the keyboard-scrollable row region; all populated groups share that region. Below 900px the page uses normal document scrolling, with classification filters behind an accessible disclosure toggle. Changing filters resets result scroll; equivalent refreshes preserve it. Branch controls and mutation actions respect pending/drag state. Errors retain canonical rows and offer reload; empty searches offer reset and empty catalogs offer creation.

The standalone hierarchy page, scope selection rail and paginated grid/results view model have been retired. The legacy /hierarchy route redirects to the unified catalog, including beneath the host mount. Create/edit routes and typed form/persistence behavior remain unchanged. Original features 006 and 007 are superseded by feature 008.

## Design system migration — 2026-10-29

The App host applies `ngx-design-system` for routed and legacy Component consumers. The compact sticky action bar replaces the particle hero. The initial panel/grid catalog was subsequently replaced by the Mission Control workspace described above (feature 006).

NgxPanel composes the Filter console, Destinations workspace and form sections. The filter rail uses chamfered/solid appearance with a CATALOG / FILTER eyebrow and fade entrance, matching the orchestrator catalog rail. Counts and rows use compact native layouts with the same semantic tokens. NgxButton enhances normal Material buttons/links; NgxStatus labels active/archived cards. Material retains inputs, selects, validation, checkbox, icon actions, paginator and accordion behavior. Owned styles use semantic Ngx colors/radius; hierarchy rows use the public Material icon-button density mixin.

Standalone styles include the public theme() and scoped material-adapter() mixins. Federated loading relies on the shell's global theme, button and overlay assets. Detached select/tooltip/dialog/snackbar surfaces use ngx-design-system-overlay; dialogs also use ngx-design-system-backdrop. The standalone stylesheet sets --menu-toolbar-top to zero; hosted defaults are 96px desktop/76px narrow, matching the migrated orchestrator shell chrome. A host may supply this custom property when its chrome differs.

No domain store, HTTP/payload, navigation URL or federation export changes accompany this migration. The user's existing package/lockfile/webpack installation edits are preserved.


## Unified tree interaction contracts

Tree roots use raw classification IDs (list-ADMIN-NAV-FULL etc.) for both rendered and connected drop lists. Connections include only visible existing child lists within the same classification. Descendant/cross-classification drops remain rejected. Root IDs retain the correction introduced in feature 007. Canonical arrays change only after successful service refresh.

Recursive MenuTree owns CDK list/drag lifecycle; MenuTreeRow emits presentation intent. Catalog actions bubble through the tree to MenuListViewModel, so edit navigation remains relative to the unified catalog mount. Material menus/selects/tooltips retain detached overlay scope. Reorder-disabled is separate from general busy state, allowing catalog actions during filtering while protecting complete-sibling sort semantics. Public Material density styling keeps row controls compact. Ancestor context and filtered sibling positions are visibly distinguished.


## Filter console summary — 2026-10-29

MenuStatistics is embedded immediately beneath search in MenuFilters. It presents canonical Total/Active/Archived counts as three compact summary cells; filtering does not change these catalog totals. Initial unknown values use em dashes. The retained refresh action bubbles through MenuFilters to MenuList and is disabled during loading or pending writes. Management no longer renders a separate statistics strip.

The rail measures panel chrome and remaining viewport space using ResizeObserver and scheduled resize/scroll measurements, following MfeRemoteRail. Only its body scrolls; observers/listeners/frame callbacks clean up on destruction. The mobile body is capped at 480px and retains the existing classification disclosure. Removing the old strip lets desktop results begin closer to the action bar and extends their usable height.


## Destinations design-system panel

The Destinations workspace follows MfeRemoteCard: NgxPanel with stepped geometry, grid background, primary tone, fade entrance and a staggered heading. Match count and hierarchy disclosure controls project through ngxPanelHeader; guidance projects through ngxPanelActions. Its inner body measures the available desktop space after panel chrome, retaining keyboard-scrollable rows and fixed header/footer; mobile uses natural document flow. The former outer native border is removed to avoid double framing. No search, ordering, lifecycle or persistence behavior changes.


## Workspace feedback and repair layout — 2026-10-29

Each section heading sticks within the hierarchy row scroller. On mobile it sticks below the measured action bar. The action bar writes its measured height to a scoped --menu-action-bar-height custom property, which also updates rail offsets and available workspace height when notifications wrap.

MenuStore exposes saveNotification for all accepted mutations. It identifies the destination and transitions through saving, saved on confirmed write response, or error on failure. A multi-request parent clear is saved only after both writes. Success clears after three seconds; newer accepted work cancels the old clear timer. Failure remains until another mutation. A failed post-write refresh is separately reported as a load failure, while the confirmed-write notification remains accurate. Duplicate writes do not replace current feedback. Timer cleanup belongs to the root store.

Catalog and create/edit pages pass this state into the presentational action bar's persistent polite/atomic live region. Existing action/form flows own retry; notification display does not automatically replay writes or stale form payloads.

Unplaced matches have their own secondary-toned NgxPanel beside Destinations on a 2:1 desktop grid. Their count is excluded from the main list count, and hierarchy receives all available width when no unplaced matches remain. An unplaced-only search retains the empty placed-result explanation. Both panels share public panel-body viewport measurement with teardown cleanup, use independently scrollable bodies, and stack below 900px. Rows/cards respond to their container width rather than assuming full browser width.


## Menu creation wizard — 2026-10-30

MenuItemPage renders CreateMenuItemPage for create mode and retains the existing form workspace for edit mode. The creation page mirrors the orchestrator's vertical linear Material stepper inside a stepped glass NgxPanel with viewport background and chevron actions in ngxPanelActions.

Steps are (1) menu item text, domain/placement/display state and role, (2) route plus parent and sort position, (3) optional tooltip, paired SVG path fields and description. Creation uses the existing active default; archive controls remain in edit/dialog forms. CreateMenuItemViewModel owns progression and reads public form events for step validity. It reuses MenuItemFormViewModel and the typed factory for the single form, reactive parent options, DTOs, duplicate-save guards, failure retention and host-relative completion navigation. No HTTP or canonical state is introduced in the wizard VM.

Continue is gated by the current required fields; linear headers also prevent skipping invalid earlier steps. Earlier steps remain editable while not busy. Final creation requires step three, a valid form and a ready/nonbusy store; native submit from earlier steps does not post. Failed POSTs leave the step and values intact, with error/notification feedback and a retryable Create action. The existing pending route guard and save completion behavior remain.

Shared field components expose embedded presentation for the wizard, suppressing nested panel chrome. Their default edit/dialog presentation is unchanged. Creation remains centered at a maximum 765px content width; direct/hosted create URLs and legacy exposures retain their contracts. Dialog-based creation retains the existing flat form.


Creation placement uses a Position After dropdown alongside Parent Item. The creation VM projects active direct siblings for the selected parent/classification (root siblings when no parent), maps each to a numeric insertion gap, and resets to None=0 on parent/classification changes. This preserves the create DTO without assuming the service resequences siblings on POST. Domain and role share a row; the panel heading reacts to menu text. Edit/dialog numeric sort controls remain unchanged.


## Domain route choices — 2026-10-30

The shared menu form VM owns scoped MFE route reference data through
`createMenuRouteOptions`. `MfeRoutesApiService` is stateless and uses published
orchestrator contracts ^0.0.57 to request `/api/mfe-remotes/domain/admin` or
`/api/mfe-remotes/domain/workshop`, mapping uppercase navigation domains.
Only user-journey remotes become route choices. Slugs exactly match the shells:
trim, lowercase, replace whitespace runs with hyphens; values have no leading slash.
The endpoint's archive behavior is retained to match shell route generation.

Basic information renders a searchable Material autocomplete with themed overlay,
matching either MFE name or slug. Catalog-membership validation blocks arbitrary
text, unknown existing routes and progression/save while route data is unavailable.
Material writes typed text to the control immediately, so replacing a valid selection
with arbitrary text cannot leave the old route valid. Domain changes clear the route,
cancel obsolete requests and fetch new options. Initial edit values and other fields
survive loading/failure; Retry routes refreshes the same domain. No matches, empty
catalog, loading, missing domain and failure have explicit feedback.

Creation step two and existing full edit/dialog forms share this behavior. Legacy
route values remain visible but must match a current registered slug before saving;
there is no automatic rewrite of persisted navigation. Nested remote routes, static
shell routes and external URLs are not included. MenuStore still owns navigation
persistence; the form VM owns this independent, per-form reference lookup.


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


## Menu icon assets — 2026-10-30

The legacy navSvgPath/headerSvgPath DTO fields accept Material ligature names, Devicon class strings, or image URLs. Structural header/navigation render all three formats through local standalone renderers, including child menu overlays. The form uses accurate icon labels and a dedicated image picker dialog backed by @tmdjr/ngx-asset-manager 21.1.0. Selection changes only the target control; manual entry, cancellation, disabled-state protection and view cleanup remain local to the form section. The asset package is a federation singleton using the admin shell's authenticated data source; standalone bootstrap supplies its default adapter. No custom HTTP transport or domain state was added. See feature 013 for verification limits.


## Shared Create/Edit step form — 2026-10-31

Feature 014 supersedes the creation-only routing distinction above. Both routed modes use CreateMenuItemPage/CreateMenuItemViewModel and the same centered vertical stepper. The shared editor still owns prefill, validation and POST/PATCH selection. Edit adds Archived to the right panel header, an Editing heading and Save changes/Saving labels; Presentation includes tooltip, icons and description. Dialog forms retain their existing layout.

Position choices exclude the edited record. An additional Current position choice preserves its exact persisted numeric sort value when no sibling gap already represents it. Parent/classification changes reset placement to None=0. The route wrapper keys the wizard by edit ID, recreating the form and step state on ID changes. Final-step validation, duplicate-write protection, failure retention, pending route guard, parent-clear sequence and host-relative completion remain in the existing form/store layers.

The edit header checkbox is independent of lazy step content and remains available across steps. Its form-backed value selects secondary panel tone for archived items and primary for active items; busy state disables changes. Route Path explicitly uses Material floatLabel="always" to avoid overlap with prefilled autocomplete values before focus or after deferred value writes.

The edit header's Archive toggle now saves immediately via the existing store archive/unarchive endpoints. MenuItemFormViewModel handles the guarded command, optimistic checkbox state and failure rollback without full-form validation, draft submission or completion navigation. Other edits and current progression survive the canonical refresh. Store notifications supply the action bar's saving/saved/error states and the existing route guard blocks leaving during the request.


## Unplaced destination action-bar status — 2026-10-31

MenuStore now owns the canonical active/unreachable destination projection. MenuWorkspaceViewModel applies local matches to this projection for the repair panel. Management and routed Create/Edit pass the catalog-wide count into the action bar independently of workspace filters. Initial unknown count displays an em dash; refresh/error retains the last known canonical count. Orphan/cycle/unreachable detection matches the repair panel and excludes archived items.

The presentational action bar follows the orchestrator dev-mode status pattern: decorative dot, emphasized count, singular/plural text and polite atomic live region. Zero is muted; nonzero uses semantic warning color/glow. Save notifications and projected actions retain their behavior, and existing measured action-bar height handles wrapping.

## Shared action bar adoption — 2026-10-31

The app consumes published design-system 21.0.9 NgxActionBar, NgxSaveFeedback and
NgxInlineStatus. Its existing action component is a thin domain adapter for labels,
notifications and action intent, with display:contents so the shared sticky element
belongs to the workspace layout. It no longer duplicates live-region/status markup,
visual styles or ResizeObserver code. The owning workspace binds shared heightChange
to its existing sizing CSS variable. Stores retain persistence, notification timers,
retry execution and canonical counts. Routes, DTOs and federation exposures are unchanged.

The design-system singleton now requires ^21.0.9: older releases lack the new exports.
The local admin shell still pins 21.0.8; upgrade it to the published 21.0.9 or newer
compatible release before hosted acceptance. This feature does not modify the shell.

Navigation retains --menu-toolbar-top (96px desktop/76px narrow; standalone 0px),
unknown/zero/singular/plural unplaced labels, and "Try the action again" failure
instructions without a generic retry button. MenuManagementComponent and
MenuItemPageComponent own --menu-action-bar-height through local signals; no parent
inline-style mutation or teardown restoration remains in the action adapter.

## Shared overlay policy adoption — 2026-10-31

The shell and both migrated remotes install design-system 21.0.10 and require
^21.0.10 in federation sharing. Shell theme() emits the shared overlay-policy()
once globally; standalone remote theme() supplies the same policy for isolated use.
The page and portal scopes no longer regenerate a dark Material adapter. Root theme
roles, typography and color scheme reach controls and overlays in both palettes.
Local duplicated portal font/text/backdrop and fixed-dark rules are removed.

All owned mat-select panels have ngx-design-system-overlay and ngx-select-panel.
Autocomplete/menu/tooltip/dialog markers retain their public configuration without
receiving select-only animation policy. Existing app-specific layout, dialog sizing,
classes, forms, values, routes, stores and persistence are retained.
