import { TIMELINE_CANVAS_PAD } from "@/lib/rendering/layout/padding";

const OVERVIEW_RULER_TIER_HEIGHT = 18;
const OVERVIEW_RULER_MAX_TIERS = 3;
export const MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER = 480;
export const OVERVIEW_RULER_DOCK_BOTTOM_INSET =
  "calc(env(safe-area-inset-bottom, 0px) + 14px)";

export const TIMELINE_APP_LAYOUT = {
  overviewRulerTierHeight: OVERVIEW_RULER_TIER_HEIGHT,
  overviewRulerMaxTiers: OVERVIEW_RULER_MAX_TIERS,
  canvasPad: TIMELINE_CANVAS_PAD,
} as const;

export function shouldUseMobileTimelineDrawer(width: number, height: number) {
  return width <= 720 || (width <= 980 && height <= 560);
}

export function getTimelineAppLayoutState({
  height,
  isOverviewVisible,
  width,
}: {
  height: number;
  isOverviewVisible: boolean;
  width: number;
}) {
  const shouldUseMobileDrawer = shouldUseMobileTimelineDrawer(width, height);
  const shouldHideOverviewSideLabels = width <= 720 && height > width;
  const shouldDockOverviewRuler =
    shouldUseMobileDrawer && isOverviewVisible;
  const overviewRulerDockHeight =
    TIMELINE_APP_LAYOUT.overviewRulerTierHeight *
    TIMELINE_APP_LAYOUT.overviewRulerMaxTiers;
  const overviewReservedHeight =
    isOverviewVisible && !shouldDockOverviewRuler
      ? overviewRulerDockHeight
      : 0;

  return {
    overviewReservedHeight,
    overviewRulerDockBottomInset: OVERVIEW_RULER_DOCK_BOTTOM_INSET,
    overviewRulerDockHeight,
    shouldDockOverviewRuler,
    shouldHideOverviewSideLabels,
    shouldUseMobileDrawer,
  };
}
