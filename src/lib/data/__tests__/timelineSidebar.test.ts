import { describe, expect, it } from "vitest";
import { resolveTimelineSidebarSections } from "../timelineSidebar";
import type { TimelineDisplayConfig } from "../timelineTypes";

describe("timeline sidebar selectors", () => {
  it("returns only context-relevant flat sections for the current viewport", () => {
    const display: TimelineDisplayConfig = {
      markers: [
        {
          id: "neolithic-marker",
          label: "Neolithic marker",
          year: -9000,
          groupId: "human-history",
        },
        {
          id: "post-classical-marker",
          label: "Post-classical marker",
          year: 1200,
          groupId: "human-history",
        },
      ],
      overlays: [
        {
          id: "ancient-overlay",
          label: "Ancient overlay",
          startYear: -500,
          endYear: 200,
          color: "rgba(0, 0, 0, 0.1)",
          groupId: "civilizations",
        },
      ],
    };

    const sections = resolveTimelineSidebarSections(
      display,
      {
        centerYear: 1200,
        zoom: 28,
      },
      1000,
      120,
      new Set(["human-history"]),
    );

    expect(sections.map((section) => section.label)).toEqual(["Markers"]);
    expect(sections[0].entries.map((entry) => entry.id)).toEqual([
      "human-history",
    ]);
    expect(sections[0].entries[0]).toMatchObject({
      label: "Human History",
      enabled: true,
      mixed: false,
      markerCount: 1,
      overlayCount: 0,
      relevantItemCount: 1,
    });
  });

  it("aggregates civilization overlays into the overlay section", () => {
    const display: TimelineDisplayConfig = {
      markers: [],
      overlays: [
        {
          id: "post-classical-overlay",
          label: "Post-classical overlay",
          startYear: 800,
          endYear: 1400,
          color: "rgba(0, 0, 0, 0.1)",
          groupId: "civilizations",
        },
      ],
    };

    const sections = resolveTimelineSidebarSections(
      display,
      {
        centerYear: 1100,
        zoom: 24,
      },
      1000,
      120,
      new Set(),
    );

    expect(sections.map((section) => section.label)).toEqual(["Overlays"]);
    expect(sections[0].entries[0]).toMatchObject({
      id: "civilizations",
      enabled: false,
      mixed: false,
      overlayCount: 1,
      relevantItemCount: 1,
    });
  });

  it("hides suppressed civilization entries from the sidebar", () => {
    const display: TimelineDisplayConfig = {
      markers: [],
      overlays: [
        {
          id: "post-classical-overlay",
          label: "Post-classical overlay",
          startYear: 800,
          endYear: 1400,
          color: "rgba(0, 0, 0, 0.1)",
          groupId: "civilizations",
        },
      ],
    };

    const sections = resolveTimelineSidebarSections(
      display,
      {
        centerYear: 1100,
        zoom: 24,
      },
      1000,
      120,
      new Set(["civilizations"]),
      new Set(["civilizations"]),
    );

    expect(sections).toEqual([]);
  });

  it("hides civilizations when human-history markers are no longer zoom-visible", () => {
    const display: TimelineDisplayConfig = {
      markers: [
        {
          id: "late-history-marker",
          label: "Late history marker",
          year: 1200,
          minZoom: 20,
          groupId: "human-history",
        },
      ],
      overlays: [
        {
          id: "post-classical-overlay",
          label: "Post-classical overlay",
          startYear: 800,
          endYear: 1400,
          color: "rgba(0, 0, 0, 0.1)",
          groupId: "civilizations",
        },
      ],
    };

    const sections = resolveTimelineSidebarSections(
      display,
      {
        centerYear: 1100,
        zoom: 10,
      },
      1000,
      120,
      new Set(["human-history", "civilizations"]),
    );

    expect(sections).toEqual([]);
  });

  it("surfaces the human evolution layer in overlays and counts both markers and overlays", () => {
    const display: TimelineDisplayConfig = {
      markers: [
        {
          id: "early-biped-marker",
          label: "Early biped marker",
          year: -7_000_000,
          minZoom: 10,
          priority: 92,
          groupId: "human-evolution",
        },
      ],
      overlays: [
        {
          id: "sahelanthropus",
          label: "Sahelanthropus",
          startYear: -7_000_000,
          endYear: -6_000_000,
          minZoom: 8,
          priority: 95,
          color: "rgba(0, 0, 0, 0.1)",
          groupId: "human-evolution",
        },
      ],
    };

    const sections = resolveTimelineSidebarSections(
      display,
      {
        centerYear: -6_500_000,
        zoom: 6,
      },
      1000,
      120,
      new Set(["human-evolution"]),
    );

    expect(sections.map((section) => section.label)).toEqual(["Overlays"]);
    expect(sections[0].entries[0]).toMatchObject({
      id: "human-evolution",
      label: "Human Evolution",
      enabled: true,
      mixed: false,
      markerCount: 1,
      overlayCount: 1,
      relevantItemCount: 2,
    });
  });
});
