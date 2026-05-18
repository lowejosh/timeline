import { describe, expect, it } from "vitest";

import {
  createEmptyTimelineSetDocument,
  getTimelineSetDocumentIssues,
  slugifyTimelineSetId,
  validateTimelineSetDocument,
} from "./setDocumentValidation";
import { normalizeTimelineSetDocument } from "./setSchema";

describe("set document validation helpers", () => {
  it("creates a valid portable raw set document", () => {
    const document = createEmptyTimelineSetDocument("My Great Set");

    expect(document.metadata.id).toBe("my-great-set");
    expect(validateTimelineSetDocument(document)).toBe(true);
    expect(normalizeTimelineSetDocument(document).metadata.familyIds).toEqual([
      "my-great-set-eras",
    ]);
  });

  it("reports schema and catalog issues without throwing", () => {
    const document = createEmptyTimelineSetDocument("Broken Set");

    document.markers.push({
      id: "broken-marker",
      label: "Broken marker",
      year: Number.POSITIVE_INFINITY,
    });

    expect(getTimelineSetDocumentIssues(document)).toEqual([
      expect.objectContaining({
        severity: "error",
        message: expect.stringContaining("must be a finite number"),
      }),
    ]);
  });

  it("keeps elapsed timestamp integer strings valid for JSON persistence", () => {
    const document = createEmptyTimelineSetDocument("Deep Time");

    document.markers.push({
      id: "deep-time-marker",
      label: "Deep time marker",
      year: {
        kind: "elapsed",
        reference: "after-big-bang",
        precision: "year",
        years: "12345678901234567890",
      },
      groupId: "deep-time-markers",
      sourceIds: ["deep-time-source"],
    });

    expect(validateTimelineSetDocument(document)).toBe(true);
  });

  it("slugifies labels into stable IDs", () => {
    expect(slugifyTimelineSetId("  AI & Civilisation!! ")).toBe(
      "ai-civilisation",
    );
    expect(slugifyTimelineSetId("...")).toBe("custom-set");
  });
});
