import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";
import { findEraById } from "@/lib/catalog/eras";
import { getViewportForRange } from "@/lib/core/viewport";
import type { ExperienceStop, GuidedExperience } from "./experiences";

/** Use full catalog bands, including their future portions and expandable children. */
export function resolveExperienceContent(experience: GuidedExperience, catalog: TimelineCatalogSnapshot) {
  const era = findEraById(catalog.rootEra, experience.eraId) ?? catalog.rootEra;
  const setId = catalog.setIdByFamilyId.get(era.familyId ?? "");
  const overlays = catalog.overlays.filter(band => band.setId === setId);
  const markers = catalog.markers.filter(marker => marker.setId === setId);
  const enabledGroupIds = new Set([...overlays, ...markers].flatMap(item => item.groupId ? [item.groupId] : []));
  return { era, overlays, markers, enabledGroupIds };
}

/** Author controls the span; the chapter's year always lands at the center. */
export function getExperienceViewport(stop: ExperienceStop, width: number) {
  const halfSpan = (stop.range[1] - stop.range[0]) / 2;
  return getViewportForRange(stop.year - halfSpan, stop.year + halfSpan, width, 0);
}
