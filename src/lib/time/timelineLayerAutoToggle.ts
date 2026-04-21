import type { TimelineLayerAutoToggleRule } from "../data/timelineTypes";
import { bce } from "../data/timelineDateBuilders";
import { TIMELINE_DECORATION_GROUPS_BY_ID } from "../data/timelineDecorations";
import { getTimelineYearFromYearsAgo } from "./timelineYears";
import { getVisibleRange, type TimelineViewport } from "./viewport";

export const HUMAN_EVOLUTION_AUTO_HIDE_YEAR = bce(4_000);
export const CIVILIZATIONS_AUTO_HIDE_YEAR = 1_800;
export const DEEP_TIME_LIFE_AUTO_HIDE_YEAR = getTimelineYearFromYearsAgo(7_000_000);
const DEFAULT_HIDE_RECENT_COVERAGE = 0.82;
const DEFAULT_SHOW_RECENT_COVERAGE = 0.68;

export const HUMAN_EVOLUTION_AUTO_TOGGLE_RULE =
  TIMELINE_DECORATION_GROUPS_BY_ID["human-evolution"].autoToggleRule!;

export const CIVILIZATIONS_AUTO_TOGGLE_RULE =
  TIMELINE_DECORATION_GROUPS_BY_ID.civilizations.autoToggleRule!;

export const DEEP_TIME_LIFE_AUTO_TOGGLE_RULE =
  TIMELINE_DECORATION_GROUPS_BY_ID["deep-time-life"].autoToggleRule!;

export function isTimelineLayerAutoToggleEnabled(
  rule: TimelineLayerAutoToggleRule,
  enabledSetIds?: ReadonlySet<string> | null,
  enabledGroupIds?: ReadonlySet<string> | null,
  visibleGroupIds?: ReadonlySet<string> | null,
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
        ? (rule.showCoverage ?? DEFAULT_SHOW_RECENT_COVERAGE)
        : (rule.hideCoverage ?? DEFAULT_HIDE_RECENT_COVERAGE);

      return thresholdCoverage >= threshold;
    }
    case "max-visible-span": {
      const visibleSpan = Math.max(visibleEnd - visibleStart, 1);
      const threshold = currentlySuppressed
        ? (rule.showAboveYears ?? rule.hideAtOrBelowYears)
        : rule.hideAtOrBelowYears;

      return visibleSpan <= threshold;
    }
    case "viewport-start-after-year": {
      return visibleStart >= rule.thresholdYear;
    }
  }
}

export function shouldAutoSuppressHumanEvolution(
  viewport: TimelineViewport,
  width: number,
  pad: number,
  currentlySuppressed: boolean,
) {
  return shouldAutoSuppressTimelineLayer(
    HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
    viewport,
    width,
    pad,
    currentlySuppressed,
  );
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

export function shouldAutoSuppressDeepTimeLife(
  viewport: TimelineViewport,
  width: number,
  pad: number,
  currentlySuppressed: boolean,
) {
  return shouldAutoSuppressTimelineLayer(
    DEEP_TIME_LIFE_AUTO_TOGGLE_RULE,
    viewport,
    width,
    pad,
    currentlySuppressed,
  );
}
