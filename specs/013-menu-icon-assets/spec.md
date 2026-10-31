# 013 — Menu icon assets

Requested 2026-10-30.

- Structural header and navigation render Material icon names, Devicon class strings and image URLs for both top-level and child menu entries.
- Rename SVG-path labels to Navigation icon / Header icon. Preserve legacy navSvgPath/headerSvgPath DTO properties and existing text values.
- Each field supports manual entry and the published asset manager image gallery/upload picker. Only ready images with usable URLs can be selected.
- Cancel and failures retain form values; choosing an image affects only its target control and marks it dirty. Disabled forms block selection.
- Keep create/edit/dialog usage, responsive paired layout, Material accessibility, host asset source and federation identities.
