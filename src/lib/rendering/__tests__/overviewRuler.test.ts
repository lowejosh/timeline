import { describe, expect, it } from "vitest";
import {
  formatOverviewRulerPercentageLabel,
  formatOverviewRulerSpanLabel,
  OVERVIEW_RULER_FULL_TIMELINE_DOMAIN,
  OVERVIEW_RULER_MIN_SPOTLIGHT_WIDTH,
  getOverviewRulerBounds,
  getOverviewRulerYearsPerPixel,
  mapOverviewRulerXToYear,
  mapOverviewRulerYearToX,
  resolveAnchoredOverviewRulerTiers,
  resolveOverviewRulerBandRect,
  resolveOverviewRulerSpotlight,
  resolveOverviewRulerTiers,
} from "../overviewRuler";
import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "../../core/timelineYears";

const FULL_DOMAIN = OVERVIEW_RULER_FULL_TIMELINE_DOMAIN;

describe("overview ruler geometry", () => {
  it("formats overview span labels compactly across scales", () => {
    expect(formatOverviewRulerSpanLabel(575)).toBe("575 years");
    expect(formatOverviewRulerSpanLabel(2_580_000)).toBe("2.58M years");
    expect(formatOverviewRulerSpanLabel(0.5)).toBe("183 days");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425)).toBe("1 day");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425 / 2)).toBe("12 hours");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425 / 24)).toBe("1 hour");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425 / 24 / 2)).toBe("30 minutes");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425 / 24 / 60)).toBe("1 minute");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425 / 24 / 60 / 2)).toBe("30 seconds");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425 / 24 / 3600)).toBe("1 second");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425 / 24 / 3600 / 2)).toBe("500 ms");
    expect(formatOverviewRulerSpanLabel(1 / 365.2425 / 24 / 3600 / 2000)).toBe("500 µs");
  });

  it("formats overview percentage labels compactly across scales", () => {
    expect(formatOverviewRulerPercentageLabel(92_500_000, 13_800_000_000)).toBe(
      "0.67%",
    );
    expect(formatOverviewRulerPercentageLabel(620_000, 13_800_000_000)).toBe(
      "0.0045%",
    );
    expect(formatOverviewRulerPercentageLabel(574, 13_800_000_000)).toBe(
      "0.00000416%",
    );
    expect(formatOverviewRulerPercentageLabel(0.5, 13_800_000_000)).toBe(
      "3.62×10⁻⁹%",
    );
  });

  it("maps the full timeline range onto the padded strip", () => {
    const width = 1200;
    const pad = 120;
    const bounds = getOverviewRulerBounds(width, pad);

    expect(
      mapOverviewRulerYearToX(TIMELINE_MIN_YEAR, FULL_DOMAIN, width, pad),
    ).toBeCloseTo(bounds.left, 6);
    expect(
      mapOverviewRulerYearToX(TIMELINE_MAX_YEAR, FULL_DOMAIN, width, pad),
    ).toBeCloseTo(bounds.right, 6);
  });

  it("round-trips overview x positions back to timeline years", () => {
    const width = 960;
    const pad = 96;
    const sourceYear = -2_500_000_000;
    const x = mapOverviewRulerYearToX(sourceYear, FULL_DOMAIN, width, pad);

    expect(mapOverviewRulerXToYear(x, FULL_DOMAIN, width, pad)).toBeCloseTo(
      sourceYear,
      -3,
    );
  });

  it("computes years-per-pixel across the full timeline span", () => {
    const width = 1000;
    const pad = 100;
    const yearsPerPixel = getOverviewRulerYearsPerPixel(
      FULL_DOMAIN,
      width,
      pad,
    );

    expect(yearsPerPixel * (width - pad * 2)).toBeCloseTo(
      TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR,
      6,
    );
  });

  it("maps a sub-domain across the same padded strip", () => {
    const width = 600;
    const pad = 50;
    const subDomain = { startYear: 1000, endYear: 2000 };
    const bounds = getOverviewRulerBounds(width, pad);

    expect(
      mapOverviewRulerYearToX(1500, subDomain, width, pad),
    ).toBeCloseTo(bounds.left + bounds.innerWidth / 2, 6);
    expect(
      mapOverviewRulerYearToX(2000, subDomain, width, pad),
    ).toBeCloseTo(bounds.right, 6);
  });

  it("enforces a one-pixel minimum spotlight display width for deep zoom", () => {
    const width = 1200;
    const pad = 120;
    const spotlight = resolveOverviewRulerSpotlight(
      1900,
      1900.0001,
      FULL_DOMAIN,
      width,
      pad,
    );

    expect(spotlight.displayWidth).toBeGreaterThanOrEqual(
      OVERVIEW_RULER_MIN_SPOTLIGHT_WIDTH,
    );
  });

  it("respects a larger custom spotlight minimum width when provided", () => {
    const width = 1200;
    const pad = 120;
    const spotlight = resolveOverviewRulerSpotlight(
      1900,
      1900.0001,
      FULL_DOMAIN,
      width,
      pad,
      4,
    );

    expect(spotlight.displayWidth).toBeGreaterThanOrEqual(4);
  });

  it("clamps spotlight display bounds at the timeline start edge", () => {
    const width = 1200;
    const pad = 120;
    const spotlight = resolveOverviewRulerSpotlight(
      TIMELINE_MIN_YEAR,
      TIMELINE_MIN_YEAR + 1,
      FULL_DOMAIN,
      width,
      pad,
      48,
    );

    expect(spotlight.displayLeft).toBeCloseTo(pad, 6);
  });

  it("clamps spotlight display bounds at the present edge", () => {
    const width = 1200;
    const pad = 120;
    const spotlight = resolveOverviewRulerSpotlight(
      TIMELINE_MAX_YEAR - 1,
      TIMELINE_MAX_YEAR,
      FULL_DOMAIN,
      width,
      pad,
      48,
    );

    expect(spotlight.displayRight).toBeCloseTo(width - pad, 6);
  });

  it("does not inflate microscopic overview bands into visible one-pixel slivers", () => {
    const width = 1200;
    const pad = 120;

    expect(
      resolveOverviewRulerBandRect(
        TIMELINE_MIN_YEAR,
        TIMELINE_MIN_YEAR + 1_000,
        FULL_DOMAIN,
        width,
        pad,
      ),
    ).toBeNull();
  });

  it("keeps genuinely visible overview bands at their natural width", () => {
    const width = 1200;
    const pad = 120;
    const rect = resolveOverviewRulerBandRect(
      -13_800_000_000,
      -13_000_000_000,
      FULL_DOMAIN,
      width,
      pad,
    );

    expect(rect).not.toBeNull();
    expect(rect?.width).toBeGreaterThan(1);
  });
});

describe("overview ruler tier chain", () => {
  const width = 1200;
  const pad = 120;
  const innerWidth = width - pad * 2; // 960

  it("returns a single tier when the visible span is wide enough", () => {
    const tiers = resolveOverviewRulerTiers(
      FULL_DOMAIN,
      TIMELINE_MIN_YEAR,
      TIMELINE_MAX_YEAR / 2,
      width,
      pad,
      { addTierThresholdPx: 10, maxTiers: 4 },
    );

    expect(tiers).toHaveLength(1);
    expect(tiers[0].isFinalTier).toBe(true);
    expect(tiers[0].domain).toEqual(FULL_DOMAIN);
  });

  it("freezes the parent spotlight at the threshold and recurses", () => {
    const visibleStart = 1990;
    const visibleEnd = 2000;
    const tiers = resolveOverviewRulerTiers(
      FULL_DOMAIN,
      visibleStart,
      visibleEnd,
      width,
      pad,
      { addTierThresholdPx: 10, maxTiers: 4 },
    );

    expect(tiers.length).toBeGreaterThan(1);

    const firstTier = tiers[0];
    expect(firstTier.isFinalTier).toBe(false);
    expect(firstTier.domain).toEqual(FULL_DOMAIN);

    const fullDomainSpan =
      FULL_DOMAIN.endYear - FULL_DOMAIN.startYear;
    const expectedFrozenSpan = (10 / innerWidth) * fullDomainSpan;
    const frozenSpan =
      firstTier.spotlightEndYear - firstTier.spotlightStartYear;

    expect(frozenSpan).toBeCloseTo(expectedFrozenSpan, 0);

    const lastTier = tiers[tiers.length - 1];
    expect(lastTier.isFinalTier).toBe(true);
    expect(lastTier.spotlightStartYear).toBeCloseTo(visibleStart, 6);
    expect(lastTier.spotlightEndYear).toBeCloseTo(visibleEnd, 6);
  });

  it("each tier's domain equals the previous tier's spotlight", () => {
    const tiers = resolveOverviewRulerTiers(
      FULL_DOMAIN,
      1995,
      1995.5,
      width,
      pad,
      { addTierThresholdPx: 10, maxTiers: 4 },
    );

    for (let index = 1; index < tiers.length; index += 1) {
      const previous = tiers[index - 1];
      const current = tiers[index];
      expect(current.domain.startYear).toBeCloseTo(
        previous.spotlightStartYear,
        6,
      );
      expect(current.domain.endYear).toBeCloseTo(
        previous.spotlightEndYear,
        6,
      );
    }
  });

  it("never produces more than the configured max tiers", () => {
    const tiers = resolveOverviewRulerTiers(
      FULL_DOMAIN,
      1995,
      1995 + 1e-9,
      width,
      pad,
      { addTierThresholdPx: 10, maxTiers: 3 },
    );

    expect(tiers.length).toBeLessThanOrEqual(3);
    expect(tiers[tiers.length - 1].isFinalTier).toBe(true);
  });

  it("can anchor a deeper drag to a fixed parent subsection", () => {
    const baseTiers = resolveOverviewRulerTiers(
      FULL_DOMAIN,
      1995,
      1995.5,
      width,
      pad,
      { addTierThresholdPx: 10, maxTiers: 4 },
    );

    expect(baseTiers.length).toBeGreaterThan(2);

    const anchoredDomainSpan =
      baseTiers[1].domain.endYear - baseTiers[1].domain.startYear;
    const anchoredVisibleStart =
      baseTiers[1].domain.startYear + anchoredDomainSpan * 0.02;
    const anchoredVisibleEnd = anchoredVisibleStart + 0.5;
    const anchoredTiers = resolveAnchoredOverviewRulerTiers(
      baseTiers,
      1,
      anchoredVisibleStart,
      anchoredVisibleEnd,
      width,
      pad,
      { addTierThresholdPx: 10, maxTiers: 4 },
    );

    expect(anchoredTiers[0]).toEqual(baseTiers[0]);
    expect(anchoredTiers[1].domain).toEqual(baseTiers[1].domain);
    expect(anchoredTiers[1].spotlightStartYear).toBeLessThan(
      baseTiers[1].spotlightStartYear,
    );
  });
});
