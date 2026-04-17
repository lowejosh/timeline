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
          groupId: "neolithic",
        },
        {
          id: "post-classical-marker",
          label: "Post-classical marker",
          year: 1200,
          groupId: "post-classical-history",
        },
      ],
      overlays: [
        {
          id: "ancient-overlay",
          label: "Ancient overlay",
          startYear: -500,
          endYear: 200,
          color: "rgba(0, 0, 0, 0.1)",
          groupId: "ancient-civilizations",
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
      new Set(["post-classical-history"]),
    );

    expect(sections.map((section) => section.label)).toEqual(["Markers"]);
    expect(sections[0].entries.map((entry) => entry.id)).toEqual([
      "human-history",
    ]);
    expect(sections[0].entries[0]).toMatchObject({
      label: "Human History",
      enabled: false,
      mixed: true,
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
          groupId: "post-classical-early-modern",
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
});
