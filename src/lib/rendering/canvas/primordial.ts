import type { Era } from "../../catalog/eras";
import type { ResolvedTimelineEraLayer } from "../childLayers";
import { getPreciseTimelineYearFromExactTimestamp } from "../../core/exactTimestamp";
import {
  EARLY_UNIVERSE_CHILD_ERA_ORDER,
  EARLY_UNIVERSE_END_YEAR,
  EARLY_UNIVERSE_START_YEAR,
} from "../../catalog/sets/cosmic/index";
import {
  comparePreciseTimelineYears,
  getVisibleRangePrecise,
  type PreciseTimelineYear,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MIN_YEAR,
  toApproximateTimelineYear,
  type TimelineViewport,
  worldPreciseToScreen,
} from "../../core/viewport";

export type EraScreenSpan = {
  x0: number;
  x1: number;
  usesVisualExpansion: boolean;
};

export type PrimordialDetailStripSegment = {
  era: Era;
  x0: number;
  x1: number;
};

export const EARLY_UNIVERSE_MIN_EPOCH_WIDTH_PX = 16;
export const EARLY_UNIVERSE_NATURAL_SPAN_MIN_WIDTH_PX = 6;
export const EARLY_UNIVERSE_DETAIL_STRIP_EPOCH_WIDTH_PX =
  EARLY_UNIVERSE_MIN_EPOCH_WIDTH_PX + 28;
export const EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX = 10;
export const EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_RESERVED_HEIGHT_PX = 58;
export const EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_MIN_CANVAS_HEIGHT_PX = 480;
export const PRIMORDIAL_DETAIL_STRIP_FOCUS_ERA_ID = "quark-epoch";
export const PRIMORDIAL_DETAIL_STRIP_FADE_DURATION_MS = 140;
export const EARLY_UNIVERSE_EXPANDED_LABEL_MIN_WIDTH_PX = 22;
export const EARLY_UNIVERSE_EXPANDED_LABEL_FADE_WIDTH_PX = 42;
export const EARLY_UNIVERSE_COMPACT_LABEL_MIN_WIDTH_PX = 18;
export const EARLY_UNIVERSE_COMPACT_LABEL_FADE_WIDTH_PX = 32;
export const FORCED_PRIMORDIAL_LABEL_IDS = new Set([
  "quark-epoch",
  "hadron-epoch",
]);
export const PRIMORDIAL_SYNTHETIC_DETAIL_MAX_ZOOM_WINDOW = 0.001;
export const EARLY_UNIVERSE_INLINE_LABELS: Readonly<Record<string, string>> = {
  "planck-epoch": "Planck",
  "grand-unification-epoch": "GUT",
  "inflationary-epoch": "Inflation",
  "electroweak-epoch": "EW",
  "quark-epoch": "Quark",
  "hadron-epoch": "Hadron",
  "lepton-epoch": "Lepton",
  "big-bang-nucleosynthesis": "BBN",
  "photon-epoch": "Photon",
  recombination: "Recomb.",
};
export const EARLY_UNIVERSE_DETAIL_STRIP_LABELS: Readonly<
  Record<string, string>
> = {
  "planck-epoch": "Planck",
  "grand-unification-epoch": "GUT",
  "inflationary-epoch": "Infl.",
  "electroweak-epoch": "EW",
  "quark-epoch": "Quark",
  "hadron-epoch": "Hadron",
  "lepton-epoch": "Lepton",
  "big-bang-nucleosynthesis": "BBN",
  "photon-epoch": "Photon",
  recombination: "Recomb.",
};
export const EARLY_UNIVERSE_BAND_EXPANSION_IDS = new Set<string>(
  EARLY_UNIVERSE_CHILD_ERA_ORDER,
);

export function getEraBoundaryPreciseYear(era: Era, edge: "start" | "end") {
  const exactTime = edge === "start" ? era.exactStartTime : era.exactEndTime;

  if (exactTime) {
    return getPreciseTimelineYearFromExactTimestamp(exactTime);
  }

  return splitTimelineYear(edge === "start" ? era.startYear : era.endYear);
}

export function getActualEraScreenSpan(
  era: Era,
  viewport: TimelineViewport,
  innerWidth: number,
  pad: number,
): EraScreenSpan {
  return {
    x0:
      pad +
      worldPreciseToScreen(
        getEraBoundaryPreciseYear(era, "start"),
        viewport,
        innerWidth,
      ),
    x1:
      pad +
      worldPreciseToScreen(
        getEraBoundaryPreciseYear(era, "end"),
        viewport,
        innerWidth,
      ),
    usesVisualExpansion: false,
  };
}

export function isPreciseRangeInsideEarlyUniverse(
  visibleStart: PreciseTimelineYear,
  visibleEnd: PreciseTimelineYear,
) {
  return (
    visibleStart.wholeYear >= Math.floor(EARLY_UNIVERSE_START_YEAR) &&
    visibleEnd.wholeYear <= Math.ceil(EARLY_UNIVERSE_END_YEAR)
  );
}

export function resolveEraScreenSpanMap(
  layers: ResolvedTimelineEraLayer[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
  allowPrimordialSyntheticExpansion: boolean,
) {
  const innerWidth = Math.max(width - pad * 2, 1);
  const spans = new Map<string, EraScreenSpan>();

  for (const layer of layers) {
    spans.set(
      layer.era.id,
      getActualEraScreenSpan(layer.era, viewport, innerWidth, pad),
    );
  }

  if (!allowPrimordialSyntheticExpansion) {
    return spans;
  }

  const [visibleStart, visibleEnd] = getVisibleRangePrecise(
    viewport,
    innerWidth,
  );
  const visibleSpan = Math.max(
    Math.abs(subtractPreciseTimelineYears(visibleEnd, visibleStart)),
    1e-18,
  );
  const earlyUniverseOverlapStart = Math.max(
    toApproximateTimelineYear(visibleStart),
    EARLY_UNIVERSE_START_YEAR,
  );
  const earlyUniverseOverlapEnd = Math.min(
    toApproximateTimelineYear(visibleEnd),
    EARLY_UNIVERSE_END_YEAR,
  );
  const floatOverlapRatio =
    Math.max(0, earlyUniverseOverlapEnd - earlyUniverseOverlapStart) /
    visibleSpan;
  const viewportInsideEarlyUniverse = isPreciseRangeInsideEarlyUniverse(
    visibleStart,
    visibleEnd,
  );
  const shouldExpandEarlyUniverseChildren =
    floatOverlapRatio >= 0.75 || viewportInsideEarlyUniverse;

  if (!shouldExpandEarlyUniverseChildren) {
    return spans;
  }

  return spans;
}

export function resolvePrimordialDetailStripSegments(
  layers: ResolvedTimelineEraLayer[],
  spans: ReadonlyMap<string, EraScreenSpan>,
  viewport: TimelineViewport,
  width: number,
  pad: number,
) {
  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRangePrecise(
    viewport,
    innerWidth,
  );

  const visibleSpan = Math.max(
    Math.abs(subtractPreciseTimelineYears(visibleEnd, visibleStart)),
    1e-18,
  );
  const earlyUniverseOverlapStart = Math.max(
    toApproximateTimelineYear(visibleStart),
    EARLY_UNIVERSE_START_YEAR,
  );
  const earlyUniverseOverlapEnd = Math.min(
    toApproximateTimelineYear(visibleEnd),
    EARLY_UNIVERSE_END_YEAR,
  );
  const startsAtBigBang =
    comparePreciseTimelineYears(
      visibleStart,
      splitTimelineYear(TIMELINE_MIN_YEAR),
    ) === 0;
  const shouldShowDetailStrip =
    startsAtBigBang ||
    isPreciseRangeInsideEarlyUniverse(visibleStart, visibleEnd) ||
    Math.max(0, earlyUniverseOverlapEnd - earlyUniverseOverlapStart) /
      visibleSpan >=
      0.75;

  if (!shouldShowDetailStrip) {
    return [] as PrimordialDetailStripSegment[];
  }

  const orderedLayers = EARLY_UNIVERSE_CHILD_ERA_ORDER.map((id) =>
    layers.find((layer) => layer.era.id === id),
  ).filter((layer): layer is ResolvedTimelineEraLayer => layer !== undefined);

  if (orderedLayers.length === 0) {
    return [] as PrimordialDetailStripSegment[];
  }

  const viewportLeft = pad;
  const viewportRight = pad + innerWidth;
  const firstNaturallyVisibleIndex = orderedLayers.findIndex((layer) => {
    const actualSpan = spans.get(layer.era.id);

    if (!actualSpan) {
      return false;
    }

    const visibleWidth =
      Math.min(actualSpan.x1, viewportRight) -
      Math.max(actualSpan.x0, viewportLeft);

    return visibleWidth >= EARLY_UNIVERSE_NATURAL_SPAN_MIN_WIDTH_PX;
  });
  const firstNaturallyVisibleLayer =
    firstNaturallyVisibleIndex === -1
      ? null
      : orderedLayers[firstNaturallyVisibleIndex];

  if (
    firstNaturallyVisibleLayer?.era.id !== PRIMORDIAL_DETAIL_STRIP_FOCUS_ERA_ID
  ) {
    return [] as PrimordialDetailStripSegment[];
  }

  const syntheticLayers =
    firstNaturallyVisibleIndex === -1
      ? orderedLayers
      : orderedLayers.slice(0, firstNaturallyVisibleIndex);

  if (syntheticLayers.length === 0) {
    return [] as PrimordialDetailStripSegment[];
  }

  return syntheticLayers.map((layer, index) => {
    const x0 = pad + index * EARLY_UNIVERSE_DETAIL_STRIP_EPOCH_WIDTH_PX;

    return {
      era: layer.era,
      x0,
      x1: x0 + EARLY_UNIVERSE_DETAIL_STRIP_EPOCH_WIDTH_PX,
    };
  });
}
