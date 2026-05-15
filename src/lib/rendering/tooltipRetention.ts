export type TooltipRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type TooltipRetentionAnchor = {
  anchorX: number;
  anchorY: number;
  placement: "above" | "below";
};

export type TooltipRetentionCandidate = {
  tooltip: {
    image?: unknown;
    sources: readonly unknown[];
  };
};

const STICKY_RECT_PADDING_X = 6;
const STICKY_RECT_PADDING_TOP = 12;
const STICKY_RECT_PADDING_BOTTOM = 4;

export function shouldPrioritizeTooltipRetention(
  tooltip: TooltipRetentionCandidate | null | undefined,
) {
  return (
    Boolean(tooltip?.tooltip.image) ||
    (tooltip?.tooltip.sources.length ?? 0) > 0
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isPointInRect(pointX: number, pointY: number, rect: TooltipRect) {
  return (
    pointX >= rect.left &&
    pointX <= rect.right &&
    pointY >= rect.top &&
    pointY <= rect.bottom
  );
}

function toLocalRect(
  rect: TooltipRect,
  shellRect: TooltipRect,
  paddingX = 0,
  paddingY = 0,
): TooltipRect {
  return {
    left: rect.left - shellRect.left - paddingX,
    right: rect.right - shellRect.left + paddingX,
    top: rect.top - shellRect.top - paddingY,
    bottom: rect.bottom - shellRect.top + paddingY,
  };
}

function isPointInTooltipBridgeTriangle(
  pointX: number,
  pointY: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  endHalfWidth: number,
) {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.hypot(dx, dy);

  if (length <= 1e-6) {
    return Math.hypot(pointX - startX, pointY - startY) <= endHalfWidth;
  }

  const unitX = dx / length;
  const unitY = dy / length;
  const offsetX = pointX - startX;
  const offsetY = pointY - startY;
  const distanceAlong = offsetX * unitX + offsetY * unitY;

  if (distanceAlong < 0 || distanceAlong > length) {
    return false;
  }

  const perpendicularDistance = Math.abs(offsetX * -unitY + offsetY * unitX);
  const allowedHalfWidth = (distanceAlong / length) * endHalfWidth;

  return perpendicularDistance <= allowedHalfWidth;
}

export function shouldRetainTooltipAtPoint(
  pointX: number,
  pointY: number,
  shellRect: TooltipRect,
  stickyRect: TooltipRect | null | undefined,
  anchor: TooltipRetentionAnchor,
  bridgeHalfWidth: number,
) {
  if (!stickyRect) {
    return false;
  }

  const localStickyRect = toLocalRect(
    stickyRect,
    shellRect,
    STICKY_RECT_PADDING_X,
  );

  localStickyRect.top -= STICKY_RECT_PADDING_TOP;
  localStickyRect.bottom += STICKY_RECT_PADDING_BOTTOM;

  if (isPointInRect(pointX, pointY, localStickyRect)) {
    return true;
  }

  const edgeX = clamp(
    anchor.anchorX,
    localStickyRect.left + 8,
    localStickyRect.right - 8,
  );
  const edgeY =
    anchor.placement === "below" ? localStickyRect.top : localStickyRect.bottom;

  return isPointInTooltipBridgeTriangle(
    pointX,
    pointY,
    anchor.anchorX,
    anchor.anchorY,
    edgeX,
    edgeY,
    bridgeHalfWidth,
  );
}
