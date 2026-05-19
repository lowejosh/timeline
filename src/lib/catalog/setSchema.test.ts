import { describe, expect, it } from "vitest";

import { createEmptyTimelineSetDocument } from "./setDocumentValidation";
import { normalizeTimelineSetDocument } from "./setSchema";
import type { TimelineRawSetDocument } from "./setSchema";

describe("normalizeTimelineSetDocument", () => {
  it("normalizes uppercase calendar eras from imported raw documents", () => {
    const document: TimelineRawSetDocument =
      createEmptyTimelineSetDocument("Calendar Case");

    document.markers = [
      {
        id: "calendar-case-tasman-sights-tasmania",
        label: "Tasman sights Tasmania",
        year: {
          kind: "calendar",
          era: "CE" as never,
          year: 1642,
          precision: "day",
          month: 11,
          day: 24,
        },
        groupId: "calendar-case-markers",
        sourceIds: [],
      },
    ];

    const normalized = normalizeTimelineSetDocument(document);

    expect(normalized.markers[0].year).toBeGreaterThan(1642);
    expect(normalized.markers[0].year).toBeLessThan(1643);
  });
});
