import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "./timelineYears";

export const OVERVIEW_RULER_MIN_SPOTLIGHT_WIDTH = 1;
export const OVERVIEW_RULER_DEFAULT_TIER_THRESHOLD_PX = 10;
export const OVERVIEW_RULER_DEFAULT_MAX_TIERS = 4;

export type OverviewRulerDomain = {
  startYear: number;
  endYear: number;
};

export const OVERVIEW_RULER_FULL_TIMELINE_DOMAIN: OverviewRulerDomain = {
  startYear: TIMELINE_MIN_YEAR,
  endYear: TIMELINE_MAX_YEAR,
};

export type OverviewRulerBounds = {
  left: number;
  right: number;
  innerWidth: number;
};

export type OverviewRulerSpotlight = {
  actualLeft: number;
  actualRight: number;
  actualWidth: number;
  displayLeft: number;
  displayRight: number;
  displayWidth: number;
  centerX: number;
};

export type OverviewRulerTier = {
  domain: OverviewRulerDomain;
  spotlightStartYear: number;
  spotlightEndYear: number;
  isFinalTier: boolean;
};

const overviewRulerIntegerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function formatOverviewRulerScaledValue(value: number) {
  const maximumFractionDigits =
    value >= 100 ? 0 : value >= 10 ? 1 : 2;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDomainSpan(domain: OverviewRulerDomain) {
  return Math.max(domain.endYear - domain.startYear, 0);
}

export function getOverviewRulerBounds(
  width: number,
  pad: number,
): OverviewRulerBounds {
  const safeWidth = Math.max(width, pad * 2 + 1);

  return {
    left: pad,
    right: safeWidth - pad,
    innerWidth: Math.max(safeWidth - pad * 2, 1),
  };
}

export function getOverviewRulerYearsPerPixel(
  domain: OverviewRulerDomain,
  width: number,
  pad: number,
) {
  const span = getDomainSpan(domain);

  return span / getOverviewRulerBounds(width, pad).innerWidth;
}

export function mapOverviewRulerYearToX(
  year: number,
  domain: OverviewRulerDomain,
  width: number,
  pad: number,
) {
  const bounds = getOverviewRulerBounds(width, pad);
  const span = getDomainSpan(domain);

  if (span <= 0) {
    return bounds.left;
  }

  const clampedYear = clamp(year, domain.startYear, domain.endYear);
  const progress = (clampedYear - domain.startYear) / span;

  return bounds.left + progress * bounds.innerWidth;
}

export function mapOverviewRulerXToYear(
  x: number,
  domain: OverviewRulerDomain,
  width: number,
  pad: number,
) {
  const bounds = getOverviewRulerBounds(width, pad);
  const span = getDomainSpan(domain);
  const clampedX = clamp(x, bounds.left, bounds.right);
  const progress = (clampedX - bounds.left) / bounds.innerWidth;

  return domain.startYear + progress * span;
}

export function resolveOverviewRulerSpotlight(
  visibleStartYear: number,
  visibleEndYear: number,
  domain: OverviewRulerDomain,
  width: number,
  pad: number,
  minDisplayWidth = OVERVIEW_RULER_MIN_SPOTLIGHT_WIDTH,
): OverviewRulerSpotlight {
  const bounds = getOverviewRulerBounds(width, pad);
  const actualLeft = mapOverviewRulerYearToX(
    visibleStartYear,
    domain,
    width,
    pad,
  );
  const actualRight = mapOverviewRulerYearToX(
    visibleEndYear,
    domain,
    width,
    pad,
  );
  const orderedActualLeft = Math.min(actualLeft, actualRight);
  const orderedActualRight = Math.max(actualLeft, actualRight);
  const actualWidth = Math.max(orderedActualRight - orderedActualLeft, 0);
  const centerX = orderedActualLeft + actualWidth / 2;
  const displayWidth = clamp(
    Math.max(actualWidth, minDisplayWidth),
    1,
    bounds.innerWidth,
  );
  const displayLeft = clamp(
    centerX - displayWidth / 2,
    bounds.left,
    bounds.right - displayWidth,
  );

  return {
    actualLeft: orderedActualLeft,
    actualRight: orderedActualRight,
    actualWidth,
    displayLeft,
    displayRight: displayLeft + displayWidth,
    displayWidth,
    centerX,
  };
}

export type ResolveOverviewRulerTiersOptions = {
  addTierThresholdPx?: number;
  maxTiers?: number;
};

export function resolveOverviewRulerTiers(
  fullDomain: OverviewRulerDomain,
  visibleStartYear: number,
  visibleEndYear: number,
  width: number,
  pad: number,
  options: ResolveOverviewRulerTiersOptions = {},
): OverviewRulerTier[] {
  const addTierThresholdPx = Math.max(
    options.addTierThresholdPx ?? OVERVIEW_RULER_DEFAULT_TIER_THRESHOLD_PX,
    1,
  );
  const maxTiers = Math.max(options.maxTiers ?? OVERVIEW_RULER_DEFAULT_MAX_TIERS, 1);
  const bounds = getOverviewRulerBounds(width, pad);
  const orderedVisibleStart = Math.min(visibleStartYear, visibleEndYear);
  const orderedVisibleEnd = Math.max(visibleStartYear, visibleEndYear);
  const visibleSpan = orderedVisibleEnd - orderedVisibleStart;
  const tiers: OverviewRulerTier[] = [];
  let domain = fullDomain;

  for (let index = 0; index < maxTiers; index += 1) {
    const domainSpan = getDomainSpan(domain);
    const yearsPerPx = domainSpan / bounds.innerWidth;
    const actualPx = yearsPerPx > 0 ? visibleSpan / yearsPerPx : bounds.innerWidth;
    const isLastSlot = index === maxTiers - 1;
    const visibleFitsInThisTier = actualPx >= addTierThresholdPx;

    if (visibleFitsInThisTier || isLastSlot) {
      tiers.push({
        domain,
        spotlightStartYear: clamp(
          orderedVisibleStart,
          domain.startYear,
          domain.endYear,
        ),
        spotlightEndYear: clamp(
          orderedVisibleEnd,
          domain.startYear,
          domain.endYear,
        ),
        isFinalTier: true,
      });
      break;
    }

    const frozenYearSpan = Math.min(addTierThresholdPx * yearsPerPx, domainSpan);
    const visibleCenter = (orderedVisibleStart + orderedVisibleEnd) / 2;
    let spotStart = visibleCenter - frozenYearSpan / 2;
    let spotEnd = spotStart + frozenYearSpan;

    if (spotStart < domain.startYear) {
      spotStart = domain.startYear;
      spotEnd = spotStart + frozenYearSpan;
    }

    if (spotEnd > domain.endYear) {
      spotEnd = domain.endYear;
      spotStart = spotEnd - frozenYearSpan;
    }

    tiers.push({
      domain,
      spotlightStartYear: spotStart,
      spotlightEndYear: spotEnd,
      isFinalTier: false,
    });

    domain = { startYear: spotStart, endYear: spotEnd };
  }

  return tiers;
}

export function resolveAnchoredOverviewRulerTiers(
  frozenTiers: OverviewRulerTier[],
  anchorTierIndex: number,
  visibleStartYear: number,
  visibleEndYear: number,
  width: number,
  pad: number,
  options: ResolveOverviewRulerTiersOptions = {},
): OverviewRulerTier[] {
  if (frozenTiers.length === 0) {
    return [];
  }

  const safeAnchorTierIndex = clamp(anchorTierIndex, 0, frozenTiers.length - 1);
  const prefix = frozenTiers.slice(0, safeAnchorTierIndex);
  const anchorTier = frozenTiers[safeAnchorTierIndex];
  const maxTiers = Math.max(
    options.maxTiers ?? OVERVIEW_RULER_DEFAULT_MAX_TIERS,
    1,
  );
  const remainingMaxTiers = Math.max(maxTiers - prefix.length, 1);
  const anchoredSuffix = resolveOverviewRulerTiers(
    anchorTier.domain,
    visibleStartYear,
    visibleEndYear,
    width,
    pad,
    {
      ...options,
      maxTiers: remainingMaxTiers,
    },
  );

  return [...prefix, ...anchoredSuffix];
}

export function formatOverviewRulerSpanLabel(spanYears: number) {
  const safeSpanYears = Math.max(Math.abs(spanYears), 1e-18);

  if (safeSpanYears >= 1_000_000_000) {
    return `${formatOverviewRulerScaledValue(safeSpanYears / 1_000_000_000)}B years`;
  }

  if (safeSpanYears >= 1_000_000) {
    return `${formatOverviewRulerScaledValue(safeSpanYears / 1_000_000)}M years`;
  }

  if (safeSpanYears >= 1_000) {
    return `${formatOverviewRulerScaledValue(safeSpanYears / 1_000)}k years`;
  }

  if (safeSpanYears >= 1) {
    return `${overviewRulerIntegerFormatter.format(Math.round(safeSpanYears))} years`;
  }

  return "<1 years";
}

export function formatOverviewRulerPercentageLabel(
  highlightedSpanYears: number,
  totalSpanYears: number,
) {
  const safeHighlightedSpanYears = Math.max(Math.abs(highlightedSpanYears), 1e-18);
  const safeTotalSpanYears = Math.max(Math.abs(totalSpanYears), safeHighlightedSpanYears);
  const percentage = (safeHighlightedSpanYears / safeTotalSpanYears) * 100;
  const maximumFractionDigits =
    percentage >= 10
      ? 1
      : percentage >= 0.1
        ? 2
        : percentage >= 0.01
          ? 3
          : percentage >= 0.001
            ? 4
            : percentage >= 0.0001
              ? 6
              : 8;
  const minimumVisiblePercentage = 10 ** -maximumFractionDigits;

  if (percentage > 0 && percentage < minimumVisiblePercentage) {
    return `<${new Intl.NumberFormat("en-US", {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(minimumVisiblePercentage)}%`;
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(percentage)}%`;
}
