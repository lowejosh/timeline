import { shouldHideOverlappedEraLabel } from "@/lib/rendering/childLayers";
import { resolveContextBandRenderState } from "@/lib/rendering/contextBands";
import { resolveTextHoverBounds } from "@/lib/rendering/overlayLabelHover";
import { getEraTooltipContent } from "@/lib/app/tooltipModel";
import {
  getEraBackdropResetAlpha,
  getEraBandAlphaMultiplier,
  getEraInlineLabelVisibility,
} from "../eraAnimation";
import {
  EARLY_UNIVERSE_BAND_EXPANSION_IDS,
  EARLY_UNIVERSE_COMPACT_LABEL_FADE_WIDTH_PX,
  EARLY_UNIVERSE_COMPACT_LABEL_MIN_WIDTH_PX,
  EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX,
  EARLY_UNIVERSE_DETAIL_STRIP_LABELS,
  EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_MIN_CANVAS_HEIGHT_PX,
  EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_RESERVED_HEIGHT_PX,
  EARLY_UNIVERSE_EXPANDED_LABEL_FADE_WIDTH_PX,
  EARLY_UNIVERSE_EXPANDED_LABEL_MIN_WIDTH_PX,
  EARLY_UNIVERSE_INLINE_LABELS,
  FORCED_PRIMORDIAL_LABEL_IDS,
} from "../primordial";
import { ERA_BAND_ALPHA } from "../constants";
import type { CanvasDrawContext } from "./drawContext";

type EraLayer = CanvasDrawContext["paintOrderedEraLayers"][number];

function renderEra(layer: EraLayer, cx: CanvasDrawContext): void {
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

  context.globalAlpha =
    opacity *
    ERA_BAND_ALPHA *
    getEraBandAlphaMultiplier(era, layer.depth) *
    renderState.alphaMultiplier;
  context.fillStyle = era.color;
  context.fillRect(
    renderState.renderLeft,
    0,
    renderState.renderWidth,
    sceneHeight,
  );
  context.restore();

  const shouldHideInlineLabel = breadcrumbChainIds.has(era.id);
  const isPrimordialEra = EARLY_UNIVERSE_BAND_EXPANSION_IDS.has(era.id);
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
  const labelText = era.alternateName
    ? `${baseLabelText}\n${era.alternateName}`
    : baseLabelText;
  const labelMinWidth = usesForcedPrimordialLabel
    ? 8
    : usesExpandedPrimordialLabel
      ? EARLY_UNIVERSE_EXPANDED_LABEL_MIN_WIDTH_PX
      : usesCompactPrimordialLabel
        ? EARLY_UNIVERSE_COMPACT_LABEL_MIN_WIDTH_PX
        : 60;
  const labelFadeWidth = usesForcedPrimordialLabel
    ? 18
    : usesExpandedPrimordialLabel
      ? EARLY_UNIVERSE_EXPANDED_LABEL_FADE_WIDTH_PX
      : usesCompactPrimordialLabel
        ? EARLY_UNIVERSE_COMPACT_LABEL_FADE_WIDTH_PX
        : 120;
  const labelFont = usesForcedPrimordialLabel
    ? "9px var(--font-sans)"
    : usesExpandedPrimordialLabel || usesCompactPrimordialLabel
      ? "10px var(--font-sans)"
      : "11px var(--font-sans)";

  if (
    visibleEraWidth > labelMinWidth &&
    (!shouldHideInlineLabel || allowsNormalPrimordialLabelBypass)
  ) {
    const labelX = Math.max(x0, pad) / 2 + Math.min(x1, sceneWidth - pad) / 2;
    const labelBaselineY = axisY - 44;
    const labelVisibility = getEraInlineLabelVisibility(layer.childOpacity);
    const labelAlpha =
      Math.min((visibleEraWidth - labelMinWidth) / labelFadeWidth, 1) *
      labelVisibility *
      (usesForcedPrimordialLabel ? 0.68 : 0.28 + Math.min(opacity, 1) * 0.22);

    context.save();
    context.font = labelFont;
    const lines = labelText.split("\n");
    let maxWidth = 0;
    for (const line of lines) {
      const metrics = context.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    }
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
    context.globalAlpha = labelAlpha;
    context.font = labelFont;
    context.fillStyle = labelColor;
    context.textAlign = "center";
    context.textBaseline = "bottom";

    const lineHeight = 12; // approximate line height
    let currentY = labelBaselineY;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 1) {
        // alternate name
        context.font = `italic 9px ${fontSans}`;
      }
      context.fillText(line, labelX, currentY);
      currentY += lineHeight;
    }
    context.restore();

    if (labelAlpha > 0.01) {
      const totalHeight = lines.length * 12;
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
    sceneHeight,
    lineSoft,
    labelColor,
    hoverRegions,
  } = cx;

  for (const layer of paintOrderedEraLayers) {
    renderEra(layer, cx);
  }

  if (
    renderedPrimordialDetailStripSegments.length > 0 &&
    primordialDetailStripOpacity > 0.01
  ) {
    const stripPanelPaddingTop = 14;
    const stripPanelPaddingBottom = 6;
    const overviewReservedHeight =
      sceneHeight >= EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_MIN_CANVAS_HEIGHT_PX
        ? EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_RESERVED_HEIGHT_PX
        : 0;
    const stripPanelTop =
      sceneHeight -
      overviewReservedHeight -
      (EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX +
        stripPanelPaddingTop +
        stripPanelPaddingBottom);
    const stripPanelHeight =
      EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX +
      stripPanelPaddingTop +
      stripPanelPaddingBottom;
    const stripBottomY =
      stripPanelTop + stripPanelHeight - stripPanelPaddingBottom;
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
      context.font = "8px var(--font-sans)";
      const labelWidth = context.measureText(labelText).width;
      context.restore();

      if (labelWidth + 6 <= segmentWidth) {
        context.save();
        context.globalAlpha = 0.82 * primordialDetailStripOpacity;
        context.font = "8px var(--font-sans)";
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
          top: stripPanelTop,
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
