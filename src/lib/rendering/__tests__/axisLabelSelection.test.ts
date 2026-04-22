import { describe, expect, it } from "vitest";

import {
  getAllowedAxisLabelSteps,
  getPrimaryAxisLabelStepFromResolvedLabels,
} from "../axisLabelSelection";

describe("axis label selection hysteresis", () => {
  it("keeps the preferred readable sub-year step while a finer step only wins narrowly", () => {
    const candidates = [
      {
        x: 100,
        text: "Jan",
        width: 48,
        alpha: 1,
        step: 1 / 12,
        pixelsPerStep: 92,
      },
      {
        x: 220,
        text: "Mid-Jan",
        width: 54,
        alpha: 1.08,
        step: 1 / 24,
        pixelsPerStep: 70,
      },
    ];

    const { allowedSteps, primaryStep } = getAllowedAxisLabelSteps(
      candidates,
      true,
      { preferredStep: 1 / 12 },
    );

    expect(primaryStep).toBe(1 / 12);
    expect(allowedSteps.has(1 / 12)).toBe(true);
    expect(allowedSteps.has(1 / 24)).toBe(true);
  });

  it("switches to a much stronger readable sub-year step when the preferred one clearly loses", () => {
    const candidates = [
      {
        x: 100,
        text: "Jan",
        width: 48,
        alpha: 0.7,
        step: 1 / 12,
        pixelsPerStep: 92,
      },
      {
        x: 220,
        text: "15 Jan",
        width: 54,
        alpha: 1.2,
        step: 1 / 24,
        pixelsPerStep: 70,
      },
    ];

    const { allowedSteps, primaryStep } = getAllowedAxisLabelSteps(
      candidates,
      true,
      { preferredStep: 1 / 12 },
    );

    expect(primaryStep).toBe(1 / 24);
    expect(allowedSteps.has(1 / 24)).toBe(true);
  });

  it("keeps a secondary readable sub-year step when both adjacent scales fit comfortably", () => {
    const candidates = [
      {
        x: 100,
        text: "Jan",
        width: 28,
        alpha: 1,
        step: 1 / 12,
        pixelsPerStep: 96,
      },
      {
        x: 180,
        text: "15 Jan",
        width: 34,
        alpha: 0.82,
        step: 1 / 24,
        pixelsPerStep: 82,
      },
    ];

    const { allowedSteps, primaryStep } = getAllowedAxisLabelSteps(
      candidates,
      true,
      { preferredStep: 1 / 12 },
    );

    expect(primaryStep).toBe(1 / 12);
    expect(allowedSteps.has(1 / 12)).toBe(true);
    expect(allowedSteps.has(1 / 24)).toBe(true);
  });

  it("keeps the previous dominant step when resolved labels temporarily disappear", () => {
    expect(getPrimaryAxisLabelStepFromResolvedLabels([], 10)).toBe(10);
  });
});
