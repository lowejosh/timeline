import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import { ChevronLeft } from "lucide-react";
import type {
  Era,
  TimelineMarker,
  TimelineOverlayBand,
} from "@/lib/catalog/eras";
import { findEraById } from "@/lib/catalog/eras";
import { getEraChildOpacityTarget } from "@/lib/rendering/childLayers";
import { getVisibleTimelineMarkers } from "@/lib/rendering/queries/markers";
import { resolveTimelineOverlayTracks } from "@/lib/rendering/overlayTracks";
import {
  getViewportForRange,
  panByPixels,
  type TimelineViewport,
} from "@/lib/core/viewport";
import { useWheelZoomPan } from "../interactions/useWheelZoomPan";
import { TimelineTooltip } from "../components/TimelineTooltip";
import type { TimelineCanvasScene } from "../model/TimelineCanvas.types";
import { TimelineCanvasRenderSurface } from "../rendering/TimelineCanvasRenderSurface";
import { TOOLTIP_EXIT_DURATION_MS } from "@/lib/rendering/canvas/constants";
import type {
  HoverRegion,
  OverlayInteractionRegion,
} from "@/lib/rendering/canvas/draw/drawContext";
import type {
  HoveredTooltipState,
  RenderedTooltipState,
} from "@/lib/rendering/canvas/tooltip";
import { isEquivalentHoveredTooltip } from "@/lib/rendering/canvas/tooltip";

const PREVIEW_PAD = 20;
const NOOP = () => {};

/** Synthetic home era ID used when no era is drilled into. */
const PREVIEW_HOME_ERA_ID = "preview-home";

type Props = {
  /** Top-level era families for this set. The preview manages its own drill state. */
  eras: Era[];
  markers: TimelineMarker[];
  overlayBands: TimelineOverlayBand[];
  /** [startYear, endYear] used for initial fit and reset-to-fit. */
  initialRange: [number, number];
};

/**
 * Self-contained interactive timeline preview with local viewport state.
 * Supports wheel zoom, trackpad zoom, horizontal pan, and era drill-down.
 *
 * Reuses `TimelineCanvasRenderSurface` (and thus the real draw path) but
 * carries no global stores, no sidebar state, and no external navigation.
 */
export function TimelineCanvasPreview({
  eras,
  markers,
  overlayBands,
  initialRange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipInteractiveContentRef = useRef<HTMLDivElement | null>(null);
  const hoveredTooltipRef = useRef<HoveredTooltipState | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [viewport, setViewport] = useState<TimelineViewport>(() =>
    getViewportForRange(initialRange[0], initialRange[1], 600, 0.08),
  );
  const [lastPointer, setLastPointer] = useState<{
    pointerType: string;
    x: number;
    y: number;
  } | null>(null);
  const [renderedTooltip, setRenderedTooltip] =
    useState<RenderedTooltipState | null>(null);

  const hasInitializedRef = useRef(false);
  const dragRef = useRef<{ pointerId: number; lastX: number } | null>(null);
  const pointerDownRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(null);
  const tooltipEnterFrameRef = useRef(0);
  const tooltipExitTimeoutRef = useRef<number | null>(null);
  const widthRef = useRef(size.width);
  widthRef.current = size.width;
  const overlayInteractionRegionsRef = useRef<OverlayInteractionRegion[]>([]);
  const hoverRegionsRef = useRef<HoverRegion[]>([]);
  const [expandedOverlayIds, setExpandedOverlayIds] = useState<string[]>([]);

  // --- Era drill-down state ----------------------------------------------
  // Track the drilled-into era by ID so it survives document re-compiles
  // (same era ID = stays drilled, removed era = falls back to home).
  const [activeEraId, setActiveEraId] = useState<string | null>(null);

  // Synthetic home era that acts as the invisible parent of all era families.
  // Falls back to initialRange when eras is empty to avoid Infinity spans.
  const homeEra = useMemo<Era>(
    () => ({
      id: PREVIEW_HOME_ERA_ID,
      name: "Overview",
      startYear:
        eras.length > 0
          ? eras.reduce((m, e) => Math.min(m, e.startYear), Infinity)
          : initialRange[0],
      endYear:
        eras.length > 0
          ? eras.reduce((m, e) => Math.max(m, e.endYear), -Infinity)
          : initialRange[1],
      color: "rgba(0,0,0,0)",
      children: eras,
    }),
    [eras, initialRange],
  );

  // Resolve the active era from the current era tree.
  const activeEra = useMemo<Era>(() => {
    if (!activeEraId) return homeEra;
    for (const era of eras) {
      const found = era.id === activeEraId ? era : findEraById(era, activeEraId);
      if (found) return found;
    }
    return homeEra; // era was removed by a document edit
  }, [activeEraId, eras, homeEra]);

  const isAtHome = activeEra.id === PREVIEW_HOME_ERA_ID;
  const siblingEras = isAtHome ? eras : (activeEra.children ?? []);

  const commitHoveredTooltip = useCallback(
    (nextTooltip: HoveredTooltipState | null) => {
      const currentTooltip = hoveredTooltipRef.current;

      if (isEquivalentHoveredTooltip(currentTooltip, nextTooltip)) {
        if (currentTooltip && nextTooltip && currentTooltip !== nextTooltip) {
          hoveredTooltipRef.current = currentTooltip;
        }

        return;
      }

      if (tooltipExitTimeoutRef.current !== null) {
        window.clearTimeout(tooltipExitTimeoutRef.current);
        tooltipExitTimeoutRef.current = null;
      }

      if (tooltipEnterFrameRef.current) {
        cancelAnimationFrame(tooltipEnterFrameRef.current);
        tooltipEnterFrameRef.current = 0;
      }

      hoveredTooltipRef.current = nextTooltip;

      if (!nextTooltip) {
        setRenderedTooltip((current) =>
          current
            ? {
                ...current,
                phase: "exiting",
              }
            : null,
        );

        tooltipExitTimeoutRef.current = window.setTimeout(() => {
          tooltipExitTimeoutRef.current = null;
          setRenderedTooltip((current) =>
            current?.phase === "exiting" ? null : current,
          );
        }, TOOLTIP_EXIT_DURATION_MS);

        return;
      }

      setRenderedTooltip({
        phase: "entering",
        tooltipState: nextTooltip,
      });

      tooltipEnterFrameRef.current = requestAnimationFrame(() => {
        tooltipEnterFrameRef.current = 0;
        setRenderedTooltip((current) => {
          if (!current) {
            return current;
          }

          return isEquivalentHoveredTooltip(current.tooltipState, nextTooltip)
            ? {
                phase: "present",
                tooltipState: nextTooltip,
              }
            : current;
        });
      });
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (tooltipExitTimeoutRef.current !== null) {
        window.clearTimeout(tooltipExitTimeoutRef.current);
      }

      if (tooltipEnterFrameRef.current) {
        cancelAnimationFrame(tooltipEnterFrameRef.current);
      }
    };
  }, []);

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
    pointerDownRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
    setLastPointer(null);
    commitHoveredTooltip(null);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      const rect = event.currentTarget.getBoundingClientRect();

      setLastPointer({
        pointerType: event.pointerType,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      return;
    }
    const deltaX = event.clientX - drag.lastX;
    dragRef.current = { ...drag, lastX: event.clientX };
    const innerW = Math.max(widthRef.current - PREVIEW_PAD * 2, 1);
    setLastPointer(null);
    commitHoveredTooltip(null);
    setViewport((current) => panByPixels(current, deltaX, innerW));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // Detect a click: pointer-down + up with minimal movement (≤5px).
    const down = pointerDownRef.current;
    const isClick =
      down !== null &&
      down.pointerId === event.pointerId &&
      Math.abs(event.clientX - down.startX) <= 5 &&
      Math.abs(event.clientY - down.startY) <= 5;
    pointerDownRef.current = null;
    if (!isClick) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Hit-test overlay interaction regions.
    for (const region of overlayInteractionRegionsRef.current) {
      if (region.role !== "parent") continue;
      if (x >= region.left && x <= region.right && y >= region.top && y <= region.bottom) {
        setExpandedOverlayIds((current) =>
          current.includes(region.id)
            ? current.filter((id) => id !== region.id)
            : [...current, region.id],
        );
        break;
      }
    }

    // Hit-test era hover regions for drill-down (eras with children only).
    for (const region of hoverRegionsRef.current) {
      if (region.tooltip.kind !== "era") continue;
      if (x >= region.left && x <= region.right && y >= region.top && y <= region.bottom) {
        // Find the clicked era in the currently-displayed tree.
        const eraId = region.id;
        const clickedEra =
          siblingEras.find((e) => e.id === eraId) ??
          siblingEras.reduce<Era | undefined>(
            (found, e) => found ?? findEraById(e, eraId),
            undefined,
          );
        if (clickedEra && (clickedEra.children?.length ?? 0) > 0) {
          setActiveEraId(clickedEra.id);
          setViewport(
            getViewportForRange(
              clickedEra.startYear,
              clickedEra.endYear,
              widthRef.current,
              0.08,
            ),
          );
        }
        break;
      }
    }
  };

  const handlePointerLeave = () => {
    dragRef.current = null;
    setLastPointer(null);
    commitHoveredTooltip(null);
  };

  // --- Era child opacity map ---------------------------------------------
  // Compute which eras should show their children based on the current
  // viewport, so the preview is consistent with the full timeline without
  // needing a live animation system.
  const eraChildOpacityById = useMemo(() => {
    const map = new Map<string, number>();
    const visit = (erasToVisit: Era[]) => {
      for (const era of erasToVisit) {
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
      onPointerLeave={handlePointerLeave}
    >
      {!isAtHome ? (
        <button
          className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[0.7rem] font-medium text-primary shadow-sm backdrop-blur-sm transition-opacity hover:bg-background"
          onClick={() => {
            setActiveEraId(null);
            setViewport(
              getViewportForRange(initialRange[0], initialRange[1], size.width, 0.08),
            );
          }}
          type="button"
        >
          <ChevronLeft className="size-3" />
          Overview
        </button>
      ) : null}
      <TimelineCanvasRenderSurface
        commitHoveredTooltip={commitHoveredTooltip}
        eraChildOpacityById={eraChildOpacityById}
        expandedOverlayIds={expandedOverlayIds}
        hoverRegionsRef={hoverRegionsRef}
        overlayInteractionRegionsRef={overlayInteractionRegionsRef}
        hoveredTooltipRef={hoveredTooltipRef}
        lastPointer={lastPointer}
        pad={PREVIEW_PAD}
        scene={scene}
        shellElement={containerRef.current}
        tooltipInteractiveContentElement={tooltipInteractiveContentRef.current}
      />
      {renderedTooltip ? (
        <TimelineTooltip
          height={size.height}
          interactiveContentRef={tooltipInteractiveContentRef}
          renderedTooltip={renderedTooltip}
          width={size.width}
        />
      ) : null}
    </div>
  );
}
