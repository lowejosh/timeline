/**
 * Per-id lane start-bias tweaks for overlay lane assignment.
 *
 * Lane assignment sorts overlays by `startYear + bias` to prefer particular
 * bands getting earlier/lower lanes (visually higher rows). These are content
 * decisions, not rendering math, so they live in the catalog.
 */
export const OVERLAY_LANE_START_BIAS_YEARS: Readonly<Record<string, number>> = {
  "chinese-civilization": -250,
  "homo-sapiens": -7_000_000,
};

export function getOverlayLaneStartBiasYears(id: string): number {
  return OVERLAY_LANE_START_BIAS_YEARS[id] ?? 0;
}
