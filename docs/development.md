# Development and verification

Use the committed package lock and `npm ci` when dependencies are absent. Start with `npm start` or the existing `npm run dev:bundle` watch/static-host workflow on port 4201. Avoid starting another server when that port already hosts the remote. The standalone app has no API proxy or Material theme; full visual/auth integration belongs to the admin shell.

Checks:

```sh
npm run check:layout
npm run typecheck
npx tsc -p tsconfig.spec.json --noEmit
npm run test:ci
npm run test:bundle-watch
npm run build
```

On macOS, set CHROME_BIN to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` if Chrome is not auto-detected. Tests use the Angular Karma builder and HttpTestingController, with no backend writes. Test discovery explicitly selects `testing/**/*.spec.ts` relative to Angular's source root. Templates remain inline in TypeScript and use SCSS. The installed versions and federation sharing require Angular/Material/CDK 21.1.0. Restart an existing bundle watcher after changes to angular.json or webpack.config.js; an already running watcher may retain its previous build configuration. Use `npm run build -- --output-path=/tmp/navigation-verified-build` for isolated verification while another process writes dist.

## Known integration limits

The legacy remote route and federation name remain for compatibility. Source compilation and isolated tests do not establish authenticated create/edit/archive/delete/reorder against the running service. Do not perform destructive writes on existing navigation records merely for smoke testing. Root-parent clearing is a two-request operation; see architecture.md. Inherited delete intent exists but its card button remains hidden, preserving the existing UI. Orphans/cyclic records without reachable roots are excluded from the hierarchy, while still visible in the list for repair.

See the active feature handoff for actual verification results and browser observations.

## Production watch regression

`webpack.prod.config.js` disables Webpack's module cache for production builds. With the installed federation/webpack toolchain, a cached incremental compilation can omit RxJS Subscriber exports while retaining OperatorSubscriber subclasses, producing `Class extends value undefined`. Fresh compiler processes work; restarting the static HTTP server itself is not the fix. Common-chunk extraction alone did not prevent the incremental failure. Minification, tree shaking, hashed assets and federation sharing remain enabled. The tradeoff is rebuilding module code rather than reusing Webpack's cached code, so rebuilds can take longer.

`npm run test:bundle-watch` starts an isolated production watcher, checks the initial build and two incremental builds, and evaluates the emitted Component/Routes factories in fresh VM contexts. It touches source timestamps without changing their contents and cleans up its watcher/output. This checks real generated factories, including their inheritance dependencies; it does not substitute for browser/host rendering or authenticated service tests.

After changing webpack configuration, restart the existing watcher once to load it. Ordinary source edits then rebuild without restarting. The inherited shell command backgrounds its watcher; if stopping the static server leaves an old watcher alive, stop that watcher before starting another process against the same dist directory.
