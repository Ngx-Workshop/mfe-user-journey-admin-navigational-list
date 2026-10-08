# Navigation API contracts

Published types: `@tmdjr/service-navigational-list-contracts`, as locked in package-lock.json. MenuApiService is the sole HttpClient owner; MenuStore orchestrates application requests.

| Method | Path beneath `/api/navigational-list` | Contract |
| --- | --- | --- |
| GET | collection root | MenuItemDto[]; optional domain, structuralSubtype, state, archived filters |
| POST | collection root | CreateMenuItemDto → MenuItemDto |
| PATCH | `/:id` | UpdateMenuItemDto → MenuItemDto |
| DELETE | `/:id` | void |
| PATCH | `/:id/archive`, `/:id/unarchive` | empty body → MenuItemDto |
| POST | `/sort` | SortMenuItemDto → MenuItemDto |
| GET | `/hierarchy/:domain` | MenuHierarchyResponseDto; optional includeArchived |
| GET | `/domain/:domain/structural-subtype/:subtype/state/:state` | MenuItemDto[]; optional includeArchived |

Sort accepts `_id`, `sortId` and optional parentId. Root moves omit parentId; backend explicitly unsets the field and resequences siblings. Create/update parentId requires a valid Mongo ID when present. Form mapping omits an empty parent; changing an existing child to root uses PATCH then sort under store orchestration. The two writes are not atomic. See architecture.md for recovery and compatibility limits.

No backend DTO, authorization or route changes accompany this refactor. A host/service check needs an authenticated shell and disposable navigation fixtures before performing write journeys.
