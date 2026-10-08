# Development and verification

Use the committed package lock and `npm ci` when dependencies are absent. Start with `npm start` or the existing `npm run dev:bundle` watch/static-host workflow on port 4201. Avoid starting another server when that port already hosts the remote. The standalone app has no API proxy or Material theme; full visual/auth integration belongs to the admin shell.

Checks:

```sh
npm run check:layout
npm run typecheck
npx tsc -p tsconfig.spec.json --noEmit
npm run test:ci
npm run build
```

On macOS, set CHROME_BIN to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` if Chrome is not auto-detected. Tests use the Angular Karma builder and HttpTestingController, with no backend writes. Test discovery explicitly selects `testing/**/*.spec.ts` relative to Angular's source root. Templates remain inline in TypeScript and use SCSS. The installed versions and federation sharing require Angular/Material/CDK 21.1.0. Restart an existing bundle watcher after changes to angular.json or webpack.config.js; an already running watcher may retain its previous build configuration. Use `npm run build -- --output-path=/tmp/navigation-verified-build` for isolated verification while another process writes dist.

## Known integration limits

The legacy remote route and federation name remain for compatibility. Source compilation and isolated tests do not establish authenticated create/edit/archive/delete/reorder against the running service. Do not perform destructive writes on existing navigation records merely for smoke testing. Root-parent clearing is a two-request operation; see architecture.md. Inherited delete intent exists but its card button remains hidden, preserving the existing UI. Orphans/cyclic records without reachable roots are excluded from the hierarchy, while still visible in the list for repair.

See the active feature handoff for actual verification results and browser observations.
