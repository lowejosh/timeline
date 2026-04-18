import { describe, expect, it } from "vitest";
import {
  getEraTooltipContent,
  getMarkerTooltipContent,
  getOverlayTooltipContent,
} from "../timelineTooltip";
import { createExactCalendarTimestamp } from "../../time/exactTimestamp";
import { yearsAgo } from "../timelineDateBuilders";
import type {
  Era,
  TimelineMarker,
  TimelineOverlayBand,
} from "../timelineTypes";

describe("timeline tooltip content", () => {
  it("deduplicates sources and omits source-ref notes from marker tooltips", () => {
    const marker: TimelineMarker = {
      id: "moon-landing",
      label: "Moon landing",
      year: 1969,
      sourceRefs: [
        {
          sourceId: "historyMoonLanding",
          note: "Do not surface this in the tooltip.",
        },
        { sourceId: "historyMoonLanding" },
      ],
    };

    expect(getMarkerTooltipContent(marker)).toMatchObject({
      kind: "marker",
      kindLabel: "Marker",
      title: "Moon landing",
      timeLabel: "1,969 CE",
      sources: [
        {
          id: "historyMoonLanding",
          organization: "HISTORY",
          shortTitle: "History: 1969 Moon Landing",
          title: "1969 Moon Landing",
          url: "https://www.history.com/articles/moon-landing-1969",
        },
      ],
    });
  });

  it("formats marker tooltips from exact calendar timestamps when no explicit time label exists", () => {
    const marker: TimelineMarker = {
      id: "ides-of-march",
      label: "Julius Caesar assassinated",
      year: -43,
      exactTime: createExactCalendarTimestamp({
        era: "bce",
        year: 44,
        month: 3,
        day: 15,
        hour: 12,
        precision: "hour",
      }),
      sourceRefs: [{ sourceId: "periodo" }],
    };

    expect(getMarkerTooltipContent(marker).timeLabel).toBe(
      "Mar 15, 44 BCE, 12:00 UTC",
    );
  });

  it("formats overlay tooltips from exact ranges when available", () => {
    const overlay: TimelineOverlayBand = {
      id: "first-world-war",
      label: "World War I",
      startYear: 1914,
      endYear: 1918,
      exactStartTime: createExactCalendarTimestamp({
        era: "ce",
        year: 1914,
        month: 7,
        day: 28,
        precision: "day",
      }),
      exactEndTime: createExactCalendarTimestamp({
        era: "ce",
        year: 1918,
        month: 11,
        day: 11,
        precision: "day",
      }),
      color: "rgba(0, 0, 0, 0.1)",
      sourceRefs: [{ sourceId: "historyWorldWarOne" }],
    };

    expect(getOverlayTooltipContent(overlay).timeLabel).toBe(
      "Jul 28, 1914 — Nov 11, 1918",
    );
  });

  it("formats overlay tooltips as ranges", () => {
    const overlay: TimelineOverlayBand = {
      id: "roman-empire",
      label: "Roman Empire",
      startYear: -27,
      endYear: 476,
      color: "rgba(0, 0, 0, 0.1)",
      sourceRefs: [{ sourceId: "historyAncientRome" }],
    };

    expect(getOverlayTooltipContent(overlay).timeLabel).toBe("27 BCE — 476 CE");
  });

  it("surfaces region scope and approximate labels for era tooltips", () => {
    const era: Era = {
      id: "bronze-age",
      name: "Bronze Age",
      startYear: -3300,
      endYear: -1200,
      color: "rgba(0, 0, 0, 0.1)",
      regionalScopeLabel: "Ancient Near East",
      approximateStart: true,
      approximateEnd: true,
      sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
    };

    expect(getEraTooltipContent(era)).toMatchObject({
      regionalScopeLabel: "Ancient Near East",
      timeLabel: "~3,300 BCE — ~1,200 BCE",
    });
  });

  it("includes optional descriptions on era tooltips", () => {
    const era: Era = {
      id: "test-era",
      name: "Test Era",
      startYear: -500,
      endYear: -100,
      color: "rgba(0, 0, 0, 0.1)",
      description: "Optional descriptions should show up when present.",
      sourceRefs: [{ sourceId: "periodo" }],
    };

    expect(getEraTooltipContent(era)).toMatchObject({
      kind: "era",
      kindLabel: "Era",
      title: "Test Era",
      timeLabel: "500 BCE — 100 BCE",
      description: "Optional descriptions should show up when present.",
    });
  });

  it("prefers explicit era time labels when provided", () => {
    const era: Era = {
      id: "quaternary",
      name: "Quaternary",
      startYear: -2_580_000,
      endYear: -300_000,
      timeLabel: "2.58M years ago — present",
      color: "rgba(0, 0, 0, 0.1)",
      sourceRefs: [{ sourceId: "icsChart2024" }],
    };

    expect(getEraTooltipContent(era)).toMatchObject({
      timeLabel: "2.58M years ago — present",
    });
  });

  it("prefers explicit marker date/time labels when provided", () => {
    const marker: TimelineMarker = {
      id: "titanic-sinks",
      label: "Titanic sinks in North Atlantic",
      year: 1912.286,
      dateLabel: "Apr 15, 1912",
      timeLabel: "Apr 15, 1912, 2:20 AM UTC",
      sourceRefs: [{ sourceId: "britannicaTitanic" }],
    };

    expect(getMarkerTooltipContent(marker)).toMatchObject({
      timeLabel: "Apr 15, 1912, 2:20 AM UTC",
      sources: [
        {
          id: "britannicaTitanic",
          organization: "Encyclopaedia Britannica",
          shortTitle: "Britannica: Titanic",
          title: "Titanic",
          url: "https://www.britannica.com/topic/Titanic",
        },
      ],
    });
  });

  it("shows approximate marker labels and region scope when flagged", () => {
    const marker: TimelineMarker = {
      id: "bronze-age-collapse",
      label: "Bronze Age collapse",
      year: -1200,
      approximate: true,
      regionalScopeLabel: "Eastern Mediterranean",
      sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
    };

    expect(getMarkerTooltipContent(marker)).toMatchObject({
      timeLabel: "~1,200 BCE",
      regionalScopeLabel: "Eastern Mediterranean",
    });
  });

  it("switches tooltip point labels to years ago at the 15,000-years-ago handoff", () => {
    const marker: TimelineMarker = {
      id: "ubirr",
      label: "Ubirr rock art in Kakadu",
      year: yearsAgo(15_000),
      approximate: true,
      sourceRefs: [{ sourceId: "kakaduUbirr" }],
    };

    expect(getMarkerTooltipContent(marker).timeLabel).toMatch(/years ago$/);
  });

  it("shows approximate overlay labels and region scope when flagged", () => {
    const overlay: TimelineOverlayBand = {
      id: "mesopotamia",
      label: "Mesopotamia",
      startYear: -4000,
      endYear: -539,
      color: "rgba(0, 0, 0, 0.1)",
      regionalScopeLabel: "Mesopotamia",
      approximateStart: true,
      sourceRefs: [{ sourceId: "britannicaMesopotamia" }],
    };

    expect(getOverlayTooltipContent(overlay)).toMatchObject({
      timeLabel: "~4,000 BCE — 539 BCE",
      regionalScopeLabel: "Mesopotamia",
    });
  });
});
