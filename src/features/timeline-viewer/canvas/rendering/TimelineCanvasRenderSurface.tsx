import { useEffect, useRef, type MutableRefObject } from "react";

import type { Era } from "@/lib/catalog/eras";
import { createTimelinePerfStats, createTimelineVerboseStats } from "@/lib/rendering/canvas/perf";
import {
  DEFAULT_TIMELINE_THEME,
  readTimelineCanvasTheme,
} from "@/lib/rendering/canvas/theme";
import type { HoverRegion, OverlayInteractionRegion } from "@/lib/rendering/canvas/draw/drawContext";
import type { PrimordialDetailStripSegment } from "@/lib/rendering/canvas/primordial";
import type { AnimatedAxisTickState } from "@/lib/rendering/animation/axisTickState";
import type { MarkerPriorityBoostState } from "@/lib/rendering/animation/markerPriorityBoost";
import type { AnimatedOverlayBandState } from "@/lib/rendering/animation/overlayBand";
import { getOverlayLaneY, getTimelineLayout } from "@/lib/rendering/canvas/overlayLayout";
import type { AnimatedEraChildState } from "../animation/useEraChildAnimation";
import { useCanvasBackingStore } from "../platform/useCanvasBackingStore";
import { drawTimelineCanvasFrame } from "./drawTimelineCanvasFrame";
import type { TimelineCanvasScene } from "../model/TimelineCanvas.types";
import {
  isEquivalentHoveredTooltip,
  type HoveredTooltipState,
} from "@/lib/rendering/canvas/tooltip";

type Props = {
  scene: TimelineCanvasScene | null;
  pad: number;
  /**
   * Optional override for era child visibility. When provided, the render
   * surface uses these opacity values instead of an empty animation map, so
   * child eras are visible at the right zoom levels without a live animation
   * system.
   */
  eraChildOpacityById?: ReadonlyMap<string, number>;
  /** Overlay IDs that should show their disclosure indicator as expanded. */
  expandedOverlayIds?: string[];
  /** When provided, the draw populates this with clickable overlay regions. */
  overlayInteractionRegionsRef?: MutableRefObject<OverlayInteractionRegion[]>;
  /** When provided, populated with the era/marker/overlay hover regions after each draw. */
  hoverRegionsRef?: MutableRefObject<HoverRegion[]>;
  commitHoveredTooltip?: (tooltip: HoveredTooltipState | null) => void;
  hoveredTooltipRef?: MutableRefObject<HoveredTooltipState | null>;
  lastPointer?: {
    pointerType: string;
    x: number;
    y: number;
  } | null;
  shellElement?: HTMLDivElement | null;
  tooltipInteractiveContentElement?: HTMLDivElement | null;
};

/**
 * Lightweight shared render surface. Owns the <canvas> element and the draw
 * loop, but carries no interaction state, no tooltip logic, and no global
 * store dependencies. Redraws whenever `scene` or `pad` change.
 *
 * Use `TimelineCanvasPreview` for a self-contained preview with viewport
 * state and pan/zoom gestures.
 */
export function TimelineCanvasRenderSurface({
  commitHoveredTooltip,
  eraChildOpacityById,
  expandedOverlayIds,
  overlayInteractionRegionsRef: externalOverlayInteractionRegionsRef,
  hoverRegionsRef: externalHoverRegionsRef,
  hoveredTooltipRef: externalHoveredTooltipRef,
  lastPointer,
  pad,
  scene,
  shellElement,
  tooltipInteractiveContentElement,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scene and pad kept in refs so the draw callback never captures stale values.
  const sceneRef = useRef(scene);
  const padRef = useRef(pad);
  const eraChildOpacityRef = useRef(eraChildOpacityById);
  const themeRef = useRef(DEFAULT_TIMELINE_THEME);

  // Stable perf placeholders — preview never measures perf.
  const perfStatsRef = useRef(createTimelinePerfStats());
  const verbosePerfStatsRef = useRef(createTimelineVerboseStats());
  const internalHoveredTooltipRef = useRef<HoveredTooltipState | null>(null);
  const hoveredTooltipRef =
    externalHoveredTooltipRef ?? internalHoveredTooltipRef;
  const lastPointerRef = useRef(lastPointer ?? null);
  const shellElementRef = useRef(shellElement);
  const tooltipInteractiveContentElementRef = useRef(
    tooltipInteractiveContentElement,
  );

  // --- Animation state refs (empty — preview renders statically) ----------
  const axisTickAnimationRef = useRef<Map<string, AnimatedAxisTickState>>(new Map());
  const eraChildAnimationRef = useRef<Map<string, AnimatedEraChildState>>(new Map());
  const expandedOverlayProgressByIdRef = useRef<Map<string, number>>(new Map());
  const internalHoverRegionsRef = useRef<HoverRegion[]>([]);
  const hoverRegionsRef = externalHoverRegionsRef ?? internalHoverRegionsRef;
  const interactiveChildErasRef = useRef<Era[]>([]);
  const markerPriorityBoostRef = useRef<Map<string, MarkerPriorityBoostState>>(new Map());
  const overlayBandAnimationRef = useRef<Map<string, AnimatedOverlayBandState>>(new Map());
  const internalOverlayInteractionRegionsRef = useRef<OverlayInteractionRegion[]>([]);
  const overlayInteractionRegionsRef =
    externalOverlayInteractionRegionsRef ?? internalOverlayInteractionRegionsRef;
  const expandedOverlayIdsRef = useRef(expandedOverlayIds ?? []);
  const preferredAxisLabelStepRef = useRef<number | undefined>(undefined);
  const primordialDetailStripAnimationRef = useRef<{
    opacity: number;
    target: number;
    lastTime: number;
    segments: PrimordialDetailStripSegment[];
  }>({ opacity: 0, target: 0, lastTime: 0, segments: [] });
  const renderedExpandedOverlayIdsRef = useRef<string[]>([]);
  // -------------------------------------------------------------------------

  const width = scene?.width ?? 0;
  const height = scene?.height ?? 0;

  useCanvasBackingStore(canvasRef, width, height);

  // Stable draw function that reads all values from refs.
  const drawRef = useRef<() => void>(() => {});
  drawRef.current = () => {
    // Sync marker priority boost from current hover state (1-frame lag is imperceptible).
    const hoveredMarkerId =
      hoveredTooltipRef.current?.tooltip.kind === "marker"
        ? hoveredTooltipRef.current.id
        : null;
    const boostMap = markerPriorityBoostRef.current;
    boostMap.clear();
    if (hoveredMarkerId) {
      boostMap.set(hoveredMarkerId, { current: 1, target: 1 });
    }

    // Sync disclosure indicator state from expandedOverlayIds prop.
    const expandedIds = expandedOverlayIdsRef.current;
    const progressMap = expandedOverlayProgressByIdRef.current;
    progressMap.clear();
    for (const id of expandedIds) {
      progressMap.set(id, 1);
    }
    // Sync rendered expanded overlays so detail panels (with sub-bands) draw.
    renderedExpandedOverlayIdsRef.current = expandedIds;

    // Sync eraChildAnimationRef from the optional opacity override.
    const opacityMap = eraChildOpacityRef.current;
    if (opacityMap) {
      const animMap = eraChildAnimationRef.current;
      animMap.clear();
      for (const [id, opacity] of opacityMap) {
        animMap.set(id, {
          current: opacity,
          from: opacity,
          target: opacity,
          startTime: 0,
          duration: 0,
        });
      }
    }

    const scene = sceneRef.current;

    // Populate overlayBandAnimationRef so overlay bands render at full opacity.
    const overlayMap = overlayBandAnimationRef.current;
    overlayMap.clear();
    if (scene) {
      const layout = getTimelineLayout(scene.height, scene.overlayLaneCount, 0, {
        reserveAxisDateRow: true,
        overviewReservedHeight: 0,
        expandedExtraHeight: 0,
      });
      for (const overlay of scene.resolvedOverlayBands) {
        const y = getOverlayLaneY(layout, overlay.laneIndex);
        overlayMap.set(overlay.band.id, {
          overlay,
          currentOpacity: 1,
          targetOpacity: 1,
          currentY: y,
          targetY: y,
        });
      }
    }

    const resolveHoveredTooltipForCanvasDraw = (
      x: number,
      y: number,
      pointerType: string,
    ) => {
      if (pointerType !== "mouse" && pointerType !== "pen") {
        return null;
      }

      const previousTooltip = hoveredTooltipRef.current;
      let selectedRegion: HoverRegion | null = null;
      let selectedKindPriority = Number.POSITIVE_INFINITY;
      let selectedDistance = Number.POSITIVE_INFINITY;
      let selectedBias = Number.POSITIVE_INFINITY;

      for (const region of hoverRegionsRef.current) {
        if (
          x < region.left ||
          x > region.right ||
          y < region.top ||
          y > region.bottom
        ) {
          continue;
        }

        const kindPriority = region.tooltip.kind === "marker" ? 0 : 1;
        const distance = Math.hypot(x - region.anchorX, y - region.anchorY);
        const currentBias = previousTooltip?.id === region.id ? -0.25 : 0;
        const isBetter =
          kindPriority < selectedKindPriority ||
          (kindPriority === selectedKindPriority &&
            (distance < selectedDistance - 0.001 ||
              (Math.abs(distance - selectedDistance) <= 0.001 &&
                currentBias < selectedBias)));

        if (isBetter) {
          selectedRegion = region;
          selectedKindPriority = kindPriority;
          selectedDistance = distance;
          selectedBias = currentBias;
        }
      }

      if (!selectedRegion) {
        return null;
      }

      const resolvedTooltip = {
        id: selectedRegion.id,
        anchorX:
          selectedRegion.anchorMode === "follow-x" ? x : selectedRegion.anchorX,
        anchorY: selectedRegion.anchorY,
        placement: selectedRegion.placement,
        tooltip: selectedRegion.tooltip,
      } satisfies HoveredTooltipState;

      return isEquivalentHoveredTooltip(previousTooltip, resolvedTooltip)
        ? previousTooltip
        : resolvedTooltip;
    };

    drawTimelineCanvasFrame({
      canvas: canvasRef.current,
      commitHoveredTooltip: commitHoveredTooltip ?? (() => {}),
      frameRefs: {
        axisTickAnimationRef,
        eraChildAnimationRef,
        expandedOverlayProgressByIdRef,
        hoverRegionsRef,
        interactiveChildErasRef,
        markerPriorityBoostRef,
        overlayBandAnimationRef,
        overlayInteractionRegionsRef,
        preferredAxisLabelStepRef,
        primordialDetailStripAnimationRef,
        renderedExpandedOverlayIdsRef,
      },
      hoveredTooltipRef,
      invalidateReasons: [],
      isCosmicCalendarMode: false,
      isTouchTooltipPinned: false,
      isViewportInteractionActive: false,
      lastPointer: lastPointerRef.current,
      overviewReservedHeight: 0,
      overlayScrollOffset: 0,
      pad: padRef.current,
      perfMode: "off",
      perfStats: perfStatsRef.current,
      resolveHoveredTooltipForCanvasDraw,
      reserveAxisDateRow: true,
      scene: sceneRef.current,
      shellElement: shellElementRef.current ?? null,
      theme: themeRef.current,
      tooltipInteractiveContentElement:
        tooltipInteractiveContentElementRef.current ?? null,
      verbosePerfStats: verbosePerfStatsRef.current,
    });
  };

  // Keep refs in sync and redraw when props change. Draw synchronously after
  // the backing store effect has sized the canvas — no RAF needed for a static
  // preview and skipping it avoids timing issues where the RAF fires before the
  // canvas is ready.
  useEffect(() => {
    sceneRef.current = scene;
    padRef.current = pad;
    eraChildOpacityRef.current = eraChildOpacityById;
    expandedOverlayIdsRef.current = expandedOverlayIds ?? [];
    lastPointerRef.current = lastPointer ?? null;
    shellElementRef.current = shellElement;
    tooltipInteractiveContentElementRef.current =
      tooltipInteractiveContentElement;
    themeRef.current = readTimelineCanvasTheme();
    drawRef.current();
  }, [
    scene,
    pad,
    eraChildOpacityById,
    expandedOverlayIds,
    lastPointer,
    shellElement,
    tooltipInteractiveContentElement,
  ]);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />;
}
