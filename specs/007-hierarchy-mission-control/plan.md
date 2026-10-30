# Plan

A scoped MenuHierarchyViewModel owns selection and branch disclosure. Pure hierarchy helpers project populated scopes/counts and visible drop-list connectivity. MenuStore continues owning canonical data; MenuReorderService continues orchestrating sort writes.

The manager composes the compact scope rail and tree workspace. Separate presentational scope and row components keep responsibilities focused; recursive MenuTree retains CDK list/drag lifecycle and emits intent. Row edit links route relative to the hierarchy mount. The shared action bar gains an optional title input, retaining the catalog default.

Fix the observed rendered list-ID mismatch: old roots used human-readable domain labels although predicates and the reorder service require ADMIN/WORKSHOP. New roots use the same raw classification IDs as their connected descendants. No API or payload contract change.

Constitution check: inline templates/styles, BEM, mirrored tests, public Material density mixin/semantic Ngx colors, labeled keyboard ordering and truthful pending/error UI. Preserve all earlier uncommitted catalog/migration/dependency changes. Do not deploy or write real navigation records to validate.
