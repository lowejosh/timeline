import type {
  TimelineOverlayBand,
  TimelineSetId,
} from "../core/timelineTypes";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressTimelineLayer,
} from "../catalog/layerAutoToggle";
import { type TimelineViewport } from "../core/viewport";

function collectAutoHiddenOverlayIds(
  overlays: TimelineOverlayBand[],
  hiddenOverlayIds: Set<string>,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  enabledSetIds?: ReadonlySet<string> | null,
  enabledGroupIds?: ReadonlySet<string> | null,
  visibleGroupIds?: ReadonlySet<string> | null,
  visibleOverlayGroupIds?: ReadonlySet<string> | null,
  hasHigherPrioritySetSpanVisible?: (
    ownerSetId: TimelineSetId | null | undefined,
    ownerPriority?: number,
  ) => boolean,
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
        overlay.groupId,
        visibleOverlayGroupIds,
        hasHigherPrioritySetSpanVisible?.(overlay.setId, overlay.priority) ??
          false,
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
        visibleOverlayGroupIds,
        hasHigherPrioritySetSpanVisible,
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
  visibleOverlayGroupIds?: ReadonlySet<string> | null,
  hasHigherPrioritySetSpanVisible?: (
    ownerSetId: TimelineSetId | null | undefined,
    ownerPriority?: number,
  ) => boolean,
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
    visibleOverlayGroupIds,
    hasHigherPrioritySetSpanVisible,
  );

  return hiddenOverlayIds;
}
