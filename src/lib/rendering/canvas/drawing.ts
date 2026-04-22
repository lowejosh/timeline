import { resolveOverlayLabelPaint } from "../contextBands";
import {
  OVERLAY_BAND_DISCLOSURE_RESERVED_WIDTH,
  OVERLAY_BAND_SIDE_PADDING,
} from "./constants";

export type CanvasOcclusionRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export function getOverlayLabelPaint(
  bandColor: string,
  bandOpacity: number,
  fallbackLabelColor: string,
  backgroundColor: string,
) {
  return resolveOverlayLabelPaint({
    bandColor,
    bandOpacity,
    fallbackLabelColor,
    backgroundColor,
  });
}

export function drawPaperOverlayBand({
  context,
  x,
  y,
  width,
  height,
  bandColor,
  alpha,
  borderStyle,
  drawBorder,
}: {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  bandColor: string;
  alpha: number;
  borderStyle: string;
  drawBorder: boolean;
}) {
  context.save();
  context.globalAlpha = alpha;
  context.shadowColor = "rgba(64, 46, 31, 0.2)";
  context.shadowBlur = 5;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 1;
  context.fillStyle = bandColor;
  context.fillRect(x, y, width, height);

  if (drawBorder) {
    context.shadowColor = "rgba(0, 0, 0, 0)";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.globalAlpha = Math.min(alpha * 0.72 + 0.08, 0.86);
    context.strokeStyle = borderStyle;
    context.lineWidth = 1;
    context.strokeRect(x, y, width, height);
  }

  context.restore();
}

export function resolveOverlayBandLabelInsets({
  iconReservedWidth = 0,
  hasDisclosure = false,
}: {
  iconReservedWidth?: number;
  hasDisclosure?: boolean;
}) {
  return {
    left: OVERLAY_BAND_SIDE_PADDING + Math.max(iconReservedWidth, 0),
    right:
      OVERLAY_BAND_SIDE_PADDING +
      (hasDisclosure ? OVERLAY_BAND_DISCLOSURE_RESERVED_WIDTH : 0),
  };
}

export function pushCanvasOcclusionRect(
  rects: CanvasOcclusionRect[],
  rect: CanvasOcclusionRect,
) {
  const left = Math.min(rect.left, rect.right);
  const right = Math.max(rect.left, rect.right);
  const top = Math.min(rect.top, rect.bottom);
  const bottom = Math.max(rect.top, rect.bottom);

  if (right - left < 0.5 || bottom - top < 0.5) {
    return;
  }

  rects.push({ left, right, top, bottom });
}

export function clipCanvasOutsideOcclusionRects(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  rects: readonly CanvasOcclusionRect[],
  padding = 1,
) {
  if (rects.length === 0) {
    return;
  }

  context.beginPath();
  context.rect(0, 0, width, height);

  for (const rect of rects) {
    context.rect(
      rect.left - padding,
      rect.top - padding,
      rect.right - rect.left + padding * 2,
      rect.bottom - rect.top + padding * 2,
    );
  }

  context.clip("evenodd");
}
