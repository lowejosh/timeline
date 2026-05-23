import {
  compareEraPriorityAscending,
  compareEraPriorityDescending,
  type Era,
} from "../catalog/eras";
import { getEffectiveTimelinePriority } from "../catalog/timelineSets";
import { worldToScreen, type TimelineViewport } from "../core/viewport";

export type ResolvedTimelineEraLayer = {
  era: Era;
  depth: number;
  opacity: number;
  childOpacity: number;
  visibleFillRatio: number;
  isActive: boolean;
};

const ACTIVE_LAYER_FADE_IN_START = 0.52;
const ACTIVE_LAYER_FADE_IN_END = 0.82;
const PREVIEW_LAYER_FADE_IN_START = 0.58;
const PREVIEW_LAYER_FADE_IN_END = 0.88;
const ACTIVE_LAYER_TRIGGER_IN = 0.72;
const ACTIVE_LAYER_TRIGGER_OUT = 0.62;
const PREVIEW_LAYER_TRIGGER_IN = 0.78;
const PREVIEW_LAYER_TRIGGER_OUT = 0.68;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function interpolateOpacity(fillRatio: number, start: number, end: number) {
  if (end <= start) return fillRatio > start ? 1 : 0;
  return clamp01((fillRatio - start) / (end - start));
}

export function getVisibleEraFillRatio(
  era: Era,
  viewport: TimelineViewport,
  width: number,
  pad: number,
) {
  const innerWidth = Math.max(width - pad * 2, 1);
  const x0 = pad + worldToScreen(era.startYear, viewport, innerWidth);
  const x1 = pad + worldToScreen(era.endYear, viewport, innerWidth);
  const visibleWidth = Math.max(
    0,
    Math.min(x1, width - pad) - Math.max(x0, pad),
  );

  return visibleWidth / innerWidth;
}

export function getEraChildOpacity(
  era: Era,
  activeEraId: string,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  isAnimating: boolean,
) {
  if ((era.children?.length ?? 0) === 0) return 0;

  const isActive = era.id === activeEraId;

  if (isActive && isAnimating) return 1;

  const fillRatio = getVisibleEraFillRatio(era, viewport, width, pad);

  return interpolateOpacity(
    fillRatio,
    isActive ? ACTIVE_LAYER_FADE_IN_START : PREVIEW_LAYER_FADE_IN_START,
    isActive ? ACTIVE_LAYER_FADE_IN_END : PREVIEW_LAYER_FADE_IN_END,
  );
}

export function getEraChildOpacityTarget(
  era: Era,
  activeEraId: string,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  isAnimating: boolean,
  currentTarget = 0,
  isZoomingOut = false,
) {
  if ((era.children?.length ?? 0) === 0) return 0;

  const isActive = era.id === activeEraId;

  if (isActive && isAnimating) return 1;

  const fillRatio = getVisibleEraFillRatio(era, viewport, width, pad);
  const triggerIn = isActive
    ? ACTIVE_LAYER_TRIGGER_IN
    : PREVIEW_LAYER_TRIGGER_IN;
  const triggerOut = isActive
    ? ACTIVE_LAYER_TRIGGER_OUT
    : PREVIEW_LAYER_TRIGGER_OUT;

  if (isZoomingOut) {
    return currentTarget >= 0.5 && fillRatio >= triggerOut ? 1 : 0;
  }

  if (currentTarget >= 0.5) {
    return fillRatio >= triggerOut ? 1 : 0;
  }

  return fillRatio >= triggerIn ? 1 : 0;
}

export function resolveTimelineEraLayersFromOpacityMap(
  eras: Era[],
  activeEraId: string,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  childOpacityById: ReadonlyMap<string, number>,
  inheritedOpacity = 1,
  depth = 0,
): ResolvedTimelineEraLayer[] {
  const currentLevel = [...eras]
    .sort(compareEraPriorityAscending)
    .map((era) => {
      const visibleFillRatio = getVisibleEraFillRatio(
        era,
        viewport,
        width,
        pad,
      );
      const isActive = era.id === activeEraId;
      const childOpacity =
        (era.children?.length ?? 0) === 0
          ? 0
          : clamp01(childOpacityById.get(era.id) ?? 0);

      return {
        era,
        depth,
        isActive,
        visibleFillRatio,
        childOpacity,
        opacity: inheritedOpacity,
      };
    });

  const descendants = currentLevel.flatMap((layer) => {
    if (layer.childOpacity <= 0.01 || !layer.era.children?.length) {
      return [];
    }

    return resolveTimelineEraLayersFromOpacityMap(
      layer.era.children,
      activeEraId,
      viewport,
      width,
      pad,
      childOpacityById,
      inheritedOpacity * layer.childOpacity,
      depth + 1,
    );
  });

  return [...currentLevel, ...descendants];
}

export function resolveTimelineEraLayers(
  eras: Era[],
  activeEraId: string,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  isAnimating: boolean,
  inheritedOpacity = 1,
  depth = 0,
): ResolvedTimelineEraLayer[] {
  const currentLevel = [...eras]
    .sort(compareEraPriorityAscending)
    .map((era) => {
      const visibleFillRatio = getVisibleEraFillRatio(
        era,
        viewport,
        width,
        pad,
      );
      const isActive = era.id === activeEraId;
      const childOpacity = getEraChildOpacity(
        era,
        activeEraId,
        viewport,
        width,
        pad,
        isAnimating,
      );

      return {
        era,
        depth,
        isActive,
        visibleFillRatio,
        childOpacity,
        opacity: inheritedOpacity,
      };
    });

  const descendants = currentLevel.flatMap((layer) => {
    if (layer.childOpacity <= 0.01 || !layer.era.children?.length) {
      return [];
    }

    return resolveTimelineEraLayers(
      layer.era.children,
      activeEraId,
      viewport,
      width,
      pad,
      isAnimating,
      inheritedOpacity * layer.childOpacity,
      depth + 1,
    );
  });

  return [...currentLevel, ...descendants];
}

export function getInteractiveDescendantEras(
  layers: ResolvedTimelineEraLayer[],
  minOpacity = 0.01,
) {
  return layers
    .filter((layer) => layer.depth > 0 && layer.opacity > minOpacity)
    .sort(
      (left, right) =>
        right.depth - left.depth ||
        compareEraPriorityDescending(left.era, right.era),
    )
    .map((layer) => layer.era);
}

export function shouldHideOverlappedEraLabel(
  targetLayer: ResolvedTimelineEraLayer,
  layers: ResolvedTimelineEraLayer[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
  labelWidth: number,
  labelPadding = 8,
) {
  if (targetLayer.opacity <= 0.01) {
    return true;
  }

  const innerWidth = width - pad * 2;
  const targetX0 =
    pad + worldToScreen(targetLayer.era.startYear, viewport, innerWidth);
  const targetX1 =
    pad + worldToScreen(targetLayer.era.endYear, viewport, innerWidth);
  const targetLeft = Math.max(Math.min(targetX0, targetX1), pad);
  const targetRight = Math.min(Math.max(targetX0, targetX1), width - pad);

  if (targetRight - targetLeft <= 0) {
    return true;
  }

  const labelCenterX = (targetLeft + targetRight) / 2;
  const labelLeft = Math.max(labelCenterX - labelWidth / 2 - labelPadding, pad);
  const labelRight = Math.min(
    labelCenterX + labelWidth / 2 + labelPadding,
    width - pad,
  );
  const targetPriority = getEffectiveTimelinePriority(targetLayer.era);

  return layers.some((layer) => {
    if (
      layer.era.id === targetLayer.era.id ||
      layer.depth > targetLayer.depth ||
      layer.opacity <= 0.01 ||
      getEffectiveTimelinePriority(layer.era) <= targetPriority
    ) {
      return false;
    }

    const x0 = pad + worldToScreen(layer.era.startYear, viewport, innerWidth);
    const x1 = pad + worldToScreen(layer.era.endYear, viewport, innerWidth);
    const left = Math.max(Math.min(x0, x1), pad);
    const right = Math.min(Math.max(x0, x1), width - pad);
    const overlap = Math.min(right, labelRight) - Math.max(left, labelLeft);

    return overlap > 1;
  });
}

export function getPreviewFocusChain(
  eras: Era[],
  layers: ResolvedTimelineEraLayer[],
  minChildOpacity = 0.45,
) {
  const layerById = new Map(layers.map((layer) => [layer.era.id, layer]));
  const chain: Era[] = [];
  let currentLevel = eras;

  while (currentLevel.length > 0) {
    const candidates = currentLevel
      .map((era) => ({ era, layer: layerById.get(era.id) }))
      .filter(
        (
          candidate,
        ): candidate is { era: Era; layer: ResolvedTimelineEraLayer } =>
          candidate.layer !== undefined &&
          candidate.layer.childOpacity >= minChildOpacity,
      )
      .sort((left, right) => {
        return (
          right.layer.childOpacity - left.layer.childOpacity ||
          right.layer.visibleFillRatio - left.layer.visibleFillRatio ||
          Number(right.layer.isActive) - Number(left.layer.isActive) ||
          compareEraPriorityDescending(left.era, right.era) ||
          left.era.startYear - right.era.startYear
        );
      });

    const next = candidates[0]?.era;

    if (!next) {
      break;
    }

    chain.push(next);
    currentLevel = next.children ?? [];
  }

  return chain;
}
