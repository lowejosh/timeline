import type { TimelineLayerAutoToggleRule } from "../core/timelineTypes";
import { TIMELINE_DECORATION_GROUPS_BY_ID } from "../catalog/decorations";
import { getVisibleRange, type TimelineViewport } from "../core/viewport";

export const CIVILIZATIONS_AUTO_HIDE_YEAR = 1_800;

export const CIVILIZATIONS_AUTO_TOGGLE_RULE =
  TIMELINE_DECORATION_GROUPS_BY_ID.civilizations.autoToggleRule!;

export function isTimelineLayerAutoToggleEnabled(
  rule: TimelineLayerAutoToggleRule,
  enabledSetIds?: ReadonlySet<string> | null,
  enabledGroupIds?: ReadonlySet<string> | null,
  visibleGroupIds?: ReadonlySet<string> | null,
  ownerGroupId?: string | null,
  visibleOverlayGroupIds?: ReadonlySet<string> | null,
  hasHigherPrioritySetSpanVisible = false,
) {
  if (
    rule.onlyWhenAnySetEnabled &&
    rule.onlyWhenAnySetEnabled.length > 0 &&
    !rule.onlyWhenAnySetEnabled.some((setId) => enabledSetIds?.has(setId))
  ) {
    return false;
  }

  if (
    rule.onlyWhenAnyGroupEnabled &&
    rule.onlyWhenAnyGroupEnabled.length > 0 &&
    !rule.onlyWhenAnyGroupEnabled.some((groupId) => enabledGroupIds?.has(groupId))
  ) {
    return false;
  }

  if (
    rule.onlyWhenAnyGroupVisible &&
    rule.onlyWhenAnyGroupVisible.length > 0 &&
    !rule.onlyWhenAnyGroupVisible.some((groupId) => visibleGroupIds?.has(groupId))
  ) {
    return false;
  }

  if (rule.onlyWhenOtherSetBandsVisible) {
    if (!ownerGroupId || !visibleOverlayGroupIds) {
      return false;
    }

    let hasOtherBandGroupVisible = false;

    for (const groupId of visibleOverlayGroupIds) {
      if (groupId !== ownerGroupId) {
        hasOtherBandGroupVisible = true;
        break;
      }
    }

    if (!hasOtherBandGroupVisible) {
      return false;
    }
  }

  if (
    rule.onlyWhenHigherPrioritySetSpanVisible &&
    !hasHigherPrioritySetSpanVisible
  ) {
    return false;
  }

  return true;
}

function getVisibleRangeBounds(
  viewport: TimelineViewport,
  width: number,
  pad: number,
) {
  if (width <= pad * 2) {
    return null;
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);

  return { visibleStart, visibleEnd };
}

export function shouldAutoSuppressTimelineLayer(
  rule: TimelineLayerAutoToggleRule,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  currentlySuppressed: boolean,
) {
  const bounds = getVisibleRangeBounds(viewport, width, pad);

  if (!bounds) {
    return false;
  }

  const { visibleStart, visibleEnd } = bounds;

  switch (rule.kind) {
    case "coverage-after-year": {
      if (visibleEnd <= rule.thresholdYear) {
        return false;
      }

      if (visibleStart >= rule.thresholdYear) {
        return true;
      }

      const visibleSpan = Math.max(visibleEnd - visibleStart, 1);
      const postThresholdSpan = Math.max(
        0,
        visibleEnd - Math.max(visibleStart, rule.thresholdYear),
      );
      const thresholdCoverage = postThresholdSpan / visibleSpan;
      const threshold = currentlySuppressed
        ? (rule.showCoverage ?? 0.68)
        : (rule.hideCoverage ?? 0.82);

      return thresholdCoverage >= threshold;
    }
    case "max-visible-span": {
      const visibleSpan = Math.max(visibleEnd - visibleStart, 1);
      const threshold = currentlySuppressed
        ? (rule.showAboveYears ?? rule.hideAtOrBelowYears)
        : rule.hideAtOrBelowYears;

      return visibleSpan <= threshold;
    }
  }
}

export function shouldAutoSuppressCivilizations(
  viewport: TimelineViewport,
  width: number,
  pad: number,
  currentlySuppressed: boolean,
) {
  return shouldAutoSuppressTimelineLayer(
    CIVILIZATIONS_AUTO_TOGGLE_RULE,
    viewport,
    width,
    pad,
    currentlySuppressed,
  );
}
