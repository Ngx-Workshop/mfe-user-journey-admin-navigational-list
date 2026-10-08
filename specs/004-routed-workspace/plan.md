# Plan

- Scope search/results state to the management workspace; share it with the grid and results-toolbar paginator.
- Replace tabs with statistics/list composition and route links.
- Compose child pages under App's header/outlet; support standalone routing and preserve direct Component rendering.
- Adapt the existing form view model for page navigation while retaining dialog compatibility. Resolve direct edit IDs after the singleton store loads and recreate forms when the route ID changes.
- Cover pagination/filter integration, routed hierarchy, direct create/edit, missing records, failed save recovery and saving navigation guard. Run layout, compilation, tests and production build.
