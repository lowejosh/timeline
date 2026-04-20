import type { TimelineLayerAutoToggleRule } from "../data/timelineTypes";
import { getTimelineYearFromYearsAgo } from "./timelineYears";
import { getVisibleRange, type TimelineViewport } from "./viewport";

export const HUMAN_EVOLUTION_AUTO_HIDE_YEAR = -10_000;
export const CIVILIZATIONS_AUTO_HIDE_YEAR = 1_800;
export const DEEP_TIME_LIFE_AUTO_HIDE_YEAR = getTimelineYearFromYearsAgo(12_000_000);
const DEFAULT_HIDE_RECENT_COVERAGE = 0.82;
const DEFAULT_SHOW_RECENT_COVERAGE = 0.68;

export const HUMAN_EVOLUTION_AUTO_TOGGLE_RULE: TimelineLayerAutoToggleRule = {
  kind: "coverage-after-year",
  thresholdYear: HUMAN_EVOLUTION_AUTO_HIDE_YEAR,
  hideCoverage: DEFAULT_HIDE_RECENT_COVERAGE,
  showCoverage: DEFAULT_SHOW_RECENT_COVERAGE,
};

export const CIVILIZATIONS_AUTO_TOGGLE_RULE: TimelineLayerAutoToggleRule = {
  kind: "coverage-after-year",
  thresholdYear: CIVILIZATIONS_AUTO_HIDE_YEAR,
  hideCoverage: DEFAULT_HIDE_RECENT_COVERAGE,
  showCoverage: DEFAULT_SHOW_RECENT_COVERAGE,
};

export const DEEP_TIME_LIFE_AUTO_TOGGLE_RULE: TimelineLayerAutoToggleRule = {
  kind: "coverage-after-year",
  thresholdYear: DEEP_TIME_LIFE_AUTO_HIDE_YEAR,
  hideCoverage: DEFAULT_HIDE_RECENT_COVERAGE,
  showCoverage: DEFAULT_SHOW_RECENT_COVERAGE,
};

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
