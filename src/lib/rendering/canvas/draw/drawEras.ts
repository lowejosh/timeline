import { fitEraLabel, placeEraLabelBlock } from "@/lib/rendering/eraLabel";
import { smoothstep01 } from "@/lib/core/easing";
import { shouldHideOverlappedEraLabel } from "@/lib/rendering/childLayers";
import { resolveContextBandRenderState } from "@/lib/rendering/contextBands";
import { resolveTextHoverBounds } from "@/lib/rendering/overlayLabelHover";
import { getEraTooltipContent } from "@/lib/app/tooltipModel";
import {
  getEraBackdropResetAlpha,
  getEraInlineLabelVisibility,
} from "../eraAnimation";
import {
  EARLY_UNIVERSE_BAND_EXPANSION_IDS,
  EARLY_UNIVERSE_COMPACT_LABEL_FADE_WIDTH_PX,
  EARLY_UNIVERSE_COMPACT_LABEL_MIN_WIDTH_PX,
  EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX,
  EARLY_UNIVERSE_DETAIL_STRIP_LABELS,
  EARLY_UNIVERSE_EXPANDED_LABEL_FADE_WIDTH_PX,
  EARLY_UNIVERSE_EXPANDED_LABEL_MIN_WIDTH_PX,
  EARLY_UNIVERSE_INLINE_LABELS,
  FORCED_PRIMORDIAL_LABEL_IDS,
} from "../primordial";
import { ERA_BAND_ALPHA, EXPERIMENTAL_ERA_BAND_ALPHA } from "../constants";
import { getEraZoomFill } from "../eraZoomGradient";
import type { CanvasDrawContext } from "./drawContext";

type EraLayer = CanvasDrawContext["paintOrderedEraLayers"][number];

function renderEra(layer: EraLayer, cx: CanvasDrawContext, fillOnly: boolean): void {
  const {
    context,
    eraScreenSpanById,
    toX,
    pad,
    sceneWidth,
    sceneHeight,
    background,
    breadcrumbChainIds,
    allowPrimordialSyntheticDetail,
    labelColor,
    fontSans,
    layout,
    hoverRegions,
    visibleEraLayers,
    sceneViewport,
    devicePixelRatio,
    renderedPrimordialDetailStripSegments,
    primordialDetailStripOpacity,
  } = cx;
  const { era, opacity } = layer;

  if (opacity < 0.01) return;

  const screenSpan = eraScreenSpanById.get(era.id);
  const x0 = screenSpan?.x0 ?? toX(era.startYear);
  const x1 = screenSpan?.x1 ?? toX(era.endYear);
  const eraWidth = x1 - x0;
  const renderState = resolveContextBandRenderState({
    x0,
    x1,
    minX: pad,
    maxX: sceneWidth - pad,
    devicePixelRatio,
  });

  if (!renderState) return;

  const axisY = layout.axisY;

  if (fillOnly) {
    context.save();
    const backdropResetAlpha =
      getEraBackdropResetAlpha(layer.depth, opacity) *
      renderState.alphaMultiplier;

    if (backdropResetAlpha > 0.001) {
      context.globalAlpha = backdropResetAlpha;
      context.fillStyle = background;
      context.fillRect(
        renderState.renderLeft,
        0,
        renderState.renderWidth,
        sceneHeight,
      );
    }

    const bandAlpha = cx.isZoomColorsEnabled ? EXPERIMENTAL_ERA_BAND_ALPHA : ERA_BAND_ALPHA;
    context.globalAlpha = opacity * bandAlpha * renderState.alphaMultiplier;
    context.fillStyle = cx.isZoomColorsEnabled
      ? getEraZoomFill(context, era.color, sceneHeight, axisY, sceneViewport.zoom, era.id)
      : era.color;
    context.fillRect(
      renderState.renderLeft,
      0,
      renderState.renderWidth,
      sceneHeight,
    );
    context.restore();

    return;
  }

  if (cx.guidedFocus && sceneHeight < 280) return;

  const hasReadableChildren = era.children?.some(child => {
    const span = eraScreenSpanById.get(child.id);
    return Math.min(span?.x1 ?? toX(child.endYear), sceneWidth - pad) -
      Math.max(span?.x0 ?? toX(child.startYear), pad) >= 56;
  });
  const labelChildOpacity = hasReadableChildren ? layer.childOpacity : 0;
  // A preview breadcrumb appears before the children finish fading in.
  // Keep the in-place parent label until that handoff is complete.
  const shouldHideInlineLabel = breadcrumbChainIds.has(era.id) && labelChildOpacity >= 0.98;
  const isPrimordialEra = EARLY_UNIVERSE_BAND_EXPANSION_IDS.has(era.id);

  // When the primordial detail strip is active and already labels this era,
  // skip the inline label to avoid doubled text above and below the axis.
  if (
    isPrimordialEra &&
    primordialDetailStripOpacity > 0.01 &&
    renderedPrimordialDetailStripSegments.some((s) => s.era.id === era.id)
  ) {
    return;
  }
  const visibleEraWidth = Math.max(
    Math.min(x1, sceneWidth - pad) - Math.max(x0, pad),
    0,
  );
  const allowsNormalPrimordialLabelBypass =
    FORCED_PRIMORDIAL_LABEL_IDS.has(era.id) && visibleEraWidth >= 44;
  const usesForcedPrimordialLabel =
    allowPrimordialSyntheticDetail &&
    FORCED_PRIMORDIAL_LABEL_IDS.has(era.id) &&
    visibleEraWidth < 44;
  const usesExpandedPrimordialLabel =
    allowPrimordialSyntheticDetail && screenSpan?.usesVisualExpansion === true;
  const usesCompactPrimordialLabel =
    allowPrimordialSyntheticDetail &&
    isPrimordialEra &&
    !usesExpandedPrimordialLabel &&
    eraWidth < 60;
  const baseLabelText =
    usesExpandedPrimordialLabel || usesCompactPrimordialLabel
      ? (EARLY_UNIVERSE_INLINE_LABELS[era.id] ?? era.name)
      : era.name;
  const labelText = baseLabelText;
  const labelMinWidth = usesForcedPrimordialLabel
    ? 8
    : usesExpandedPrimordialLabel
      ? EARLY_UNIVERSE_EXPANDED_LABEL_MIN_WIDTH_PX
      : usesCompactPrimordialLabel
        ? EARLY_UNIVERSE_COMPACT_LABEL_MIN_WIDTH_PX
        : 36;
  const labelFadeWidth = usesForcedPrimordialLabel
    ? 18
    : usesExpandedPrimordialLabel
      ? EARLY_UNIVERSE_EXPANDED_LABEL_FADE_WIDTH_PX
      : usesCompactPrimordialLabel
        ? EARLY_UNIVERSE_COMPACT_LABEL_FADE_WIDTH_PX
        : 20;
  const labelFont = usesForcedPrimordialLabel
    ? `9px ${fontSans}`
    : usesExpandedPrimordialLabel || usesCompactPrimordialLabel
      ? `10px ${fontSans}`
      : `11px ${fontSans}`;

  if (
    visibleEraWidth > labelMinWidth &&
    (!shouldHideInlineLabel || allowsNormalPrimordialLabelBypass)
  ) {
    const labelX = Math.max(x0, pad) / 2 + Math.min(x1, sceneWidth - pad) / 2;
    let labelBaselineY = axisY - 44 - labelChildOpacity * 24;
    const labelVisibility = getEraInlineLabelVisibility(labelChildOpacity);
    const labelAlpha =
      Math.min((visibleEraWidth - labelMinWidth) / labelFadeWidth, 1) *
      labelVisibility * smoothstep01(opacity) *
      (usesForcedPrimordialLabel ? 0.68 : 0.58);

    context.save();
    context.font = labelFont;
    let lines = fitEraLabel(labelText, Math.max(visibleEraWidth - 12, 0), text => context.measureText(text).width);
    const alternateFont = `italic 10px ${fontSans}`;
    context.font = alternateFont;
    let alternateLines = era.alternateName ? fitEraLabel(era.alternateName, Math.max(visibleEraWidth - 12, 0), text => context.measureText(text).width) : [];
    if (cx.animatedOverlayLaneCount > 0 && !cx.guidedFocus) {
      const alternateLineCount = alternateLines.length;
      const placed = placeEraLabelBlock(lines, alternateLines, labelBaselineY,
        layout.overlayClipBottom + 6, layout.majorTickTop - 4);
      lines = placed.lines;
      alternateLines = placed.alternateLines;
      labelBaselineY = placed.baseline;
      if (lines.length === 0) { context.restore(); return; }
      if (alternateLines.length > 0 && placed.alternateLines.length < alternateLineCount) {
        // Preserve the subtitle as a single abbreviated line when it cannot wrap.
        let alternate = era.alternateName ?? "";
        while (alternate && context.measureText(`${alternate}…`).width > visibleEraWidth - 12) alternate = alternate.slice(0, -1);
        alternateLines = alternate ? [`${alternate.trimEnd()}…`] : [];
      }
    }
    context.font = labelFont;
    let maxWidth = 0;
    for (const line of lines) {
      const metrics = context.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    }
    context.font = alternateFont;
    for (const line of alternateLines) maxWidth = Math.max(maxWidth, context.measureText(line).width);
    const labelMetrics = {
      width: maxWidth,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 4,
    }; // approximate
    context.restore();

    const shouldHideForPriorityOverlap = shouldHideOverlappedEraLabel(
      layer,
      visibleEraLayers,
      sceneViewport,
      sceneWidth,
      pad,
      labelMetrics.width,
    );

    if (
      shouldHideForPriorityOverlap &&
      !screenSpan?.usesVisualExpansion &&
      !usesCompactPrimordialLabel &&
      !usesForcedPrimordialLabel &&
      !allowsNormalPrimordialLabelBypass
    ) {
      return;
    }

    context.save();
    context.beginPath();
    context.rect(Math.max(x0, pad), 0, visibleEraWidth, sceneHeight);
    context.clip();
    context.globalAlpha = labelAlpha;
    context.font = labelFont;
    context.fillStyle = labelColor;
    context.textAlign = "center";
    context.textBaseline = "bottom";

    const lineHeight = 12; // approximate line height
    let currentY = labelBaselineY - (lines.length + alternateLines.length - 1) * lineHeight;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      context.fillText(line, labelX, currentY);
      currentY += lineHeight;
    }
    context.font = alternateFont;
    context.globalAlpha = labelAlpha * 0.85;
    for (const line of alternateLines) { context.fillText(line, labelX, currentY); currentY += lineHeight; }
    context.restore();

    if (labelAlpha > 0.12) {
      const totalHeight = (lines.length + alternateLines.length) * 12;
      const labelTop = labelBaselineY - totalHeight + 4;
      const labelBottom = labelBaselineY + 2;
      const hoverBounds = resolveTextHoverBounds({
        centerX: labelX,
        labelWidth: labelMetrics.width,
        boxTop: labelTop,
        boxBottom: labelBottom,
        paddingX: 8,
        paddingY: 4,
      });

      hoverRegions.push({
        id: `era:${era.id}`,
        left: hoverBounds.left,
        right: hoverBounds.right,
        top: hoverBounds.top,
        bottom: hoverBounds.bottom,
        anchorX: labelX,
        anchorY: labelTop - 2,
        anchorMode: "fixed",
        placement: "above",
        tooltip: getEraTooltipContent(era),
      });
    }
  }
}

export function drawEras(cx: CanvasDrawContext): void {
  const {
    context,
    paintOrderedEraLayers,
    renderedPrimordialDetailStripSegments,
    primordialDetailStripOpacity,
    lineSoft,
    labelColor,
    hoverRegions,
    fontSans,
    layout,
  } = cx;

  for (const layer of paintOrderedEraLayers) {
    renderEra(layer, cx, true);
  }

  // Paint labels after every backdrop so child fills cannot erase parent text.
  for (const layer of paintOrderedEraLayers) {
    renderEra(layer, cx, false);
  }

  if (
    renderedPrimordialDetailStripSegments.length > 0 &&
    primordialDetailStripOpacity > 0.01
  ) {
    const stripBottomY = layout.majorTickTop - 2;
    const stripTopY = stripBottomY - EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX;
    const stripLabelBaselineY = stripTopY - 3;

    for (const segment of renderedPrimordialDetailStripSegments) {
      const segmentWidth = segment.x1 - segment.x0;
      const labelText =
        EARLY_UNIVERSE_DETAIL_STRIP_LABELS[segment.era.id] ??
        EARLY_UNIVERSE_INLINE_LABELS[segment.era.id] ??
        segment.era.name;

      context.save();
      context.globalAlpha = 0.92 * primordialDetailStripOpacity;
      context.fillStyle = segment.era.color;
      context.fillRect(
        segment.x0,
        stripTopY,
        segmentWidth,
        EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX,
      );
      context.strokeStyle = lineSoft;
      context.globalAlpha = 0.55 * primordialDetailStripOpacity;
      context.strokeRect(
        segment.x0 + 0.5,
        stripTopY + 0.5,
        Math.max(segmentWidth - 1, 0),
        Math.max(EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX - 1, 0),
      );
      context.restore();

      context.save();
      context.font = `8px ${fontSans}`;
      const labelWidth = context.measureText(labelText).width;
      context.restore();

      if (labelWidth + 6 <= segmentWidth) {
        context.save();
        context.globalAlpha = 0.82 * primordialDetailStripOpacity;
        context.font = `8px ${fontSans}`;
        context.fillStyle = labelColor;
        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.fillText(
          labelText,
          segment.x0 + segmentWidth / 2,
          stripLabelBaselineY,
        );
        context.restore();
      }

      if (primordialDetailStripOpacity >= 0.35) {
        hoverRegions.push({
          id: `era:detail-strip:${segment.era.id}`,
          left: segment.x0,
          right: segment.x1,
          top: stripLabelBaselineY - 10,
          bottom: stripBottomY + 4,
          anchorX: segment.x0 + segmentWidth / 2,
          anchorY: stripTopY - 2,
          anchorMode: "fixed",
          placement: "above",
          tooltip: getEraTooltipContent(segment.era),
        });
      }
    }
  }
}
