import { describe, expect, it } from "vitest";
import {
  resolveOverlayGroupIconId,
  resolveOverlayGroupIconLayout,
} from "../overlayGroupIcons";

describe("overlay group icons", () => {
  it("maps supported overlay groups to icon ids", () => {
    expect(resolveOverlayGroupIconId("cultures")).toBe("cultures");
    expect(resolveOverlayGroupIconId("civilizations")).toBe("civilizations");
    expect(resolveOverlayGroupIconId("human-evolution")).toBe(
      "human-evolution",
    );
    expect(resolveOverlayGroupIconId("deep-time-life")).toBe("deep-time-life");
    expect(resolveOverlayGroupIconId("human-history")).toBeNull();
  });

  it("reserves a small leading slot for supported group icons", () => {
    expect(
      resolveOverlayGroupIconLayout({
        groupId: "civilizations",
        bandLeft: 100,
        bandTop: 24,
        bandWidth: 72,
        bandHeight: 16,
      }),
    ).toEqual({
      iconId: "civilizations",
      centerX: 109,
      centerY: 32,
      drawSize: 8,
      reservedWidth: 12,
    });
  });

  it("skips the icon on bands that are too narrow to fit it comfortably", () => {
    expect(
      resolveOverlayGroupIconLayout({
        groupId: "cultures",
        bandLeft: 0,
        bandTop: 0,
        bandWidth: 26,
        bandHeight: 16,
      }),
    ).toBeNull();
  });
});
