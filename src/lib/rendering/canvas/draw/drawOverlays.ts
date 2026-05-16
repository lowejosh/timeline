import { clamp01, smoothstep01 } from "@/lib/core/easing";
import { resolveOverlayLabelHoverBounds } from "@/lib/rendering/overlayLabelHover";
import {
  drawOverlayGroupIcon,
  resolveOverlayGroupIconLayout,
} from "@/lib/rendering/overlayGroupIcons";
import { getOverlayTooltipContent } from "@/lib/app/tooltipModel";
import {
  clipCanvasOutsideOcclusionRects,
  drawPaperOverlayBand,
  getOverlayLabelPaint,
  pushCanvasOcclusionRect,
  resolveOverlayBandLabelInsets,
} from "../drawing";
import {
  getExpandedOverlayChildRevealProgress,
  getExpandedOverlayChromeRailRevealProgress,
  getExpandedOverlayChromeStemRevealProgress,
  getExpandedOverlayLabelRevealProgress,
} from "../eraAnimation";
import {
  getOverlayLaneY,
  resolveExpandedOverlayConnectorGeometry,
} from "../overlayLayout";
import { getExpandedOverlayPanelBounds } from "@/lib/rendering/expandedOverlayLayout";
import { parseColor, toCssColor, withAlpha } from "../colors";
import {
  canExpandOverlayParent,
  EXPANDED_OVERLAY_CHILD_SLIDE_PX,
  EXPANDED_OVERLAY_CONNECTOR_ALPHA,
  EXPANDED_OVERLAY_CONNECTOR_LINE_WIDTH,
  EXPANDED_OVERLAY_INTERACTION_REVEAL_THRESHOLD,
  EXPANDED_OVERLAY_TOP_PADDING,
  MIN_VISIBLE_OVERLAY_CHILD_WIDTH,
  OVERLAY_BAND_ALPHA,
  OVERLAY_BAND_ENTER_SLIDE_PX,
  OVERLAY_BAND_EXIT_SLIDE_PX,
  OVERLAY_GROUP_ICON_CHILD_ALPHA,
  OVERLAY_GROUP_ICON_PARENT_ALPHA,
  OVERLAY_LANE_GAP,
  OVERLAY_LANE_HEIGHT,
} from "../constants";
import type { TimelineTooltipContent } from "@/lib/app/tooltipModel";
import type { CanvasDrawContext } from "./drawContext";

type DrawOverlayLabelParams = {
  fullLabel: string;
  shortLabel: string;
  renderX: number;
  renderWidth: number;
  labelLeftInset?: number;
  labelRightInset?: number;
  y: number;
  fillStyle: string;
  alpha: number;
  hoverId?: string;
  tooltip?: TimelineTooltipContent;
};

function drawOverlayLabel(
  params: DrawOverlayLabelParams,
  cx: CanvasDrawContext,
): void {
  const {
    fullLabel,
    shortLabel,
    renderX,
    renderWidth,
    labelLeftInset = 0,
    labelRightInset = 0,
    y,
    fillStyle,
    alpha,
    hoverId,
    tooltip,
  } = params;
  const { context, hoverRegions, fontSans } = cx;

  const contentLeft = renderX + labelLeftInset;
  const contentRight = renderX + renderWidth - labelRightInset;
  const contentWidth = Math.max(contentRight - contentLeft, 0);

  context.font = `11px ${fontSans}`;
  const fullLabelWidth = context.measureText(fullLabel).width;

  let text: string;
  let textWidth: number;

  if (fullLabelWidth <= contentWidth) {
    text = fullLabel;
    textWidth = fullLabelWidth;
  } else if (shortLabel !== fullLabel) {
    const shortLabelWidth = context.measureText(shortLabel).width;

    if (shortLabelWidth <= contentWidth) {
      text = shortLabel;
      textWidth = shortLabelWidth;
    } else {
      return;
    }
  } else {
    return;
  }

  if (hoverId && tooltip) {
    const hoverBounds = resolveOverlayLabelHoverBounds({
      centerX: contentLeft + contentWidth / 2,
      labelWidth: textWidth,
      bandLeft: contentLeft,
      bandRight: contentRight,
      bandTop: y,
      bandBottom: y + OVERLAY_LANE_HEIGHT,
    });

    hoverRegions.push({
      id: hoverId,
      left: hoverBounds.left,
      right: hoverBounds.right,
      top: hoverBounds.top,
      bottom: hoverBounds.bottom,
      anchorX: contentLeft + contentWidth / 2,
      anchorY: y + 2,
      anchorMode: "follow-x",
      placement: "above",
      tooltip,
    });
  }

  context.save();
  context.fillStyle = fillStyle;
  context.globalAlpha = alpha;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    text,
    contentLeft + contentWidth / 2,
    y + OVERLAY_LANE_HEIGHT / 2,
  );
  context.restore();
}

type DrawAnimatedOverlayDisclosureIndicatorParams = {
  centerX: number;
  centerY: number;
  strokeStyle: string;
  alpha: number;
  progress: number;
};

function drawAnimatedOverlayDisclosureIndicator(
  params: DrawAnimatedOverlayDisclosureIndicatorParams,
  cx: CanvasDrawContext,
): void {
  const { centerX, centerY, strokeStyle, alpha, progress } = params;
  const { context } = cx;
  const easedProgress = smoothstep01(progress);

  context.save();
  context.translate(centerX, centerY);
  context.rotate(Math.PI * easedProgress);
  context.strokeStyle = strokeStyle;
  context.globalAlpha = alpha;
  context.lineWidth = 1.4;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(-3.5, -1.5);
  context.lineTo(0, 1.5);
  context.lineTo(3.5, -1.5);
  context.stroke();
  context.restore();
}

export function drawOverlays(cx: CanvasDrawContext): void {
  const {
    context,
    sceneWidth,
    sceneHeight,
    animatedOverlayBands,
    visibleOverlayIds,
    resolvedOverlayLayout,
    expandedOverlayExpansionStates,
    layout,
    labelColor,
    paper,
    overlayInteractionRegions,
    overlayOcclusionRects,
    expandedOverlayProgressByIdRef,
  } = cx;

  context.save();
  context.beginPath();
  context.rect(
    0,
    layout.overlayClipTop,
    sceneWidth,
    Math.max(layout.overlayClipBottom - layout.overlayClipTop, 0),
  );
  context.clip();

  if (animatedOverlayBands.length > 0) {
    for (const overlayState of animatedOverlayBands) {
      const overlay = overlayState.overlay;
      const bandWidth = overlay.renderWidth;
      const isVisibleOverlay = visibleOverlayIds.has(overlay.band.id);
      const canExpand = canExpandOverlayParent(
        bandWidth,
        overlay.band.children?.length ?? 0,
      );
      const expandedShift = isVisibleOverlay
        ? (resolvedOverlayLayout.yById.get(overlay.band.id) ??
            getOverlayLaneY(layout, overlay.laneIndex)) -
          getOverlayLaneY(layout, overlay.laneIndex)
        : 0;
      const motionOffset =
        overlayState.targetOpacity > overlayState.currentOpacity
          ? (1 - overlayState.currentOpacity) * OVERLAY_BAND_ENTER_SLIDE_PX
          : -(1 - overlayState.currentOpacity) * OVERLAY_BAND_EXIT_SLIDE_PX;
      const y = overlayState.currentY + expandedShift + motionOffset;

      if (isVisibleOverlay && canExpand) {
        overlayInteractionRegions.push({
          id: overlay.band.id,
          left: overlay.renderX,
          right: overlay.renderX + bandWidth,
          top: y - 4,
          bottom: y + OVERLAY_LANE_HEIGHT + 4,
          role: "parent",
        });
      }

      pushCanvasOcclusionRect(overlayOcclusionRects, {
        left: overlay.renderX,
        right: overlay.renderX + bandWidth,
        top: y,
        bottom: y + OVERLAY_LANE_HEIGHT,
      });

      context.save();
      const overlayBandOpacity = OVERLAY_BAND_ALPHA;
      const overlayLabelPaint = getOverlayLabelPaint(
        overlay.band.color,
        overlayBandOpacity,
        labelColor,
        paper,
      );

      drawPaperOverlayBand({
        context,
        x: overlay.renderX,
        y,
        width: bandWidth,
        height: OVERLAY_LANE_HEIGHT,
        bandColor: overlay.band.color,
        alpha:
          overlayBandOpacity *
          overlay.renderAlphaMultiplier *
          overlayState.currentOpacity,
      });

      const iconLayout = resolveOverlayGroupIconLayout({
        groupId: overlay.band.groupId,
        bandLeft: overlay.renderX,
        bandTop: y,
        bandWidth,
        bandHeight: OVERLAY_LANE_HEIGHT,
      });
      const labelInsets = resolveOverlayBandLabelInsets({
        iconReservedWidth: iconLayout?.reservedWidth ?? 0,
        hasDisclosure: isVisibleOverlay && canExpand,
      });

      if (iconLayout) {
        drawOverlayGroupIcon({
          context,
          layout: iconLayout,
          strokeStyle: overlayLabelPaint.fillStyle,
          alpha: OVERLAY_GROUP_ICON_PARENT_ALPHA * overlayState.currentOpacity,
        });
      }

      const fullLabel = overlay.band.label;
      const shortLabel = overlay.band.shortLabel ?? fullLabel;
      drawOverlayLabel(
        {
          fullLabel,
          shortLabel,
          renderX: overlay.renderX,
          renderWidth: bandWidth,
          labelLeftInset: labelInsets.left,
          labelRightInset: labelInsets.right,
          y,
          fillStyle: overlayLabelPaint.fillStyle,
          alpha: 0.82 * overlayState.currentOpacity,
          hoverId: isVisibleOverlay ? overlay.band.id : undefined,
          tooltip: isVisibleOverlay
            ? getOverlayTooltipContent(overlay.band)
            : undefined,
        },
        cx,
      );

      if (isVisibleOverlay && canExpand) {
        const indicatorOpacity = clamp01((bandWidth - 26) / 18);

        if (indicatorOpacity > 0.01) {
          const indicatorCenterX = overlay.renderX + bandWidth - 10;
          const indicatorCenterY = y + OVERLAY_LANE_HEIGHT / 2;
          const indicatorProgress =
            expandedOverlayProgressByIdRef.current.get(overlay.band.id) ?? 0;

          drawAnimatedOverlayDisclosureIndicator(
            {
              centerX: indicatorCenterX,
              centerY: indicatorCenterY,
              strokeStyle: overlayLabelPaint.fillStyle,
              alpha: 0.74 * indicatorOpacity,
              progress: indicatorProgress,
            },
            cx,
          );
        }
      }

      context.restore();
    }
  }

  for (const {
    detail: expandedOverlayDetail,
    progress: expandedOverlayProgress,
    animatedHeight: expandedOverlayAnimatedHeight,
  } of expandedOverlayExpansionStates) {
    if (expandedOverlayAnimatedHeight <= 0.5) {
      continue;
    }

    const panelHeight = expandedOverlayAnimatedHeight;
    const parentY =
      resolvedOverlayLayout.yById.get(expandedOverlayDetail.parent.band.id) ??
      getOverlayLaneY(layout, expandedOverlayDetail.parent.laneIndex);
    const { panelTop } = getExpandedOverlayPanelBounds(
      parentY,
      panelHeight,
      OVERLAY_LANE_HEIGHT,
    );
    const panelLeft = expandedOverlayDetail.parent.renderX;
    const panelRight = panelLeft + expandedOverlayDetail.panelWidth;
    const panelInnerLeft = panelLeft;
    const panelInnerRight = panelRight;
    const parentCenterX = panelLeft + expandedOverlayDetail.panelWidth / 2;
    const parentColor = parseColor(expandedOverlayDetail.parent.band.color) ?? {
      r: 180,
      g: 120,
      b: 70,
      a: 1,
    };
    const connectorStroke = toCssColor(
      withAlpha(parentColor, EXPANDED_OVERLAY_CONNECTOR_ALPHA),
    );
    const connectorGeometry = resolveExpandedOverlayConnectorGeometry(
      expandedOverlayDetail.children,
      panelLeft,
      panelRight,
      parentCenterX,
      parentY + OVERLAY_LANE_HEIGHT,
      panelTop,
    );
    const chromeStemReveal = getExpandedOverlayChromeStemRevealProgress(
      expandedOverlayProgress,
    );
    const chromeRailReveal = getExpandedOverlayChromeRailRevealProgress(
      expandedOverlayProgress,
    );
    const revealedStemBottom =
      connectorGeometry.stemTop +
      (connectorGeometry.stemBottom - connectorGeometry.stemTop) *
        chromeStemReveal;
    const revealedRailLeft =
      connectorGeometry.stemX +
      (connectorGeometry.railLeft - connectorGeometry.stemX) * chromeRailReveal;
    const revealedRailRight =
      connectorGeometry.stemX +
      (connectorGeometry.railRight - connectorGeometry.stemX) *
        chromeRailReveal;

    overlayInteractionRegions.push({
      id: expandedOverlayDetail.parent.band.id,
      left: connectorGeometry.railLeft - 6,
      right: connectorGeometry.railRight + 6,
      top: parentY + OVERLAY_LANE_HEIGHT - 4,
      bottom: panelTop + EXPANDED_OVERLAY_TOP_PADDING + 6,
      role: "panel",
      parentId: expandedOverlayDetail.parent.band.id,
    });

    context.save();
    clipCanvasOutsideOcclusionRects(
      context,
      sceneWidth,
      sceneHeight,
      overlayOcclusionRects,
    );
    context.strokeStyle = connectorStroke;
    context.lineWidth = EXPANDED_OVERLAY_CONNECTOR_LINE_WIDTH;
    context.lineCap = "round";

    if (chromeStemReveal > 0.01) {
      context.globalAlpha = chromeStemReveal;
      context.beginPath();
      context.moveTo(connectorGeometry.stemX, connectorGeometry.stemTop);
      context.lineTo(connectorGeometry.stemX, revealedStemBottom);
      context.stroke();
    }

    if (chromeRailReveal > 0.01) {
      context.globalAlpha = chromeRailReveal;
      context.beginPath();
      context.moveTo(revealedRailLeft, connectorGeometry.railY);
      context.lineTo(revealedRailRight, connectorGeometry.railY);
      context.stroke();
    }

    context.restore();

    for (const child of expandedOverlayDetail.children) {
      const clippedX0 = Math.max(child.x0, panelInnerLeft);
      const clippedX1 = Math.min(child.x1, panelInnerRight);
      const clippedWidth = Math.max(clippedX1 - clippedX0, 0);

      if (clippedWidth < MIN_VISIBLE_OVERLAY_CHILD_WIDTH) {
        continue;
      }

      const renderWidth = clippedWidth;
      const renderX = clippedX0;
      const childY =
        panelTop +
        EXPANDED_OVERLAY_TOP_PADDING +
        child.laneIndex * (OVERLAY_LANE_HEIGHT + OVERLAY_LANE_GAP);
      const childReveal = getExpandedOverlayChildRevealProgress(
        expandedOverlayProgress,
        child.laneIndex,
      );

      if (childReveal <= 0.01) {
        continue;
      }

      const childLabelReveal = getExpandedOverlayLabelRevealProgress(
        expandedOverlayProgress,
        child.laneIndex,
      );
      const childTooltip = getOverlayTooltipContent(child.band);
      const childRenderY =
        childY - (1 - childReveal) * EXPANDED_OVERLAY_CHILD_SLIDE_PX;
      const childConnectorX = renderX + renderWidth / 2;
      const childBandOpacity = OVERLAY_BAND_ALPHA;
      const childLabelPaint = getOverlayLabelPaint(
        child.band.color,
        childBandOpacity,
        labelColor,
        paper,
      );

      pushCanvasOcclusionRect(overlayOcclusionRects, {
        left: renderX,
        right: renderX + renderWidth,
        top: childRenderY,
        bottom: childRenderY + OVERLAY_LANE_HEIGHT,
      });

      if (childReveal >= EXPANDED_OVERLAY_INTERACTION_REVEAL_THRESHOLD) {
        overlayInteractionRegions.push({
          id: child.band.id,
          left: renderX,
          right: renderX + renderWidth,
          top: childRenderY - 3,
          bottom: childRenderY + OVERLAY_LANE_HEIGHT + 3,
          role: "child",
          parentId: expandedOverlayDetail.parent.band.id,
          tooltip: childTooltip,
        });
      }

      context.save();
      clipCanvasOutsideOcclusionRects(
        context,
        sceneWidth,
        sceneHeight,
        overlayOcclusionRects,
      );
      context.strokeStyle = connectorStroke;
      context.lineWidth = 1;
      context.lineCap = "round";
      context.globalAlpha = childReveal;
      context.beginPath();
      context.moveTo(childConnectorX, connectorGeometry.railY);
      context.lineTo(
        childConnectorX,
        connectorGeometry.railY +
          (childRenderY - connectorGeometry.railY) * childReveal,
      );
      context.stroke();
      context.restore();

      context.save();
      drawPaperOverlayBand({
        context,
        x: renderX,
        y: childRenderY,
        width: renderWidth,
        height: OVERLAY_LANE_HEIGHT,
        bandColor: child.band.color,
        alpha: childBandOpacity * childReveal,
      });

      const childIconLayout = resolveOverlayGroupIconLayout({
        groupId: child.band.groupId,
        bandLeft: renderX,
        bandTop: childRenderY,
        bandWidth: renderWidth,
        bandHeight: OVERLAY_LANE_HEIGHT,
      });
      const childLabelInsets = resolveOverlayBandLabelInsets({
        iconReservedWidth: childIconLayout?.reservedWidth ?? 0,
      });

      if (childIconLayout) {
        drawOverlayGroupIcon({
          context,
          layout: childIconLayout,
          strokeStyle: childLabelPaint.fillStyle,
          alpha: OVERLAY_GROUP_ICON_CHILD_ALPHA * childReveal,
        });
      }

      const fullLabel = child.band.label;
      const shortLabel = child.band.shortLabel ?? fullLabel;

      if (childLabelReveal > 0.01) {
        drawOverlayLabel(
          {
            fullLabel,
            shortLabel,
            renderX,
            renderWidth,
            labelLeftInset: childLabelInsets.left,
            labelRightInset: childLabelInsets.right,
            y: childRenderY,
            fillStyle: childLabelPaint.fillStyle,
            alpha: 0.8 * childReveal * childLabelReveal,
            hoverId: child.band.id,
            tooltip: childTooltip,
          },
          cx,
        );
      }

      context.restore();
    }
  }

  context.restore();
}
