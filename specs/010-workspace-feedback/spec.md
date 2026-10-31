# 010 — Sticky hierarchy, save feedback and repair panel

Requested 2026-10-29.

- R1: Keep each menu-workspace section header sticky inside the hierarchy scroll region; on mobile, pin below the action bar without obscuring content.
- R2: Add action-bar save feedback styled like the orchestrator: saving, confirmed saved and persistent error states, identifying the destination. Do not announce success before the write succeeds.
- R3: Put filtered Unplaced destinations in a separate design-system panel on the same desktop row as the hierarchy, with the hierarchy wider. Hide the repair panel when no unplaced records match. Preserve its edit/archive/copy actions.
- R4: Maintain truthful separate counts for hierarchy/archive results and unplaced results. Retain empty hierarchy guidance for unplaced-only searches.
- R5: Keep controls readable in narrow panels and stack panels on mobile. Preserve DTOs, endpoints, routes, canonical state and prior user edits.
