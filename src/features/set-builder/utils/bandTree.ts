import { slugifyTimelineSetId } from "@/lib/catalog/setDocumentValidation";
import type {
  TimelineRawOverlay,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";

type BandUpdater = (band: TimelineRawOverlay) => TimelineRawOverlay;

function collectBandIds(band: TimelineRawOverlay): string[] {
  return [
    band.id,
    ...(band.children ?? []).flatMap((child) => collectBandIds(child)),
  ];
}

function getDefaultBandGroupId(document: TimelineRawSetDocument) {
  return (
    document.categories
      .flatMap((category) => category.groups)
      .find((group) => group.contentType === "overlays" || group.contentType === "mixed")
      ?.id ?? `${document.metadata.id}-markers`
  );
}

export function getAllBandIds(document: TimelineRawSetDocument) {
  return new Set(document.overlays.flatMap((band) => collectBandIds(band)));
}

export function createUniqueBandId(
  document: TimelineRawSetDocument,
  label: string,
) {
  const allIds = getAllBandIds(document);
  const baseId = `${document.metadata.id}-${slugifyTimelineSetId(label)}`;
  let candidate = baseId;
  let index = 2;

  while (allIds.has(candidate)) {
    candidate = `${baseId}-${index}`;
    index += 1;
  }

  return candidate;
}

export function createBand(
  document: TimelineRawSetDocument,
  label = "Untitled band",
): TimelineRawOverlay {
  return {
    id: createUniqueBandId(document, label),
    label,
    startYear: 1900,
    endYear: 2000,
    color: "#4f8a8b",
    description: "",
    groupId: getDefaultBandGroupId(document),
    sourceIds: [],
    children: [],
  };
}

function updateBand(
  band: TimelineRawOverlay,
  bandId: string,
  updater: BandUpdater,
): TimelineRawOverlay {
  if (band.id === bandId) {
    return updater(band);
  }

  return {
    ...band,
    children: band.children?.map((child) => updateBand(child, bandId, updater)),
  };
}

function insertChildBand(
  band: TimelineRawOverlay,
  parentId: string,
  childBand: TimelineRawOverlay,
): TimelineRawOverlay {
  if (band.id === parentId) {
    return {
      ...band,
      children: [...(band.children ?? []), childBand],
    };
  }

  return {
    ...band,
    children: band.children?.map((child) =>
      insertChildBand(child, parentId, childBand),
    ),
  };
}

function removeBand(
  band: TimelineRawOverlay,
  bandId: string,
): TimelineRawOverlay {
  return {
    ...band,
    children: band.children
      ?.filter((child) => child.id !== bandId)
      .map((child) => removeBand(child, bandId)),
  };
}

export function updateBandInDocument(
  document: TimelineRawSetDocument,
  bandId: string,
  updater: BandUpdater,
): TimelineRawSetDocument {
  return {
    ...document,
    overlays: document.overlays.map((band) =>
      updateBand(band, bandId, updater),
    ),
  };
}

export function addBandToDocument(
  document: TimelineRawSetDocument,
  band = createBand(document),
): TimelineRawSetDocument {
  return {
    ...document,
    overlays: [...document.overlays, band],
  };
}

export function addBandChildToDocument(
  document: TimelineRawSetDocument,
  parentId: string,
  childBand = createBand(document),
): TimelineRawSetDocument {
  return {
    ...document,
    overlays: document.overlays.map((band) =>
      insertChildBand(band, parentId, childBand),
    ),
  };
}

export function removeBandFromDocument(
  document: TimelineRawSetDocument,
  bandId: string,
): TimelineRawSetDocument {
  return {
    ...document,
    overlays: document.overlays
      .filter((band) => band.id !== bandId)
      .map((band) => removeBand(band, bandId)),
  };
}
