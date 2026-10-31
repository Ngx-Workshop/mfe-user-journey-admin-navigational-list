# Plan

Reuse MenuStatisticsComponent as a compact three-column rail summary, embedded in the presentational MenuFiltersComponent. Pass canonical statistics, loading and pending from MenuList's store; bubble refresh back to its existing reload method. Remove the management-level statistics rendering/import.

Use the reference rail's public NgxPanel/NgxEntrance composition and viewport measurement approach with ResizeObserver, resize/scroll scheduling and destroy cleanup. Widen the desktop console to 280–320px for panel padding and recover the removed overview strip's height in the results region.

Constitution check: inline templates/styles, BEM, stateless presentation, existing scoped search/domain store, accessible labels and refresh pending guard. No transport or route changes. Preserve unrelated source edits, including the existing create-action outline treatment.

Destinations follow-up: compose the existing result tree through NgxPanel's public content/header/actions slots. Measure natural panel chrome to fit its body to the existing desktop result height; clean up resize observation on destruction. Remove the redundant native frame.
