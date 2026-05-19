import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import type {
  Era,
  TimelineMarker,
  TimelineOverlayBand,
} from "@/lib/catalog/eras";
import { getEraChildOpacityTarget } from "@/lib/rendering/childLayers";
import { getVisibleTimelineMarkers } from "@/lib/rendering/queries/markers";
import { resolveTimelineOverlayTracks } from "@/lib/rendering/overlayTracks";
import {
  getViewportForRange,
  panByPixels,
  type TimelineViewport,
} from "@/lib/core/viewport";
import { useWheelZoomPan } from "../interactions/useWheelZoomPan";
import type { TimelineCanvasScene } from "../model/TimelineCanvas.types";
import { TimelineCanvasRenderSurface } from "../rendering/TimelineCanvasRenderSurface";

const PREVIEW_PAD = 20;
const NOOP = () => {};

type Props = {
  activeEra: Era;
  siblingEras: Era[];
  markers: TimelineMarker[];
  overlayBands: TimelineOverlayBand[];
  /** [startYear, endYear] used for initial fit and reset-to-fit. */
  initialRange: [number, number];
};

/**
 * Self-contained interactive timeline preview with local viewport state.
 * Supports wheel zoom, trackpad zoom, horizontal pan, and reset-to-fit.
 *
 * Reuses `TimelineCanvasRenderSurface` (and thus the real draw path) but
 * carries no global stores, no sidebar state, and no drilldown hierarchy.
 */
export function TimelineCanvasPreview({
  activeEra,
  siblingEras,
  markers,
  overlayBands,
  initialRange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [viewport, setViewport] = useState<TimelineViewport>(() =>
    getViewportForRange(initialRange[0], initialRange[1], 600, 0.08),
  );

  const hasInitializedRef = useRef(false);
  const dragRef = useRef<{ pointerId: number; lastX: number } | null>(null);
  const widthRef = useRef(size.width);
  widthRef.current = size.width;

  // --- Resize observer ---------------------------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fit to range once the container has a real size.
  useEffect(() => {
    if (size.width > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setViewport(
        getViewportForRange(initialRange[0], initialRange[1], size.width, 0.08),
      );
    }
  }, [size.width, initialRange]);

  // Re-fit when the range values change (document edits change the span).
  const prevRangeRef = useRef(initialRange);
  useEffect(() => {
    const prev = prevRangeRef.current;
    if (prev[0] === initialRange[0] && prev[1] === initialRange[1]) return;
    prevRangeRef.current = initialRange;
    if (size.width > 0) {
      setViewport(
        getViewportForRange(initialRange[0], initialRange[1], size.width, 0.08),
      );
    }
  }, [initialRange, size.width]);

  // --- Wheel zoom / trackpad pan -----------------------------------------
  useWheelZoomPan({
    surfaceRef: containerRef,
    pad: PREVIEW_PAD,
    width: size.width,
    onViewportChange: setViewport,
    onContinuousViewportChange: setViewport,
    onViewportGestureStart: NOOP,
    onViewportGestureEnd: NOOP,
    onInteractionStart: NOOP,
    recordVerboseInteractionEvent: NOOP,
    markViewportInteraction: NOOP,
  });

  // --- Pointer drag pan ---------------------------------------------------
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, lastX: event.clientX };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.lastX;
    dragRef.current = { ...drag, lastX: event.clientX };
    const innerW = Math.max(widthRef.current - PREVIEW_PAD * 2, 1);
    setViewport((current) => panByPixels(current, deltaX, innerW));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // --- Era child opacity map ---------------------------------------------
  // Compute which eras should show their children based on the current
  // viewport, so the preview is consistent with the full timeline without
  // needing a live animation system.
  const eraChildOpacityById = useMemo(() => {
    const map = new Map<string, number>();
    const visit = (eras: Era[]) => {
      for (const era of eras) {
        if (era.children?.length) {
          map.set(
            era.id,
            getEraChildOpacityTarget(
              era,
              activeEra.id,
              viewport,
              size.width,
              PREVIEW_PAD,
              false,
            ),
          );
          visit(era.children);
        }
      }
    };
    visit(siblingEras);
    return map;
  }, [activeEra.id, siblingEras, viewport, size.width]);

  // --- Scene derivation --------------------------------------------------
  const scene = useMemo<TimelineCanvasScene | null>(() => {
    if (size.width <= 0 || size.height <= 0) return null;
    const visibleMarkers = getVisibleTimelineMarkers(
      markers,
      viewport,
      size.width,
      PREVIEW_PAD,
    );
    const resolvedOverlayBands = resolveTimelineOverlayTracks(
      overlayBands,
      viewport,
      size.width,
      PREVIEW_PAD,
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    );
    return {
      width: size.width,
      height: size.height,
      viewport,
      activeEra,
      activeChain: [activeEra],
      siblingEras,
      parentEra: null,
      visibleMarkers,
      resolvedOverlayBands,
      overlayLaneCount: resolvedOverlayBands[0]?.laneCount ?? 0,
    };
  }, [
    activeEra,
    markers,
    overlayBands,
    siblingEras,
    size.height,
    size.width,
    viewport,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <TimelineCanvasRenderSurface
        eraChildOpacityById={eraChildOpacityById}
        pad={PREVIEW_PAD}
        scene={scene}
      />
    </div>
  );
}
