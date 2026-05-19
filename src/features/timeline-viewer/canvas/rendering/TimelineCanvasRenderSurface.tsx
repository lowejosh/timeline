import { useEffect, useRef } from "react";

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
};

/**
 * Lightweight shared render surface. Owns the <canvas> element and the draw
 * loop, but carries no interaction state, no tooltip logic, and no global
 * store dependencies. Redraws whenever `scene` or `pad` change.
 *
 * Use `TimelineCanvasPreview` for a self-contained preview with viewport
 * state and pan/zoom gestures.
 */
export function TimelineCanvasRenderSurface({ scene, pad, eraChildOpacityById }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scene and pad kept in refs so the draw callback never captures stale values.
  const sceneRef = useRef(scene);
  const padRef = useRef(pad);
  const eraChildOpacityRef = useRef(eraChildOpacityById);
  const themeRef = useRef(DEFAULT_TIMELINE_THEME);

  // Stable perf placeholders — preview never measures perf.
  const perfStatsRef = useRef(createTimelinePerfStats());
  const verbosePerfStatsRef = useRef(createTimelineVerboseStats());
  const hoveredTooltipRef = useRef(null);

  // --- Animation state refs (empty — preview renders statically) ----------
  const axisTickAnimationRef = useRef<Map<string, AnimatedAxisTickState>>(new Map());
  const eraChildAnimationRef = useRef<Map<string, AnimatedEraChildState>>(new Map());
  const expandedOverlayProgressByIdRef = useRef<Map<string, number>>(new Map());
  const hoverRegionsRef = useRef<HoverRegion[]>([]);
  const interactiveChildErasRef = useRef<Era[]>([]);
  const markerPriorityBoostRef = useRef<Map<string, MarkerPriorityBoostState>>(new Map());
  const overlayBandAnimationRef = useRef<Map<string, AnimatedOverlayBandState>>(new Map());
  const overlayInteractionRegionsRef = useRef<OverlayInteractionRegion[]>([]);
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

    drawTimelineCanvasFrame({
      canvas: canvasRef.current,
      commitHoveredTooltip: () => {},
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
      lastPointer: null,
      overviewReservedHeight: 0,
      overlayScrollOffset: 0,
      pad: padRef.current,
      perfMode: "off",
      perfStats: perfStatsRef.current,
      resolveHoveredTooltipForCanvasDraw: () => null,
      reserveAxisDateRow: true,
      scene: sceneRef.current,
      shellElement: null,
      theme: themeRef.current,
      tooltipInteractiveContentElement: null,
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
    themeRef.current = readTimelineCanvasTheme();
    drawRef.current();
  }, [scene, pad, eraChildOpacityById]);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />;
}
