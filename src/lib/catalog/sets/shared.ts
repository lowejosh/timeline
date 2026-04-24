import type { TimelineExactTimestamp } from "../../core/exactTimestamp";
import type {
  EraDefinition,
  EraSource,
  TimelineMarker,
  TimelineOverlayBand,
} from "../../core/timelineTypes";
import type {
  TimelineRawDecorationCategory,
  TimelineRawEraFamily,
  TimelineRawEraNode,
  TimelineRawExactTimestamp,
  TimelineRawMarker,
  TimelineRawOverlay,
  TimelineRawSetDocument,
  TimelineRawSetMetadata,
} from "../setSchema";

function toRawExactTimestamp(
  timestamp: TimelineExactTimestamp,
): TimelineRawExactTimestamp {
  if (timestamp.kind === "calendar") {
    return { ...timestamp };
  }

  return {
    ...timestamp,
    years: timestamp.years?.toString(),
    days: timestamp.days?.toString(),
    hours: timestamp.hours?.toString(),
    minutes: timestamp.minutes?.toString(),
    seconds: timestamp.seconds?.toString(),
    milliseconds: timestamp.milliseconds?.toString(),
    microseconds: timestamp.microseconds?.toString(),
  };
}

export function toRawMarker(
  marker: TimelineMarker,
  groupId = marker.groupId,
): TimelineRawMarker {
  return {
    id: marker.id,
    label: marker.label,
    shortLabel: marker.shortLabel,
    description: marker.description,
    priority: marker.priority,
    groupId,
    subGroup: marker.subGroup,
    sourceIds: marker.sourceIds,
    minZoom: marker.minZoom,
    maxZoom: marker.maxZoom,
    regionalScopeLabel: marker.regionalScopeLabel,
    year: marker.year,
    exactTime: marker.exactTime
      ? toRawExactTimestamp(marker.exactTime)
      : undefined,
    approximate: marker.approximate,
    color: marker.color,
    dateLabel: marker.dateLabel,
    timeLabel: marker.timeLabel,
  };
}

export function toRawOverlay(
  overlay: TimelineOverlayBand,
  groupId = overlay.groupId,
): TimelineRawOverlay {
  return {
    id: overlay.id,
    label: overlay.label,
    shortLabel: overlay.shortLabel,
    description: overlay.description,
    priority: overlay.priority,
    groupId,
    subGroup: overlay.subGroup,
    sourceIds: overlay.sourceIds,
    minZoom: overlay.minZoom,
    maxZoom: overlay.maxZoom,
    regionalScopeLabel: overlay.regionalScopeLabel,
    startYear: overlay.startYear,
    endYear: overlay.endYear,
    exactStartTime: overlay.exactStartTime
      ? toRawExactTimestamp(overlay.exactStartTime)
      : undefined,
    exactEndTime: overlay.exactEndTime
      ? toRawExactTimestamp(overlay.exactEndTime)
      : undefined,
    approximateStart: overlay.approximateStart,
    approximateEnd: overlay.approximateEnd,
    color: overlay.color,
    autoToggleRule: overlay.autoToggleRule,
    children: overlay.children?.map((child) =>
      toRawOverlay(child, child.groupId ?? groupId),
    ),
  };
}

export function toRawEraNode(era: EraDefinition): TimelineRawEraNode {
  return {
    id: era.id,
    name: era.name,
    alternateName: era.alternateName,
    startYear: era.startYear,
    endYear: era.endYear,
    exactStartTime: era.exactStartTime
      ? toRawExactTimestamp(era.exactStartTime)
      : undefined,
    exactEndTime: era.exactEndTime ? toRawExactTimestamp(era.exactEndTime) : undefined,
    color: era.color,
    timeLabel: era.timeLabel,
    description: era.description,
    scheme: era.scheme,
    priority: era.priority,
    isFamilyRoot: era.isFamilyRoot,
    sourceIds: era.sourceIds,
    approximateStart: era.approximateStart,
    approximateEnd: era.approximateEnd,
    regionalScopeLabel: era.regionalScopeLabel,
    children: era.children?.map(toRawEraNode),
  };
}

function collectEraNodeSourceIds(era: TimelineRawEraNode, sink: Set<string>) {
  for (const sourceId of era.sourceIds ?? []) {
    sink.add(sourceId);
  }

  for (const child of era.children ?? []) {
    collectEraNodeSourceIds(child, sink);
  }
}

function collectOverlaySourceIds(
  overlay: TimelineRawOverlay,
  sink: Set<string>,
) {
  for (const sourceId of overlay.sourceIds ?? []) {
    sink.add(sourceId);
  }

  for (const child of overlay.children ?? []) {
    collectOverlaySourceIds(child, sink);
  }
}

function pickSources(
  sourceCatalog: Record<string, EraSource>,
  sourceIds: Iterable<string>,
): Record<string, EraSource> {
  const entries = Array.from(new Set(sourceIds)).map((sourceId) => {
    const source = sourceCatalog[sourceId];

    if (!source) {
      throw new Error(`Unknown source id in set document build: ${sourceId}`);
    }

    return [sourceId, source] as const;
  });

  return Object.fromEntries(entries);
}

export function buildTimelineSetDocument(options: {
  metadata: TimelineRawSetMetadata;
  categories: TimelineRawDecorationCategory[];
  families: TimelineRawEraFamily[];
  markers: TimelineRawMarker[];
  overlays: TimelineRawOverlay[];
  sourceCatalog: Record<string, EraSource>;
  overlayLaneBias?: Record<string, number>;
}): TimelineRawSetDocument {
  const sourceIds = new Set<string>();

  for (const family of options.families) {
    collectEraNodeSourceIds(family.root, sourceIds);
  }

  for (const marker of options.markers) {
    for (const sourceId of marker.sourceIds ?? []) {
      sourceIds.add(sourceId);
    }
  }

  for (const overlay of options.overlays) {
    collectOverlaySourceIds(overlay, sourceIds);
  }

  return {
    version: 1,
    metadata: options.metadata,
    sources: pickSources(options.sourceCatalog, sourceIds),
    categories: options.categories,
    families: options.families,
    markers: options.markers,
    overlays: options.overlays,
    overlayLaneBias: options.overlayLaneBias,
  };
}
