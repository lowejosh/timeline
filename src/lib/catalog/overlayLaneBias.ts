import { TIMELINE_OVERLAY_LANE_BIAS_YEARS } from "./timelineRegistry";

export const OVERLAY_LANE_START_BIAS_YEARS = TIMELINE_OVERLAY_LANE_BIAS_YEARS;

export function getOverlayLaneStartBiasYears(id: string): number {
  return OVERLAY_LANE_START_BIAS_YEARS[id] ?? 0;
}
