# a timeline project

Pan and zoom through history, from the big bang to now. Pretty cool

## commands

```sh
npm run dev            # dev server
npm run build          # production build
npm run preview        # preview the build locally
npm run lint           # lint
npm run test           # tests
npm run build:report   # bundle size analysis (raw, gzip, brotli)
```

for canvas perf profiling, run `npm run preview` and open:

```
http://127.0.0.1:4173/?timelinePerf=1
```

`timelinePerf=verbose` adds more detail

## GitHub Pages routing

The production build emits entry files for `/timeline`, `/sets` and `/sets/new`,
so refreshing those routes works on GitHub Pages. Icon and manifest URLs are
root-relative so they also work under these directories. `404.html` contains the
app shell for dynamic set editor links; Pages still returns an HTTP 404 for these
unknown dynamic paths, though the client router can render the editor.

## structure

```
src/
  features/timeline-viewer/   # canvas viewer (rendering, scene, interaction)
  lib/
    core/        # types, viewport, axis math
    catalog/     # timeline set data and schemas
    rendering/   # canvas drawing and layout
    app/         # layout, sidebar, tooltip state
  components/    # ui components
  hooks/         # app-level hooks
  views/         # page views
```
