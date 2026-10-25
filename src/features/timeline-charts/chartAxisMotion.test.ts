import { describe, expect, it } from "vitest";
import { ChartAxisMotion, CHART_AXIS_EASE_MS, CHART_AXIS_SETTLE_MS } from "./chartAxisMotion";

describe("chart axis navigation", () => {
  it("freezes throughout navigation and the settling delay, then eases to the final visible range", () => {
    const motion = new ChartAxisMotion();
    expect(motion.update("co2", [150, 450], "home", false, 0).domain).toEqual([150, 450]);
    for (let now = 10; now <= 1000; now += 10) {
      expect(motion.update("co2", [0, 5000], `zoom-${now}`, true, now).domain).toEqual([150, 450]);
    }
    expect(motion.update("co2", [0, 5000], "zoom-1000", false, 1000 + CHART_AXIS_SETTLE_MS - 1).domain).toEqual([150, 450]);
    const start = 1000 + CHART_AXIS_SETTLE_MS;
    motion.update("co2", [0, 5000], "zoom-1000", false, start);
    expect(motion.update("co2", [0, 5000], "zoom-1000", false, start + CHART_AXIS_EASE_MS / 2).domain).toEqual([75, 2725]);
    expect(motion.update("co2", [0, 5000], "zoom-1000", false, start + CHART_AXIS_EASE_MS)).toEqual({ domain: [0, 5000], needsFrame: false });
  });

  it("detects viewport changes even for navigation without a gesture flag", () => {
    const motion = new ChartAxisMotion();
    motion.update("ice", [2, 5], "a", false, 0);
    expect(motion.update("ice", [1, 6], "b", false, 20).domain).toEqual([2, 5]);
    expect(motion.update("ice", [1, 6], "c", false, 150).domain).toEqual([2, 5]);
    expect(motion.update("ice", [1, 6], "c", false, 300).domain).toEqual([2, 5]);
  });

  it("interrupts easing at the displayed range when navigation resumes", () => {
    const motion = new ChartAxisMotion();
    motion.update("a", [0, 100], "a", false, 0);
    motion.update("a", [0, 200], "a", false, 10);
    const middle = motion.update("a", [0, 200], "a", false, 185).domain;
    expect(middle).toEqual([0, 150]);
    expect(motion.update("a", [0, 300], "b", true, 200).domain).toEqual(middle);
    expect(motion.update("a", [0, 400], "c", true, 300).domain).toEqual(middle);
  });

  it("keeps two axes independent and discards disabled charts", () => {
    const motion = new ChartAxisMotion();
    motion.update("a", [0, 100], "a", false, 0);
    motion.update("b", [10, 20], "a", false, 0);
    motion.update("a", [0, 500], "b", true, 10);
    expect(motion.getDomain("b")).toEqual([10, 20]);
    motion.retain(["b"]);
    expect(motion.getDomain("a")).toBeUndefined();
    expect(motion.update("a", [0, 500], "b", false, 20).domain).toEqual([0, 500]);
  });

  it("respects reduced motion while still holding the axis during the gesture", () => {
    const motion = new ChartAxisMotion();
    motion.update("a", [0, 100], "a", false, 0, true);
    expect(motion.update("a", [0, 200], "b", true, 10, true).domain).toEqual([0, 100]);
    expect(motion.update("a", [0, 200], "b", false, 190, true)).toEqual({ domain: [0, 200], needsFrame: false });
  });
});
