# Plan

Reuse CreateMenuItemPage and CreateMenuItemViewModel for both routed modes; keep their existing exported names to limit churn. The shared MenuItemFormViewModel already populates edits and chooses PATCH. Make progression labels mode-aware, expose Archived only for editing, and use the same centered page width. Keep the route-ID keyed view lifecycle.

Project position choices without the edited item and add the exact saved numeric position when no existing choice represents it. Keep tooltip editing available in Presentation. Update route tests and exercise the real Material stepper with HTTP doubles. Verify layout, application/test types, all browser tests and an isolated production build. Record host/service verification separately.

Follow-up: project a native Material checkbox through ngxPanelHeader, guarded by the wizard busy state. Derive archived status from form events for both checkbox and panel tone, retaining one persisted form control. Explicitly float Route Path's Material label so deferred autocomplete value writes cannot leave it over hydrated text. Cover the header toggle, live tone, pending disable and prefilled label before focus.

Archive autosave: the wizard delegates toggle intent to MenuItemFormViewModel, which issues the existing store archive$/unarchive$ commands. Guard mode/id/busy/unchanged status, optimistically reflect archive state, rollback on failure and retain the rest of the draft. Subscribe within the editor lifecycle without invoking full save/completion navigation. The singleton store owns notifications, pending protection and canonical refresh. Verify both endpoints, pending guard, rollback/retry, invalid draft preservation and action-bar text.
