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

  // Use the rendered rectangle: collision handling can flip the preferred side.
  // The corridor widens from the trigger to the entire facing edge, so diagonal
  // movement towards Sources is protected too.
  const edgeY = anchor.anchorY < localStickyRect.top
    ? localStickyRect.top
    : anchor.anchorY > localStickyRect.bottom
      ? localStickyRect.bottom
      : anchor.anchorY;
  const gap = edgeY - anchor.anchorY;
  const startHalfWidth = Math.max(bridgeHalfWidth, 12);
  if (Math.abs(gap) < 1) {
    return pointY >= localStickyRect.top && pointY <= localStickyRect.bottom &&
      pointX >= Math.min(anchor.anchorX - startHalfWidth, localStickyRect.left) &&
      pointX <= Math.max(anchor.anchorX + startHalfWidth, localStickyRect.right);
  }
  const progress = (pointY - anchor.anchorY) / gap;
  if (progress < 0 || progress > 1) return false;
  const left = anchor.anchorX - startHalfWidth +
    (localStickyRect.left - anchor.anchorX + startHalfWidth) * progress;
  const right = anchor.anchorX + startHalfWidth +
    (localStickyRect.right - anchor.anchorX - startHalfWidth) * progress;
  return pointX >= left && pointX <= right;
}
