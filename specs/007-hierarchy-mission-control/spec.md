# 007 — Mission Control hierarchy

Requested 2026-10-29: make hierarchy management compact and easier to inspect/reorder.

- R1: Replace nested domain/placement/state accordions with a compact scope rail and one focused tree. Prefer an available navigation scope initially; preserve selection during refresh and safely fall back if it disappears.
- R2: Show reachable active destination counts, root counts, compact numbered sibling rows, clear child indentation and branch counts. Provide per-branch and expand/collapse-all controls.
- R3: Keep pointer handles and labeled keyboard sibling arrows. Keep one-based sort payloads and backend-owned resequencing; block duplicate commands and invalid cross-classification/descendant drops.
- R4: Use raw classification IDs for rendered/connected drop lists; exclude collapsed descendant lists from connectivity. Preserve DTOs and endpoints.
- R5: Keep refresh, progress/error recovery, and direct edit links for choosing a new parent. Existing data remains visible on failed writes/refreshes.
- R6: Use a viewport-bounded, keyboard-scrollable desktop tree and horizontally scrollable scope choices with document scrolling on narrow screens. Keep design-system tokens and host-mount-relative routes.
