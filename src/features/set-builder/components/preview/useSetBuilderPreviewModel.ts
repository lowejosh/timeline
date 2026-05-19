import { useMemo } from "react";

import type { Era, TimelineMarker, TimelineOverlayBand } from "@/lib/catalog/eras";
import { normalizeTimelineSetDocument } from "@/lib/catalog/setSchema";
import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";
import { compileTimelineCatalog } from "@/lib/catalog/timelineCatalog";
export type SetBuilderPreviewModel = {
  /** Era family roots — the top-level drillable eras for this set. */
  eras: Era[];
  markers: TimelineMarker[];
  overlayBands: TimelineOverlayBand[];
  /** [startYear, endYear] derived from the compiled set span. */
  range: [number, number];
  /** Non-null when the document is invalid and the preview cannot be rendered. */
  error: string | null;
};

const FALLBACK_MODEL: SetBuilderPreviewModel = {
  eras: [],
  markers: [],
  overlayBands: [],
  range: [1900, 2000],
  error: null,
};

/**
 * Normalises and compiles a raw set document into a render-ready preview
 * model. Returns a fallback (empty eras, no markers) if the document is
 * currently invalid.
 */
export function useSetBuilderPreviewModel(
  document: TimelineRawSetDocument,
): SetBuilderPreviewModel {
  return useMemo(() => {
    try {
      const normalized = normalizeTimelineSetDocument(document);
      const catalog = compileTimelineCatalog([normalized]);
      const spanPriority = catalog.setSpanPriorityById.get(document.metadata.id);

      const startYear = spanPriority?.startYear ?? 1900;
      const endYear = spanPriority?.endYear ?? 2000;

      return {
        eras: catalog.rootEra.children ?? [],
        markers: [...catalog.markers],
        overlayBands: [...catalog.overlays],
        range: [startYear, endYear],
        error: null,
      };
    } catch (err) {
      return {
        ...FALLBACK_MODEL,
        error: err instanceof Error ? err.message : "Invalid document",
      };
    }
  }, [document]);
}
