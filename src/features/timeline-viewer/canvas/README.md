# Timeline Viewer Canvas

This feature owns the interactive timeline canvas. Keep public imports pointed at
`@/features/timeline-viewer/canvas`; internal files should stay behind this
feature boundary unless they are generic enough to graduate into `src/lib`.

## Boundaries

- `TimelineCanvas.tsx` is the React host and coordinator. It owns DOM refs,
  feature hooks, and the public component contract.
- `scene/` derives render-ready scene inputs from app state and viewport state.
- `rendering/` performs frame assembly and canvas drawing. It reads refs at draw
  time and should avoid React state.
- `interactions/` owns wheel, pointer-adjacent, edge rail, touch, and other
  gesture-specific behavior.
- `animation/` owns imperative animation refs and schedules redraws.
- `ui/` contains React DOM overlays that sit around the canvas, such as tooltip
  and edge rail affordances.
- `platform/` contains DOM/canvas integration details.
- `model/` contains feature-local types shared by the canvas internals.

## Performance Rule

Per-frame state belongs in refs, animation stores, or renderer inputs. React
state is for user-visible UI state and durable app state, not frame bookkeeping.
