import {
  compareEraPriorityDescending,
  type Era,
  type TimelineOverlayBand,
} from "@/lib/catalog/eras";
import { getEffectiveTimelinePriority } from "@/lib/catalog/timelineSets";
import {
  getVisibleRange,
  type TimelineViewport,
  worldToScreen,
} from "@/lib/core/viewport";
import type { ResolvedTimelineOverlayBand } from "../overlayTracks";
import {
  AXIS_DATE_LABEL_HEIGHT,
  AXIS_LABEL_ROW_GAP,
  AXIS_MAJOR_TICK_BOTTOM_OFFSET,
  AXIS_MAJOR_TICK_TOP_OFFSET,
  AXIS_TICK_TO_LABEL_GAP,
  AXIS_YEAR_LABEL_HEIGHT,
  BREADCRUMB_HEIGHT,
  BREADCRUMB_TO_OVERLAY_GAP,
  BREADCRUMB_TOP,
  COMFORTABLE_AXIS_TO_MARKER_LABEL_GAP,
  COMFORTABLE_MARKER_LABEL_ROW_GAP,
  COMFORTABLE_MARKER_TO_AXIS_LABEL_GAP,
  COMPACT_AXIS_TO_MARKER_LABEL_GAP,
  COMPACT_MARKER_LABEL_ROW_GAP,
  COMPACT_MARKER_STACK_MAX_HEIGHT,
  COMPACT_MARKER_TO_AXIS_LABEL_GAP,
  EXPANDED_OVERLAY_BOTTOM_PADDING,
  EXPANDED_OVERLAY_TOP_PADDING,
  MARKER_DATE_HEIGHT,
  MARKER_LABEL_HEIGHT,
  MARKER_STEM_BOTTOM_OFFSET,
  MARKER_STEM_TO_LABEL_GAP,
  MIN_VISIBLE_OVERLAY_CHILD_WIDTH,
  NOW_INDICATOR_TOP_OFFSET,
  OVERLAY_LANE_GAP,
  OVERLAY_LANE_HEIGHT,
  OVERLAY_PANEL_GAP,
  ROOMY_TIMELINE_BOTTOM_PADDING_MAX_EXTRA,
  ROOMY_TIMELINE_BOTTOM_PADDING_START_HEIGHT,
  TIMELINE_BOTTOM_PADDING,
} from "./constants";

export type TimelineCanvasLayout = {
  breadcrumbY: number;
  overlayTop: number;
  overlayHeight: number;
  overlayBottom: number;
  overlayClipTop: number;
  overlayClipBottom: number;
  overlayScrollMax: number;
  overlayScrollOffset: number;
  axisY: number;
  markerStemBottom: number;
  markerLabelY: number;
  markerDateY: number;
  majorTickTop: number;
  majorTickBottom: number;
  dateLabelY: number;
  yearLabelY: number;
  nowTop: number;
  nowBottom: number;
};

export type ExpandedOverlayChild = {
  band: TimelineOverlayBand;
  laneIndex: number;
  x0: number;
  x1: number;
};

export type ExpandedOverlayDetail = {
  parent: ResolvedTimelineOverlayBand;
  children: ExpandedOverlayChild[];
  laneCount: number;
  panelWidth: number;
  headerText: string;
};

export type NestedOverlayLaneAssignment = {
  assigned: Array<{
    band: TimelineOverlayBand;
    laneIndex: number;
  }>;
  laneCount: number;
};

export type ExpandedOverlayConnectorGeometry = {
  stemX: number;
  stemTop: number;
  stemBottom: number;
  railLeft: number;
  railRight: number;
  railY: number;
};

export function findEraAtYear(eras: Era[], year: number): Era | undefined {
  return eras
    .filter((era) => year >= era.startYear && year <= era.endYear)
    .sort(compareEraPriorityDescending)[0];
}

export function getTimelineLayout(
  height: number,
  overlayLaneCount: number,
  requestedOverlayScrollOffset = 0,
  options?: {
    reserveAxisDateRow?: boolean;
    overviewReservedHeight?: number;
  },
): TimelineCanvasLayout {
  const reserveAxisDateRow = options?.reserveAxisDateRow ?? true;
  const overviewReservedHeight = Math.max(options?.overviewReservedHeight ?? 0, 0);
  const effectiveHeight = Math.max(height - overviewReservedHeight, 0);
  const overlayHeight =
    overlayLaneCount > 0
      ? overlayLaneCount * OVERLAY_LANE_HEIGHT +
        Math.max(overlayLaneCount - 1, 0) * OVERLAY_LANE_GAP
      : 0;
  const compactMarkerStack =
    effectiveHeight <= COMPACT_MARKER_STACK_MAX_HEIGHT;
  const roomyBottomPadding = Math.round(
    Math.min(
      Math.max(effectiveHeight - ROOMY_TIMELINE_BOTTOM_PADDING_START_HEIGHT, 0) * 0.06,
      ROOMY_TIMELINE_BOTTOM_PADDING_MAX_EXTRA,
    ),
  );
  const timelineBottomPadding = TIMELINE_BOTTOM_PADDING + roomyBottomPadding;
  const axisToMarkerLabelGap = compactMarkerStack
    ? COMPACT_AXIS_TO_MARKER_LABEL_GAP
    : COMFORTABLE_AXIS_TO_MARKER_LABEL_GAP;
  const markerLabelRowGap = compactMarkerStack
    ? COMPACT_MARKER_LABEL_ROW_GAP
    : COMFORTABLE_MARKER_LABEL_ROW_GAP;
  const markerToAxisLabelGap = compactMarkerStack
    ? COMPACT_MARKER_TO_AXIS_LABEL_GAP
    : COMFORTABLE_MARKER_TO_AXIS_LABEL_GAP;
  const breadcrumbY = BREADCRUMB_TOP;
  const overlayClipTop =
    breadcrumbY + BREADCRUMB_HEIGHT + BREADCRUMB_TO_OVERLAY_GAP;
  const yearLabelY =
    height - timelineBottomPadding - overviewReservedHeight - AXIS_YEAR_LABEL_HEIGHT;
  const dateLabelY = reserveAxisDateRow
    ? yearLabelY - AXIS_LABEL_ROW_GAP - AXIS_DATE_LABEL_HEIGHT
    : yearLabelY;
  const axisLabelTopY = reserveAxisDateRow ? dateLabelY : yearLabelY;
  const markerDateY =
    axisLabelTopY - markerToAxisLabelGap - MARKER_DATE_HEIGHT;
  const markerLabelY =
    markerDateY - markerLabelRowGap - MARKER_LABEL_HEIGHT;
  const axisY = markerLabelY - axisToMarkerLabelGap;
  const majorTickTop = axisY - AXIS_MAJOR_TICK_TOP_OFFSET;
  const majorTickBottom = Math.min(
    axisY + AXIS_MAJOR_TICK_BOTTOM_OFFSET,
    axisLabelTopY - AXIS_TICK_TO_LABEL_GAP,
  );
  const markerStemBottom = Math.min(
    axisY + MARKER_STEM_BOTTOM_OFFSET,
    markerLabelY - MARKER_STEM_TO_LABEL_GAP,
  );
  const baseOverlayBottom =
    overlayLaneCount > 0 ? majorTickTop - OVERLAY_PANEL_GAP : majorTickTop;
  const overlayClipBottom = Math.max(overlayClipTop, baseOverlayBottom);
  const visibleOverlayHeight = Math.max(overlayClipBottom - overlayClipTop, 0);
  const overlayScrollMax = Math.max(overlayHeight - visibleOverlayHeight, 0);
  const overlayScrollOffset = Math.min(
    Math.max(requestedOverlayScrollOffset, 0),
    overlayScrollMax,
  );
  const overlayBottom = baseOverlayBottom + overlayScrollOffset;
  const overlayTop = overlayBottom - overlayHeight;

  return {
    breadcrumbY,
    overlayTop,
    overlayHeight,
    overlayBottom,
    overlayClipTop,
    overlayClipBottom,
    overlayScrollMax,
    overlayScrollOffset,
    axisY,
    markerStemBottom,
    markerLabelY,
    markerDateY,
    majorTickTop,
    majorTickBottom,
    dateLabelY,
    yearLabelY,
    nowTop: majorTickTop - NOW_INDICATOR_TOP_OFFSET,
    nowBottom: Math.min(majorTickBottom + 12, axisLabelTopY - 4),
  };
}

export function getOverlayLaneY(
  layout: TimelineCanvasLayout,
  laneIndex: number,
) {
  return (
    layout.overlayBottom -
    OVERLAY_LANE_HEIGHT -
    laneIndex * (OVERLAY_LANE_HEIGHT + OVERLAY_LANE_GAP)
  );
}

export function getExpandedOverlayPanelHeight(
  detail: ExpandedOverlayDetail | null,
) {
  if (!detail) {
    return 0;
  }

  return (
    EXPANDED_OVERLAY_TOP_PADDING +
    EXPANDED_OVERLAY_BOTTOM_PADDING +
    detail.laneCount * OVERLAY_LANE_HEIGHT +
    Math.max(detail.laneCount - 1, 0) * OVERLAY_LANE_GAP
  );
}

export function compareOverlayBands(
  left: TimelineOverlayBand,
  right: TimelineOverlayBand,
) {
  return (
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    getEffectiveTimelinePriority(right) - getEffectiveTimelinePriority(left) ||
    left.id.localeCompare(right.id)
  );
}

const nestedOverlayLaneAssignmentCache = new WeakMap<
  TimelineOverlayBand[],
  NestedOverlayLaneAssignment
>();

export function assignNestedOverlayLanes(
  overlays: TimelineOverlayBand[],
): NestedOverlayLaneAssignment {
  const cached = nestedOverlayLaneAssignmentCache.get(overlays);

  if (cached) {
    return cached;
  }

  const laneEndYears: number[] = [];
  const assigned = [...overlays].sort(compareOverlayBands).map((band) => {
    let laneIndex = laneEndYears.findIndex(
      (laneEndYear) => band.startYear >= laneEndYear,
    );

    if (laneIndex === -1) {
      laneIndex = laneEndYears.length;
      laneEndYears.push(band.endYear);
    } else {
      laneEndYears[laneIndex] = band.endYear;
    }

    return {
      band,
      laneIndex,
    };
  });

  const computed = {
    assigned,
    laneCount: Math.max(laneEndYears.length, 1),
  };

  nestedOverlayLaneAssignmentCache.set(overlays, computed);
  return computed;
}

export function resolveExpandedOverlayDetail(
  expandedOverlayId: string | null,
  resolvedOverlayBands: ResolvedTimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
): ExpandedOverlayDetail | null {
  if (!expandedOverlayId || width <= pad * 2) {
    return null;
  }

  const parent = resolvedOverlayBands.find(
    ({ band }) =>
      band.id === expandedOverlayId && (band.children?.length ?? 0) > 0,
  );

  if (!parent?.band.children?.length) {
    return null;
  }

  const innerWidth = width - pad * 2;
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const { assigned, laneCount } = assignNestedOverlayLanes(
    parent.band.children,
  );
  const children = assigned
    .filter(
      ({ band }) =>
        band.endYear >= visibleStart && band.startYear <= visibleEnd,
    )
    .map(({ band, laneIndex }) => ({
      band,
      laneIndex,
      x0: pad + worldToScreen(band.startYear, viewport, innerWidth),
      x1: pad + worldToScreen(band.endYear, viewport, innerWidth),
    }));

  if (children.length === 0) {
    return null;
  }

  const panelWidth = Math.min(Math.max(parent.renderWidth, 1), width - pad * 2);

  return {
    parent,
    children,
    laneCount,
    panelWidth,
    headerText: `${parent.band.label} · major polities`,
  };
}

export function resolveExpandedOverlayDetails(
  expandedOverlayIds: readonly string[],
  resolvedOverlayBands: ResolvedTimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
) {
  return expandedOverlayIds
    .map((expandedOverlayId) =>
      resolveExpandedOverlayDetail(
        expandedOverlayId,
        resolvedOverlayBands,
        viewport,
        width,
        pad,
      ),
    )
    .filter((detail): detail is ExpandedOverlayDetail => detail !== null);
}

export function resolveExpandedOverlayConnectorGeometry(
  children: ExpandedOverlayChild[],
  panelLeft: number,
  panelRight: number,
  parentCenterX: number,
  parentBandBottom: number,
  panelTop: number,
): ExpandedOverlayConnectorGeometry {
  let childConnectorLeft = Number.POSITIVE_INFINITY;
  let childConnectorRight = Number.NEGATIVE_INFINITY;

  for (const child of children) {
    const clippedLeft = Math.max(child.x0, panelLeft);
    const clippedRight = Math.min(child.x1, panelRight);

    if (clippedRight - clippedLeft < MIN_VISIBLE_OVERLAY_CHILD_WIDTH) {
      continue;
    }

    const childConnectorX = clippedLeft + (clippedRight - clippedLeft) / 2;
    childConnectorLeft = Math.min(childConnectorLeft, childConnectorX);
    childConnectorRight = Math.max(childConnectorRight, childConnectorX);
  }

  const railY = panelTop + Math.max(3, EXPANDED_OVERLAY_TOP_PADDING * 0.45);
  const fallbackLeft = Math.max(panelLeft, parentCenterX - 12);
  const fallbackRight = Math.min(panelRight, parentCenterX + 12);
  const railLeft = Number.isFinite(childConnectorLeft)
    ? Math.min(childConnectorLeft, parentCenterX)
    : fallbackLeft;
  const railRight = Number.isFinite(childConnectorRight)
    ? Math.max(childConnectorRight, parentCenterX)
    : fallbackRight;

  return {
    stemX: Math.min(Math.max(parentCenterX, railLeft), railRight),
    stemTop: parentBandBottom,
    stemBottom: railY,
    railLeft,
    railRight,
    railY,
  };
}
