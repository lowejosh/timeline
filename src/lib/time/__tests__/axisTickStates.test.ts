import { describe, expect, it } from "vitest";
import { resolveAxisTickRenderStates } from "../axisTickStates";
import { splitTimelineYear, TIMELINE_MIN_YEAR } from "../viewport";

const DAY_IN_MS = 86_400_000;

function createTimelineUtcDate(year: number, month = 0, day = 1) {
  const date = new Date(Date.UTC(2000, month, day));

  date.setUTCFullYear(year, month, day);
  date.setUTCHours(0, 0, 0, 0);

  return date;
}

function getTimelineYearStart(year: number) {
  return createTimelineUtcDate(year, 0, 1).getTime();
}

function getTimelineDateFromYear(year: number) {
  const wholeYear = Math.floor(year);
  const fraction = year - wholeYear;
  const start = getTimelineYearStart(wholeYear);
  const end = getTimelineYearStart(wholeYear + 1);

  return new Date(start + fraction * (end - start));
}

function getTickStatesAtYear(year: number, span: number, width = 1000) {
  return resolveAxisTickRenderStates(-span, 0, width).filter(
    (state) => Math.abs(state.year - year) < 1e-6,
  );
}

function getTickState(year: number, span: number, step: number, width = 1000) {
  return getTickStatesAtYear(year, span, width).find(
    (state) => Math.abs(state.step - step) < 1e-6,
  );
}

describe("axis tick render states", () => {
  it("returns chronologically sorted ticks within each visible step layer", () => {
    const states = resolveAxisTickRenderStates(-13_800_000_000, 2026, 1440);
    const yearsByStep = new Map<number, number[]>();

    for (const state of states) {
      const years = yearsByStep.get(state.step) ?? [];
      years.push(state.year);
      yearsByStep.set(state.step, years);
    }

    for (const years of yearsByStep.values()) {
      expect(years).toEqual([...years].sort((left, right) => left - right));
    }

    const sharedTick = getTickStatesAtYear(-1_000, 1_750);

    expect(sharedTick.length).toBeGreaterThan(1);
    expect(sharedTick.some((state) => state.step === 1_000)).toBe(true);
    expect(sharedTick.some((state) => state.step === 500)).toBe(true);
  });

  it("brings subdivision ticks in once they enter the visible ladder window", () => {
    const hidden = getTickState(-1_000, 100_000, 1_000);
    const emerging = getTickState(-1_000, 16_000, 1_000);
    const grown = getTickState(-1_000, 9_000, 1_000);

    expect(hidden).toBeUndefined();
    expect(emerging?.visibleProgress ?? 0).toBeGreaterThan(0.5);
    expect(grown?.visibleProgress ?? 0).toBe(1);
    expect(grown?.growthProgress ?? 0).toBe(1);
  });

  it("keeps coarse and finer tick layers visible together across shared years", () => {
    const earlyCoarse = getTickState(-1_000, 2_700, 1_000);
    const earlyFineShared = getTickState(-1_000, 2_700, 500);
    const boundaryCoarse = getTickState(-1_000, 2_150, 1_000);
    const boundaryFine = getTickState(-1_000, 2_150, 500);
    const laterCoarse = getTickState(-1_000, 1_750, 1_000);
    const laterFineShared = getTickState(-1_000, 1_750, 500);
    const uniqueFine = getTickState(-500, 1_750, 500);

    expect(earlyCoarse).toBeDefined();
    expect(earlyFineShared).toBeDefined();
    expect(boundaryCoarse).toBeDefined();
    expect(boundaryFine).toBeDefined();
    expect(laterCoarse).toBeDefined();
    expect(laterFineShared).toBeDefined();
    expect(uniqueFine).toBeDefined();
    expect(earlyCoarse?.visibleProgress ?? 0).toBeGreaterThan(0.6);
    expect(earlyFineShared?.visibleProgress ?? 0).toBeGreaterThan(0.6);
    expect(laterCoarse?.visibleProgress ?? 0).toBeGreaterThan(0.6);
    expect(laterFineShared?.visibleProgress ?? 0).toBeGreaterThan(0.6);
    expect(uniqueFine?.visibleProgress ?? 0).toBeGreaterThan(0.5);

    expect(earlyCoarse?.majorProgress ?? 0).toBeGreaterThanOrEqual(0);
    expect(earlyFineShared?.majorProgress ?? 0).toBeGreaterThanOrEqual(0);
    expect(boundaryCoarse?.majorProgress ?? 0).toBeGreaterThanOrEqual(0);
    expect(boundaryFine?.majorProgress ?? 0).toBeGreaterThanOrEqual(0);
    expect([0, 1]).toContain(laterCoarse?.majorProgress ?? 0);
    expect([0, 1]).toContain(laterFineShared?.majorProgress ?? 0);
  });

  it("keeps one primary label step and moves it finer as zoom increases", () => {
    const earlyLabeledTicks = resolveAxisTickRenderStates(
      -2_700,
      0,
      1_000,
    ).filter((state) => state.labelOpacity > 0.01);
    const boundaryLabeledTicks = resolveAxisTickRenderStates(
      -2_150,
      0,
      1_000,
    ).filter((state) => state.labelOpacity > 0.01);
    const laterLabeledTicks = resolveAxisTickRenderStates(
      -1_750,
      0,
      1_000,
    ).filter((state) => state.labelOpacity > 0.01);
    const earlyLabelSteps = new Set(
      earlyLabeledTicks.map((state) => state.labelStep),
    );
    const boundaryLabelSteps = new Set(
      boundaryLabeledTicks.map((state) => state.labelStep),
    );
    const laterLabelSteps = new Set(
      laterLabeledTicks.map((state) => state.labelStep),
    );

    expect(earlyLabelSteps).toEqual(new Set([500]));
    expect(boundaryLabelSteps).toEqual(new Set([200]));
    expect(laterLabelSteps).toEqual(new Set([200]));

    for (const labeledTick of [
      ...earlyLabeledTicks,
      ...boundaryLabeledTicks,
      ...laterLabeledTicks,
    ]) {
      expect(labeledTick.visibleProgress).toBeGreaterThan(0.01);
      expect(labeledTick.step).toBe(labeledTick.labelStep);
    }
  });

  it("snaps sub-year ticks to discrete calendar boundaries", () => {
    const states = resolveAxisTickRenderStates(2025.57, 2025.58, 1_200);
    const dailyStep = 1 / 365.2425;
    const dailyLayer = states.filter(
      (state) => Math.abs(state.step - dailyStep) < 1e-9,
    );

    expect(dailyLayer.length).toBeGreaterThan(0);

    const dailyDates = dailyLayer.map((state) =>
      getTimelineDateFromYear(state.year),
    );

    for (const date of dailyDates) {
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCMilliseconds()).toBe(0);
    }

    const uniqueDayLabels = new Set(
      dailyDates.map((date) => `${date.getUTCMonth()}-${date.getUTCDate()}`),
    );

    expect(uniqueDayLabels.size).toBe(dailyDates.length);

    for (let index = 1; index < dailyDates.length; index += 1) {
      const dayDelta =
        (dailyDates[index].getTime() - dailyDates[index - 1].getTime()) /
        DAY_IN_MS;

      expect(dayDelta).toBeCloseTo(1, 6);
    }
  });

  it("uses discrete daily steps for long-ago sub-year ranges", () => {
    const states = resolveAxisTickRenderStates(-54_321.02, -54_320.98, 1_200);
    const dailyStep = 1 / 365.2425;
    const dailyLayer = states.filter(
      (state) => Math.abs(state.step - dailyStep) < 1e-9,
    );

    expect(dailyLayer.length).toBeGreaterThan(0);

    for (let index = 1; index < dailyLayer.length; index += 1) {
      expect(
        (dailyLayer[index].year - dailyLayer[index - 1].year) * 365.2425,
      ).toBeCloseTo(1, 6);
    }
  });

  it("does not resolve sub-day steps for narrow calendar ranges", () => {
    const yearsPerDay = 1 / 365.2425;
    const states = resolveAxisTickRenderStates(2025.57, 2025.58, 1_200);

    expect(states.length).toBeGreaterThan(0);
    expect(
      states.every((state) => state.step >= yearsPerDay - 1e-12),
    ).toBe(true);
  });

  it("keeps discrete daily ticks across a deep Big Bang day span", () => {
    const yearsPerDay = 1 / 365.2425;
    const preciseStart = splitTimelineYear(TIMELINE_MIN_YEAR);
    const preciseEnd = {
      wholeYear: TIMELINE_MIN_YEAR,
      fraction: yearsPerDay * 13,
    };
    const states = resolveAxisTickRenderStates(
      TIMELINE_MIN_YEAR,
      TIMELINE_MIN_YEAR,
      1_800,
      {
        elapsedSubYearReference: "after-big-bang",
        preciseStartYear: preciseStart,
        preciseEndYear: preciseEnd,
      },
    );
    const dailyStates = states.filter(
      (state) => Math.abs(state.step - yearsPerDay) < 1e-9,
    );

    expect(dailyStates.length).toBeGreaterThanOrEqual(13);
    expect(dailyStates.some((state) => state.hierarchyDepth === 0)).toBe(
      true,
    );
  });

  it("keeps numeric levels contiguous through the 1-2-5 ladder", () => {
    const states = resolveAxisTickRenderStates(-1_600_000, 0, 1_800);
    const visibleSteps = new Set(
      states
        .filter((state) => state.visibleProgress > 0.5)
        .map((state) => Math.round(state.step)),
    );

    expect(visibleSteps.has(20_000)).toBe(true);
    expect(visibleSteps.has(50_000)).toBe(true);
    expect(visibleSteps.has(100_000)).toBe(true);
    expect(visibleSteps.has(200_000)).toBe(true);
    expect(visibleSteps.has(500_000)).toBe(true);
    expect(visibleSteps.has(1_000_000)).toBe(true);
  });

  it("keeps day ticks alive at Big Bang deep zoom using precise range data", () => {
    const yearsPerDay = 1 / 365.2425;
    const preciseStart = splitTimelineYear(TIMELINE_MIN_YEAR);
    const preciseEnd = {
      wholeYear: TIMELINE_MIN_YEAR,
      fraction: yearsPerDay * 4,
    };
    const states = resolveAxisTickRenderStates(
      TIMELINE_MIN_YEAR,
      TIMELINE_MIN_YEAR,
      1_200,
      {
        elapsedSubYearReference: "after-big-bang",
        preciseStartYear: preciseStart,
        preciseEndYear: preciseEnd,
      },
    );

    expect(states.length).toBeGreaterThan(0);
    expect(
      states.some(
        (state) => Math.abs(state.step - yearsPerDay) < 1e-9,
      ),
    ).toBe(true);
  });

  it("keeps elapsed ticks available for medium sub-year spans", () => {
    const states = resolveAxisTickRenderStates(-7_997_289_173.75, -7_997_289_172.1, 1_200, {
      elapsedSubYearReference: "ago",
    });

    expect(states.length).toBeGreaterThan(0);
    expect(states.some((state) => state.visibleProgress > 0.5)).toBe(true);
  });

  it("resolves parent, current, and child generations in logarithmic mode", () => {
    const states = resolveAxisTickRenderStates(-200_000, 200_000, 1_000, {
      scaleMode: "logarithmic",
      anchorYear: 1_234,
    });
    const generations = new Set(states.map((state) => state.generationIndex));
    const stepsByGeneration = new Map<number, Set<number>>();

    for (const state of states) {
      const existing = stepsByGeneration.get(state.generationIndex) ?? new Set<number>();
      existing.add(state.step);
      stepsByGeneration.set(state.generationIndex, existing);
    }

    expect(generations).toEqual(new Set([-1, 0, 1]));
    expect(stepsByGeneration.get(-1)).toEqual(new Set([1_000_000]));
    expect(stepsByGeneration.get(0)).toEqual(new Set([100_000]));
    expect(stepsByGeneration.get(1)).toEqual(new Set([10_000]));
    expect(states.some((state) => Math.abs(state.year) < 1e-9)).toBe(true);
  });

  it("cross-fades logarithmic generations from parent to child using decade progress", () => {
    const states = resolveAxisTickRenderStates(-200_000, 200_000, 1_000, {
      scaleMode: "logarithmic",
      anchorYear: 0,
    });
    const parentState = states.find((state) => state.generationIndex === -1);
    const currentState = states.find((state) => state.generationIndex === 0);
    const childState = states.find((state) => state.generationIndex === 1);

    expect(parentState).toBeDefined();
    expect(currentState).toBeDefined();
    expect(childState).toBeDefined();
    expect(parentState?.generationAlpha ?? 0).toBeGreaterThan(0);
    expect(parentState?.generationAlpha ?? 0).toBeLessThan(1);
    expect(currentState?.generationAlpha ?? 0).toBe(1);
    expect(childState?.generationAlpha ?? 0).toBeGreaterThan(0);
    expect(childState?.generationAlpha ?? 0).toBeLessThan(1);
    expect(parentState?.generationProgress ?? 0).toBeCloseTo(
      childState?.generationProgress ?? 0,
      6,
    );
    expect(currentState?.labelOpacity ?? 0).toBeGreaterThan(0);
    expect(parentState?.labelOpacity ?? 0).toBe(0);
    expect(childState?.labelOpacity ?? 0).toBe(0);
  });

  it("keeps logarithmic tick years stable when the anchor shifts during panning", () => {
    const left = resolveAxisTickRenderStates(-200_000, 200_000, 1_000, {
      scaleMode: "logarithmic",
      anchorYear: -25_000,
    });
    const right = resolveAxisTickRenderStates(-200_000, 200_000, 1_000, {
      scaleMode: "logarithmic",
      anchorYear: 25_000,
    });

    const leftKeys = new Set(left.map((state) => `${state.step}:${state.year}`));
    const rightKeys = new Set(right.map((state) => `${state.step}:${state.year}`));

    expect(leftKeys).toEqual(rightKeys);
  });

  it("snaps logarithmic Big Bang sub-year layers to discrete elapsed-day steps", () => {
    const yearsPerDay = 1 / 365.2425;
    const preciseStart = splitTimelineYear(TIMELINE_MIN_YEAR);
    const preciseEnd = {
      wholeYear: TIMELINE_MIN_YEAR,
      fraction: yearsPerDay * 7.5,
    };
    const states = resolveAxisTickRenderStates(
      TIMELINE_MIN_YEAR,
      TIMELINE_MIN_YEAR,
      1_200,
      {
        scaleMode: "logarithmic",
        elapsedSubYearReference: "after-big-bang",
        preciseStartYear: preciseStart,
        preciseEndYear: preciseEnd,
      },
    );
    const daySteps = new Set(
      states
        .map((state) => Number((state.step / yearsPerDay).toFixed(6)))
        .filter((step) => step < 365.2425),
    );

    expect(daySteps.size).toBeGreaterThan(0);
    expect([...daySteps].every((step) => [1, 2, 7, 14, 30, 60, 90, 180].includes(step))).toBe(true);

    for (const state of states.filter((state) => state.step < 1)) {
      expect(state.wholeYear).toBe(TIMELINE_MIN_YEAR);
      expect(state.yearFraction).toBeDefined();
      expect((state.yearFraction ?? 0) * 365.2425).toBeCloseTo(
        Math.round((state.yearFraction ?? 0) * 365.2425),
        6,
      );
    }
  });
});
