# 011 — Menu creation wizard

Requested 2026-10-30: use the orchestrator creation wizard pattern for the menu-item create route.

- R1: Provide a linear vertical wizard with Identity and access, Route and position, and Presentation steps.
- R2: Require valid name/domain/placement/state/role before continuing; require route/parent/sort validity before the final step. Create only from the final step with a valid form and ready/nonbusy store. Keep optional parent, tooltip/description and SVG inputs. New records use the existing active default; archive controls remain in edit/dialog forms.
- R3: Retain entries when navigating backwards and after failed creation. Parent choices and invalid-parent clearing follow the existing classification rules.
- R4: Submit through the existing typed form/store/DTO flow; prevent duplicates and retain pending navigation protection. Successful creation returns to the catalog within the host mount.
- R5: Match the reference's glass stepped panel, background, lazy step content and chevron footer actions. Keep edit and dialog forms unchanged in behavior and appearance.
- R6: Keep accessible Material step navigation and responsive layout. No new endpoint, URL verification requirement, federation or package contract changes.

Field-order revision: step one shows Menu Item Text → Domain / Role → Structural / State; step two Route Path → Parent Item / Position After; step three Tooltip → Navigation SVG Path / Header SVG Path → Description. Paired fields share a desktop row and stack on narrow screens.


Position selector revision: creation replaces numeric sort entry with an accessible Position After select beside Parent Item. None is the first option with numeric value 0. Remaining options are active direct children of the selected parent, in the current classification and sort order; root selection lists root siblings. Parent/classification changes reset to None. Selected children map to an insertion sort value between adjacent positions (or one greater than the last item) because creation does not resequence siblings. Panel heading reacts to name edits as “Create menu item: {Menu Item Text}”. Existing edit/dialog controls remain unchanged.
