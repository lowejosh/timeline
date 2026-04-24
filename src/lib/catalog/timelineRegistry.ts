import type {
  TimelineDecorationCategory,
  TimelineDecorationGroup,
  TimelineDisplayConfig,
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSetId,
} from "../core/timelineTypes";
import type { TimelineSetDefinition } from "./setSchema";
import { COSMIC_SET } from "./sets/cosmic/index";
import { EARTH_SET } from "./sets/earth/index";
import { HUMAN_SET } from "./sets/human/index";
import { PHYSICS_SET } from "./sets/physics/index";

function compareSetOrder(left: TimelineSetDefinition, right: TimelineSetDefinition) {
  return (
    left.metadata.order - right.metadata.order ||
    left.metadata.label.localeCompare(right.metadata.label)
  );
}

function compareCategoryOrder(
  left: TimelineDecorationCategory,
  right: TimelineDecorationCategory,
) {
  return left.order - right.order || left.label.localeCompare(right.label);
}

function compareGroupOrder(
  left: TimelineDecorationGroup,
  right: TimelineDecorationGroup,
) {
  return (
    left.categoryId.localeCompare(right.categoryId) ||
    left.order - right.order ||
    left.label.localeCompare(right.label)
  );
}

function compareMarkerOrder(left: TimelineMarker, right: TimelineMarker) {
  return (
    left.year - right.year ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.id.localeCompare(right.id)
  );
}

function compareOverlayOrder(left: TimelineOverlayBand, right: TimelineOverlayBand) {
  return (
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.id.localeCompare(right.id)
  );
}

function assertUniqueRegistryKeys(entries: readonly string[], label: string) {
  const seen = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry)) {
      throw new Error(`Duplicate ${label} in timeline registry: ${entry}`);
    }

    seen.add(entry);
  }
}

export const TIMELINE_SETS: readonly TimelineSetDefinition[] = [
  COSMIC_SET,
  EARTH_SET,
  HUMAN_SET,
  PHYSICS_SET,
].sort(compareSetOrder);

assertUniqueRegistryKeys(
  TIMELINE_SETS.map((set) => set.metadata.id),
  "set id",
);
assertUniqueRegistryKeys(
  TIMELINE_SETS.flatMap((set) => set.families.map((family) => family.id)),
  "family id",
);
assertUniqueRegistryKeys(
  TIMELINE_SETS.flatMap((set) => set.groups.map((group) => group.id)),
  "group id",
);
assertUniqueRegistryKeys(
  TIMELINE_SETS.flatMap((set) => set.categories.map((category) => category.id)),
  "category id",
);
assertUniqueRegistryKeys(
  TIMELINE_SETS.flatMap((set) => Object.keys(set.sources)),
  "source id",
);

export const TIMELINE_SETS_BY_ID: Readonly<Record<TimelineSetId, TimelineSetDefinition>> =
  Object.fromEntries(
    TIMELINE_SETS.map((set) => [set.metadata.id, set] as const),
  ) as Readonly<Record<TimelineSetId, TimelineSetDefinition>>;

export const TIMELINE_DECORATION_CATEGORIES: TimelineDecorationCategory[] =
  TIMELINE_SETS.flatMap((set) => set.categories).sort(compareCategoryOrder);

export const TIMELINE_DECORATION_GROUPS: TimelineDecorationGroup[] =
  TIMELINE_SETS.flatMap((set) => set.groups).sort(compareGroupOrder);

export const TIMELINE_DECORATION_GROUPS_BY_ID = Object.fromEntries(
  TIMELINE_DECORATION_GROUPS.map((group) => [group.id, group] as const),
) satisfies Record<string, TimelineDecorationGroup>;

export const TIMELINE_MARKERS: TimelineMarker[] = TIMELINE_SETS.flatMap(
  (set) => set.markers,
).sort(compareMarkerOrder);

export const TIMELINE_OVERLAYS: TimelineOverlayBand[] = TIMELINE_SETS.flatMap(
  (set) => set.overlays,
).sort(compareOverlayOrder);

export const TIMELINE_DISPLAY: TimelineDisplayConfig = {
  markers: TIMELINE_MARKERS,
  overlays: TIMELINE_OVERLAYS,
};

export const TIMELINE_SOURCES_BY_ID = Object.fromEntries(
  TIMELINE_SETS.flatMap((set) => Object.entries(set.sources)),
) as Readonly<Record<string, TimelineSetDefinition["sources"][string]>>;

export const TIMELINE_SET_ID_BY_FAMILY_ID = new Map(
  TIMELINE_SETS.flatMap((set) =>
    set.families.map((family) => [family.id, set.metadata.id] as const),
  ),
);

export const TIMELINE_OVERLAY_LANE_BIAS_YEARS = Object.fromEntries(
  TIMELINE_SETS.flatMap((set) => Object.entries(set.overlayLaneBias)),
) as Readonly<Record<string, number>>;
