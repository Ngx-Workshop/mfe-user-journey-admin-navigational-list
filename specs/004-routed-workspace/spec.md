# Routed navigation workspace

Status: Implemented; local verification complete, authenticated host verification unavailable.

The list workspace displays statistics above menu items without tabs. Its sticky action bar contains Manage Hierarchy and Create Menu Item. Pagination sits beside Sort by in the results toolbar, which sticks at `top: 128px` with an opaque surface background. Filtering/sorting/page-size changes reset pagination; refreshes with equivalent IDs preserve the page.

Hierarchy, create and edit use separate routes under the remote mount: `hierarchy`, `create`, `edit/:id`. Direct edit loads canonical records, distinguishes loading/load failure/missing records and populates the selected item. Failed saves retain edits; successful saves and cancel return to the list. Navigation during a write is blocked. Keep the legacy `hello-world` URL as a redirect and preserve federation exports and DTOs.
