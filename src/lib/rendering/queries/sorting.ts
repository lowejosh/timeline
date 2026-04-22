import type {
  TimelineMarker,
  TimelineOverlayBand,
} from "../../core/timelineTypes";
import { getEffectiveTimelinePriority } from "../../catalog/timelineSets";

type DecorationLike =
  | (Pick<TimelineMarker, "id" | "priority"> & {
      startYear: number;
      endYear: number;
    })
  | TimelineOverlayBand;

export function compareDecorations(
  left: DecorationLike,
  right: DecorationLike,
) {
  return (
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    getEffectiveTimelinePriority(right) - getEffectiveTimelinePriority(left) ||
    left.id.localeCompare(right.id)
  );
}

export function markerAsDecoration(marker: TimelineMarker): DecorationLike {
  return {
    id: marker.id,
    startYear: marker.year,
    endYear: marker.year,
    priority: marker.priority,
  };
}
