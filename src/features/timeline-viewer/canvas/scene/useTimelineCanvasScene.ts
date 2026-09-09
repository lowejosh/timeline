import { arrangeGuidedTracks } from "@/lib/rendering/guidedTracks";
import type { GuidedTimelineFocus } from "@/lib/rendering/guidedFocus";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

import { getVisibleTimelineMarkers } from "@/lib/rendering/queries/markers";
import { resolveTimelineOverlayTracks } from "@/lib/rendering/overlayTracks";
import { resolveViewportAxisTicks } from "@/lib/rendering/viewportAxisTicks";
import {
  getExpandedOverlayPanelHeight,
  getTimelineLayout,
  resolveExpandedOverlayDetails,
} from "@/lib/rendering/canvas/overlayLayout";
import { OVERLAY_LANE_HEIGHT, OVERLAY_LANE_GAP } from "@/lib/rendering/canvas/constants";
import type { TimelineViewport } from "@/lib/core/viewport";
import type { TimelineMarker, TimelineOverlayBand } from "@/lib/catalog/eras";

type UseTimelineCanvasSceneArgs = {
  guidedFocus?: GuidedTimelineFocus;
  enabledGroupIds: ReadonlySet<string>;
  expandedOverlayIds: readonly string[];
  height: number;
  markers: TimelineMarker[];
  onOverlayScroll: (eventName: string) => void;
  overlayBands: TimelineOverlayBand[];
  overviewReservedHeight: number;
  pad: number;
  surfaceRef: RefObject<HTMLElement | null>;
  viewport: TimelineViewport;
  width: number;
};

export function useTimelineCanvasScene({
  guidedFocus,
  enabledGroupIds,
  expandedOverlayIds,
  height,
  markers,
  onOverlayScroll,
  overlayBands,
  overviewReservedHeight,
  pad,
  surfaceRef,
  viewport,
  width,
}: UseTimelineCanvasSceneArgs) {
  const [overlayScrollOffset, setOverlayScrollOffset] = useState(0);

  const axisTickTargets = useMemo(() => {
    if (width <= pad * 2) {
      return [];
    }

    return resolveViewportAxisTicks(viewport, width - pad * 2);
  }, [pad, viewport, width]);

  const reserveAxisDateRow = useMemo(
    () => axisTickTargets.some((tick) => tick.labelStep < 1 && tick.labelOpacity > 0.01),
    [axisTickTargets],
  );
  const visibleMarkers = useMemo(
    () =>
      getVisibleTimelineMarkers(markers, viewport, width, pad, enabledGroupIds),
    [enabledGroupIds, markers, pad, viewport, width],
  );
  const resolvedOverlayBands = useMemo(
    () =>
      arrangeGuidedTracks(resolveTimelineOverlayTracks(
        overlayBands,
        viewport,
        width,
        pad,
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
        enabledGroupIds,
      ), guidedFocus?.subjectIds),
    [enabledGroupIds, overlayBands, pad, viewport, width, guidedFocus?.subjectIds],
  );
  const overlayLaneCount = resolvedOverlayBands[0]?.laneCount ?? 0;
  const expandedOverlayExtraHeight = useMemo(() => {
    if (expandedOverlayIds.length === 0) return 0;
    return resolveExpandedOverlayDetails(
      expandedOverlayIds,
      resolvedOverlayBands,
      viewport,
      width,
      pad,
    ).reduce(
      (total, detail) => total + getExpandedOverlayPanelHeight(detail),
      0,
    );
  }, [expandedOverlayIds, resolvedOverlayBands, viewport, width, pad]);
  const centerOverlays = !!guidedFocus;
  const overlayInteractionLayout = useMemo(
    () =>
      getTimelineLayout(height, overlayLaneCount, overlayScrollOffset, {
        reserveAxisDateRow,
        overviewReservedHeight,
        expandedExtraHeight: expandedOverlayExtraHeight,
        centerOverlays,
      }),
    [
      centerOverlays,
      expandedOverlayExtraHeight,
      height,
      overlayLaneCount,
      overlayScrollOffset,
      overviewReservedHeight,
      reserveAxisDateRow,
    ],
  );

  const clampOverlayScrollOffset = useCallback(
    (requestedOffset: number) =>
      getTimelineLayout(height, overlayLaneCount, requestedOffset, {
        reserveAxisDateRow,
        overviewReservedHeight,
        expandedExtraHeight: expandedOverlayExtraHeight,
        centerOverlays,
      }).overlayScrollOffset,
    [
      centerOverlays,
      expandedOverlayExtraHeight,
      height,
      overlayLaneCount,
      overviewReservedHeight,
      reserveAxisDateRow,
    ],
  );

  const focusFrameRef = useRef(0);
  const offsetRef = useRef(overlayScrollOffset);
  const wheelFrameRef = useRef(0);
  const wheelTargetRef = useRef<number | null>(null);
  useEffect(() => () => { cancelAnimationFrame(wheelFrameRef.current); }, []);
  useEffect(() => { offsetRef.current = overlayScrollOffset; }, [overlayScrollOffset]);
  const adjustOverlayScrollOffset = useCallback(
    (deltaY: number) => {
      cancelAnimationFrame(focusFrameRef.current);
      cancelAnimationFrame(wheelFrameRef.current);
      wheelFrameRef.current = 0;
      wheelTargetRef.current = null;
      if (overlayInteractionLayout.overlayScrollMax <= 0) {
        return;
      }

      setOverlayScrollOffset((current) =>
        clampOverlayScrollOffset(current + deltaY),
      );
    },
    [clampOverlayScrollOffset, overlayInteractionLayout.overlayScrollMax],
  );

  useEffect(() => {
    setOverlayScrollOffset((current) => clampOverlayScrollOffset(current));
  }, [clampOverlayScrollOffset]);

  const hasFramed = useRef(false);
  const lastFocusRequest = useRef<string | null>(null);
  const subjectLanes = resolvedOverlayBands.filter(item => guidedFocus?.subjectIds.includes(item.band.id)).map(item => item.laneIndex);
  const focusLane = subjectLanes.length ? (Math.min(...subjectLanes) + Math.max(...subjectLanes)) / 2
    : resolvedOverlayBands.find(item => item.band.id === guidedFocus?.bandId)?.laneIndex;
  const focusKey = guidedFocus?.stopKey;
  const focusTarget = focusLane === undefined ? undefined : clampOverlayScrollOffset(
    (overlayInteractionLayout.overlayClipTop - overlayInteractionLayout.overlayClipBottom) / 2
    + OVERLAY_LANE_HEIGHT / 2 + focusLane * (OVERLAY_LANE_HEIGHT + OVERLAY_LANE_GAP),
  );
  useEffect(() => {
    if (focusKey === undefined || focusTarget === undefined) return;
    const request = `${focusKey}:${width}:${height}`;
    if (lastFocusRequest.current === request) return;
    lastFocusRequest.current = request;
    cancelAnimationFrame(wheelFrameRef.current);
    wheelFrameRef.current = 0;
    wheelTargetRef.current = null;
    const from = offsetRef.current;
    const started = performance.now();
    const instant = !hasFramed.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    hasFramed.current = true;
    const tick = (now: number) => {
      const t = instant ? 1 : Math.min((now - started) / 350, 1);
      setOverlayScrollOffset(from + (focusTarget - from) * (1 - (1 - t) ** 3));
      if (t < 1) focusFrameRef.current = requestAnimationFrame(tick);
    };
    if (instant) tick(started);
    else focusFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(focusFrameRef.current);
  }, [focusKey, focusTarget, width, height]);

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface || overlayInteractionLayout.overlayScrollMax <= 0) {
      return;
    }

    const animateWheel = (delta: number) => {
      cancelAnimationFrame(focusFrameRef.current);
      const target = clampOverlayScrollOffset((wheelTargetRef.current ?? offsetRef.current) + delta);
      wheelTargetRef.current = target;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setOverlayScrollOffset(target);
        offsetRef.current = target;
        wheelTargetRef.current = null;
        return;
      }
      if (wheelFrameRef.current) return;
      let last = performance.now();
      const tick = (now: number) => {
        const goal = clampOverlayScrollOffset(wheelTargetRef.current ?? offsetRef.current);
        const next = offsetRef.current + (goal - offsetRef.current) * (1 - Math.exp(-Math.min(now - last, 40) / 55));
        last = now;
        offsetRef.current = Math.abs(goal - next) < 0.2 ? goal : next;
        setOverlayScrollOffset(offsetRef.current);
        if (offsetRef.current !== goal) wheelFrameRef.current = requestAnimationFrame(tick);
        else { wheelFrameRef.current = 0; wheelTargetRef.current = null; }
      };
      wheelFrameRef.current = requestAnimationFrame(tick);
    };
    const handleOverlayWheel = (event: globalThis.WheelEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-timeline-tooltip]")) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      const rect = surface.getBoundingClientRect();
      const localY = event.clientY - rect.top;

      if (
        localY < overlayInteractionLayout.overlayClipTop ||
        localY > overlayInteractionLayout.overlayClipBottom
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      onOverlayScroll("overlay-wheel-scroll");
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2
        ? overlayInteractionLayout.overlayClipBottom - overlayInteractionLayout.overlayClipTop : 1;
      animateWheel(-Math.max(-240, Math.min(240, event.deltaY * unit)));
    };

    surface.addEventListener("wheel", handleOverlayWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      surface.removeEventListener("wheel", handleOverlayWheel, {
        capture: true,
      });
    };
  }, [
    clampOverlayScrollOffset,
    onOverlayScroll,
    overlayInteractionLayout.overlayClipBottom,
    overlayInteractionLayout.overlayClipTop,
    overlayInteractionLayout.overlayScrollMax,
    surfaceRef,
  ]);

  return {
    adjustOverlayScrollOffset,
    axisTickTargets,
    expandedOverlayExtraHeight,
    overlayInteractionLayout,
    overlayLaneCount,
    overlayScrollOffset,
    reserveAxisDateRow,
    resolvedOverlayBands,
    visibleMarkers,
  };
}
