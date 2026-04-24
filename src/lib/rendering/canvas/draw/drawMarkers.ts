import {
  getVisibleMarkerPositions,
  type MarkerTextMeasureInput,
  resolveMarkerRenderStates,
  type ResolvedMarkerRenderState,
} from "@/lib/rendering/markerGlyphs";
import { getMarkerTooltipContent } from "@/lib/app/tooltipModel";
import type { CanvasDrawContext } from "./drawContext";

export function drawMarkers(
  cx: CanvasDrawContext,
): readonly ResolvedMarkerRenderState[] {
  const {
    context,
    sceneVisibleMarkers,
    sceneWidth,
    pad,
    toX,
    layout,
    line,
    labelColor,
    hoverRegions,
    markerPriorityBoostRef,
  } = cx;
  const axisY = layout.axisY;

  const visibleMarkerPositions = getVisibleMarkerPositions(
    sceneVisibleMarkers,
    sceneWidth,
    pad,
    toX,
  );
  const measureMarkerText = (
    _marker: (typeof sceneVisibleMarkers)[number],
    { fullLabel, shortLabel, dateLabel }: MarkerTextMeasureInput,
  ) => {
    context.font = "12px var(--font-sans)";
    const fullLabelWidth = context.measureText(fullLabel).width;
    const shortLabelWidth =
      shortLabel === fullLabel
        ? fullLabelWidth
        : context.measureText(shortLabel).width;
    context.font = "10px var(--font-sans)";

    return {
      fullLabelWidth,
      shortLabelWidth,
      dateLabelWidth: context.measureText(dateLabel).width,
    };
  };
  const baseMarkerRenderStates = resolveMarkerRenderStates(
    visibleMarkerPositions,
    sceneWidth,
    pad,
    measureMarkerText,
  );
  const activeMarkerBoosts = [...markerPriorityBoostRef.current.entries()]
    .filter(([, state]) => state.current > 0.001)
    .sort((left, right) => right[1].current - left[1].current);
  const resolvedMarkerStates = (() => {
    if (activeMarkerBoosts.length === 0) {
      return baseMarkerRenderStates;
    }

    const finalStatesById = new Map(
      baseMarkerRenderStates.map((state) => [state.marker.id, { ...state }]),
    );

    for (const [boostedMarkerId, boostState] of activeMarkerBoosts) {
      const boostedStates = resolveMarkerRenderStates(
        visibleMarkerPositions,
        sceneWidth,
        pad,
        measureMarkerText,
        { highlightedMarkerId: boostedMarkerId },
      );

      for (const boostedState of boostedStates) {
        const currentState = finalStatesById.get(boostedState.marker.id);

        if (!currentState) {
          continue;
        }

        currentState.labelOpacity +=
          (boostedState.labelOpacity - currentState.labelOpacity) *
          boostState.current;
        currentState.stemProgress +=
          (boostedState.stemProgress - currentState.stemProgress) *
          boostState.current;
        currentState.intrinsicLabelOpacity +=
          (boostedState.intrinsicLabelOpacity -
            currentState.intrinsicLabelOpacity) *
          boostState.current;
        currentState.revealProgress +=
          (boostedState.revealProgress - currentState.revealProgress) *
          boostState.current;
        currentState.timingProgress +=
          (boostedState.timingProgress - currentState.timingProgress) *
          boostState.current;
        currentState.dotProgress +=
          (boostedState.dotProgress - currentState.dotProgress) *
          boostState.current;
      }
    }

    return baseMarkerRenderStates.map(
      (state) => finalStatesById.get(state.marker.id) ?? state,
    );
  })();

  for (const { marker, x, dotProgress, stemProgress } of resolvedMarkerStates) {
    const markerDotColor = marker.color ?? line;
    const stemStartY = axisY + 2;
    const stemY =
      stemStartY + (layout.markerStemBottom - stemStartY) * stemProgress;

    context.save();
    context.strokeStyle = line;
    context.globalAlpha = 0.18 + stemProgress * 0.72;
    context.lineWidth = 1.5;

    if (stemProgress > 0.001) {
      context.beginPath();
      context.moveTo(x, stemStartY);
      context.lineTo(x, stemY);
      context.stroke();
    }

    const dotRadius = dotProgress > 0.01 ? 0.9 + 1.7 * dotProgress : 0;

    if (dotRadius > 0.001) {
      context.fillStyle = markerDotColor;
      context.globalAlpha = 1;
      context.beginPath();
      context.arc(x, axisY, dotRadius, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  for (const { x, label, dateLabel, labelOpacity } of resolvedMarkerStates) {
    if (labelOpacity <= 0.01) {
      continue;
    }

    context.save();
    context.font = "12px var(--font-sans)";
    context.fillStyle = labelColor;
    context.globalAlpha = 0.78 * labelOpacity;
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillText(label, x, layout.markerLabelY);
    context.font = "10px var(--font-sans)";
    context.globalAlpha = 0.62 * labelOpacity;
    context.fillText(dateLabel, x, layout.markerDateY);
    context.restore();
  }

  for (const state of resolvedMarkerStates) {
    const markerHoverHalfWidth =
      state.labelOpacity > 0.01
        ? Math.max(14, Math.min(state.width * 0.22, 26))
        : 12;
    const markerHoverBottom =
      state.labelOpacity > 0.01 ? layout.markerDateY + 20 : axisY + 18;

    hoverRegions.push({
      id: state.marker.id,
      left: state.x - markerHoverHalfWidth,
      right: state.x + markerHoverHalfWidth,
      top: layout.majorTickTop - 10,
      bottom: markerHoverBottom,
      anchorX: state.x,
      anchorY: axisY - 14,
      anchorMode: "fixed",
      placement: "above",
      tooltip: getMarkerTooltipContent(state.marker),
    });
  }

  return resolvedMarkerStates;
}
