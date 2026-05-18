import type {
  Era,
  EraDefinition,
  EraFamilyId,
  TimelineDecorationCategory,
  TimelineDecorationGroup,
  TimelineDisplayConfig,
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSetId,
  TimelineEraFamilyConfig,
} from "../core/timelineTypes";
import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "../core/timelineYears";
import type { TimelineSetDefinition } from "./setSchema";
import { COMPUTING_SET } from "./sets/computing/index";
import { COSMIC_SET } from "./sets/cosmic/index";
import { EARTH_SET } from "./sets/earth/index";
import { HUMAN_SET } from "./sets/human/index";
import { PHYSICS_SET } from "./sets/physics/index";

export type TimelineSetSpanPriority = {
  startYear: number;
  endYear: number;
  priority: number;
};

export type TimelineCatalogSnapshot = {
  sets: readonly TimelineSetDefinition[];
  setsById: Readonly<Record<TimelineSetId, TimelineSetDefinition>>;
  categories: readonly TimelineDecorationCategory[];
  groups: readonly TimelineDecorationGroup[];
  groupsById: Readonly<Record<string, TimelineDecorationGroup>>;
  display: TimelineDisplayConfig;
  markers: readonly TimelineMarker[];
  overlays: readonly TimelineOverlayBand[];
  sourcesById: Readonly<Record<string, TimelineSetDefinition["sources"][string]>>;
  setIdByFamilyId: ReadonlyMap<EraFamilyId, TimelineSetId>;
  setIdByGroupId: ReadonlyMap<string, TimelineSetId>;
  overlayLaneBiasById: Readonly<Record<string, number>>;
  setSpanPriorityById: ReadonlyMap<TimelineSetId, TimelineSetSpanPriority>;
  eraFamilies: readonly TimelineEraFamilyConfig[];
  rootEra: Era;
  defaultEnabledSetIds: ReadonlySet<TimelineSetId>;
  defaultEnabledGroupIds: ReadonlySet<string>;
  defaultSetOrder: readonly TimelineSetId[];
};

export const STATIC_TIMELINE_SETS: readonly TimelineSetDefinition[] = [
  COMPUTING_SET,
  COSMIC_SET,
  EARTH_SET,
  HUMAN_SET,
  PHYSICS_SET,
];

function compareSetOrder(
  left: TimelineSetDefinition,
  right: TimelineSetDefinition,
) {
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

function compareOverlayOrder(
  left: TimelineOverlayBand,
  right: TimelineOverlayBand,
) {
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
      throw new Error(`Duplicate ${label} in timeline catalog: ${entry}`);
    }

    seen.add(entry);
  }
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function hslToRgb(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const h = hue / 60;
  const x = c * (1 - Math.abs((h % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (h >= 0 && h < 1) {
    red = c;
    green = x;
  } else if (h < 2) {
    red = x;
    green = c;
  } else if (h < 3) {
    green = c;
    blue = x;
  } else if (h < 4) {
    green = x;
    blue = c;
  } else if (h < 5) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  const m = l - c / 2;
  const toChannel = (channel: number) => Math.round((channel + m) * 255);

  return `rgb(${toChannel(red)}, ${toChannel(green)}, ${toChannel(blue)})`;
}

export function getSeededEraColor(seed: string): string {
  const hash = hashString(seed);
  const hue = hash % 360;
  const saturation = 68 + ((hash >>> 8) % 18);
  const lightness = 52 + ((hash >>> 16) % 10);

  return hslToRgb(hue, saturation, lightness);
}

function toEraFamilyConfig(
  family: { root: EraDefinition } & TimelineEraFamilyConfig,
): TimelineEraFamilyConfig {
  return {
    id: family.id,
    label: family.label,
    description: family.description,
    order: family.order,
    priority: family.priority,
    defaultEnabled: family.defaultEnabled,
  };
}

function materializeEra(
  definition: EraDefinition,
  familyConfigById: ReadonlyMap<EraFamilyId, TimelineEraFamilyConfig>,
  inheritedFamilyId?: EraFamilyId,
  inheritedPriority?: number,
): Era {
  const familyId = definition.familyId ?? inheritedFamilyId;
  const familyPriority =
    familyId !== undefined ? familyConfigById.get(familyId)?.priority : undefined;
  const priority = definition.priority ?? inheritedPriority ?? familyPriority;

  return {
    ...definition,
    familyId,
    priority,
    color: definition.color ?? getSeededEraColor(definition.id),
    children: definition.children?.map((child) =>
      materializeEra(child, familyConfigById, familyId, priority),
    ),
  };
}

function visitTimelineOverlayBands(
  overlays: readonly TimelineOverlayBand[],
  visitor: (overlay: TimelineOverlayBand) => void,
) {
  for (const overlay of overlays) {
    visitor(overlay);

    if (overlay.children?.length) {
      visitTimelineOverlayBands(overlay.children, visitor);
    }
  }
}

export function compileTimelineCatalog(
  inputSets: readonly TimelineSetDefinition[],
): TimelineCatalogSnapshot {
  const sets = [...inputSets].sort(compareSetOrder);

  assertUniqueRegistryKeys(
    sets.map((set) => set.metadata.id),
    "set id",
  );
  assertUniqueRegistryKeys(
    sets.flatMap((set) => set.families.map((family) => family.id)),
    "family id",
  );
  assertUniqueRegistryKeys(
    sets.flatMap((set) => set.groups.map((group) => group.id)),
    "group id",
  );
  assertUniqueRegistryKeys(
    sets.flatMap((set) => set.categories.map((category) => category.id)),
    "category id",
  );
  assertUniqueRegistryKeys(
    sets.flatMap((set) => Object.keys(set.sources)),
    "source id",
  );

  const categories = sets.flatMap((set) => set.categories).sort(compareCategoryOrder);
  const groups = sets.flatMap((set) => set.groups).sort(compareGroupOrder);
  const markers = sets.flatMap((set) => set.markers).sort(compareMarkerOrder);
  const overlays = sets.flatMap((set) => set.overlays).sort(compareOverlayOrder);
  const eraFamilies = sets
    .flatMap((set) => set.families.map(toEraFamilyConfig))
    .sort(
      (left, right) =>
        left.order - right.order || left.label.localeCompare(right.label),
    );
  const eraFamilyConfigById = new Map(
    eraFamilies.map((family) => [family.id, family] as const),
  );
  const familyRootDefinitions = sets
    .flatMap((set) => set.families.map((family) => family.root))
    .sort((left, right) => {
      const leftConfig = left.familyId
        ? eraFamilyConfigById.get(left.familyId)
        : undefined;
      const rightConfig = right.familyId
        ? eraFamilyConfigById.get(right.familyId)
        : undefined;

      return (
        (leftConfig?.order ?? Number.MAX_SAFE_INTEGER) -
          (rightConfig?.order ?? Number.MAX_SAFE_INTEGER) ||
        left.name.localeCompare(right.name)
      );
    });
  const rootEra = materializeEra(
    {
      id: "universe",
      name: "Universe",
      startYear: TIMELINE_MIN_YEAR,
      endYear: TIMELINE_MAX_YEAR,
      color: "rgba(0, 0, 0, 0)",
      scheme: "app-canonical",
      sourceIds: ["nasaUniverseOverview"],
      children: familyRootDefinitions,
    },
    eraFamilyConfigById,
  );
  const setSpanPriorityById = new Map<TimelineSetId, TimelineSetSpanPriority>(
    sets.map((set) => {
      const spans = set.families.map((family) => family.root);
      let startYear = Math.min(...spans.map((span) => span.startYear));
      let endYear = Math.max(...spans.map((span) => span.endYear));
      const priority = Math.max(...set.families.map((family) => family.priority));

      for (const marker of set.markers) {
        startYear = Math.min(startYear, marker.year);
        endYear = Math.max(endYear, marker.year);
      }

      visitTimelineOverlayBands(set.overlays, (overlay) => {
        startYear = Math.min(startYear, overlay.startYear);
        endYear = Math.max(endYear, overlay.endYear);
      });

      return [set.metadata.id, { startYear, endYear, priority }] as const;
    }),
  );

  return {
    sets,
    setsById: Object.fromEntries(
      sets.map((set) => [set.metadata.id, set] as const),
    ) as Readonly<Record<TimelineSetId, TimelineSetDefinition>>,
    categories,
    groups,
    groupsById: Object.fromEntries(
      groups.map((group) => [group.id, group] as const),
    ) satisfies Record<string, TimelineDecorationGroup>,
    display: {
      markers: [...markers],
      overlays: [...overlays],
    },
    markers,
    overlays,
    sourcesById: Object.fromEntries(
      sets.flatMap((set) => Object.entries(set.sources)),
    ) as Readonly<Record<string, TimelineSetDefinition["sources"][string]>>,
    setIdByFamilyId: new Map(
      sets.flatMap((set) =>
        set.families.map((family) => [family.id, set.metadata.id] as const),
      ),
    ),
    setIdByGroupId: new Map(
      sets.flatMap((set) =>
        set.groups.map((group) => [group.id, set.metadata.id] as const),
      ),
    ),
    overlayLaneBiasById: Object.fromEntries(
      sets.flatMap((set) => Object.entries(set.overlayLaneBias)),
    ) as Readonly<Record<string, number>>,
    setSpanPriorityById,
    eraFamilies,
    rootEra,
    defaultEnabledSetIds: new Set(
      sets
        .filter((set) => set.metadata.defaultEnabled !== false)
        .map((set) => set.metadata.id),
    ),
    defaultEnabledGroupIds: new Set(
      groups
        .filter((group) => group.defaultEnabled !== false)
        .map((group) => group.id),
    ),
    defaultSetOrder: sets.map((set) => set.metadata.id),
  };
}

export const STATIC_TIMELINE_CATALOG = compileTimelineCatalog(
  STATIC_TIMELINE_SETS,
);
