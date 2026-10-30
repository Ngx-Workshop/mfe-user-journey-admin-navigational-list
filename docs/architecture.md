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

The catalog and hierarchy are one Mission Control workspace: a slim total/active/archived overview with refresh, the existing search/filter rail and a grouped recursive destination tree. Groups identify domain, placement and display state; complete sibling lists retain canonical menu order. Pagination and arbitrary flat sorting were retired because they split parent/child context and make reorder indices ambiguous.

MenuWorkspaceViewModel derives display trees from MenuSearchService matches and canonical active hierarchy. Text/role filters retain ancestor paths without counting those ancestors as matches; context rows are labeled. Matching branches automatically expand. Clearing filters restores prior disclosure. Filtered views suspend drag/drop and sibling arrows, and orchestration also rejects filtered move/drop intents. Editing, archive and copy remain available on tree rows through the catalog action view model. Unplaced/cyclic/unreachable active matches remain accessible in a repair section; archived matches appear in a separate section with restore actions when included.

Desktop keeps the 248px filter rail and viewport-bounded result region. Header and guidance remain outside the keyboard-scrollable row region; all populated groups share that region. Below 900px the page uses normal document scrolling, with classification filters behind an accessible disclosure toggle. Changing filters resets result scroll; equivalent refreshes preserve it. Branch controls and mutation actions respect pending/drag state. Errors retain canonical rows and offer reload; empty searches offer reset and empty catalogs offer creation.

The standalone hierarchy page, scope selection rail and paginated grid/results view model have been retired. The legacy /hierarchy route redirects to the unified catalog, including beneath the host mount. Create/edit routes and typed form/persistence behavior remain unchanged. Original features 006 and 007 are superseded by feature 008.

## Design system migration — 2026-10-29

The App host applies `ngx-design-system` for routed and legacy Component consumers. The compact sticky action bar replaces the particle hero. The initial panel/grid catalog was subsequently replaced by the Mission Control workspace described above (feature 006).

NgxPanel composes form sections. Catalog overview, filter console and rows use compact native layouts with the same semantic tokens. NgxButton enhances normal Material buttons/links; NgxStatus labels active/archived cards. Material retains inputs, selects, validation, checkbox, icon actions, paginator and accordion behavior. Owned styles use semantic Ngx colors/radius; hierarchy rows use the public Material icon-button density mixin.

Standalone styles include the public theme() and scoped material-adapter() mixins. Federated loading relies on the shell's global theme, button and overlay assets. Detached select/tooltip/dialog/snackbar surfaces use ngx-design-system-overlay; dialogs also use ngx-design-system-backdrop. The standalone stylesheet sets --menu-toolbar-top to zero; hosted defaults are 96px desktop/76px narrow, matching the migrated orchestrator shell chrome. A host may supply this custom property when its chrome differs.

No domain store, HTTP/payload, navigation URL or federation export changes accompany this migration. The user's existing package/lockfile/webpack installation edits are preserved.


## Unified tree interaction contracts

Tree roots use raw classification IDs (list-ADMIN-NAV-FULL etc.) for both rendered and connected drop lists. Connections include only visible existing child lists within the same classification. Descendant/cross-classification drops remain rejected. Root IDs retain the correction introduced in feature 007. Canonical arrays change only after successful service refresh.

Recursive MenuTree owns CDK list/drag lifecycle; MenuTreeRow emits presentation intent. Catalog actions bubble through the tree to MenuListViewModel, so edit navigation remains relative to the unified catalog mount. Material menus/selects/tooltips retain detached overlay scope. Reorder-disabled is separate from general busy state, allowing catalog actions during filtering while protecting complete-sibling sort semantics. Public Material density styling keeps row controls compact. Ancestor context and filtered sibling positions are visibly distinguished.
