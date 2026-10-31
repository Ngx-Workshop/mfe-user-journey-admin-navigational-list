# Plan

MenuItemPage selects a route-only CreateMenuItemPage for create mode; edit mode retains MenuItemFormComponent. The new page scopes the existing form factory and MenuItemFormViewModel for canonical parent choices, save behavior, notifications and close/navigation handling. A small CreateMenuItemViewModel owns step progression and validity gates, reacting to public form events without reparenting controls or duplicating transport logic.

Reuse field-section components with an optional embedded presentation mode: wizard fields omit nested panel chrome, while default edit/dialog sections retain their existing panels. Keep all values in one typed reactive form across lazy steps. Use the public NgxPanel actions slot for Continue/Create, and associate the final native submit button with the form ID. Early/native submit events cannot create before the final step.

Constitution check: inline views/BEM, scoped UI state, singleton canonical store, no component HTTP, existing DTO projection and save guard. Do not modify unrelated working changes. Use fixtures/mocked requests for verification; no deployment or real catalog writes.

Field-order revision: shared basic/configuration sections accept field subsets, defaulting to all existing fields for edit/dialog consumers. Creation composes those subsets around classification/parent views. SVG fields gain an optional paired layout. Identity and routing validity groups now follow the new field allocation.


Position selector revision: keep heading, sibling projections and context-reset logic in the creation VM; add a presentational Position After select using the existing numeric sort control. Expose classification field subsets for paired Domain/Role and remaining Structural/State rows. Preserve typed creation payloads and default edit/dialog views. Verify option scoping/order, numeric payload, resets, heading and responsive rows.
