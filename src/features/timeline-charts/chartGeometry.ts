import { createWorldToScreen, getVisibleRange, type TimelineViewport } from "@/lib/core/viewport";
import type { ChartData, ChartDefinition, ChartPoint, ChartSegment } from "./chartCatalog";

export function lowerBound(points: readonly ChartPoint[], year: number) {
  let low = 0;
  let high = points.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (points[mid][0] < year) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** Includes the neighbouring samples needed to clip a segment at each edge. */
export function chartWindow(points: readonly ChartPoint[], start: number, end: number) {
  if (!points.length || end < points[0][0] || start > points[points.length - 1][0]) return [];
  return points.slice(Math.max(0, lowerBound(points, start) - 1), Math.min(points.length, lowerBound(points, end) + 1));
}

export function nearestChartPoint(points: readonly ChartPoint[], year: number) {
  if (!points.length || year < points[0][0] || year > points[points.length - 1][0]) return null;
  const right = lowerBound(points, year);
  if (right === 0) return points[0];
  if (right === points.length) return points[right - 1];
  return year - points[right - 1][0] <= points[right][0] - year ? points[right - 1] : points[right];
}

export function fitChartDomain(points: readonly ChartPoint[], fallback: [number, number], includeUncertainty = false): [number, number] {
  if (!points.length) return fallback;
  const min = Math.min(...points.map(point => includeUncertainty ? point[2] ?? point[1] : point[1]));
  const max = Math.max(...points.map(point => includeUncertainty ? point[3] ?? point[1] : point[1]));
  const margin = Math.max((max - min) * 0.12, Math.abs(max) * 0.015, 0.1);
  // Rounding the domain to tick steps makes otherwise continuous zooming jump.
  return [fallback[0] >= 0 && min >= 0 ? Math.max(0, min - margin) : min - margin, max + margin];
}

export type ChartPlotPoint = { x: number; value: number; low?: number; high?: number };

/** A frozen Y scale can put new values far outside the plot; clip those too. */
export function clipChartLine(points: readonly ChartPlotPoint[], domain: [number, number]) {
  const paths: ChartPlotPoint[][] = [];
  let path: ChartPlotPoint[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const delta = b.value - a.value;
    let enter = 0;
    let exit = 1;
    if (delta === 0) {
      if (a.value < domain[0] || a.value > domain[1]) { path = []; continue; }
    } else {
      const t0 = (domain[0] - a.value) / delta;
      const t1 = (domain[1] - a.value) / delta;
      enter = Math.max(0, Math.min(t0, t1));
      exit = Math.min(1, Math.max(t0, t1));
      if (enter > exit) { path = []; continue; }
    }
    const at = (t: number) => ({ x: a.x + (b.x - a.x) * t, value: Math.max(domain[0], Math.min(domain[1], a.value + delta * t)) });
    const start = at(enter);
    if (!path.length || enter > 0) { path = [start]; paths.push(path); }
    path.push(at(exit));
    if (exit < 1) path = [];
  }
  return paths;
}

export function clipChartRibbon(points: readonly ChartPlotPoint[], domain: [number, number]) {
  let polygon = [...points.map(point => ({ x: point.x, value: point.low! })), ...[...points].reverse().map(point => ({ x: point.x, value: point.high! }))];
  for (const [bound, direction] of [[domain[0], 1], [domain[1], -1]]) {
    const clipped: typeof polygon = [];
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[(i + polygon.length - 1) % polygon.length];
      const b = polygon[i];
      const aInside = (a.value - bound) * direction >= 0;
      const bInside = (b.value - bound) * direction >= 0;
      if (aInside !== bInside) {
        const t = (bound - a.value) / (b.value - a.value);
        clipped.push({ x: a.x + (b.x - a.x) * t, value: bound });
      }
      if (bInside) clipped.push(b);
    }
    polygon = clipped;
  }
  return polygon;
}

/** Clip before Canvas sees the path: distant neighbours can be trillions of pixels away. */
export function clipChartPoints(points: readonly ChartPoint[], toX: (year: number) => number, left: number, right: number): ChartPlotPoint[] {
  const projected = points.map(([year, value, low, high]) => ({ x: toX(year), value, low, high }));
  const result: ChartPlotPoint[] = [];
  const atX = (a: ChartPlotPoint, b: ChartPlotPoint, x: number): ChartPlotPoint => {
    const t = b.x === a.x ? 0 : (x - a.x) / (b.x - a.x);
    return { x, value: a.value + (b.value - a.value) * t,
      low: a.low !== undefined && b.low !== undefined ? a.low + (b.low - a.low) * t : undefined,
      high: a.high !== undefined && b.high !== undefined ? a.high + (b.high - a.high) * t : undefined };
  };
  for (let i = 1; i < projected.length; i++) {
    const a = projected[i - 1];
    const b = projected[i];
    if (b.x < left || a.x > right) continue;
    const start = atX(a, b, Math.max(left, a.x));
    const end = atX(a, b, Math.min(right, b.x));
    const previous = result[result.length - 1];
    if (!previous || previous.x !== start.x || previous.value !== start.value) result.push(start);
    result.push(end);
  }
  return result;
}

export function chartSegments(data: ChartData): ChartSegment[] {
  return data.segments ?? [{ id: "record", label: "", sourceUrl: data.sourceUrl, style: "solid", points: data.points }];
}

export type ChartProjection = ReturnType<typeof projectChart>;
export function withChartDomain(projection: ChartProjection, domain: [number, number]) {
  return { ...projection, domain, toY: (value: number) => projection.bottom - (value - domain[0]) / (domain[1] - domain[0]) * (projection.bottom - projection.top) };
}
export function projectChart(chart: ChartDefinition, data: ChartData, viewport: TimelineViewport, width: number, pad: number, top: number, bottom: number, fitVisible: boolean, uncertainty: boolean) {
  const innerWidth = Math.max(1, width - pad * 2);
  const [start, end] = getVisibleRange(viewport, innerWidth);
  const projectX = createWorldToScreen(viewport, innerWidth);
  const toX = (year: number) => pad + projectX(year);
  const segments = chartSegments(data).map(segment => {
    const points = chartWindow(segment.points, start, end);
    const plot = clipChartPoints(points, toX, pad, width - pad);
    const coverageWidth = plot.length ? plot[plot.length - 1].x - plot[0].x : 0;
    return { ...segment, record: segment.points, points, plot, drawable: plot.length >= 2 && coverageWidth >= 4 };
  }).filter(segment => segment.points.length > 0);
  const points = segments.flatMap(segment => segment.points);
  // Edge values are interpolated only for geometry; readouts still use actual observations.
  // A source's nominal full-record range must not rescale a tiny visible fragment.
  const visible = segments.flatMap(segment => segment.plot.map(point => [0, point.value, point.low, point.high] as ChartPoint));
  const fitted = fitChartDomain(visible, chart.domain, uncertainty);
  const min = visible.reduce((value, point) => Math.min(value, uncertainty ? point[2] ?? point[1] : point[1]), chart.domain[0]);
  const max = visible.reduce((value, point) => Math.max(value, uncertainty ? point[3] ?? point[1] : point[1]), chart.domain[1]);
  const domain: [number, number] = fitVisible ? fitted : [min - (chart.domain[0] - min) * 0.12, max + (max - chart.domain[1]) * 0.12];
  const toY = (value: number) => bottom - (value - domain[0]) / (domain[1] - domain[0]) * (bottom - top);
  return { points, segments, domain, toX, toY, start, end, top, bottom, drawable: segments.some(segment => segment.drawable) };
}

/** Segment bounds prevent interpolation and inspection across source gaps. */
export function chartReadoutAt(projection: ChartProjection, _data: ChartData, year: number, x: number, y: number) {
  if (!projection.drawable || y < projection.top || y > projection.bottom) return null;
  for (const segment of projection.segments) {
    if (!segment.drawable) continue;
    const point = nearestChartPoint(segment.record, year);
    if (!point) continue;
    const right = lowerBound(segment.points, year);
    const a = segment.points[Math.max(0, right - 1)];
    const b = segment.points[Math.min(right, segment.points.length - 1)];
    if (!a || !b) continue;
    const x0 = projection.toX(a[0]);
    const x1 = projection.toX(b[0]);
    const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
    const curveY = projection.toY(a[1] + (b[1] - a[1]) * t);
    if (Math.abs(y - curveY) <= 16) return { point, curveY, segment };
  }
  return null;
}
