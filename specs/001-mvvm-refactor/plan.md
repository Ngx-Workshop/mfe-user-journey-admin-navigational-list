# Refactor plan

## Source findings
MenuApiService is already free of mutable state but includes tree presentation transforms. MenuManagementComponent independently fetches hierarchy/statistics; MenuListComponent fetches and mutates; MenuSearchService duplicates canonical items; MenuItemFormService mixes forms, HTTP and notifications; parent selection nests requests; reorder mutates rendered arrays before an unhandled promise. All component views are inline. Starter tests assert obsolete greeting content. Material/CDK federation versions differ from installed Angular 21.1.0.

## Implementation sequence
1. Adapt constitution/templates/entry point and local feature documentation (FR-006).
2. Organize feature into api, state, models, view-models, utils, components and pages; mirror tests (FR-002).
3. Add root MenuStore with latest-load cancellation, explicit loading/error state, guarded mutation commands, successful-write refresh and preserved data on failure. Derive hierarchy/statistics from canonical items; remove presentation transforms from HTTP (FR-001–003).
4. Scope search and form view models. Keep form helpers pure and typed. Derive parent choices from canonical data with cycle-safe traversal; protect saving and dialog lifecycle (FR-002–005).
5. Move reorder persistence through store, validate classification/ancestry, avoid optimistic array mutation; add keyboard ordering. Apply BEM and retain presentation boundaries (FR-004–005).
6. Replace starter tests with HTTP, store, form/parent/reorder and rendered view regressions. Run strict checks, production build, browser smoke where available; document exact outcomes (FR-006, AC-004).

## Compatibility
No API or DTO changes. Sort submits only _id, parentId, sortId; root move omits parentId as supported by server. Keep legacy remote name and route tree. Align Material/CDK required versions with installed versions. Explicitly share RxJS interop/operators and enable commonChunk: production browser inspection found duplicated stripped RxJS internals otherwise caused a blank standalone page. Do not change sibling repositories.

## Constitution Check
All principles covered. Hierarchy may retain a modest line-count exception if its inline composed view remains cohesive. Local smoke checks do not establish authenticated host integration.
