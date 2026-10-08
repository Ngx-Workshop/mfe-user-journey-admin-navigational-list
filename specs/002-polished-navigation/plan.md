# UX implementation plan

Observed host screenshot: filters occupy most of the first viewport, role dropdown has invalid boolean values, cards emphasize raw IDs, copy affordance has no behavior, and empty search prompts creating a first item.

1. Refine management header/action/error layout and responsive tab content.
2. Rebuild compact filters with defaults, role options, filter count and reset state.
3. Add sorted, paginated results and focused card metadata/status/actions; route copy through view model, keeping presentation components stateless.
4. Improve empty/loading/saving feedback, dialog layout and hierarchy affordances.
5. Add interaction regressions, inspect the production build with local synthetic records/theme at desktop and mobile sizes, update handoff/docs.

## Constitution Check
Feature remains inside navigation; HTTP/store unchanged. Page-local sorting/paging and clipboard feedback belong to UI/view-model layers. Preserve existing hidden delete action rather than exposing destructive behavior as a cosmetic change.
