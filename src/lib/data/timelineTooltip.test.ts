import { describe, expect, it } from "vitest";
import {
  getEraTooltipContent,
  getMarkerTooltipContent,
  getOverlayTooltipContent,
} from "./timelineTooltip";
import type { Era, TimelineMarker, TimelineOverlayBand } from "./timelineTypes";

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
});
