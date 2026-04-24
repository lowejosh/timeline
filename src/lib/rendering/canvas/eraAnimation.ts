import type { Era } from "../../catalog/eras";
import {
  EXPANDED_OVERLAY_CHILD_LANE_STAGGER,
  EXPANDED_OVERLAY_CHILD_REVEAL_DURATION,
  EXPANDED_OVERLAY_CHILD_REVEAL_START,
  EXPANDED_OVERLAY_CHROME_RAIL_REVEAL_END,
  EXPANDED_OVERLAY_CHROME_RAIL_REVEAL_START,
  EXPANDED_OVERLAY_CHROME_STEM_REVEAL_END,
  EXPANDED_OVERLAY_LABEL_REVEAL_DELAY,
  EXPANDED_OVERLAY_LABEL_REVEAL_DURATION,
} from "./constants";
import { clamp01, interpolateProgress, smoothstep01 } from "../../core/easing";

export function getEraInlineLabelVisibility(childOpacity: number) {
  return 1 - smoothstep01((childOpacity - 0.12) / 0.36);
}

export function getEraBackdropResetAlpha(depth: number, opacity: number) {
  if (depth <= 0) {
    return 1;
  }

  return clamp01(opacity);
}

export function getEraBandAlphaMultiplier(era: Era, depth: number) {
  void era;
  void depth;

  return 1;
}

export function getExpandedOverlayChromeStemRevealProgress(progress: number) {
  return interpolateProgress(
    progress,
    0,
    EXPANDED_OVERLAY_CHROME_STEM_REVEAL_END,
  );
}

export function getExpandedOverlayChromeRailRevealProgress(progress: number) {
  return interpolateProgress(
    progress,
    EXPANDED_OVERLAY_CHROME_RAIL_REVEAL_START,
    EXPANDED_OVERLAY_CHROME_RAIL_REVEAL_END,
  );
}

export function getExpandedOverlayChildRevealProgress(
  progress: number,
  laneIndex: number,
) {
  const start =
    EXPANDED_OVERLAY_CHILD_REVEAL_START +
    laneIndex * EXPANDED_OVERLAY_CHILD_LANE_STAGGER;

  return interpolateProgress(
    progress,
    start,
    start + EXPANDED_OVERLAY_CHILD_REVEAL_DURATION,
  );
}

export function getExpandedOverlayLabelRevealProgress(
  progress: number,
  laneIndex: number,
) {
  const start =
    EXPANDED_OVERLAY_CHILD_REVEAL_START +
    laneIndex * EXPANDED_OVERLAY_CHILD_LANE_STAGGER +
    EXPANDED_OVERLAY_LABEL_REVEAL_DELAY;

  return interpolateProgress(
    progress,
    start,
    start + EXPANDED_OVERLAY_LABEL_REVEAL_DURATION,
  );
}
