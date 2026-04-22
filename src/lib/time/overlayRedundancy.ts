import { TIMELINE_DECORATION_CATEGORY_IDS } from "../data/timelineDecorations";
import { getVisibleRange, type TimelineViewport } from "./viewport";

export const HOMO_SAPIENS_REDUNDANT_VISIBLE_SPAN_YEARS = 25_000;
export const AGE_OF_MAMMALS_REDUNDANT_VISIBLE_SPAN_YEARS = 10_500_000;

export function getAutoHiddenOverlayIds(
  viewport: TimelineViewport,
  width: number,
  pad: number,
  visibleGroupIds: ReadonlySet<string>,
) {
  if (width <= pad * 2) {
    return new Set<string>();
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const visibleSpanYears = Math.max(visibleEnd - visibleStart, 1);
  const hiddenOverlayIds = new Set<string>();

  if (
    visibleGroupIds.has(TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution) &&
    visibleSpanYears <= AGE_OF_MAMMALS_REDUNDANT_VISIBLE_SPAN_YEARS
  ) {
    hiddenOverlayIds.add("age-of-mammals");
  }

  if (
    visibleGroupIds.has(TIMELINE_DECORATION_CATEGORY_IDS.civilizations) &&
    visibleSpanYears <= HOMO_SAPIENS_REDUNDANT_VISIBLE_SPAN_YEARS
  ) {
    hiddenOverlayIds.add("homo-sapiens");
  }

  return hiddenOverlayIds;
}
