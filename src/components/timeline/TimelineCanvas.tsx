import { useEffect, useRef, type PointerEvent, type WheelEvent } from "react";
import { formatTimelineYear, getTimelineTicks } from "../../lib/time/bands";
import { type Era } from "../../lib/data/eras";
import {
  getZoomAnchorForCanvasX,
  getVisibleRange,
  getYearsPerPixel,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  panByPixels,
  screenToWorld,
  worldToScreen,
  zoomAtPosition,
  type TimelineViewport,
} from "../../lib/time/viewport";
import {
  getInteractiveDescendantEras,
  resolveTimelineEraLayers,
} from "../../lib/time/childLayers";

type TimelineCanvasProps = {
  width: number;
  height: number;
  viewport: TimelineViewport;
  /** The currently drilled-into era (or root) */
  activeEra: Era;
  /** Children of the active era's parent (the "base" layer, always visible) */
  siblingEras: Era[];
  parentEra: Era | null;
  isAnimating: boolean;
  onViewportChange: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onAnimateZoom: (zoomDelta: number, anchorX: number) => void;
  onAnimateToRange: (startYear: number, endYear: number) => void;
  onDrillIntoEra: (era: Era) => void;
  onNavigateUp: () => void;
  onRecordDragSample: (dx: number) => void;
  onReleaseMomentum: () => void;
};

type DragState = {
  pointerId: number;
  lastX: number;
};

const NOW_YEAR = new Date().getFullYear();
const PAD = 120;

function getTickOpacity(
  _tick: number,
  majorStep: number,
  zoom: number,
): number {
  // Fade ticks in/out near zoom thresholds
  const ypp = getYearsPerPixel(zoom);
  const pixelsPerStep = majorStep / ypp;

  if (pixelsPerStep < 40) {
    return Math.max(0, (pixelsPerStep - 20) / 20);
  }

  return 1;
}

function findEraAtYear(eras: Era[], year: number): Era | undefined {
  return eras.find((era) => year >= era.startYear && year <= era.endYear);
}

export function TimelineCanvas({
  width,
  height,
  viewport,
  activeEra,
  siblingEras,
  parentEra,
  isAnimating,
  onViewportChange,
  onAnimateZoom,
  onAnimateToRange,
  onDrillIntoEra,
  onNavigateUp,
  onRecordDragSample,
  onReleaseMomentum,
}: TimelineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const resolvedEraLayers = resolveTimelineEraLayers(
    siblingEras,
    activeEra.id,
    viewport,
    width,
    PAD,
    isAnimating,
  );
  const visibleEraLayers = resolvedEraLayers.filter(
    (layer) => layer.opacity > 0.01,
  );
  const interactiveChildEras = getInteractiveDescendantEras(resolvedEraLayers);
  const activeChildOpacity =
    resolvedEraLayers.find((layer) => layer.era.id === activeEra.id)?.childOpacity ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || width <= 0 || height <= 0) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const styles = getComputedStyle(document.documentElement);
    const paper = styles.getPropertyValue("--timeline-surface").trim();
    const paperDeep = styles.getPropertyValue("--timeline-surface-deep").trim();
    const line = styles.getPropertyValue("--timeline-line").trim();
    const lineSoft = styles.getPropertyValue("--timeline-line-soft").trim();
    const labelColor = styles.getPropertyValue("--timeline-label").trim();
    const pad = PAD;
    const innerWidth = width - pad * 2;
    const axisY = height / 2;

    const [rangeStart, rangeEnd] = getVisibleRange(viewport, innerWidth);
    const tickStart = Math.max(rangeStart, TIMELINE_MIN_YEAR);
    const tickEnd = Math.min(rangeEnd, TIMELINE_MAX_YEAR);
    const { major, minor, majorStep } = getTimelineTicks(
      tickStart,
      tickEnd,
      innerWidth,
    );

    // Helper: map world year to canvas x (offset into padded region)
    const toX = (year: number) =>
      pad + worldToScreen(year, viewport, innerWidth);

    // Background
    const background = context.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, paper);
    background.addColorStop(1, paperDeep);
    context.clearRect(0, 0, width, height);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    // Parent era tint in gaps between child era bands
    if (parentEra && parentEra.color !== "rgba(0, 0, 0, 0)") {
      const tintColor = parentEra.color.replace(/[\d.]+\)$/, "0.06)");
      context.fillStyle = tintColor;
      context.fillRect(pad, 0, innerWidth, height);
    }

    // Helper to render one era band
    const renderEra = (era: Era, opacity: number) => {
      if (opacity < 0.01) return;

      const x0 = toX(era.startYear);
      const x1 = toX(era.endYear);
      const eraWidth = x1 - x0;

      if (x1 < pad || x0 > width - pad || eraWidth < 2) return;

      context.save();
      context.globalAlpha = opacity;
      context.fillStyle = era.color;
      context.fillRect(
        Math.max(x0, pad),
        0,
        Math.min(x1, width - pad) - Math.max(x0, pad),
        height,
      );
      context.restore();

      if (eraWidth > 60) {
        context.save();
        context.globalAlpha = Math.min((eraWidth - 60) / 80, 0.35) * opacity;
        context.font = "11px var(--font-sans)";
        context.fillStyle = labelColor;
        context.textAlign = "center";
        context.textBaseline = "bottom";
        const labelX = Math.max(x0, pad) / 2 + Math.min(x1, width - pad) / 2;
        context.fillText(era.name, labelX, axisY - 44);
        context.restore();
      }
    };

    // Render the resolved recursive era tree in depth order.
    for (const layer of visibleEraLayers) {
      renderEra(layer.era, layer.opacity);
    }

    // Era label (top center) — always shows active era name; adds breadcrumb when drilled in
    {
      context.save();
      context.font = "13px var(--font-sans)";
      context.fillStyle = labelColor;
      context.textAlign = "center";
      context.textBaseline = "top";
      if (parentEra && activeChildOpacity > 0.1) {
        context.globalAlpha = 0.25 * activeChildOpacity;
        context.fillText(
          parentEra.name + " › " + activeEra.name,
          width / 2,
          16,
        );
      } else {
        context.globalAlpha = 0.25;
        context.fillText(activeEra.name, width / 2, 16);
      }
      context.restore();
    }

    // Axis line — always spans full padded area
    context.strokeStyle = line;
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(pad, axisY);
    context.lineTo(width - pad, axisY);
    context.stroke();

    // Minor ticks with fade
    const minorOpacity = getTickOpacity(0, majorStep / 5, viewport.zoom);

    if (minorOpacity > 0.01) {
      context.save();
      context.strokeStyle = lineSoft;
      context.lineWidth = 1;

      for (const tick of minor) {
        const x = toX(tick);
        if (x < pad - 16 || x > width - pad + 16) continue;
        const edgeFade = Math.min(
          Math.max(0, (x - pad) / 40),
          Math.max(0, (width - pad - x) / 40),
          1,
        );
        context.globalAlpha = minorOpacity * edgeFade;
        if (edgeFade > 0.01) {
          context.beginPath();
          context.moveTo(x, axisY - 10);
          context.lineTo(x, axisY + 10);
          context.stroke();
        }
      }

      context.restore();
    }

    // Edge ticks — always fixed at the padded edges, with labels showing the
    // actual visible years at those positions, clamped to the timeline bounds.
    const fromX = (px: number) => screenToWorld(px - pad, viewport, innerWidth);
    const edgeLeftYear = Math.max(
      TIMELINE_MIN_YEAR,
      Math.min(TIMELINE_MAX_YEAR, fromX(pad)),
    );
    const edgeRightYear = Math.max(
      TIMELINE_MIN_YEAR,
      Math.min(TIMELINE_MAX_YEAR, fromX(width - pad)),
    );
    const edgeLeftCutoff = edgeLeftYear + majorStep * 0.5;
    const edgeRightCutoff = edgeRightYear - majorStep * 0.5;

    // Major ticks with fade
    const majorOpacity = getTickOpacity(0, majorStep, viewport.zoom);
    const edgeLeftX = pad;
    const edgeRightX = width - pad;

    if (majorOpacity > 0.01) {
      context.save();
      context.strokeStyle = line;

      for (const tick of major) {
        const x = toX(tick);
        if (x < pad - 32 || x > width - pad + 32) continue;
        if (tick <= edgeLeftCutoff || tick >= edgeRightCutoff) continue;

        // Fade ticks near edge boundary ticks to avoid doubling
        const distToMin = Math.abs(x - edgeLeftX);
        const distToMax = Math.abs(x - edgeRightX);
        const distToBound = Math.min(distToMin, distToMax);
        const boundFade =
          distToBound < 40 ? Math.max(0, (distToBound - 4) / 36) : 1;

        // Fade at viewport edges
        const edgeFade = Math.min(
          Math.max(0, (x - pad) / 60),
          Math.max(0, (width - pad - x) / 60),
          1,
        );

        context.globalAlpha = majorOpacity * boundFade * edgeFade;
        if (boundFade * edgeFade > 0.01) {
          context.beginPath();
          context.moveTo(x, axisY - 28);
          context.lineTo(x, axisY + 28);
          context.stroke();
        }
      }

      context.restore();
    }

    // Edge boundary ticks — always at pad edges with accurate year labels
    const edgeTickData = [
      { year: edgeLeftYear, x: pad, align: "left" as const },
      { year: edgeRightYear, x: width - pad, align: "right" as const },
    ];

    for (const { year, x, align } of edgeTickData) {
      context.save();
      context.globalAlpha = 1;
      context.strokeStyle = line;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x, axisY - 28);
      context.lineTo(x, axisY + 28);
      context.stroke();

      const edgeLabel = formatTimelineYear(year, 1);
      context.fillStyle = labelColor;
      context.font = "11px var(--font-sans)";
      context.textAlign = align;
      context.textBaseline = "top";
      context.fillText(edgeLabel, x, axisY + 38);
      context.restore();
    }

    // "Now" indicator
    const rawNowX = toX(NOW_YEAR);
    const nowX = edgeRightYear === TIMELINE_MAX_YEAR ? width - pad : rawNowX;

    if (nowX >= pad - 20 && nowX <= width - pad + 20) {
      context.save();
      context.strokeStyle = "rgba(180, 80, 40, 0.5)";
      context.lineWidth = 2;
      context.setLineDash([4, 4]);
      context.beginPath();
      context.moveTo(nowX, axisY - 40);
      context.lineTo(nowX, axisY + 40);
      context.stroke();
      context.setLineDash([]);

      context.fillStyle = "rgba(180, 80, 40, 0.7)";
      context.font = "10px var(--font-sans)";
      context.textAlign = "center";
      context.textBaseline = "bottom";
      context.fillText("now", nowX, axisY - 44);
      context.restore();
    }

    // Labels
    const edgeLabelLeftX = pad;
    const edgeLabelRightX = width - pad;
    context.fillStyle = labelColor;
    context.font = "13px var(--font-sans)";
    context.textAlign = "center";
    context.textBaseline = "top";

    let lastLabelRight = -Infinity;

    for (const tick of major) {
      const x = toX(tick);
      if (x < pad - 80 || x > width - pad + 80) continue;
      if (tick <= edgeLeftCutoff || tick >= edgeRightCutoff) continue;

      const labelText = formatTimelineYear(tick, majorStep);
      const labelWidth = context.measureText(labelText).width;
      const labelLeft = x - labelWidth / 2;

      if (labelLeft <= lastLabelRight + 48) continue;

      // Fade out labels near edge boundary labels
      const distToMin = Math.abs(x - edgeLabelLeftX);
      const distToMax = Math.abs(x - edgeLabelRightX);
      const distToBoundary = Math.min(distToMin, distToMax);
      const boundaryFade =
        distToBoundary < 100 ? Math.max(0, (distToBoundary - 20) / 80) : 1;

      // Fade at viewport edges
      const labelEdgeFade = Math.min(
        Math.max(0, (x - pad) / 60),
        Math.max(0, (width - pad - x) / 60),
        1,
      );

      const labelAlpha = majorOpacity * boundaryFade * labelEdgeFade;
      context.save();
      context.globalAlpha = labelAlpha;
      if (labelAlpha > 0.01) {
        context.fillText(labelText, x, axisY + 38);
      }
      context.restore();
      lastLabelRight = labelLeft + labelWidth;
    }
  }, [
    activeEra,
    activeChildOpacity,
    height,
    parentEra,
    visibleEraLayers,
    viewport,
    width,
  ]);

  // Pinch-to-zoom via native gesture events (Safari) and touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width) return;

    // Safari gesture events
    const handleGestureChange = (event: Event) => {
      event.preventDefault();
      const gestureEvent = event as unknown as {
        scale: number;
        clientX: number;
        clientY: number;
      };
      const rect = canvas.getBoundingClientRect();
      const localX = gestureEvent.clientX - rect.left;
      const anchorX = getZoomAnchorForCanvasX(localX, width, PAD);
      const zoomDelta = Math.log2(gestureEvent.scale) * 2;
      onAnimateZoom(zoomDelta, anchorX);
    };

    const handleGestureStart = (event: Event) => event.preventDefault();
    const handleGestureEnd = (event: Event) => event.preventDefault();

    // Touch pinch for non-Safari
    let lastTouchDist = 0;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const dx = event.touches[1].clientX - event.touches[0].clientX;
        const dy = event.touches[1].clientY - event.touches[0].clientY;
        lastTouchDist = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const dx = event.touches[1].clientX - event.touches[0].clientX;
        const dy = event.touches[1].clientY - event.touches[0].clientY;
        const dist = Math.hypot(dx, dy);

        if (lastTouchDist > 0) {
          const scale = dist / lastTouchDist;
          const zoomDelta = Math.log2(scale) * 3;
          const rect = canvas.getBoundingClientRect();
          const localX =
            (event.touches[0].clientX + event.touches[1].clientX) / 2 -
            rect.left;
          const anchorX = getZoomAnchorForCanvasX(localX, width, PAD);
          const innerW = width - PAD * 2;
          onViewportChange((current) =>
            zoomAtPosition(current, current.zoom + zoomDelta, anchorX, innerW),
          );
        }

        lastTouchDist = dist;
      }
    };

    canvas.addEventListener("gesturestart", handleGestureStart, {
      passive: false,
    });
    canvas.addEventListener("gesturechange", handleGestureChange, {
      passive: false,
    });
    canvas.addEventListener("gestureend", handleGestureEnd, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener("gesturestart", handleGestureStart);
      canvas.removeEventListener("gesturechange", handleGestureChange);
      canvas.removeEventListener("gestureend", handleGestureEnd);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [width, viewport, onAnimateZoom, onViewportChange]);

  const handleWheel = (event: WheelEvent<HTMLCanvasElement>) => {
    if (!width) return;

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const anchorX = getZoomAnchorForCanvasX(localX, width, PAD);
    const innerW = width - PAD * 2;
    const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY);

    if (horizontalIntent) {
      onViewportChange((current) =>
        panByPixels(current, -event.deltaX, innerW),
      );
      return;
    }

    // Use animated zoom for smooth feel
    const zoomDelta = -event.deltaY * 0.003;
    onAnimateZoom(zoomDelta, anchorX);
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    dragStateRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
    };

    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !width) return;

    const deltaX = event.clientX - dragState.lastX;
    dragStateRef.current = { ...dragState, lastX: event.clientX };

    onRecordDragSample(deltaX);
    const innerW = width - PAD * 2;
    onViewportChange((current) => panByPixels(current, deltaX, innerW));
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      onReleaseMomentum();
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!width) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left - PAD;
    const innerW = width - PAD * 2;
    const clickYear = screenToWorld(clickX, viewport, innerW);
    // Check visible child layers first, then siblings
    const era =
      findEraAtYear(interactiveChildEras, clickYear) ??
      findEraAtYear(siblingEras, clickYear);

    if (era) {
      if (era.children && era.children.length > 0) {
        onDrillIntoEra(era);
      } else {
        onAnimateToRange(era.startYear, era.endYear);
      }
    }
  };

  return (
    <canvas
      aria-label="Interactive timeline canvas"
      className="timeline-canvas"
      onKeyDown={(event) => {
        if (!width) return;

        if (event.key === "h" || event.key === "H") {
          event.preventDefault();
          onNavigateUp();
          return;
        }

        if (event.key === "Escape" || event.key === "Backspace") {
          event.preventDefault();
          onNavigateUp();
          return;
        }

        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          const innerW = width - PAD * 2;
          onAnimateZoom(1, innerW / 2);
        }

        if (event.key === "-" || event.key === "_") {
          event.preventDefault();
          const innerW = width - PAD * 2;
          onAnimateZoom(-1, innerW / 2);
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          const innerW = width - PAD * 2;
          onViewportChange((current) => panByPixels(current, 120, innerW));
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          const innerW = width - PAD * 2;
          onViewportChange((current) => panByPixels(current, -120, innerW));
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      ref={canvasRef}
      tabIndex={0}
    />
  );
}
