# Plan

Review orchestrator catalog, form sections, dialogs and theme integration against installed 21.0.8 public APIs. Keep the navigation-specific catalog layout. Use NgxPanel for filter/form/statistic/domain sections, NgxButton for text actions, NgxStatus for card lifecycle labels, and semantic tokens for owned surfaces. Retain Material inputs/selects/checkboxes/pagination/accordions/icon buttons. Replace the particle hero with a compact action-bar heading, as in the orchestrator. Preserve existing state and persistence boundaries.

Constitution check: inline HTML/SCSS and BEM remain; tests stay under testing/app. No HTTP, DTO, service authorization or federation contract changes. Existing cohesive filter/tree/card components exceed the soft line target. Standalone stylesheet is a fallback; host supplies shared global assets. No deployment or publication.
