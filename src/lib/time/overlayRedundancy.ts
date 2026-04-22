import type { TimelineOverlayBand } from "../data/timelineTypes";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressTimelineLayer,
} from "./timelineLayerAutoToggle";
import { type TimelineViewport } from "./viewport";

function collectAutoHiddenOverlayIds(
  overlays: TimelineOverlayBand[],
  hiddenOverlayIds: Set<string>,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  enabledSetIds?: ReadonlySet<string> | null,
  enabledGroupIds?: ReadonlySet<string> | null,
  visibleGroupIds?: ReadonlySet<string> | null,
) {
  for (const overlay of overlays) {
    const rule = overlay.autoToggleRule;

    if (
      rule &&
      isTimelineLayerAutoToggleEnabled(
        rule,
        enabledSetIds,
        enabledGroupIds,
        visibleGroupIds,
      ) &&
      shouldAutoSuppressTimelineLayer(rule, viewport, width, pad, false)
    ) {
      hiddenOverlayIds.add(overlay.id);
    }

    if (overlay.children && overlay.children.length > 0) {
      collectAutoHiddenOverlayIds(
        overlay.children,
        hiddenOverlayIds,
        viewport,
        width,
        pad,
        enabledSetIds,
        enabledGroupIds,
        visibleGroupIds,
      );
    }
  }
}

export function getAutoHiddenOverlayIds(
  overlays: TimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
  enabledSetIds?: ReadonlySet<string> | null,
  enabledGroupIds?: ReadonlySet<string> | null,
  visibleGroupIds?: ReadonlySet<string> | null,
) {
  if (width <= pad * 2) {
    return new Set<string>();
  }

  const hiddenOverlayIds = new Set<string>();

  collectAutoHiddenOverlayIds(
    overlays,
    hiddenOverlayIds,
    viewport,
    width,
    pad,
    enabledSetIds,
    enabledGroupIds,
    visibleGroupIds,
  );

  return hiddenOverlayIds;
}
