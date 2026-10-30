# Plan

Replace statistic panels with a native semantic dl strip. Keep source statistics projections unchanged and display the three lifecycle counts. Add a refresh icon with loading/pending guards. Compose the catalog as a 248px filter rail and flexible result region, bounded by the available viewport with a reasonable minimum for short screens.

Keep view-model behavior intact. Render compact item rows through the existing presentational component contract. Move the existing paginator to a persistent result footer; sorting stays in the header. Split classification selectors into a presentational child to keep filter-console responsibilities focused. Keep collapsed fields mounted to preserve their values.

Constitution check: inline views and BEM; public Material overrides and semantic Ngx tokens; keyboard scrolling and named action controls; tests remain in testing/app. All HTTP, DTO, route and federation contracts remain unchanged. Existing uncommitted migration and dependency work is preserved.
