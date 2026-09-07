export type TooltipBounds = { left: number; top: number; right: number; bottom: number };

/** All coordinates are local to the canvas, including the visible viewport. */
export function placeTimelineTooltip({
  bounds, anchorX, anchorY, measuredHeight, preferredBelow, maxWidth = 320, offset = 12,
}: {
  bounds: TooltipBounds;
  anchorX: number;
  anchorY: number;
  measuredHeight: number;
  preferredBelow: boolean;
  maxWidth?: number;
  offset?: number;
}) {
  const width = Math.max(0, Math.min(maxWidth, bounds.right - bounds.left));
  const maxHeight = Math.max(0, bounds.bottom - bounds.top);
  const height = Math.min(measuredHeight || maxHeight, maxHeight);
  const above = anchorY - offset - bounds.top;
  const below = bounds.bottom - anchorY - offset;
  const placeBelow = preferredBelow ? below >= height || below > above : above < height && below > above;
  const desiredTop = placeBelow ? anchorY + offset : anchorY - offset - height;
  return {
    width,
    maxHeight,
    left: Math.max(bounds.left, Math.min(anchorX - width / 2, bounds.right - width)),
    top: Math.max(bounds.top, Math.min(desiredTop, bounds.bottom - height)),
    placeBelow,
  };
}
