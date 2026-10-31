# 009 — Filter console rail

Requested 2026-10-29: move catalog statistics into the Filter console and match the orchestrator's MfeRemoteRail panel.

- Use the shared chamfered, solid NgxPanel with eyebrow/heading and fade entrance, matching the reference rail.
- Show search followed by compact Total/Active/Archived summary cells inside the console. Counts remain canonical catalog totals while results are filtered; unknown values use placeholders.
- Keep refresh/loading/pending behavior and existing filter interactions. Remove the separate overview strip above the workspace.
- Measure remaining viewport space like the reference so the rail body can scroll while panel chrome remains visible. Retain mobile filter disclosure.
- Preserve service/store ownership, API/DTO/routes and federation contracts.

Follow-up: wrap Destinations in the same stepped/grid NgxPanel used by MfeRemoteCard, with heading motion and public header/footer slots. Preserve bounded desktop row scrolling and natural mobile flow.
