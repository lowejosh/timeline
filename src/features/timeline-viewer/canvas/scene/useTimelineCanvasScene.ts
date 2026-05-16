import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";

import { getVisibleTimelineMarkers } from "@/lib/rendering/queries/markers";
import { resolveTimelineOverlayTracks } from "@/lib/rendering/overlayTracks";
import { resolveAxisTickRenderStates } from "@/lib/rendering/axisTickStates";
import {
  getExpandedOverlayPanelHeight,
  getTimelineLayout,
  resolveExpandedOverlayDetails,
} from "@/lib/rendering/canvas/overlayLayout";
import { AXIS_TICK_OVERSCAN_PX } from "@/lib/rendering/canvas/constants";
import {
  EARLY_UNIVERSE_END_YEAR,
  EARLY_UNIVERSE_START_YEAR,
} from "@/lib/catalog/sets/cosmic/index";
import {
  comparePreciseTimelineYears,
  getMinZoomForWidth,
  getViewportCenterYear,
  getVisibleRangePrecise,
  screenToWorldPrecise,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  toApproximateTimelineYear,
  type TimelineViewport,
} from "@/lib/core/viewport";
import type { TimelineMarker, TimelineOverlayBand } from "@/lib/catalog/eras";

type UseTimelineCanvasSceneArgs = {
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

    const innerWidth = width - pad * 2;
    const [preciseRangeStart, preciseRangeEnd] = getVisibleRangePrecise(
      viewport,
      innerWidth,
    );
    const tickRangeStart = screenToWorldPrecise(
      -AXIS_TICK_OVERSCAN_PX,
      viewport,
      innerWidth,
    );
    const tickRangeEnd = screenToWorldPrecise(
      innerWidth + AXIS_TICK_OVERSCAN_PX,
      viewport,
      innerWidth,
    );
    const tickStart = Math.max(
      toApproximateTimelineYear(tickRangeStart),
      TIMELINE_MIN_YEAR,
    );
    const tickEnd = Math.min(
      toApproximateTimelineYear(tickRangeEnd),
      TIMELINE_MAX_YEAR,
    );
    const visibleSpan = Math.max(
      Math.abs(
        subtractPreciseTimelineYears(preciseRangeEnd, preciseRangeStart),
      ),
      1e-18,
    );
    const earlyUniverseOverlapStart = Math.max(
      tickStart,
      EARLY_UNIVERSE_START_YEAR,
    );
    const earlyUniverseOverlapEnd = Math.min(tickEnd, EARLY_UNIVERSE_END_YEAR);
    const earlyUniverseOverlap = Math.max(
      0,
      earlyUniverseOverlapEnd - earlyUniverseOverlapStart,
    );
    const startsAtBigBang =
      comparePreciseTimelineYears(
        preciseRangeStart,
        splitTimelineYear(TIMELINE_MIN_YEAR),
      ) === 0;
    const isFullyZoomedOut =
      viewport.zoom <=
      getMinZoomForWidth(innerWidth, viewport.scaleMode ?? "linear") + 0.001;
    const isPrimordialFocused =
      !isFullyZoomedOut &&
      (startsAtBigBang || earlyUniverseOverlap / visibleSpan >= 0.75);

    return resolveAxisTickRenderStates(tickStart, tickEnd, innerWidth, {
      elapsedReference: isPrimordialFocused ? "after-big-bang" : "ago",
      elapsedSubYearReference: isPrimordialFocused ? "after-big-bang" : "ago",
      preciseStartYear: preciseRangeStart,
      preciseEndYear: preciseRangeEnd,
      preciseAnchorYear: getViewportCenterYear(viewport),
      scaleMode: "logarithmic",
    });
  }, [pad, viewport, width]);

  const reserveAxisDateRow = useMemo(
    () => axisTickTargets.some((tick) => tick.labelStep < 1),
    [axisTickTargets],
  );
  const visibleMarkers = useMemo(
    () =>
      getVisibleTimelineMarkers(markers, viewport, width, pad, enabledGroupIds),
    [enabledGroupIds, markers, pad, viewport, width],
  );
  const resolvedOverlayBands = useMemo(
    () =>
      resolveTimelineOverlayTracks(
        overlayBands,
        viewport,
        width,
        pad,
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
        enabledGroupIds,
      ),
    [enabledGroupIds, overlayBands, pad, viewport, width],
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
  const overlayInteractionLayout = useMemo(
    () =>
      getTimelineLayout(height, overlayLaneCount, overlayScrollOffset, {
        reserveAxisDateRow,
        overviewReservedHeight,
        expandedExtraHeight: expandedOverlayExtraHeight,
      }),
    [
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
      }).overlayScrollOffset,
    [
      expandedOverlayExtraHeight,
      height,
      overlayLaneCount,
      overviewReservedHeight,
      reserveAxisDateRow,
    ],
  );

  const adjustOverlayScrollOffset = useCallback(
    (deltaY: number) => {
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

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface || overlayInteractionLayout.overlayScrollMax <= 0) {
      return;
    }

    const handleOverlayWheel = (event: globalThis.WheelEvent) => {
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
      adjustOverlayScrollOffset(-event.deltaY);
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
    adjustOverlayScrollOffset,
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
