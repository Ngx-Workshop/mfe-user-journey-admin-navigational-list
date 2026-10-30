# Plan

Use the catalog's search rail and overview with a shared hierarchical result region. Keep canonical records and commands in MenuStore and existing MenuListViewModel/MenuReorderService. MenuWorkspaceViewModel owns derived tree projection and disclosure; pure helpers retain matching records and ancestors without mutating canonical hierarchy. Unplaced active and archived matches render through the existing catalog item presentation.

Extend tree/row presentation with catalog action events, access labels, ancestor annotations and a separate reorder-disabled input. Keep complete trees in canonical menu order, replacing flat-list pagination/sorting. Disable reorder and branch disclosure in filtered views; clear filters restores prior disclosure. Legacy hierarchy routes redirect relative to the host mount.

Retire separate hierarchy page/manager/scope selection and flat paginated-grid components/view model; replace their obsolete tests with unified projection and UI interaction coverage. No service or payload migration.

Constitution check: inline HTML/SCSS, BEM, scoped VM ownership, immutable derived data, explicit loading/error/busy states and labeled keyboard ordering. Existing dependency/webpack and prior user-authorized migration work is preserved. All persistence verification uses mocks/temporary fixtures, never real records.
