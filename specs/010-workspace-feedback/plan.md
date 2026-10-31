# Plan

MenuStore owns a root-scoped save-notification signal for every mutation, with labels from the item/create/update data. Set saving on accepted commands, saved only on successful responses and error on failures. Clear success after three seconds, cancel old timers on newer commands and clean up on store destruction. Existing form/action retry mechanisms remain the place to retry; no automatic replay or generic retry of a potentially stale form payload is introduced.

The presentational action bar accepts the notification input, uses a persistent polite atomic live region and semantic status colors. Bind it from catalog and form pages. Measure the action bar height to keep rail offsets, available workspace height and mobile sticky headings correct when messages wrap.

Separate Unplaced into a presentational NgxPanel on a 2:1 results grid. Share public panel-body measurement logic with the hierarchy, retaining independent scroll regions. Use container-responsive row/card layouts for narrow columns and single-column document flow below 900px. Sticky group headers remain scoped to each group.

Constitution check: inline HTML/SCSS, BEM, scoped presentation/root domain state, no component HTTP, accurate pending/error states and keyboard controls. Preserve user-commented status markup and existing outlined create action. No deployment or real-record persistence tests.
