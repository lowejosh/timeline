import { type Era } from "../data/eras";
import { worldToScreen, type TimelineViewport } from "./viewport";

export type ResolvedTimelineEraLayer = {
  era: Era;
  depth: number;
  opacity: number;
  childOpacity: number;
  visibleFillRatio: number;
  isActive: boolean;
};

const ACTIVE_LAYER_FADE_IN_START = 0.18;
const ACTIVE_LAYER_FADE_IN_END = 0.58;
const PREVIEW_LAYER_FADE_IN_START = 0.24;
const PREVIEW_LAYER_FADE_IN_END = 0.64;
const ACTIVE_LAYER_TRIGGER_IN = 0.38;
const ACTIVE_LAYER_TRIGGER_OUT = 0.28;
const PREVIEW_LAYER_TRIGGER_IN = 0.44;
const PREVIEW_LAYER_TRIGGER_OUT = 0.34;

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
  const currentLevel = eras.map((era) => {
    const visibleFillRatio = getVisibleEraFillRatio(era, viewport, width, pad);
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
      opacity: inheritedOpacity * (1 - childOpacity * 0.8),
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
  const currentLevel = eras.map((era) => {
    const visibleFillRatio = getVisibleEraFillRatio(era, viewport, width, pad);
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
      opacity: inheritedOpacity * (1 - childOpacity * 0.8),
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
    .sort((a, b) => b.depth - a.depth)
    .map((layer) => layer.era);
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
