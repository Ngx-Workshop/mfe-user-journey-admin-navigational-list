# Navigational list architecture

This Angular 21.1 zoneless, standalone remote manages administrator navigation records for ADMIN and WORKSHOP domains, HEADER/NAV/FOOTER structures and FULL/RELAXED/COMPACT states. It owns list/filtering, create/edit dialogs, hierarchy ordering, archive/unarchive/delete commands and statistics. The shell owns authentication, outer navigation and remote composition; server authorization remains authoritative.

## MVVM boundaries

`src/app/features/navigation` contains:

| Directory | Responsibility |
| --- | --- |
| `api` | MenuApiService: stateless typed HttpClient transport, no UI/domain state or subscriptions |
| `state` | Root MenuStore: canonical records, loading/error/pending/ready signals, latest-request load cancellation, mutation guard and refresh |
| `view-models` | Scoped MenuSearchService, MenuListViewModel, MenuResultsViewModel and MenuItemFormViewModel; scoped reorder orchestration; dialog launcher |
| `models` | Published DTO-derived types and classification constants |
| `utils` | Form construction/payload mapping, cycle-safe ancestry, sorted tree/statistic projections, hierarchy labels/connectivity |
| `components` | Inline views; management/list/form/hierarchy orchestrate; grid owns a scoped results view model; card/filter/statistics/tree/form sections present inputs and emit intent |

`app.ts` composes management. `app.routes.ts` exports named Routes, preserving the legacy empty → hello-world route. The host mounts this remote at `/navigational-list` (the earlier `/user-management/user-metadata` link belongs to another remote).

HTTP → store signals → computed hierarchy/statistics and scoped view models → views. UI intent → view model/store command → HTTP → refresh canonical records. No components inject the HTTP service. Parent selection is presentational and receives reactive options from the dialog view model. Filters remain list-local while domain data is shared. Returning to a destroyed list resets filters.

## State and lifecycle

The initial unfiltered GET includes archived items; filtering remains local. Statistics count all records; hierarchy uses active records only. Store refresh uses switchMap to cancel obsolete reads. Read/write failures retain canonical data; errors have explicit retry controls. Successful commands refresh all derived views. A pending guard rejects duplicate concurrent commands; replayed command streams keep started writes alive across view teardown and are bounded by the root lifecycle. Dialog subscriptions clean up on destruction and save protects backdrop/Escape/cancel until completion.

Parent choices exclude self, descendants, archived items and other classifications. A cycle-safe traversal handles malformed data. Hierarchy drag destinations remain inside a classification and cannot target descendants. Rendered arrays are not optimistically changed; the server resequences siblings. Labeled sibling up/down buttons support keyboard ordering. Use parent selection in the form for reparenting to leaf items.

## Integration contracts

- Base URL `/api/navigational-list`: GET/POST collection, PATCH/DELETE `/:id`, PATCH `/:id/archive` and `/:id/unarchive`, POST `/sort`.
- Transport retains typed hierarchy and classification GET endpoints for callers; current views derive these from canonical records.
- Published `@tmdjr/service-navigational-list-contracts` DTOs. Sort writes `_id`, optional `parentId`, `sortId`; the backend handles sibling resequencing. Do not send classification changes to sort.
- Clearing an existing parent uses PATCH with omitted parentId followed by POST `/sort` with omitted parentId. Empty-string parent IDs fail backend Mongo-ID validation. This sequence is not atomic: if the second call fails, other edits may already have persisted; retain edits and offer retry/reload. No backend change was made.
- Default/named App, named Routes, `remoteEntry.js`, `./Component`, `./Routes` and legacy `ngx-seed-mfe` name are preserved. Material/CDK required versions now match installed 21.1.0. Angular RxJS interop and RxJS operators are explicitly shared. The common chunk is enabled to prevent standalone/exposed-entry duplication from stripping RxJS internals. Host compatibility must be checked against its shared runtime.

Tests under `testing/app` mirror source. `npm run check:layout` checks source boundaries, inline component views and BEM; 230 lines is a soft design target.

## Navigation workspace UX

The list combines labeled classification filters with real role values and immediate local search. A scoped results view model sorts clones of canonical records and paginates 12/24/48 items. Filtering and sort/page-size changes reset the page; equivalent refresh records preserve the page. Refresh retains visible cards, while mutation controls stay disabled during pending work. Empty search offers reset; an empty catalog offers creation.

Cards expose readable status/classification/access metadata and labeled edit/archive/restore/copy actions. Clipboard success/failure is reported by the list view model. Route links resolve against the record's domain in both list and hierarchy. Dialog footers submit their associated native form, supporting Enter, and retain edits after errors. Optional icon configuration is collapsed initially. All styles consume host Material tokens; preview-only themes/fixtures are excluded from shipped source.
