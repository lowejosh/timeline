import { describe, expect, it } from "vitest";
import { syncAnimatedEraChildState } from "./eraChildAnimation";

describe("era child animation state", () => {
  it("starts newly visible descendant eras from zero so they can fade in immediately", () => {
    expect(
      syncAnimatedEraChildState({
        nextTarget: 1,
        now: 90,
        duration: 220,
        hasInitialized: true,
      }),
    ).toEqual({
      current: 0,
      from: 0,
      target: 1,
      startTime: 90,
      duration: 220,
    });
  });

  it("retargets from the current opacity without snapping when the visibility target changes", () => {
    expect(
      syncAnimatedEraChildState({
        existing: {
          current: 0.35,
          from: 0,
          target: 0,
          startTime: 10,
          duration: 220,
        },
        nextTarget: 1,
        now: 120,
        duration: 220,
        hasInitialized: true,
      }),
    ).toEqual({
      current: 0.35,
      from: 0.35,
      target: 1,
      startTime: 120,
      duration: 220,
    });
  });

  it("keeps the in-flight animation state when the target is unchanged", () => {
    expect(
      syncAnimatedEraChildState({
        existing: {
          current: 0.35,
          from: 0.1,
          target: 1,
          startTime: 120,
          duration: 220,
        },
        nextTarget: 1,
        now: 260,
        duration: 220,
        hasInitialized: true,
      }),
    ).toEqual({
      current: 0.35,
      from: 0.1,
      target: 1,
      startTime: 120,
      duration: 220,
    });
  });
});