# Plan

Promote the existing unplaced projection to MenuStore so action bars can consume a canonical catalog-wide count without UI-state duplication. MenuWorkspaceViewModel filters the same records through workspace matches for the repair panel. Pass nullable count inputs from management and routed editor wrappers to the presentational action bar; null means the first catalog load has not succeeded.

Reuse the orchestrator indicator structure and theme tokens in inline BEM styles. Keep persistence and federation contracts unchanged. Verify rendered count and live-region semantics, singular/plural/zero styling, archived exclusion, orphan/cycle detection, filter independence and retained count during errors. Run the browser suite, type/layout checks and isolated production build.
