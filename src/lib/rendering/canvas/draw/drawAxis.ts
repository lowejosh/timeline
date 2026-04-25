import {
  formatTimelineElapsedAxisLabel,
  formatTimelineElapsedAxisLabelLines,
  formatTimelineYear,
  getDominantTimelineDateReference,
} from "@/lib/rendering/bands";
import { formatCosmicCalendarLabel } from "../cosmicCalendar";
import {
  comparePreciseTimelineYears,
  getMinZoomForWidth,
  getVisibleRangePrecise,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MIN_YEAR,
  toApproximateTimelineYear,
  worldPreciseToScreen,
  worldToScreen,
  type PreciseTimelineYear,
} from "@/lib/core/viewport";
import {
  type AxisLabelCandidate,
  getAllowedAxisLabelSteps,
  getCalendarAxisLabelText,
  getCalendarEdgeAxisLabelText,
  getPreferredAxisEdgeLabelStep,
  getPrimaryAxisLabelStepFromResolvedLabels,
  getTickScaleProgress,
  measureAxisLabelWidth,
  resolveAxisLabelCandidates,
  resolveAxisLabelCandidatesWithFallback,
  resolveAxisTickYear,
} from "../axisLabels";
import {
  AXIS_LABEL_OCCUPIED_PADDING,
  CALENDAR_DAY_STEP,
  EDGE_AXIS_LABEL_SNAP_TOLERANCE_PX,
  SUBYEAR_PRIMARY_FONT,
  SUBYEAR_SECONDARY_FONT,
} from "../constants";
import { EARLY_UNIVERSE_BAND_EXPANSION_IDS } from "../primordial";
import {
  EARLY_UNIVERSE_CHILD_ERA_ORDER,
  EARLY_UNIVERSE_END_YEAR,
  EARLY_UNIVERSE_START_YEAR,
} from "@/lib/catalog/sets/cosmic/index";
import type { CanvasDrawContext } from "./drawContext";

export function drawAxis(cx: CanvasDrawContext): void {
  const {
    context,
    sceneWidth,
    pad,
    innerWidth,
    sceneViewport,
    layout,
    line,
    lineSoft,
    labelColor,
    resolvedAxisTickStates,
    breadcrumbChain,
    sceneActiveEra,
    visibleEraLayers,
    eraScreenSpanById,
    primordialDetailStripSegments,
    renderedPrimordialDetailStripSegments,
    primordialDetailStripOpacity,
    allowPrimordialSyntheticDetail,
    sceneMaxZoom,
    toX,
    fromX,
    preferredAxisLabelStepRef,
    primordialDebugSignatureRef,
  } = cx;
  const axisY = layout.axisY;

  // --- Breadcrumb ---
  {
    const rootLabel = breadcrumbChain[0]?.name ?? sceneActiveEra.name;
    const trailLabel = breadcrumbChain
      .slice(1)
      .map((era) => era.name)
      .join(" • ");
    const trailText = trailLabel ? ` • ${trailLabel}` : "";
    const breadcrumbFont =
      breadcrumbChain.length > 1
        ? "600 14px var(--font-sans)"
        : "500 13px var(--font-sans)";

    context.save();
    context.font = breadcrumbFont;
    context.fillStyle = labelColor;
    context.textAlign = "left";
    context.textBaseline = "top";
    const rootWidth = context.measureText(rootLabel).width;
    const trailWidth = trailText ? context.measureText(trailText).width : 0;
    const startX = sceneWidth / 2 - (rootWidth + trailWidth) / 2;

    context.globalAlpha = breadcrumbChain.length > 1 ? 0.9 : 0.76;
    context.fillText(rootLabel, startX, layout.breadcrumbY);

    if (trailText) {
      context.globalAlpha = 0.8;
      context.fillText(trailText, startX + rootWidth, layout.breadcrumbY);
    }

    context.restore();
  }

  // --- Axis baseline ---
  context.strokeStyle = line;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(pad, axisY);
  context.lineTo(sceneWidth - pad, axisY);
  context.stroke();

  // --- Axis edge/step computations ---
  const edgeLeftPreciseYear = fromX(pad);
  const edgeRightPreciseYear = fromX(sceneWidth - pad);
  const edgeLeftYear = toApproximateTimelineYear(edgeLeftPreciseYear);
  const edgeRightYear = toApproximateTimelineYear(edgeRightPreciseYear);
  const edgeLeftSnapToleranceYears = Math.max(
    Math.abs(
      subtractPreciseTimelineYears(
        fromX(pad + EDGE_AXIS_LABEL_SNAP_TOLERANCE_PX),
        edgeLeftPreciseYear,
      ),
    ),
    1e-18,
  );
  const edgeLeftX = pad;
  const edgeRightX = sceneWidth - pad;
  const edgeLabelStep = (() => {
    const preferredStep = getPreferredAxisEdgeLabelStep(resolvedAxisTickStates);

    if (preferredStep !== undefined) {
      return preferredStep;
    }

    const visibleSpan = Math.max(
      Math.abs(
        subtractPreciseTimelineYears(edgeRightPreciseYear, edgeLeftPreciseYear),
      ),
      1e-18,
    );
    const approximateMajorCount = Math.max(2, Math.floor(innerWidth / 280));

    return Math.max(visibleSpan / approximateMajorCount, 1e-18);
  })();
  const fineGrainedAxisMode =
    edgeLabelStep < 1
      ? (() => {
          const dominantReference = getDominantTimelineDateReference(
            edgeLeftPreciseYear,
            edgeRightPreciseYear,
          );

          if (dominantReference !== null) {
            return dominantReference === "elapsed" ? "elapsed" : "calendar";
          }

          return null;
        })()
      : null;
  const visibleSpan = Math.max(
    Math.abs(
      subtractPreciseTimelineYears(edgeRightPreciseYear, edgeLeftPreciseYear),
    ),
    1e-18,
  );
  const earlyUniverseOverlapStart = Math.max(
    edgeLeftYear,
    EARLY_UNIVERSE_START_YEAR,
  );
  const earlyUniverseOverlapEnd = Math.min(
    edgeRightYear,
    EARLY_UNIVERSE_END_YEAR,
  );
  const earlyUniverseOverlap = Math.max(
    0,
    earlyUniverseOverlapEnd - earlyUniverseOverlapStart,
  );
  const startsAtBigBang =
    comparePreciseTimelineYears(
      edgeLeftPreciseYear,
      splitTimelineYear(TIMELINE_MIN_YEAR),
    ) === 0;
  const viewportFullyInEarlyUniverse =
    edgeLeftPreciseYear.wholeYear >= Math.floor(EARLY_UNIVERSE_START_YEAR) &&
    edgeRightPreciseYear.wholeYear <= Math.ceil(EARLY_UNIVERSE_END_YEAR);
  const isFullyZoomedOut =
    sceneViewport.zoom <= getMinZoomForWidth(innerWidth) + 0.001;
  const useBigBangElapsedLabels =
    !isFullyZoomedOut &&
    (startsAtBigBang ||
      viewportFullyInEarlyUniverse ||
      earlyUniverseOverlap / visibleSpan >= 0.75);

  // --- Primordial debug logging ---
  const [debugVisibleStart, debugVisibleEnd] = getVisibleRangePrecise(
    sceneViewport,
    innerWidth,
  );
  const debugEarlyUniverseOverlapStart = Math.max(
    toApproximateTimelineYear(debugVisibleStart),
    EARLY_UNIVERSE_START_YEAR,
  );
  const debugEarlyUniverseOverlapEnd = Math.min(
    toApproximateTimelineYear(debugVisibleEnd),
    EARLY_UNIVERSE_END_YEAR,
  );
  const debugFloatOverlapRatio =
    Math.max(0, debugEarlyUniverseOverlapEnd - debugEarlyUniverseOverlapStart) /
    visibleSpan;
  const visiblePrimordialLayerIds = visibleEraLayers
    .filter((layer) => EARLY_UNIVERSE_BAND_EXPANSION_IDS.has(layer.era.id))
    .map((layer) => layer.era.id);
  const primordialSpanDebug = EARLY_UNIVERSE_CHILD_ERA_ORDER.map((eraId) => {
    const span = eraScreenSpanById.get(eraId);

    return {
      id: eraId,
      width: span ? Number((span.x1 - span.x0).toFixed(2)) : null,
      expanded: span?.usesVisualExpansion === true,
    };
  });
  const primordialDetailStripDebug = primordialDetailStripSegments.map(
    (segment) => ({
      id: segment.era.id,
      width: Number((segment.x1 - segment.x0).toFixed(2)),
    }),
  );
  const renderedPrimordialDetailStripDebug =
    renderedPrimordialDetailStripSegments.map((segment) => ({
      id: segment.era.id,
      width: Number((segment.x1 - segment.x0).toFixed(2)),
    }));
  const primordialDebugActive =
    allowPrimordialSyntheticDetail ||
    viewportFullyInEarlyUniverse ||
    sceneViewport.zoom >= sceneMaxZoom - 0.01;

  if (primordialDebugActive) {
    const debugSnapshot = {
      activeEraId: sceneActiveEra.id,
      breadcrumbIds: breadcrumbChain.map((era) => era.id),
      zoom: Number(sceneViewport.zoom.toFixed(6)),
      sceneMaxZoom: Number(sceneMaxZoom.toFixed(6)),
      zoomDeltaToMax: Number((sceneMaxZoom - sceneViewport.zoom).toFixed(6)),
      allowPrimordialSyntheticDetail,
      startsAtBigBang,
      viewportFullyInEarlyUniverse,
      useBigBangElapsedLabels,
      edgeLabelStep,
      fineGrainedAxisMode,
      visibleSpanYears: Number(visibleSpan.toExponential(6)),
      floatOverlapRatio: Number(debugFloatOverlapRatio.toFixed(6)),
      visibleStart: {
        wholeYear: debugVisibleStart.wholeYear,
        fraction: Number(debugVisibleStart.fraction.toFixed(12)),
      },
      visibleEnd: {
        wholeYear: debugVisibleEnd.wholeYear,
        fraction: Number(debugVisibleEnd.fraction.toFixed(12)),
      },
      visiblePrimordialLayerIds,
      primordialSpanDebug,
      primordialDetailStripDebug,
      renderedPrimordialDetailStripDebug,
      primordialDetailStripOpacity: Number(
        primordialDetailStripOpacity.toFixed(3),
      ),
      axisTickSteps: [
        ...new Set(resolvedAxisTickStates.map((tick) => tick.step)),
      ]
        .slice(0, 8)
        .map((step) => Number(step.toExponential(6))),
    };
    const nextSignature = JSON.stringify(debugSnapshot);

    if (primordialDebugSignatureRef.current !== nextSignature) {
      primordialDebugSignatureRef.current = nextSignature;
      console.info("[timeline primordial debug]", debugSnapshot);
    }
  } else if (primordialDebugSignatureRef.current !== null) {
    primordialDebugSignatureRef.current = null;
  }

  // --- Axis label formatters ---
  const isCosmicCalendar = cx.isCosmicCalendarMode;
  const useSubYearAxis = !isCosmicCalendar && fineGrainedAxisMode !== null;
  const useCalendarSubYearAxis =
    !isCosmicCalendar && fineGrainedAxisMode === "calendar";
  const useElapsedSubYearAxis =
    !isCosmicCalendar && fineGrainedAxisMode === "elapsed";
  const formatAxisLabel = (year: number | PreciseTimelineYear, step: number) =>
    isCosmicCalendar
      ? formatCosmicCalendarLabel(year, step)
      : useBigBangElapsedLabels
        ? formatTimelineElapsedAxisLabel(year, step, "after-big-bang")
        : formatTimelineYear(year, step, { mode: "axis" });
  const formatElapsedAxisLabel = (
    year: number | PreciseTimelineYear,
    step: number,
    options?: { snapToReferenceStartWithinYears?: number },
  ) =>
    formatTimelineElapsedAxisLabelLines(
      year,
      step,
      useBigBangElapsedLabels ? "after-big-bang" : "ago",
      options,
    );

  // --- Tick stubs ---
  if (resolvedAxisTickStates.length > 0) {
    context.save();
    context.lineWidth = 1;
    const majorExtraAbove = axisY - 10 - layout.majorTickTop;
    const majorExtraBelow = layout.majorTickBottom - (axisY + 10);

    for (const tick of resolvedAxisTickStates) {
      const x =
        pad +
        (tick.wholeYear !== undefined && tick.yearFraction !== undefined
          ? worldPreciseToScreen(
              { wholeYear: tick.wholeYear, fraction: tick.yearFraction },
              sceneViewport,
              innerWidth,
            )
          : worldToScreen(tick.year, sceneViewport, innerWidth));

      if (x < pad - 32 || x > sceneWidth - pad + 32) continue;

      const edgeFade = Math.min(
        Math.max(0, (x - pad) / 60),
        Math.max(0, (sceneWidth - pad - x) / 60),
        1,
      );

      if (edgeFade <= 0.01) continue;

      const distToMin = Math.abs(x - edgeLeftX);
      const distToMax = Math.abs(x - edgeRightX);
      const distToBound = Math.min(distToMin, distToMax);
      const boundaryFade =
        distToBound < 40 ? Math.max(0, (distToBound - 4) / 36) : 1;
      const scaleProgress = getTickScaleProgress(tick.pixelsPerStep);
      const emphasisProgress = Math.max(
        tick.majorProgress * 0.92,
        tick.labelOpacity * 0.7,
      );
      const baseFade =
        edgeFade * (1 - emphasisProgress + emphasisProgress * boundaryFade);
      const overlayFade = edgeFade * boundaryFade;
      const baseMinorExtent = 2.4 + 10.4 * Math.pow(scaleProgress, 0.88);
      const minorExtent =
        baseMinorExtent * (0.42 + tick.visibleProgress * 0.58);
      const top = axisY - minorExtent - majorExtraAbove * emphasisProgress;
      const bottom = axisY + minorExtent + majorExtraBelow * emphasisProgress;

      if (baseFade > 0.01) {
        context.strokeStyle = lineSoft;
        const minorOpacity =
          0.16 +
          0.24 * Math.pow(scaleProgress, 0.82) +
          tick.visibleProgress * 0.08;
        context.globalAlpha =
          (minorOpacity + emphasisProgress * 0.08) * baseFade;
        context.beginPath();
        context.moveTo(x, top);
        context.lineTo(x, bottom);
        context.stroke();
      }

      if (emphasisProgress > 0.01 && overlayFade > 0.01) {
        context.strokeStyle = line;
        context.globalAlpha =
          (0.3 + tick.labelOpacity * 0.24) * emphasisProgress * overlayFade;
        context.beginPath();
        context.moveTo(x, top);
        context.lineTo(x, bottom);
        context.stroke();
      }
    }

    context.restore();
  }

  // --- Edge ticks + labels ---
  const edgeTickData = [
    { year: edgeLeftPreciseYear, x: pad, align: "left" as const },
    {
      year: edgeRightPreciseYear,
      x: sceneWidth - pad,
      align: "right" as const,
    },
  ];

  for (const { year, x, align } of edgeTickData) {
    context.save();
    context.globalAlpha = 1;
    context.strokeStyle = line;
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(x, layout.majorTickTop);
    context.lineTo(x, layout.majorTickBottom);
    context.stroke();

    context.fillStyle = labelColor;
    context.textAlign = align;
    context.textBaseline = "top";

    if (useCalendarSubYearAxis) {
      const edgeLabel = getCalendarEdgeAxisLabelText(year, edgeLabelStep);

      context.globalAlpha = 0.9;
      context.font = SUBYEAR_PRIMARY_FONT;
      context.fillText(edgeLabel.text, x, layout.dateLabelY);
      context.globalAlpha = 0.72;
      context.font = SUBYEAR_SECONDARY_FONT;
      context.fillText(edgeLabel.secondaryText, x, layout.yearLabelY);
    } else if (useElapsedSubYearAxis) {
      const edgeLabel = formatElapsedAxisLabel(
        year,
        edgeLabelStep,
        x === pad
          ? { snapToReferenceStartWithinYears: edgeLeftSnapToleranceYears }
          : undefined,
      );

      if (!edgeLabel) {
        context.restore();
        continue;
      }

      if (edgeLabel.secondaryText) {
        context.globalAlpha = 0.9;
        context.font = SUBYEAR_PRIMARY_FONT;
        context.fillText(edgeLabel.primaryText, x, layout.dateLabelY);
        context.globalAlpha = 0.72;
        context.font = SUBYEAR_SECONDARY_FONT;
        context.fillText(edgeLabel.secondaryText, x, layout.yearLabelY);
      } else {
        context.globalAlpha = 0.86;
        context.font = SUBYEAR_PRIMARY_FONT;
        context.fillText(edgeLabel.primaryText, x, layout.yearLabelY);
      }
    } else {
      context.globalAlpha = 1;
      context.font = "11px var(--font-sans)";
      context.fillText(
        formatAxisLabel(year, edgeLabelStep),
        x,
        layout.yearLabelY,
      );
    }

    context.restore();
  }

  // --- Interior axis labels ---
  const edgeLabelLeftX = pad;
  const edgeLabelRightX = sceneWidth - pad;
  context.fillStyle = labelColor;
  context.textAlign = "center";
  context.textBaseline = "top";

  const axisLabelCandidates: AxisLabelCandidate[] = [];
  const yearBoundaryCandidates: AxisLabelCandidate[] = [];

  for (const tick of resolvedAxisTickStates) {
    if (tick.labelOpacity <= 0.01) continue;

    const tickYear = resolveAxisTickYear(tick);
    const resolvedX =
      pad +
      (tick.wholeYear !== undefined && tick.yearFraction !== undefined
        ? worldPreciseToScreen(
            { wholeYear: tick.wholeYear, fraction: tick.yearFraction },
            sceneViewport,
            innerWidth,
          )
        : worldToScreen(tick.year, sceneViewport, innerWidth));

    if (resolvedX < pad - 80 || resolvedX > sceneWidth - pad + 80) continue;

    if (useSubYearAxis && tick.labelStep >= 1) continue;

    const calendarLabel = useCalendarSubYearAxis
      ? getCalendarAxisLabelText(tickYear, tick.labelStep)
      : null;
    const elapsedLabel = useElapsedSubYearAxis
      ? formatElapsedAxisLabel(tickYear, tick.labelStep)
      : null;
    const labelText = calendarLabel
      ? calendarLabel.text
      : (elapsedLabel?.primaryText ??
        formatAxisLabel(tickYear, tick.labelStep));
    const secondaryText =
      calendarLabel?.secondaryText ?? elapsedLabel?.secondaryText;

    if (!labelText) continue;

    const labelWidth = secondaryText
      ? measureAxisLabelWidth(
          context,
          labelText,
          SUBYEAR_PRIMARY_FONT,
          secondaryText,
          SUBYEAR_SECONDARY_FONT,
        )
      : (() => {
          context.font = useCalendarSubYearAxis
            ? SUBYEAR_PRIMARY_FONT
            : "13px var(--font-sans)";

          return context.measureText(labelText).width;
        })();

    const distToMin = Math.abs(resolvedX - edgeLabelLeftX);
    const distToMax = Math.abs(resolvedX - edgeLabelRightX);
    const distToBoundary = Math.min(distToMin, distToMax);
    const boundaryFade =
      distToBoundary < 100 ? Math.max(0, (distToBoundary - 20) / 80) : 1;
    const labelEdgeFade = Math.min(
      Math.max(0, (resolvedX - pad) / 60),
      Math.max(0, (sceneWidth - pad - resolvedX) / 60),
      1,
    );
    const labelAlpha = tick.labelOpacity * boundaryFade * labelEdgeFade;

    if (labelAlpha > 0.01) {
      axisLabelCandidates.push({
        x: resolvedX,
        text: labelText,
        secondaryText,
        width: labelWidth,
        alpha: labelAlpha,
        step: tick.labelStep,
        pixelsPerStep: tick.pixelsPerStep,
      });
    }
  }

  const { allowedSteps: allowedLabelSteps, primaryStep: primaryAllowedStep } =
    getAllowedAxisLabelSteps(axisLabelCandidates, useSubYearAxis, {
      preferredStep: preferredAxisLabelStepRef.current,
    });

  const primaryEdgeLabelEntries = [
    {
      x: pad,
      ...(() => {
        if (useCalendarSubYearAxis) {
          return getCalendarEdgeAxisLabelText(
            edgeLeftPreciseYear,
            edgeLabelStep,
          );
        }

        if (useElapsedSubYearAxis) {
          const edgeLabel = formatElapsedAxisLabel(
            edgeLeftPreciseYear,
            edgeLabelStep,
            { snapToReferenceStartWithinYears: edgeLeftSnapToleranceYears },
          );

          return {
            text: edgeLabel?.primaryText ?? "",
            secondaryText: edgeLabel?.secondaryText,
          };
        }

        return {
          text: formatAxisLabel(edgeLeftYear, edgeLabelStep),
          secondaryText: undefined,
        };
      })(),
      align: "left" as const,
    },
    {
      x: sceneWidth - pad,
      ...(() => {
        if (useCalendarSubYearAxis) {
          return getCalendarEdgeAxisLabelText(
            edgeRightPreciseYear,
            edgeLabelStep,
          );
        }

        if (useElapsedSubYearAxis) {
          const edgeLabel = formatElapsedAxisLabel(
            edgeRightPreciseYear,
            edgeLabelStep,
          );

          return {
            text: edgeLabel?.primaryText ?? "",
            secondaryText: edgeLabel?.secondaryText,
          };
        }

        return {
          text: formatAxisLabel(edgeRightYear, edgeLabelStep),
          secondaryText: undefined,
        };
      })(),
      align: "right" as const,
    },
  ];
  const primaryOccupiedBounds: Array<{ left: number; right: number }> = [];

  for (const edgeLabel of primaryEdgeLabelEntries) {
    const labelWidth = edgeLabel.secondaryText
      ? measureAxisLabelWidth(
          context,
          edgeLabel.text,
          SUBYEAR_PRIMARY_FONT,
          edgeLabel.secondaryText,
          SUBYEAR_SECONDARY_FONT,
        )
      : (() => {
          context.font = useCalendarSubYearAxis
            ? SUBYEAR_PRIMARY_FONT
            : "13px var(--font-sans)";

          return context.measureText(edgeLabel.text).width;
        })();
    const left =
      edgeLabel.align === "left"
        ? edgeLabel.x - AXIS_LABEL_OCCUPIED_PADDING
        : edgeLabel.x - labelWidth - AXIS_LABEL_OCCUPIED_PADDING;
    const right =
      edgeLabel.align === "left"
        ? edgeLabel.x + labelWidth + AXIS_LABEL_OCCUPIED_PADDING
        : edgeLabel.x + AXIS_LABEL_OCCUPIED_PADDING;

    primaryOccupiedBounds.push({ left, right });
  }

  const resolvedAxisLabels = resolveAxisLabelCandidatesWithFallback(
    axisLabelCandidates.filter(
      (candidate) =>
        allowedLabelSteps.size === 0 || allowedLabelSteps.has(candidate.step),
    ),
    primaryOccupiedBounds,
    {
      dedupeByTextOnly: useSubYearAxis,
      relaxedSpacing: useSubYearAxis,
      centerX: sceneWidth / 2,
    },
  );

  preferredAxisLabelStepRef.current = getPrimaryAxisLabelStepFromResolvedLabels(
    resolvedAxisLabels,
    primaryAllowedStep,
  );

  for (const label of resolvedAxisLabels.sort(
    (left, right) => left.x - right.x,
  )) {
    context.save();
    context.globalAlpha = label.alpha;

    if (useCalendarSubYearAxis) {
      context.font = SUBYEAR_PRIMARY_FONT;
      context.fillText(label.text, label.x, layout.dateLabelY);

      if (label.secondaryText) {
        context.font = SUBYEAR_SECONDARY_FONT;
        context.fillText(label.secondaryText, label.x, layout.yearLabelY);
      }
    } else if (useElapsedSubYearAxis) {
      if (label.secondaryText) {
        context.font = SUBYEAR_PRIMARY_FONT;
        context.fillText(label.text, label.x, layout.dateLabelY);
        context.font = SUBYEAR_SECONDARY_FONT;
        context.fillText(label.secondaryText, label.x, layout.yearLabelY);
      } else {
        context.font = SUBYEAR_PRIMARY_FONT;
        context.fillText(label.text, label.x, layout.yearLabelY);
      }
    } else {
      context.font = "13px var(--font-sans)";
      context.fillText(label.text, label.x, layout.yearLabelY);
    }

    context.restore();
  }

  // --- Year boundary labels (calendar sub-year mode) ---
  if (useCalendarSubYearAxis && edgeLabelStep >= CALENDAR_DAY_STEP) {
    context.font = "11px var(--font-sans)";

    const firstVisibleYear = Math.ceil(edgeLeftYear);
    const lastVisibleYear = Math.floor(edgeRightYear);

    for (let year = firstVisibleYear; year <= lastVisibleYear; year += 1) {
      if (year === 0) continue;

      const x = toX(year);

      if (x < pad - 80 || x > sceneWidth - pad + 80) continue;

      const labelText = formatTimelineYear(year, 1);
      const labelWidth = context.measureText(labelText).width;
      const boundaryFade =
        Math.min(
          Math.max(0, (x - pad) / 60),
          Math.max(0, (sceneWidth - pad - x) / 60),
          1,
        ) *
        (Math.min(Math.abs(x - edgeLeftX), Math.abs(x - edgeRightX)) < 100
          ? Math.max(
              0,
              (Math.min(Math.abs(x - edgeLeftX), Math.abs(x - edgeRightX)) -
                20) /
                80,
            )
          : 1);

      if (boundaryFade <= 0.01) continue;

      yearBoundaryCandidates.push({
        x,
        text: labelText,
        width: labelWidth,
        alpha: 0.7 * boundaryFade,
        step: 1,
        pixelsPerStep: Math.abs(toX(year === -1 ? 1 : year + 1) - x),
      });
    }

    const yearEdgeLabelEntries = [
      {
        x: pad,
        text: formatTimelineYear(edgeLeftYear, 1),
        align: "left" as const,
      },
      {
        x: sceneWidth - pad,
        text: formatTimelineYear(edgeRightYear, 1),
        align: "right" as const,
      },
    ];
    const yearOccupiedBounds: Array<{ left: number; right: number }> = [];

    for (const edgeLabel of yearEdgeLabelEntries) {
      const labelWidth = context.measureText(edgeLabel.text).width;
      const left =
        edgeLabel.align === "left"
          ? edgeLabel.x - AXIS_LABEL_OCCUPIED_PADDING
          : edgeLabel.x - labelWidth - AXIS_LABEL_OCCUPIED_PADDING;
      const right =
        edgeLabel.align === "left"
          ? edgeLabel.x + labelWidth + AXIS_LABEL_OCCUPIED_PADDING
          : edgeLabel.x + AXIS_LABEL_OCCUPIED_PADDING;

      yearOccupiedBounds.push({ left, right });
    }

    const resolvedYearLabels = resolveAxisLabelCandidates(
      yearBoundaryCandidates,
      yearOccupiedBounds,
      { dedupeByTextOnly: true },
    );

    for (const label of resolvedYearLabels.sort(
      (left, right) => left.x - right.x,
    )) {
      context.save();
      context.globalAlpha = label.alpha;
      context.font = "11px var(--font-sans)";
      context.fillText(label.text, label.x, layout.yearLabelY);
      context.restore();
    }
  }
}
