# Timeline

Interactive deep-time timeline built with React, TypeScript, Vite, and canvas.

## Commands

```sh
npm run dev
npm run build
npm run build:report
npm run lint
npm run preview
npm run test
```

## Performance Tracking

Use `npm run build:report` after performance-sensitive changes. It builds the
app and prints raw, gzip, and brotli sizes for initial and async chunks.

Optional CI-style budgets can be enabled with environment variables:

```sh
BUNDLE_INITIAL_GZIP_BUDGET_KB=180 npm run build:report
BUNDLE_TOTAL_GZIP_BUDGET_KB=250 npm run build:report
```

For runtime canvas profiling, run `npm run preview` and open the app with:

```text
http://127.0.0.1:4173/?timelinePerf=1
```

Then switch the query string as needed:

```text
?timelinePerf=1
?timelinePerf=verbose
```

`timelinePerf=1` logs slow frames and rolling draw summaries. `verbose` adds
interaction, scene publish, and label stability diagnostics. You can also set
`localStorage.timelinePerf` to `1` or `verbose`.

Recommended manual profiling loop:

1. Open DevTools console.
2. Load `http://127.0.0.1:4173/?timelinePerf=1`.
3. Pan, zoom, drill into eras, expand overlays, and test mobile-sized viewport.
4. Compare `avgTotalMs`, `slowFrames`, visible marker counts, overlay counts,
   and axis tick counts before and after changes.
5. Use Chrome Performance recordings for suspicious scenarios and correlate
   long tasks with the console frame summaries.

## Architecture Notes

The timeline viewer canvas lives under
`src/features/timeline-viewer/canvas`. Public imports should use
`@/features/timeline-viewer/canvas`; internal rendering, scene, interaction,
animation, UI, platform, and model concerns stay inside that feature boundary.
