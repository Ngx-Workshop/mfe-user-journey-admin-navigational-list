# Unplaced destination status

Show a persistent action-bar status patterned after the orchestrator dev-mode indicator: decorative light, emphasized count, singular/plural destination label and polite atomic live region. Use muted styling at zero and semantic warning color/glow above zero. Before the initial catalog load succeeds show an unknown value instead of claiming zero.

Count all active destinations unreachable from canonical hierarchy roots, including orphans and cycles; exclude archived records. Keep the count independent of workspace filters, available on catalog and routed create/edit pages, and reactive to successful catalog refreshes. Retain the last known count during refresh/failure. Preserve existing save notifications, projected actions and responsive action-bar height measurement.
