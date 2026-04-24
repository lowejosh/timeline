import type { TimelineExactTimestamp } from "../core/exactTimestamp";
import type {
  EraDefinition,
  EraSource,
  TimelineDecorationCategory,
  TimelineDecorationGroup,
  TimelineEraFamilyConfig,
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSetConfig,
} from "../core/timelineTypes";
import {
  normalizeTimelineSetDocument,
  type TimelineRawDecorationGroup,
  type TimelineRawEraFamily,
  type TimelineRawEraNode,
  type TimelineRawExactTimestamp,
  type TimelineRawMarker,
  type TimelineRawOverlay,
  type TimelineRawRelativePoint,
  type TimelineRawTimelinePoint,
  type TimelineSetDefinition,
} from "./setSchema";

export type TimelineSetTimelinePoint =
  | number
  | TimelineRawRelativePoint
  | TimelineRawExactTimestamp
  | TimelineExactTimestamp;

export type TimelineSetMarkerSource = Omit<
  TimelineMarker,
  "setId" | "groupId" | "year" | "exactTime"
> & {
  year: TimelineSetTimelinePoint;
  exactTime?: TimelineRawExactTimestamp | TimelineExactTimestamp;
};

export type TimelineSetOverlaySource = Omit<
  TimelineOverlayBand,
  | "setId"
  | "groupId"
  | "startYear"
  | "endYear"
  | "exactStartTime"
  | "exactEndTime"
  | "children"
> & {
  startYear: TimelineSetTimelinePoint;
  endYear: TimelineSetTimelinePoint;
  exactStartTime?: TimelineRawExactTimestamp | TimelineExactTimestamp;
  exactEndTime?: TimelineRawExactTimestamp | TimelineExactTimestamp;
  children?: TimelineSetOverlaySource[];
};

export type TimelineSetEraNodeSource = Omit<
  EraDefinition,
  | "familyId"
  | "startYear"
  | "endYear"
  | "exactStartTime"
  | "exactEndTime"
  | "children"
> & {
  startYear: TimelineSetTimelinePoint;
  endYear: TimelineSetTimelinePoint;
  exactStartTime?: TimelineRawExactTimestamp | TimelineExactTimestamp;
  exactEndTime?: TimelineRawExactTimestamp | TimelineExactTimestamp;
  children?: TimelineSetEraNodeSource[];
};

export type TimelineSetGroupSource = Omit<
  TimelineDecorationGroup,
  "categoryId" | "children"
> & {
  markers?: TimelineSetMarkerSource[];
  overlays?: TimelineSetOverlaySource[];
  children?: TimelineSetGroupSource[];
};

export type TimelineSetCategorySource = TimelineDecorationCategory & {
  groups: TimelineSetGroupSource[];
};

export type TimelineSetFamilySource = Omit<TimelineEraFamilyConfig, "id"> & {
  id: string;
  root: TimelineSetEraNodeSource;
};

export type TimelineSetSource = {
  version: 1;
  metadata: Omit<TimelineSetConfig, "familyIds">;
  sources: Record<string, EraSource>;
  categories: TimelineSetCategorySource[];
  families: TimelineSetFamilySource[];
  overlayLaneBias?: Record<string, number>;
};

const ELAPSED_UNITS = [
  "years",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds",
  "microseconds",
] as const;

function toDocumentExactTimestamp(
  timestamp: TimelineRawExactTimestamp | TimelineExactTimestamp,
): TimelineRawExactTimestamp {
  if (timestamp.kind === "calendar") {
    return { ...timestamp };
  }

  const hasBigIntUnits = ELAPSED_UNITS.some(
    (unit) => typeof timestamp[unit] === "bigint",
  );

  if (!hasBigIntUnits) {
    return timestamp as TimelineRawExactTimestamp;
  }

  return {
    kind: "elapsed",
    reference: timestamp.reference,
    precision: timestamp.precision,
    years: timestamp.years?.toString(),
    days: timestamp.days?.toString(),
    hours: timestamp.hours?.toString(),
    minutes: timestamp.minutes?.toString(),
    seconds: timestamp.seconds?.toString(),
    milliseconds: timestamp.milliseconds?.toString(),
    microseconds: timestamp.microseconds?.toString(),
  };
}

function toDocumentTimelinePoint(
  point: TimelineSetTimelinePoint,
): TimelineRawTimelinePoint {
  if (typeof point === "number") {
    return point;
  }

  if (point.kind === "relative") {
    return point;
  }

  return toDocumentExactTimestamp(point);
}

function toDocumentMarker(
  marker: TimelineSetMarkerSource,
  groupId: string,
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
    year: toDocumentTimelinePoint(marker.year),
    exactTime: marker.exactTime
      ? toDocumentExactTimestamp(marker.exactTime)
      : undefined,
    approximate: marker.approximate,
    color: marker.color,
    dateLabel: marker.dateLabel,
    timeLabel: marker.timeLabel,
  };
}

function toDocumentOverlay(
  overlay: TimelineSetOverlaySource,
  groupId: string,
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
    startYear: toDocumentTimelinePoint(overlay.startYear),
    endYear: toDocumentTimelinePoint(overlay.endYear),
    exactStartTime: overlay.exactStartTime
      ? toDocumentExactTimestamp(overlay.exactStartTime)
      : undefined,
    exactEndTime: overlay.exactEndTime
      ? toDocumentExactTimestamp(overlay.exactEndTime)
      : undefined,
    approximateStart: overlay.approximateStart,
    approximateEnd: overlay.approximateEnd,
    color: overlay.color,
    autoToggleRule: overlay.autoToggleRule,
    children: overlay.children?.map((child) =>
      toDocumentOverlay(child, groupId),
    ),
  };
}

function toDocumentEraNode(era: TimelineSetEraNodeSource): TimelineRawEraNode {
  return {
    id: era.id,
    name: era.name,
    alternateName: era.alternateName,
    startYear: toDocumentTimelinePoint(era.startYear),
    endYear: toDocumentTimelinePoint(era.endYear),
    exactStartTime: era.exactStartTime
      ? toDocumentExactTimestamp(era.exactStartTime)
      : undefined,
    exactEndTime: era.exactEndTime
      ? toDocumentExactTimestamp(era.exactEndTime)
      : undefined,
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
    children: era.children?.map(toDocumentEraNode),
  };
}

function toDocumentGroup(
  group: TimelineSetGroupSource,
  markers: TimelineRawMarker[],
  overlays: TimelineRawOverlay[],
): TimelineRawDecorationGroup {
  for (const marker of group.markers ?? []) {
    markers.push(toDocumentMarker(marker, group.id));
  }

  for (const overlay of group.overlays ?? []) {
    overlays.push(toDocumentOverlay(overlay, group.id));
  }

  return {
    id: group.id,
    label: group.label,
    description: group.description,
    contentType: group.contentType,
    order: group.order,
    defaultEnabled: group.defaultEnabled,
    autoToggleRule: group.autoToggleRule,
    children: group.children?.map((child) =>
      toDocumentGroup(child, markers, overlays),
    ),
  };
}

export function normalizeTimelineSetSource(
  source: TimelineSetSource,
): TimelineSetDefinition {
  const markers: TimelineRawMarker[] = [];
  const overlays: TimelineRawOverlay[] = [];

  const document = {
    version: source.version,
    metadata: source.metadata,
    sources: source.sources,
    categories: source.categories.map((category) => ({
      id: category.id,
      label: category.label,
      description: category.description,
      order: category.order,
      groups: category.groups.map((group) =>
        toDocumentGroup(group, markers, overlays),
      ),
    })),
    families: source.families.map<TimelineRawEraFamily>((family) => ({
      id: family.id,
      label: family.label,
      description: family.description,
      order: family.order,
      priority: family.priority,
      defaultEnabled: family.defaultEnabled,
      root: toDocumentEraNode(family.root),
    })),
    markers,
    overlays,
    overlayLaneBias: source.overlayLaneBias,
  } satisfies Parameters<typeof normalizeTimelineSetDocument>[0];

  return normalizeTimelineSetDocument(document);
}
