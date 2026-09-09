import type { CanvasDrawContext } from "./drawContext";

export function drawGuidedCursor(cx: CanvasDrawContext) {
  const year = cx.guidedFocus?.currentYear;
  if (year === undefined) return;
  const x = cx.toX(year);
  if (x < cx.pad || x > cx.sceneWidth - cx.pad) return;
  const { context, layout } = cx;
  const top = Math.min(layout.axisY - 30, Math.max(88, layout.overlayClipTop - 22));
  context.save();
  context.strokeStyle = cx.labelColor;
  context.fillStyle = cx.labelColor;
  context.globalAlpha = 0.35;
  context.lineWidth = 1;
  context.setLineDash([3, 4]);
  context.beginPath();
  context.moveTo(x, top);
  context.lineTo(x, layout.axisY);
  context.stroke();
  context.restore();
}
