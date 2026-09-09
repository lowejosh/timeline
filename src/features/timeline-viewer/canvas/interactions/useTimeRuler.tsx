import { useRef, useState, type PointerEvent } from "react";
import { screenToWorldPrecise, worldPreciseToScreen, subtractPreciseTimelineYears, type PreciseTimelineYear, type TimelineViewport } from "@/lib/core/viewport";
import { formatMeasuredSpan } from "@/lib/rendering/timeMeasurement";

type Measurement = { start: PreciseTimelineYear; end: PreciseTimelineYear; y: number };

export function useTimeRuler(viewport: TimelineViewport, width: number, height: number, pad: number, axisY: number) {
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pointer = useRef<number | null>(null);
  const innerWidth = Math.max(width - pad * 2, 1);
  const clampX = (x: number) => Math.max(pad, Math.min(width - pad, x));
  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return screenToWorldPrecise(clampX((event.clientX - rect.left) * width / rect.width) - pad, viewport, innerWidth);
  }
  function clear() { pointer.current = null; setIsDragging(false); setMeasurement(null); }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    if (event.button !== 2 || event.pointerType === "touch") return false;
    event.preventDefault();
    const year = point(event);
    const rect = event.currentTarget.getBoundingClientRect();
    setMeasurement({ start: year, end: year, y: Math.max(92, Math.min(height - 44, (event.clientY - rect.top) * height / rect.height)) });
    pointer.current = event.pointerId;
    setIsDragging(true);
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    return true;
  }
  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (pointer.current !== event.pointerId) return false;
    const end = point(event);
    setMeasurement(current => current && { ...current, end });
    return true;
  }
  function end(event: PointerEvent<HTMLCanvasElement>) {
    if (pointer.current !== event.pointerId) return false;
    if (event.type === "pointercancel" || event.type === "lostpointercapture") clear();
    else { move(event); pointer.current = null; setIsDragging(false); }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    return true;
  }
  let overlay = null;
  if (measurement) {
    const startX = pad + worldPreciseToScreen(measurement.start, viewport, innerWidth);
    const endX = pad + worldPreciseToScreen(measurement.end, viewport, innerWidth);
    const left = Math.min(startX, endX), right = Math.max(startX, endX);
    const x0 = clampX(left), x1 = clampX(right);
    const y = Math.max(75, Math.min(height - 30, measurement.y));
    const label = formatMeasuredSpan(subtractPreciseTimelineYears(measurement.end, measurement.start));
    if (right >= pad && left <= width - pad) overlay = (
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-foreground/65" aria-hidden="true">
        <svg className="absolute inset-0 size-full" viewBox={`0 0 ${width} ${height}`}>
          <path d={`M ${x0} ${y} H ${x1}`} stroke="currentColor" strokeWidth="1" opacity="0.65" />
          {[startX, endX].filter(x => x >= pad && x <= width - pad).map((x, i) => <g key={i}>
            <path d={`M ${x} ${y + 7} V ${axisY}`} stroke="currentColor" strokeDasharray="2 5" opacity="0.2" />
            <path d={`M ${x} ${y - 5} V ${y + 5}`} stroke="currentColor" opacity="0.7" />
            <circle cx={x} cy={axisY} r="2" fill="currentColor" opacity="0.5" />
          </g>)}
        </svg>
        <span className="absolute -translate-x-1/2 -translate-y-full rounded-full border border-foreground/10 bg-background/85 px-2.5 py-1 text-[11px] tabular-nums shadow-sm backdrop-blur-sm" style={{ left: Math.max(Math.min(100, width / 2), Math.min(width - Math.min(100, width / 2), (x0 + x1) / 2)), top: y - 8, maxWidth: Math.max(width - 16, 1), whiteSpace: "nowrap" }}>{label}</span>
      </div>
    );
  }
  return { start, move, end, clear, pointer, overlay, isDragging, hasMeasurement: measurement !== null };
}
