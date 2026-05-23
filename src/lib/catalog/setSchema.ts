import {
  createExactCalendarTimestamp,
  createExactElapsedTimestamp,
  getTimelineYearFromExactTimestamp,
  type TimelineCalendarEra,
  type TimelineElapsedReference,
  type TimelineExactTimestamp,
  type TimelineTimestampPrecision,
} from "../core/exactTimestamp";
import {
  getTimelineYearFromYearsAfterBigBang,
  getTimelineYearFromYearsAgo,
} from "../core/timelineYears";
import type {
  EraDefinition,
  EraSource,
  TimelineDecorationCategory,
  TimelineDecorationGroup,
  TimelineLayerAutoToggleRule,
  TimelineTooltipImage,
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSetConfig,
  TimelineEraFamilyConfig,
} from "../core/timelineTypes";

export type TimelineJsonInteger = number | string;
export type TimelineJsonNumber = number | string;
export type TimelineRawRelativeUnit =
  | "years"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds"
  | "microseconds";

export type TimelineRawRelativePoint = {
  kind: "relative";
  reference: TimelineElapsedReference;
  unit: TimelineRawRelativeUnit;
  value: TimelineJsonNumber;
};

export type TimelineRawCalendarTimestamp = {
  kind: "calendar";
  era: TimelineCalendarEra;
  year: number;
  precision: TimelineTimestampPrecision;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  microsecond?: number;
};

export type TimelineRawElapsedTimestamp = {
  kind: "elapsed";
  reference: TimelineElapsedReference;
  precision: TimelineTimestampPrecision;
  years?: TimelineJsonInteger;
  days?: TimelineJsonInteger;
  hours?: TimelineJsonInteger;
  minutes?: TimelineJsonInteger;
  seconds?: TimelineJsonInteger;
  milliseconds?: TimelineJsonInteger;
  microseconds?: TimelineJsonInteger;
};

export type TimelineRawExactTimestamp =
  | TimelineRawCalendarTimestamp
  | TimelineRawElapsedTimestamp;

export type TimelineRawTimelinePoint =
  | number
  | TimelineRawExactTimestamp
  | TimelineRawRelativePoint;

export type TimelineRawDecorationGroup = Omit<
  TimelineDecorationGroup,
  "categoryId"
> & {
  children?: TimelineRawDecorationGroup[];
};

export type TimelineRawDecorationCategory = TimelineDecorationCategory & {
  groups: TimelineRawDecorationGroup[];
};

type TimelineRawDecorationBase = {
  id: string;
  label: string;
  shortLabel?: string;
  description?: string;
  priority?: number;
  groupId?: string;
  subGroup?: string;
  laneAffinityGroupId?: string;
  image?: TimelineTooltipImage;
  sourceIds?: string[];
  minZoom?: number;
  maxZoom?: number;
  regionalScopeLabel?: string;
};

export type TimelineRawMarker = TimelineRawDecorationBase & {
  year: TimelineRawTimelinePoint;
  exactTime?: TimelineRawExactTimestamp;
  approximate?: boolean;
  color?: string;
  dateLabel?: string;
  timeLabel?: string;
};

export type TimelineRawOverlay = TimelineRawDecorationBase & {
  startYear: TimelineRawTimelinePoint;
  endYear: TimelineRawTimelinePoint;
  exactStartTime?: TimelineRawExactTimestamp;
  exactEndTime?: TimelineRawExactTimestamp;
  approximateStart?: boolean;
  approximateEnd?: boolean;
  color: string;
  autoToggleRule?: TimelineLayerAutoToggleRule;
  children?: TimelineRawOverlay[];
};

export type TimelineRawEraNode = {
  id: string;
  name: string;
  alternateName?: string;
  startYear: TimelineRawTimelinePoint;
  endYear: TimelineRawTimelinePoint;
  exactStartTime?: TimelineRawExactTimestamp;
  exactEndTime?: TimelineRawExactTimestamp;
  color?: string;
  timeLabel?: string;
  description?: string;
  scheme?: EraDefinition["scheme"];
  priority?: number;
  isFamilyRoot?: boolean;
  image?: TimelineTooltipImage;
  sourceIds?: string[];
  approximateStart?: boolean;
  approximateEnd?: boolean;
  regionalScopeLabel?: string;
  children?: TimelineRawEraNode[];
};

export type TimelineRawEraFamily = Omit<TimelineEraFamilyConfig, "id"> & {
  id: string;
  root: TimelineRawEraNode;
};

export type TimelineRawSetMetadata = Omit<TimelineSetConfig, "familyIds">;

export type TimelineRawSetDocument = {
  version: 1;
  metadata: TimelineRawSetMetadata;
  sources: Record<string, EraSource>;
  categories: TimelineRawDecorationCategory[];
  families: TimelineRawEraFamily[];
  markers: TimelineRawMarker[];
  overlays: TimelineRawOverlay[];
  overlayLaneBias?: Record<string, number>;
};

export type TimelineSetGroupNode = TimelineDecorationGroup & {
  children?: TimelineSetGroupNode[];
};

export type TimelineSetEraFamilyDefinition = TimelineEraFamilyConfig & {
  root: EraDefinition;
};

export type TimelineSetDefinition = {
  version: 1;
  metadata: TimelineSetConfig;
  sources: Record<string, EraSource>;
  categories: TimelineDecorationCategory[];
  groupTree: TimelineSetGroupNode[];
  groups: TimelineDecorationGroup[];
  families: TimelineSetEraFamilyDefinition[];
  markers: TimelineMarker[];
  overlays: TimelineOverlayBand[];
  overlayLaneBias: Record<string, number>;
};

const AVERAGE_DAYS_PER_YEAR = 365.2425;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1_000;
const MICROSECONDS_PER_MILLISECOND = 1_000;

function assertNonEmptyString(value: string, label: string) {
  if (value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function parseFiniteNumber(value: TimelineJsonNumber, label: string) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a finite number.`);
  }

  return parsed;
}

function parseNonNegativeBigInt(value: TimelineJsonInteger, label: string) {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`${label} must be a non-negative safe integer.`);
    }

    return BigInt(value);
  }

  if (!/^\d+$/.test(value)) {
    throw new Error(`${label} must be a non-negative integer string.`);
  }

  return BigInt(value);
}

function collectUniqueIds(values: Iterable<string>, label: string) {
  const seen = new Set<string>();

  for (const value of values) {
    assertNonEmptyString(value, label);

    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }

    seen.add(value);
  }

  return seen;
}

function validateSourceIds(
  sourceIds: readonly string[] | undefined,
  availableSourceIds: ReadonlySet<string>,
  label: string,
) {
  for (const sourceId of sourceIds ?? []) {
    if (!availableSourceIds.has(sourceId)) {
      throw new Error(`${label} references unknown source: ${sourceId}`);
    }
  }
}

function normalizeCalendarEra(value: string): TimelineCalendarEra {
  const normalized = value.toLocaleLowerCase();

  if (normalized !== "ce" && normalized !== "bce") {
    throw new Error(`Calendar era must be "ce" or "bce".`);
  }

  return normalized;
}

function normalizeElapsedReference(value: string): TimelineElapsedReference {
  const normalized = value.toLocaleLowerCase();

  if (normalized !== "ago" && normalized !== "after-big-bang") {
    throw new Error(`Elapsed reference must be "ago" or "after-big-bang".`);
  }

  return normalized;
}

function normalizeRawExactTimestamp(
  timestamp: TimelineRawExactTimestamp,
): TimelineExactTimestamp {
  if (timestamp.kind === "calendar") {
    return createExactCalendarTimestamp({
      era: normalizeCalendarEra(timestamp.era),
      year: timestamp.year,
      precision: timestamp.precision,
      month: timestamp.month,
      day: timestamp.day,
      hour: timestamp.hour,
      minute: timestamp.minute,
      second: timestamp.second,
      millisecond: timestamp.millisecond,
      microsecond: timestamp.microsecond,
    });
  }

  return createExactElapsedTimestamp({
    reference: normalizeElapsedReference(timestamp.reference),
    precision: timestamp.precision,
    years:
      timestamp.years === undefined
        ? undefined
        : parseNonNegativeBigInt(timestamp.years, "Elapsed years"),
    days:
      timestamp.days === undefined
        ? undefined
        : parseNonNegativeBigInt(timestamp.days, "Elapsed days"),
    hours:
      timestamp.hours === undefined
        ? undefined
        : parseNonNegativeBigInt(timestamp.hours, "Elapsed hours"),
    minutes:
      timestamp.minutes === undefined
        ? undefined
        : parseNonNegativeBigInt(timestamp.minutes, "Elapsed minutes"),
    seconds:
      timestamp.seconds === undefined
        ? undefined
        : parseNonNegativeBigInt(timestamp.seconds, "Elapsed seconds"),
    milliseconds:
      timestamp.milliseconds === undefined
        ? undefined
        : parseNonNegativeBigInt(
            timestamp.milliseconds,
            "Elapsed milliseconds",
          ),
    microseconds:
      timestamp.microseconds === undefined
        ? undefined
        : parseNonNegativeBigInt(
            timestamp.microseconds,
            "Elapsed microseconds",
          ),
  });
}

function convertRelativeValueToYears(
  unit: TimelineRawRelativeUnit,
  value: number,
) {
  switch (unit) {
    case "years":
      return value;
    case "days":
      return value / AVERAGE_DAYS_PER_YEAR;
    case "hours":
      return value / HOURS_PER_DAY / AVERAGE_DAYS_PER_YEAR;
    case "minutes":
      return value / MINUTES_PER_HOUR / HOURS_PER_DAY / AVERAGE_DAYS_PER_YEAR;
    case "seconds":
      return (
        value /
        SECONDS_PER_MINUTE /
        MINUTES_PER_HOUR /
        HOURS_PER_DAY /
        AVERAGE_DAYS_PER_YEAR
      );
    case "milliseconds":
      return (
        value /
        MILLISECONDS_PER_SECOND /
        SECONDS_PER_MINUTE /
        MINUTES_PER_HOUR /
        HOURS_PER_DAY /
        AVERAGE_DAYS_PER_YEAR
      );
    case "microseconds":
      return (
        value /
        MICROSECONDS_PER_MILLISECOND /
        MILLISECONDS_PER_SECOND /
        SECONDS_PER_MINUTE /
        MINUTES_PER_HOUR /
        HOURS_PER_DAY /
        AVERAGE_DAYS_PER_YEAR
      );
  }
}

function resolveTimelinePoint(
  point: TimelineRawTimelinePoint,
  label: string,
): number {
  if (typeof point === "number") {
    if (!Number.isFinite(point)) {
      throw new Error(`${label} must be a finite number.`);
    }

    return point;
  }

  if (point.kind === "relative") {
    const value = parseFiniteNumber(point.value, label);
    const reference = normalizeElapsedReference(point.reference);

    if (value < 0) {
      throw new Error(`${label} must be non-negative.`);
    }

    const years = convertRelativeValueToYears(point.unit, value);

    return reference === "after-big-bang"
      ? getTimelineYearFromYearsAfterBigBang(years)
      : getTimelineYearFromYearsAgo(years);
  }

  return getTimelineYearFromExactTimestamp(normalizeRawExactTimestamp(point));
}

function normalizeGroupNode(
  node: TimelineRawDecorationGroup,
  categoryId: string,
  path: string,
  seenGroupIds: Set<string>,
): TimelineSetGroupNode {
  assertNonEmptyString(node.id, `${path} id`);
  assertNonEmptyString(node.label, `${path} label`);

  if (seenGroupIds.has(node.id)) {
    throw new Error(`Duplicate group id: ${node.id}`);
  }

  seenGroupIds.add(node.id);

  return {
    id: node.id,
    categoryId,
    label: node.label,
    description: node.description,
    contentType: node.contentType,
    order: node.order,
    defaultEnabled: node.defaultEnabled,
    autoToggleRule: node.autoToggleRule,
    children: node.children?.map((child, index) =>
      normalizeGroupNode(
        child,
        categoryId,
        `${path}.children[${index}]`,
        seenGroupIds,
      ),
    ),
  };
}

function flattenGroupTree(
  nodes: readonly TimelineSetGroupNode[],
): TimelineDecorationGroup[] {
  return nodes.flatMap((node) => {
    const { children, ...group } = node;

    return [group, ...flattenGroupTree(children ?? [])];
  });
}

function normalizeMarker(
  marker: TimelineRawMarker,
  setId: string,
  validGroupIds: ReadonlySet<string>,
  availableSourceIds: ReadonlySet<string>,
): TimelineMarker {
  assertNonEmptyString(marker.id, `Marker id`);
  assertNonEmptyString(marker.label, `Marker ${marker.id} label`);

  if (marker.groupId && !validGroupIds.has(marker.groupId)) {
    throw new Error(
      `Marker ${marker.id} references unknown group: ${marker.groupId}`,
    );
  }

  validateSourceIds(
    marker.sourceIds,
    availableSourceIds,
    `Marker ${marker.id}`,
  );

  return {
    id: marker.id,
    label: marker.label,
    shortLabel: marker.shortLabel,
    description: marker.description,
    priority: marker.priority,
    groupId: marker.groupId,
    setId,
    subGroup: marker.subGroup,
    image: marker.image,
    sourceIds: marker.sourceIds,
    minZoom: marker.minZoom,
    maxZoom: marker.maxZoom,
    regionalScopeLabel: marker.regionalScopeLabel,
    year: resolveTimelinePoint(marker.year, `Marker ${marker.id} year`),
    exactTime: marker.exactTime
      ? normalizeRawExactTimestamp(marker.exactTime)
      : undefined,
    approximate: marker.approximate,
    color: marker.color,
    dateLabel: marker.dateLabel,
    timeLabel: marker.timeLabel,
  };
}

function normalizeOverlay(
  overlay: TimelineRawOverlay,
  setId: string,
  validGroupIds: ReadonlySet<string>,
  availableSourceIds: ReadonlySet<string>,
  inheritedGroupId?: string,
): TimelineOverlayBand {
  assertNonEmptyString(overlay.id, `Overlay id`);
  assertNonEmptyString(overlay.label, `Overlay ${overlay.id} label`);

  const groupId = overlay.groupId ?? inheritedGroupId;

  if (groupId && !validGroupIds.has(groupId)) {
    throw new Error(
      `Overlay ${overlay.id} references unknown group: ${groupId}`,
    );
  }

  if (overlay.laneAffinityGroupId !== undefined) {
    assertNonEmptyString(
      overlay.laneAffinityGroupId,
      `Overlay ${overlay.id} laneAffinityGroupId`,
    );
  }

  validateSourceIds(
    overlay.sourceIds,
    availableSourceIds,
    `Overlay ${overlay.id}`,
  );

  return {
    id: overlay.id,
    label: overlay.label,
    shortLabel: overlay.shortLabel,
    description: overlay.description,
    priority: overlay.priority,
    groupId,
    setId,
    subGroup: overlay.subGroup,
    laneAffinityGroupId: overlay.laneAffinityGroupId,
    image: overlay.image,
    sourceIds: overlay.sourceIds,
    minZoom: overlay.minZoom,
    maxZoom: overlay.maxZoom,
    regionalScopeLabel: overlay.regionalScopeLabel,
    startYear: resolveTimelinePoint(
      overlay.startYear,
      `Overlay ${overlay.id} startYear`,
    ),
    endYear: resolveTimelinePoint(
      overlay.endYear,
      `Overlay ${overlay.id} endYear`,
    ),
    exactStartTime: overlay.exactStartTime
      ? normalizeRawExactTimestamp(overlay.exactStartTime)
      : undefined,
    exactEndTime: overlay.exactEndTime
      ? normalizeRawExactTimestamp(overlay.exactEndTime)
      : undefined,
    approximateStart: overlay.approximateStart,
    approximateEnd: overlay.approximateEnd,
    color: overlay.color,
    autoToggleRule: overlay.autoToggleRule,
    children: overlay.children?.map((child) =>
      normalizeOverlay(
        child,
        setId,
        validGroupIds,
        availableSourceIds,
        groupId,
      ),
    ),
  };
}

function normalizeEraNode(
  era: TimelineRawEraNode,
  familyId: string,
  availableSourceIds: ReadonlySet<string>,
): EraDefinition {
  assertNonEmptyString(era.id, `Era id`);
  assertNonEmptyString(era.name, `Era ${era.id} name`);
  validateSourceIds(era.sourceIds, availableSourceIds, `Era ${era.id}`);

  return {
    id: era.id,
    name: era.name,
    alternateName: era.alternateName,
    startYear: resolveTimelinePoint(era.startYear, `Era ${era.id} startYear`),
    endYear: resolveTimelinePoint(era.endYear, `Era ${era.id} endYear`),
    exactStartTime: era.exactStartTime
      ? normalizeRawExactTimestamp(era.exactStartTime)
      : undefined,
    exactEndTime: era.exactEndTime
      ? normalizeRawExactTimestamp(era.exactEndTime)
      : undefined,
    color: era.color,
    timeLabel: era.timeLabel,
    description: era.description,
    scheme: era.scheme,
    familyId,
    priority: era.priority,
    isFamilyRoot: era.isFamilyRoot,
    image: era.image,
    sourceIds: era.sourceIds,
    approximateStart: era.approximateStart,
    approximateEnd: era.approximateEnd,
    regionalScopeLabel: era.regionalScopeLabel,
    children: era.children?.map((child) =>
      normalizeEraNode(child, familyId, availableSourceIds),
    ),
  };
}

function collectOverlayIds(overlays: readonly TimelineOverlayBand[]): string[] {
  return overlays.flatMap((overlay) => [
    overlay.id,
    ...collectOverlayIds(overlay.children ?? []),
  ]);
}

function collectEraIds(eras: readonly EraDefinition[]): string[] {
  return eras.flatMap((era) => [era.id, ...collectEraIds(era.children ?? [])]);
}

export function normalizeTimelineSetDocument(
  document: TimelineRawSetDocument,
): TimelineSetDefinition {
  if (document.version !== 1) {
    throw new Error(`Unsupported set document version: ${document.version}`);
  }

  assertNonEmptyString(document.metadata.id, "Set id");
  assertNonEmptyString(document.metadata.label, "Set label");

  const sourceIds = collectUniqueIds(
    Object.keys(document.sources),
    "source id",
  );
  const categoryIds = collectUniqueIds(
    document.categories.map((category) => category.id),
    "category id",
  );

  const seenGroupIds = new Set<string>();
  const groupTree = document.categories.flatMap((category, categoryIndex) => {
    assertNonEmptyString(category.label, `Category ${category.id} label`);

    return category.groups.map((group, groupIndex) =>
      normalizeGroupNode(
        group,
        category.id,
        `categories[${categoryIndex}].groups[${groupIndex}]`,
        seenGroupIds,
      ),
    );
  });
  const groups = flattenGroupTree(groupTree);
  const groupIds = new Set(groups.map((group) => group.id));

  const families = document.families.map((family) => ({
    id: family.id,
    label: family.label,
    description: family.description,
    order: family.order,
    priority: family.priority,
    defaultEnabled: family.defaultEnabled,
    root: {
      ...normalizeEraNode(family.root, family.id, sourceIds),
      isFamilyRoot: true,
      familyId: family.id,
    },
  }));

  collectUniqueIds(
    families.map((family) => family.id),
    "family id",
  );

  const markers = document.markers.map((marker) =>
    normalizeMarker(marker, document.metadata.id, groupIds, sourceIds),
  );
  collectUniqueIds(
    markers.map((marker) => marker.id),
    "marker id",
  );

  const overlays = document.overlays.map((overlay) =>
    normalizeOverlay(overlay, document.metadata.id, groupIds, sourceIds),
  );
  collectUniqueIds(collectOverlayIds(overlays), "overlay id");
  collectUniqueIds(
    families.flatMap((family) => collectEraIds([family.root])),
    "era id",
  );

  const overlayLaneBiasEntries = Object.entries(document.overlayLaneBias ?? {});
  for (const [overlayId, bias] of overlayLaneBiasEntries) {
    assertNonEmptyString(overlayId, "Overlay lane bias id");

    if (!Number.isFinite(bias)) {
      throw new Error(`Overlay lane bias for ${overlayId} must be finite.`);
    }
  }

  return {
    version: 1,
    metadata: {
      ...document.metadata,
      familyIds: families.map((family) => family.id),
    },
    sources: document.sources,
    categories: document.categories.map((category) => {
      if (!categoryIds.has(category.id)) {
        throw new Error(`Unknown category id: ${category.id}`);
      }

      const { groups, ...normalizedCategory } = category;

      void groups;

      return normalizedCategory;
    }),
    groupTree,
    groups,
    families,
    markers,
    overlays,
    overlayLaneBias: Object.fromEntries(overlayLaneBiasEntries),
  };
}
