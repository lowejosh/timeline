import type { TimelineTooltipContent } from "@/lib/app/tooltipModel";

export type HoveredTooltipState = {
  id: string;
  anchorX: number;
  anchorY: number;
  placement: "above" | "below";
  tooltip: TimelineTooltipContent;
};

export type RenderedTooltipState = {
  tooltipState: HoveredTooltipState;
  phase: "entering" | "present" | "exiting";
};

export function isEquivalentHoveredTooltip(
  left: HoveredTooltipState | null,
  right: HoveredTooltipState | null,
) {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.id === right.id &&
    left.placement === right.placement &&
    Math.abs(left.anchorX - right.anchorX) < 0.1 &&
    Math.abs(left.anchorY - right.anchorY) < 0.1
  );
}
