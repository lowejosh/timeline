import { TIMELINE_CANVAS_PAD } from "@/lib/rendering/layout/padding";

const OVERVIEW_RULER_TIER_HEIGHT = 18;
const OVERVIEW_RULER_MAX_TIERS = 3;
const PORTRAIT_DOCKED_OVERVIEW_CANVAS_CLEARANCE =
  OVERVIEW_RULER_TIER_HEIGHT * OVERVIEW_RULER_MAX_TIERS + 42;
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
  const shouldUsePortraitMobileLayout = width <= 720 && height > width;
  const shouldHideOverviewSideLabels = shouldUsePortraitMobileLayout;
  const shouldDockOverviewRuler =
    shouldUseMobileDrawer && isOverviewVisible;
  const overviewRulerDockHeight =
    TIMELINE_APP_LAYOUT.overviewRulerTierHeight *
    TIMELINE_APP_LAYOUT.overviewRulerMaxTiers;
  const overviewReservedHeight =
    isOverviewVisible && !shouldDockOverviewRuler
      ? overviewRulerDockHeight
      : shouldDockOverviewRuler && shouldHideOverviewSideLabels
        ? PORTRAIT_DOCKED_OVERVIEW_CANVAS_CLEARANCE
        : 0;
  const overviewRulerDockBottomInset =
    shouldDockOverviewRuler && shouldHideOverviewSideLabels
      ? 0
      : OVERVIEW_RULER_DOCK_BOTTOM_INSET;

  return {
    overviewReservedHeight,
    overviewRulerDockBottomInset,
    overviewRulerDockHeight,
    shouldDockOverviewRuler,
    shouldHideOverviewSideLabels,
    shouldUsePortraitMobileLayout,
    shouldUseMobileDrawer,
  };
}
