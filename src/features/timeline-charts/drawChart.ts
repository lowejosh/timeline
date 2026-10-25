import type { CanvasDrawContext } from "@/lib/rendering/canvas/draw/drawContext";
import { formatTimelinePointLabel } from "@/lib/rendering/bands";
import { formatChartValue, type ChartData, type ChartDefinition } from "./chartCatalog";
import { chartReadoutAt, clipChartLine, clipChartRibbon, projectChart, withChartDomain, type ChartPlotPoint } from "./chartGeometry";
import type { ChartAxisMotion } from "./chartAxisMotion";

export type ChartRenderState = {
  chart: ChartDefinition;
  data: ChartData;
  side: "left" | "right";
  fitVisible: boolean;
  showUncertainty: boolean;
};

export function chartLineDash(style: "solid" | "dashed" | "dotted", points: ChartPlotPoint[]) {
  const width = points.length ? points[points.length - 1].x - points[0].x : 0;
  // Dense oscillations already convey the reconstruction. Tiny dashes turn them into visual noise.
  if (points.length > width / 8) return [];
  return style === "dashed" ? [10, 7] : style === "dotted" ? [2, 6] : [];
}

function reduceToPixels(points: ChartPlotPoint[]) {
  const plotted: ChartPlotPoint[] = [];
  for (let i = 0; i < points.length;) {
    let j = i + 1;
    const pixel = Math.floor(points[i].x);
    while (j < points.length && Math.floor(points[j].x) === pixel) j++;
    if (j - i <= 2) plotted.push(...points.slice(i, j));
    else {
      const bucket = points.slice(i, j);
      const min = bucket.reduce((a, b) => a.value < b.value ? a : b);
      const max = bucket.reduce((a, b) => a.value > b.value ? a : b);
      const retained = new Set([bucket[0], min, max, bucket[bucket.length - 1]]);
      plotted.push(...bucket.filter(point => retained.has(point)));
    }
    i = j;
  }
  return plotted;
}

export function drawChart(cx: CanvasDrawContext, state: ChartRenderState, axisMotion?: ChartAxisMotion, reducedMotion = false) {
  const { context: ctx, pad, sceneWidth, layout } = cx;
  const { chart, data, fitVisible, showUncertainty, side } = state;
  const top = sceneWidth < 640 ? 110 : 100;
  const bottom = layout.overlayClipBottom - 12;
  if (bottom - top < 60) return null;
  const targetProjection = projectChart(chart, data, cx.sceneViewport, sceneWidth, pad, top, bottom, fitVisible, showUncertainty);
  const viewportKey = `${cx.sceneViewport.centerYearWhole ?? cx.sceneViewport.centerYear}:${cx.sceneViewport.centerYearFraction ?? 0}:${cx.sceneViewport.zoom}:${cx.sceneViewport.scaleMode}:${sceneWidth}:${pad}`;
  const motion = axisMotion?.update(chart.id, targetProjection.domain, viewportKey, cx.isViewportInteractionActive, cx.drawNow, reducedMotion);
  const projection = { ...withChartDomain(targetProjection, motion?.domain ?? targetProjection.domain), axisAnimating: motion?.needsFrame ?? false };
  const { domain, toY } = projection;
  const right = side === "right";
  const axisX = right ? sceneWidth - Math.max(pad, 48) : Math.max(pad, 48);
  ctx.save();
  ctx.font = `10px ${cx.fontSans}`;
  ctx.textAlign = right ? "left" : "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = chart.color;
  // Titles identify both independent scales even where a record has no coverage.
  for (const value of [domain[1], (domain[0] + domain[1]) / 2, domain[0]]) {
    if (!projection.drawable) break;
    const y = toY(value);
    ctx.globalAlpha = 0.85;
    ctx.fillText(formatChartValue(value, chart), axisX + (right ? 8 : -8), y);
    ctx.strokeStyle = chart.color;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(axisX - 3, y);
    ctx.lineTo(axisX + 3, y);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(right ? sceneWidth - 12 : 12, (top + bottom) / 2);
  ctx.rotate(right ? Math.PI / 2 : -Math.PI / 2);
  ctx.font = `500 ${sceneWidth < 640 ? 9 : 11}px ${cx.fontSans}`;
  ctx.textAlign = "center";
  ctx.globalAlpha = 0.85;
  const label = `${chart.label} · ${chart.unit}${projection.drawable ? "" : " · no data"}`;
  ctx.fillText(label, 0, 0, bottom - top - 10);
  ctx.restore();
  if (!projection.drawable) { ctx.restore(); return projection; }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.rect(pad, top - 1, sceneWidth - pad * 2, bottom - top + 2);
  ctx.clip();
  for (const segment of projection.segments) {
    if (!segment.drawable) continue;
    const points = reduceToPixels(segment.plot);
    ctx.setLineDash([]);
    if (showUncertainty && segment.plot.every(point => point.low !== undefined && point.high !== undefined)) {
      ctx.beginPath();
      clipChartRibbon(segment.plot, domain).forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, toY(point.value));
        else ctx.lineTo(point.x, toY(point.value));
      });
      ctx.closePath();
      ctx.fillStyle = chart.color;
      ctx.globalAlpha = 0.06;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    clipChartLine(points, domain).forEach(path => {
      path.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, toY(point.value));
        else ctx.lineTo(point.x, toY(point.value));
      });
    });
    ctx.setLineDash(chartLineDash(segment.style, points));
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = cx.paper;
    ctx.lineWidth = 4.5;
    ctx.globalAlpha = 0.85;
    ctx.stroke();
    ctx.strokeStyle = chart.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;
    ctx.stroke();
  }
  ctx.restore();
  return projection;
}

/** One readout for the closest curve; historical label interactions retain priority. */
export function drawChartReadouts(cx: CanvasDrawContext, states: readonly ChartRenderState[], projections: ReturnType<typeof drawChart>[], pointer: { x: number; y: number } | null) {
  if (!pointer || pointer.x < cx.pad || pointer.x > cx.sceneWidth - cx.pad) return;
  if (cx.hoverRegions.some(region => pointer.x >= region.left && pointer.x <= region.right && pointer.y >= region.top && pointer.y <= region.bottom)) return;
  const year = cx.fromX(pointer.x);
  const candidates = states.flatMap((state, index) => {
    const projection = projections[index];
    if (!projection) return [];
    const readout = chartReadoutAt(projection, state.data, year.wholeYear + year.fraction, pointer.x, pointer.y);
    return readout ? [{ state, projection, ...readout }] : [];
  }).sort((a, b) => Math.abs(a.curveY - pointer.y) - Math.abs(b.curveY - pointer.y));
  const candidate = candidates[0];
  if (!candidate) return;
  const { state, projection, point, curveY, segment } = candidate;
  const { context: ctx } = cx;
  ctx.save();
  ctx.strokeStyle = state.chart.color;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.moveTo(pointer.x, projection.top);
  ctx.lineTo(pointer.x, cx.layout.axisY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  const approximate = segment.style !== "solid" || state.chart.id === "temperature" ? "≈" : "";
  const text = `${approximate}${formatChartValue(point[1], state.chart)} ${state.chart.unit} · ${formatTimelinePointLabel(point[0])}`;
  ctx.font = `11px ${cx.fontSans}`;
  const label = state.chart.label;
  const w = Math.min(Math.max(ctx.measureText(text).width, ctx.measureText(label).width) + 20, cx.innerWidth - 8);
  const x = Math.max(cx.pad + 4, Math.min(pointer.x + 12, cx.sceneWidth - cx.pad - w - 4));
  const y = Math.max(projection.top + 4, Math.min(curveY - 49, projection.bottom - 43));
  ctx.fillStyle = cx.paper;
  ctx.globalAlpha = 0.96;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 40, 5);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = state.chart.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `10px ${cx.fontSans}`;
  ctx.fillText(label, x + 10, y + 11, w - 20);
  ctx.font = `11px ${cx.fontSans}`;
  ctx.fillText(text, x + 10, y + 27, w - 20);
  ctx.beginPath();
  ctx.arc(pointer.x, curveY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
