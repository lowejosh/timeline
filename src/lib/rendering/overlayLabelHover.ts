export type OverlayLabelHoverBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type ResolveTextHoverBoundsOptions = {
  centerX: number;
  labelWidth: number;
  boxTop: number;
  boxBottom: number;
  paddingX?: number;
  paddingY?: number;
  minimumWidth?: number;
};

export type ResolveOverlayLabelHoverBoundsOptions = {
  centerX: number;
  labelWidth: number;
  bandLeft: number;
  bandRight: number;
  bandTop: number;
  bandBottom: number;
  paddingX?: number;
  paddingY?: number;
  minimumWidth?: number;
};

export function resolveTextHoverBounds({
  centerX,
  labelWidth,
  boxTop,
  boxBottom,
  paddingX = 10,
  paddingY = 6,
  minimumWidth = 28,
}: ResolveTextHoverBoundsOptions): OverlayLabelHoverBounds {
  const halfWidth = Math.max(labelWidth / 2 + paddingX, minimumWidth / 2);

  return {
    left: centerX - halfWidth,
    right: centerX + halfWidth,
    top: boxTop - paddingY,
    bottom: boxBottom + paddingY,
  };
}

export function resolveOverlayLabelHoverBounds({
  centerX,
  labelWidth,
  bandLeft,
  bandRight,
  bandTop,
  bandBottom,
  paddingX = 10,
  paddingY = 6,
  minimumWidth = 28,
}: ResolveOverlayLabelHoverBoundsOptions): OverlayLabelHoverBounds {
  const hoverBounds = resolveTextHoverBounds({
    centerX,
    labelWidth,
    boxTop: bandTop,
    boxBottom: bandBottom,
    paddingX,
    paddingY,
    minimumWidth,
  });

  return {
    left: Math.max(bandLeft, hoverBounds.left),
    right: Math.min(bandRight, hoverBounds.right),
    top: hoverBounds.top,
    bottom: hoverBounds.bottom,
  };
}
