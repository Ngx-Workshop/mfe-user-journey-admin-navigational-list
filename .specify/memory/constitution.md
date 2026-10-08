# Constitution — Navigational list administrator

Version 1.0.0 · Ratified 2026-10-07. Adapted from the document-editor workflow; feature history is intentionally local.

1. **Quality and MVVM:** Strict TypeScript/templates, standalone Angular, OnPush, signals and RxJS. HTTP services own transport only. A root singleton store owns canonical menu data, load state and mutation orchestration. Scoped view models own filter/form/UI state. Components orchestrate views or present inputs and emit intent; nested orchestration is valid.
2. **Focused views:** Inline HTML and SCSS in component TypeScript. Aim for roughly 230 lines, allowing justified cohesive exceptions. Use BEM for application-owned classes. Split meaningful responsibilities rather than hiding view code.
3. **Truthful UX:** Loading, empty, failure and saving states must be distinct. Retain data and edits on failures, block duplicate commands and refresh all dependent views after successful writes.
4. **Accessibility:** Label interactive controls, preserve keyboard interaction and responsive layout. Provide ordering controls in addition to pointer drag-and-drop.
5. **Compatibility:** Preserve default App, named Routes, remoteEntry.js, ./Component and ./Routes and legacy federation name. Use published navigational-list DTOs and /api/navigational-list. The server owns authorization. Reorder changes parent and position within a classification; do not invent classification changes unsupported by the sort contract.
6. **Evidence and workflow:** Keep spec/plan/tasks/handoff for substantive changes. Test state boundaries, failure recovery, payloads and affected views. Record unavailable integration separately. Amend rules intentionally with date/version and review dependent docs/templates.
