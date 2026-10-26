import { getTimelineYearFromYearsAgo } from "@/lib/core/timelineYears";
import type { CanvasDrawContext } from "@/lib/rendering/canvas/draw/drawContext";
import data from "./gts2020.json";

const intervals = data.boundariesMa.slice(0, -1).map((youngMa, index) => ({
  youngMa,
  oldMa: data.boundariesMa[index + 1],
  normal: index % 2 === 0,
  startYear: getTimelineYearFromYearsAgo(data.boundariesMa[index + 1] * 1e6),
  endYear: getTimelineYearFromYearsAgo(youngMa * 1e6),
}));

export function getVisiblePolarityIntervals(toX: (year: number) => number, left: number, right: number) {
  return intervals.flatMap(interval => {
    const x0 = Math.max(left, toX(interval.startYear));
    const x1 = Math.min(right, toX(interval.endYear));
    return x1 > x0 ? [{ ...interval, x0, x1 }] : [];
  });
}

const formatAge = (ageMa: number) => ageMa < 1
  ? `${Number((ageMa * 1e3).toFixed(3))} thousand years ago`
  : `${ageMa} million years ago`;

export function drawMagneticPolarity(cx: CanvasDrawContext) {
  const { context, pad, sceneWidth, layout, toX, line, paper, hoverRegions } = cx;
  const visible = getVisiblePolarityIntervals(toX, pad, sceneWidth - pad);
  if (!visible.length) return;
  // Share the axis centreline so polarity reads as part of the baseline.
  const height = 2;
  const top = layout.axisY - height / 2;
  // Integrate subpixel intervals into each pixel. Dense reversals blend by
  // duration instead of becoming exaggerated one-pixel stripes or disappearing.
  const pixels = new Map<number, { normal: number; total: number }>();
  for (const interval of visible) {
    for (let x = Math.floor(interval.x0); x < Math.ceil(interval.x1); x++) {
      const coverage = Math.max(0, Math.min(x + 1, interval.x1) - Math.max(x, interval.x0));
      const pixel = pixels.get(x) ?? { normal: 0, total: 0 };
      pixel.total += coverage;
      if (interval.normal) pixel.normal += coverage;
      pixels.set(x, pixel);
    }
    hoverRegions.push({
      id: `magnetic-polarity:${interval.youngMa}`,
      left: interval.x0, right: interval.x1, top: top - 2, bottom: top + height + 3,
      anchorX: (interval.x0 + interval.x1) / 2, anchorY: top - 5,
      anchorMode: "follow-x", placement: "above",
      tooltip: {
        kind: "era", kindLabel: "Magnetic polarity",
        title: interval.normal ? "Normal polarity" : "Reversed polarity",
        timeLabel: `${formatAge(interval.oldMa)} – ${interval.youngMa === 0 ? "Present" : formatAge(interval.youngMa)}`,
        description: interval.normal ? "Same polarity as today." : "Opposite polarity to today.",
        sources: [{ id: "gts2020-pmagpy", shortTitle: "GTS2020 · PmagPy", title: "Geologic Time Scale 2020, as distributed by PmagPy", organization: "PmagPy", url: data.sourceUrl }],
      },
    });
  }
  context.save();
  context.beginPath();
  context.rect(pad, top, sceneWidth - 2 * pad, height);
  context.clip();
  for (const [x, pixel] of pixels) {
    context.fillStyle = paper;
    context.globalAlpha = 0.8 * pixel.total;
    context.fillRect(x, top, 1, height);
    context.fillStyle = line;
    context.globalAlpha = 0.72 * pixel.normal + 0.2 * (pixel.total - pixel.normal);
    context.fillRect(x, top, 1, height);
  }
  context.restore();
}
