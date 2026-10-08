# Admin Navigational List

Angular 21.1 micro-frontend for creating, editing, filtering, archiving and organizing Ngx-Workshop navigation. Includes list, hierarchy and statistics views across ADMIN/WORKSHOP, HEADER/NAV/FOOTER and FULL/RELAXED/COMPACT classifications.

The application follows MVVM: stateless HTTP transport → singleton menu store → scoped view models → orchestration/presentation components. HTML and SCSS are inline; application classes use BEM.

- [Architecture](docs/architecture.md): source map, state flow and contracts.
- [Development](docs/development.md): setup and verification commands.
- [Agent entry point](AGENTS.md) and [workflow](.specify/README.md).
- [Feature index](specs/README.md) and [refactor plan](specs/001-mvvm-refactor/plan.md).

Run `npm start` for development or `npm run dev:bundle` for the existing federation bundle workflow on port 4201. Run `npm run build`, `npm run test:ci`, `npm run typecheck` and `npm run check:layout` to verify changes.

The shell hosts this journey at `/navigational-list`. The backend prefix is `/api/navigational-list`, using published navigational-list DTO contracts. See architecture.md for federation compatibility and parent-clearing semantics.
