import { slugifyTimelineSetId } from "@/lib/catalog/setDocumentValidation";
import type {
  TimelineRawMarker,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";

type MarkerUpdater = (marker: TimelineRawMarker) => TimelineRawMarker;

function getDefaultMarkerGroupId(document: TimelineRawSetDocument) {
  return (
    document.categories
      .flatMap((category) => category.groups)
      .find((group) => group.contentType === "markers" || group.contentType === "mixed")
      ?.id ?? `${document.metadata.id}-markers`
  );
}

export function createUniqueMarkerId(
  document: TimelineRawSetDocument,
  label: string,
) {
  const existingIds = new Set(document.markers.map((marker) => marker.id));
  const baseId = `${document.metadata.id}-${slugifyTimelineSetId(label)}`;
  let candidate = baseId;
  let index = 2;

  while (existingIds.has(candidate)) {
    candidate = `${baseId}-${index}`;
    index += 1;
  }

  return candidate;
}

export function createMarker(
  document: TimelineRawSetDocument,
  label = "Untitled marker",
): TimelineRawMarker {
  return {
    id: createUniqueMarkerId(document, label),
    label,
    year: 2000,
    description: "",
    groupId: getDefaultMarkerGroupId(document),
    sourceIds: [],
  };
}

export function addMarkerToDocument(
  document: TimelineRawSetDocument,
  marker = createMarker(document),
): TimelineRawSetDocument {
  return {
    ...document,
    markers: [...document.markers, marker],
  };
}

export function updateMarkerInDocument(
  document: TimelineRawSetDocument,
  markerId: string,
  updater: MarkerUpdater,
): TimelineRawSetDocument {
  return {
    ...document,
    markers: document.markers.map((marker) =>
      marker.id === markerId ? updater(marker) : marker,
    ),
  };
}

export function removeMarkerFromDocument(
  document: TimelineRawSetDocument,
  markerId: string,
): TimelineRawSetDocument {
  return {
    ...document,
    markers: document.markers.filter((marker) => marker.id !== markerId),
  };
}
