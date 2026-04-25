export const TIMELINE_CANVAS_PAD = 80;
export const TIMELINE_CANVAS_PAD_PORTRAIT_MOBILE = 34;

export function getTimelineCanvasPad(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return TIMELINE_CANVAS_PAD;
  }

  const isPortraitMobile = width <= 720 && height > width;

  return isPortraitMobile
    ? TIMELINE_CANVAS_PAD_PORTRAIT_MOBILE
    : TIMELINE_CANVAS_PAD;
}
