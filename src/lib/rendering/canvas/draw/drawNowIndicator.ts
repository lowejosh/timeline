import {
  TIMELINE_MAX_YEAR,
  toApproximateTimelineYear,
} from "@/lib/core/viewport";
import type { CanvasDrawContext } from "./drawContext";

export function drawNowIndicator(cx: CanvasDrawContext): void {
  const { context, toX, fromX, pad, sceneWidth, layout, fontSans } = cx;
  const edgeRightYear = toApproximateTimelineYear(fromX(sceneWidth - pad));
  const rawNowX = toX(TIMELINE_MAX_YEAR);
  const nowX = edgeRightYear === TIMELINE_MAX_YEAR ? sceneWidth - pad : rawNowX;

  if (nowX >= pad - 20 && nowX <= sceneWidth - pad + 20) {
    context.save();
    context.strokeStyle = "rgba(180, 80, 40, 0.5)";
    context.lineWidth = 2;
    context.setLineDash([4, 4]);
    context.beginPath();
    context.moveTo(nowX, layout.nowTop);
    context.lineTo(nowX, layout.nowBottom);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "rgba(180, 80, 40, 0.7)";
    context.font = `10px ${fontSans}`;
    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.fillText("now", nowX, layout.nowTop - 4);
    context.restore();
  }
}
