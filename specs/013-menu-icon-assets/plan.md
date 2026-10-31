# Plan

Extend the existing standalone MenuDevicon renderer and use equivalent local rendering in the header; avoid a shared-library publication for this change. Infer image URLs from web/root/relative paths or image filenames, Devicons from class syntax, otherwise render Material ligatures. Keep images decorative because menu links carry labels. Project through Material button/menu icon slots.

Reuse @tmdjr/ngx-asset-manager 21.1.0 in a dedicated Material picker dialog with all-folder image browsing and root upload. Preserve manual text entry and legacy DTO names. Share the asset package singleton with the admin shell so its authenticated asset data source remains available; provide the default source only in standalone bootstrap. No new API transport or domain state. Picker subscriptions and open dialog clean up with the parent view.

Verify renderer transitions and dropdown projection, real picker selection/upload outputs, cancellation/disabled/unusable assets, existing form flow, typechecks and isolated builds. Do not write to a live catalog or upload live assets for verification.
