import type {
  TimelineMarker,
  TimelineOverlayBand,
  TimelineZoomVisibility,
} from "../../core/timelineTypes";

const PRIORITY_ZOOM_GRACE_START = 75;
const PRIORITY_ZOOM_GRACE_STEP = 5;
const PRIORITY_ZOOM_GRACE_MAX = 5;

function getPriorityZoomGrace(
  item: TimelineZoomVisibility & { priority?: number },
) {
  const priority = item.priority ?? 0;

  if (priority < PRIORITY_ZOOM_GRACE_START) {
    return 0;
  }

  return Math.min(
    PRIORITY_ZOOM_GRACE_MAX,
    Math.floor(
      (priority - PRIORITY_ZOOM_GRACE_START) / PRIORITY_ZOOM_GRACE_STEP,
    ) + 1,
  );
}

export function isTimelineDecorationVisibleAtZoom(
  item: TimelineZoomVisibility & { priority?: number },
  zoom: number,
) {
  const effectiveMinZoom =
    item.minZoom === undefined
      ? undefined
      : item.minZoom - getPriorityZoomGrace(item);

  if (effectiveMinZoom !== undefined && zoom < effectiveMinZoom) {
    return false;
  }

  if (item.maxZoom !== undefined && zoom > item.maxZoom) {
    return false;
  }

  return true;
}

export function isDecorationGroupEnabled(
  item: Pick<TimelineMarker | TimelineOverlayBand, "groupId">,
  enabledGroupIds?: ReadonlySet<string> | null,
) {
  if (!enabledGroupIds || !item.groupId) {
    return true;
  }

  return enabledGroupIds.has(item.groupId);
}
