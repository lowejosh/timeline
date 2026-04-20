import { describe, expect, it } from "vitest";
import { yearsAgo } from "../timelineDateBuilders";
import { resolveTimelineSidebarTree } from "../timelineSidebar";
import type { TimelineDisplayConfig, TimelineSetId } from "../timelineTypes";

const ALL_SET_IDS = new Set<TimelineSetId>(["cosmic", "earth", "human"]);
const ALL_GROUP_IDS = new Set([
  "cosmic-milestones",
  "earth-milestones",
  "deep-time-life",
  "human-history",
  "human-evolution",
  "cultures",
  "civilizations",
]);

describe("timeline sidebar tree", () => {
  it("returns the unified set tree in set order with the expected child toggles", () => {
    const tree = resolveTimelineSidebarTree(
      {
        markers: [],
        overlays: [],
      },
      {
        centerYear: 1200,
        zoom: 24,
      },
      1000,
      120,
      ALL_SET_IDS,
      ALL_GROUP_IDS,
      new Set(),
      ["cosmic", "earth", "human"],
    );

    expect(tree.map((set) => set.id)).toEqual(["cosmic", "earth", "human"]);
    expect(tree.find((set) => set.id === "cosmic")?.children.map((child) => child.id)).toEqual([
      "cosmic-milestones",
    ]);
    expect(tree.find((set) => set.id === "earth")?.children.map((child) => child.id)).toEqual([
      "earth-milestones",
      "deep-time-life",
    ]);
    expect(tree.find((set) => set.id === "human")?.children.map((child) => child.id)).toEqual([
      "human-evolution",
      "human-history",
      "cultures",
      "civilizations",
    ]);
  });

  it("aggregates deep-time-life counts under the earth set", () => {
    const display: TimelineDisplayConfig = {
      markers: [
        {
          id: "ordovician-extinction",
          label: "Ordovician extinction",
          year: yearsAgo(447_000_000),
          groupId: "deep-time-life",
        },
      ],
      overlays: [
        {
          id: "cambrian-explosion",
          label: "Cambrian Explosion",
          startYear: yearsAgo(570_000_000),
          endYear: yearsAgo(530_000_000),
          color: "rgba(0, 0, 0, 0.1)",
          groupId: "deep-time-life",
        },
      ],
    };

    const tree = resolveTimelineSidebarTree(
      display,
      {
        centerYear: yearsAgo(500_000_000),
        zoom: 0.3,
      },
      1000,
      120,
      ALL_SET_IDS,
      ALL_GROUP_IDS,
      new Set(),
      ["cosmic", "earth", "human"],
    );

    const earthSet = tree.find((set) => set.id === "earth");
    const deepTimeLife = earthSet?.children.find(
      (child) => child.id === "deep-time-life",
    );

    expect(earthSet).toMatchObject({
      markerCount: 1,
      overlayCount: 1,
      relevantItemCount: 2,
    });
    expect(deepTimeLife).toMatchObject({
      enabled: true,
      mixed: false,
      markerCount: 1,
      overlayCount: 1,
      relevantItemCount: 2,
    });
  });

  it("aggregates human history markers and civilization overlays under the human set", () => {
    const display: TimelineDisplayConfig = {
      markers: [
        {
          id: "post-classical-marker",
          label: "Post-classical marker",
          year: 1200,
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

    const tree = resolveTimelineSidebarTree(
      display,
      {
        centerYear: 1100,
        zoom: 24,
      },
      1000,
      120,
      ALL_SET_IDS,
      new Set(["human-history"]),
      new Set(),
      ["cosmic", "earth", "human"],
    );

    const humanSet = tree.find((set) => set.id === "human");
    const humanHistory = humanSet?.children.find(
      (child) => child.id === "human-history",
    );
    const civilizations = humanSet?.children.find(
      (child) => child.id === "civilizations",
    );

    expect(humanSet).toMatchObject({
      markerCount: 1,
      overlayCount: 1,
      relevantItemCount: 2,
    });
    expect(humanHistory).toMatchObject({
      id: "human-history",
      enabled: true,
      markerCount: 1,
      overlayCount: 0,
      relevantItemCount: 1,
    });
    expect(civilizations).toMatchObject({
      id: "civilizations",
      enabled: false,
      mixed: false,
      overlayCount: 1,
      relevantItemCount: 1,
    });
  });

  it("keeps culture rows available without hiding them behind human-history zoom visibility rules", () => {
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
          id: "natufian-culture",
          label: "Natufian",
          startYear: -12500,
          endYear: -9500,
          color: "rgba(0, 0, 0, 0.1)",
          groupId: "cultures",
        },
      ],
    };

    const tree = resolveTimelineSidebarTree(
      display,
      {
        centerYear: -11000,
        zoom: 10,
      },
      1000,
      120,
      ALL_SET_IDS,
      ALL_GROUP_IDS,
      new Set(),
      ["cosmic", "earth", "human"],
    );

    const cultures = tree
      .find((set) => set.id === "human")
      ?.children.find((child) => child.id === "cultures");

    expect(cultures).toMatchObject({
      id: "cultures",
      label: "Pre-Civilization Cultures",
      enabled: true,
      mixed: false,
      overlayCount: 1,
      relevantItemCount: 1,
    });
  });

  it("keeps suppressed child rows in the tree while marking them suppressed and clearing visible counts", () => {
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

    const tree = resolveTimelineSidebarTree(
      display,
      {
        centerYear: 1100,
        zoom: 24,
      },
      1000,
      120,
      ALL_SET_IDS,
      new Set(["civilizations"]),
      new Set(["civilizations"]),
      ["cosmic", "earth", "human"],
    );

    const civilizations = tree
      .find((set) => set.id === "human")
      ?.children.find((child) => child.id === "civilizations");

    expect(civilizations).toMatchObject({
      enabled: true,
      suppressed: true,
      overlayCount: 0,
      relevantItemCount: 0,
    });
  });

  it("supports custom set ordering for the sidebar tree", () => {
    const tree = resolveTimelineSidebarTree(
      {
        markers: [],
        overlays: [],
      },
      {
        centerYear: 1200,
        zoom: 24,
      },
      1000,
      120,
      ALL_SET_IDS,
      ALL_GROUP_IDS,
      new Set(),
      ["human", "cosmic", "earth"],
    );

    expect(tree.map((set) => set.id)).toEqual(["human", "cosmic", "earth"]);
  });
});
