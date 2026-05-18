import { describe, expect, it } from "vitest";

import { createEmptyTimelineSetDocument } from "./setDocumentValidation";
import { normalizeTimelineSetDocument } from "./setSchema";
import {
  compileTimelineCatalog,
  STATIC_TIMELINE_CATALOG,
  STATIC_TIMELINE_SETS,
} from "./timelineCatalog";

describe("compileTimelineCatalog", () => {
  it("matches the static catalog shape for built-in sets", () => {
    const catalog = compileTimelineCatalog(STATIC_TIMELINE_SETS);

    expect(catalog.sets.map((set) => set.metadata.id)).toEqual(
      STATIC_TIMELINE_CATALOG.sets.map((set) => set.metadata.id),
    );
    expect(catalog.display.markers.length).toBe(
      STATIC_TIMELINE_CATALOG.display.markers.length,
    );
    expect(catalog.display.overlays.length).toBe(
      STATIC_TIMELINE_CATALOG.display.overlays.length,
    );
    expect(catalog.rootEra.id).toBe("universe");
  });

  it("compiles a custom set into all runtime lookup maps", () => {
    const document = createEmptyTimelineSetDocument("Local History");
    const customSet = normalizeTimelineSetDocument(document);
    const catalog = compileTimelineCatalog([...STATIC_TIMELINE_SETS, customSet]);

    expect(catalog.setsById["local-history"]).toBe(customSet);
    expect(catalog.sourcesById["local-history-source"]).toBeDefined();
    expect(catalog.groupsById["local-history-markers"]).toBeDefined();
    expect(catalog.setIdByFamilyId.get("local-history-eras")).toBe(
      "local-history",
    );
    expect(catalog.setIdByGroupId.get("local-history-markers")).toBe(
      "local-history",
    );
    expect(catalog.setSpanPriorityById.get("local-history")).toMatchObject({
      startYear: 1900,
      endYear: 2000,
      priority: 10,
    });
  });

  it("rejects duplicate global identifiers", () => {
    const first = normalizeTimelineSetDocument(
      createEmptyTimelineSetDocument("Duplicate One"),
    );
    const secondDocument = createEmptyTimelineSetDocument("Duplicate Two");

    secondDocument.metadata.id = first.metadata.id;
    const second = normalizeTimelineSetDocument(secondDocument);

    expect(() => compileTimelineCatalog([first, second])).toThrow(
      /Duplicate set id/,
    );
  });
});
