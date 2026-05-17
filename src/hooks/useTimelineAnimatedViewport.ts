import { useMemo } from "react";

import { useTimelineViewportStore } from "@/stores/timelineViewport.store";

export function useTimelineAnimatedViewport() {
  const viewport = useTimelineViewportStore((state) => state.viewport);
  const isAnimating = useTimelineViewportStore((state) => state.isAnimating);
  const setViewportWidth = useTimelineViewportStore(
    (state) => state.setViewportWidth,
  );
  const cancelTransientMotion = useTimelineViewportStore(
    (state) => state.cancelTransientMotion,
  );
  const updateViewport = useTimelineViewportStore(
    (state) => state.updateViewport,
  );
  const updateViewportDirect = useTimelineViewportStore(
    (state) => state.updateViewportDirect,
  );
  const animateToRange = useTimelineViewportStore(
    (state) => state.animateToRange,
  );
  const animateToViewport = useTimelineViewportStore(
    (state) => state.animateToViewport,
  );
  const animateZoom = useTimelineViewportStore((state) => state.animateZoom);
  const recordDragSample = useTimelineViewportStore(
    (state) => state.recordDragSample,
  );
  const releaseMomentum = useTimelineViewportStore(
    (state) => state.releaseMomentum,
  );

  const animated = useMemo(
    () => ({
      viewport,
      isAnimating,
      cancelTransientMotion,
      updateViewport,
      updateViewportDirect,
      animateToRange,
      animateToViewport,
      animateZoom,
      recordDragSample,
      releaseMomentum,
    }),
    [
      animateToRange,
      animateToViewport,
      animateZoom,
      cancelTransientMotion,
      isAnimating,
      recordDragSample,
      releaseMomentum,
      updateViewport,
      updateViewportDirect,
      viewport,
    ],
  );

  return {
    animated,
    setViewportWidth,
  };
}
