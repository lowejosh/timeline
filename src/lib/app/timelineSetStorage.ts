import type { TimelineSetId } from "@/lib/core/timelineTypes";
import { getDefaultEnabledTimelineGroupIds } from "@/lib/catalog/decorations";
import {
  getDefaultEnabledTimelineSetIds,
  getDefaultTimelineSetOrder,
  normalizeTimelineSetOrder,
} from "@/lib/catalog/timelineSets";
import {
  STATIC_TIMELINE_CATALOG,
  type TimelineCatalogSnapshot,
} from "@/lib/catalog/timelineCatalog";

export type StoredLayerToggleMode = "auto" | "manual-on" | "manual-off";

type TimelineLayerStorageState = {
  version: 2;
  enabledIdsByScope?: Record<string, string[]>;
  expandedIdsByScope?: Record<string, string[]>;
  orderedIdsByScope?: Record<string, string[]>;
  toggleModesByScope?: Record<string, Record<string, StoredLayerToggleMode>>;
  ui?: Record<string, unknown>;
};

const TIMELINE_LAYER_STATE_STORAGE_KEY = "timeline:layer-state:v2";
const SET_COLLECTION_SCOPE = "timeline-sets:collection";
const SET_VISIBLE_SCOPE = "timeline-sets:visible";
const SET_EXPANDED_SCOPE = "timeline-sets:expanded";
const SET_ORDER_SCOPE = "timeline-sets:order";
const GROUP_ENABLED_SCOPE = "timeline-groups:enabled";
const GROUP_AUTO_TOGGLE_SCOPE = "timeline-groups:auto-toggle";
const SIDEBAR_OPEN_UI_KEY = "sidebarOpen";
const MAP_PREVIEW_ENABLED_UI_KEY = "mapPreviewEnabled";

const LEGACY_STORAGE_KEYS = {
  enabledGroups: "timeline:enabled-group-ids:v1",
  enabledSets: "timeline:enabled-set-ids:v1",
  expandedSets: "timeline:expanded-set-ids:v1",
  humanEvolutionToggleMode: "timeline:human-evolution-toggle-mode:v1",
  setOrder: "timeline:set-order:v1",
  sidebarOpen: "timeline:sidebar-open:v1",
  visibleSets: "timeline:visible-set-ids:v1",
} as const;

const LEGACY_HUMAN_EVOLUTION_GROUP_ID = "human-evolution";

function isStoredLayerToggleMode(value: unknown): value is StoredLayerToggleMode {
  return value === "auto" || value === "manual-on" || value === "manual-off";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function dedupeStrings(values: readonly string[]) {
  return Array.from(new Set(values));
}

function readJsonFromStorage(key: string): unknown {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function writeJsonToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures; state still works in memory.
  }
}

function readLegacyStringArray(key: string) {
  const parsed = readJsonFromStorage(key);

  return isStringArray(parsed) ? dedupeStrings(parsed) : null;
}

function readLegacySidebarOpen() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const storedValue = window.localStorage.getItem(
      LEGACY_STORAGE_KEYS.sidebarOpen,
    );

    if (storedValue === "true") {
      return true;
    }

    if (storedValue === "false") {
      return false;
    }
  } catch {
    // Fall through to undefined.
  }

  return undefined;
}

function createEmptyLayerStorageState(): TimelineLayerStorageState {
  return {
    version: 2,
    enabledIdsByScope: {},
    expandedIdsByScope: {},
    orderedIdsByScope: {},
    toggleModesByScope: {},
    ui: {},
  };
}

function migrateLegacyLayerStorageState(): TimelineLayerStorageState {
  const state = createEmptyLayerStorageState();
  const enabledSets = readLegacyStringArray(LEGACY_STORAGE_KEYS.enabledSets);
  const visibleSets = readLegacyStringArray(LEGACY_STORAGE_KEYS.visibleSets);
  const expandedSets = readLegacyStringArray(LEGACY_STORAGE_KEYS.expandedSets);
  const enabledGroups = readLegacyStringArray(LEGACY_STORAGE_KEYS.enabledGroups);
  const setOrder = readLegacyStringArray(LEGACY_STORAGE_KEYS.setOrder);
  const sidebarOpen = readLegacySidebarOpen();

  if (enabledSets) {
    state.enabledIdsByScope![SET_COLLECTION_SCOPE] = enabledSets;
  }

  if (visibleSets) {
    state.enabledIdsByScope![SET_VISIBLE_SCOPE] = visibleSets;
  }

  if (expandedSets) {
    state.expandedIdsByScope![SET_EXPANDED_SCOPE] = expandedSets;
  }

  if (enabledGroups) {
    state.enabledIdsByScope![GROUP_ENABLED_SCOPE] = enabledGroups;
  }

  if (setOrder) {
    state.orderedIdsByScope![SET_ORDER_SCOPE] = setOrder;
  }

  const legacyHumanEvolutionToggleMode =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(
          LEGACY_STORAGE_KEYS.humanEvolutionToggleMode,
        );

  if (isStoredLayerToggleMode(legacyHumanEvolutionToggleMode)) {
    state.toggleModesByScope![GROUP_AUTO_TOGGLE_SCOPE] = {
      [LEGACY_HUMAN_EVOLUTION_GROUP_ID]: legacyHumanEvolutionToggleMode,
    };
  }

  if (sidebarOpen !== undefined) {
    state.ui![SIDEBAR_OPEN_UI_KEY] = sidebarOpen;
  }

  return state;
}

function normalizeLayerStorageState(
  candidate: unknown,
): TimelineLayerStorageState | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const value = candidate as Partial<TimelineLayerStorageState>;

  if (value.version !== 2) {
    return null;
  }

  return {
    version: 2,
    enabledIdsByScope: value.enabledIdsByScope ?? {},
    expandedIdsByScope: value.expandedIdsByScope ?? {},
    orderedIdsByScope: value.orderedIdsByScope ?? {},
    toggleModesByScope: value.toggleModesByScope ?? {},
    ui: value.ui ?? {},
  };
}

function readLayerStorageState() {
  return (
    normalizeLayerStorageState(
      readJsonFromStorage(TIMELINE_LAYER_STATE_STORAGE_KEY),
    ) ?? migrateLegacyLayerStorageState()
  );
}

function writeLayerStorageState(state: TimelineLayerStorageState) {
  writeJsonToStorage(TIMELINE_LAYER_STATE_STORAGE_KEY, state);
}

function readScopedIds(
  kind: "enabledIdsByScope" | "expandedIdsByScope" | "orderedIdsByScope",
  scope: string,
  fallback: () => readonly string[],
) {
  const state = readLayerStorageState();
  const storedIds = state[kind]?.[scope];

  return dedupeStrings(isStringArray(storedIds) ? storedIds : fallback());
}

function writeScopedIds(
  kind: "enabledIdsByScope" | "expandedIdsByScope" | "orderedIdsByScope",
  scope: string,
  ids: readonly string[],
) {
  const state = readLayerStorageState();

  state[kind] = {
    ...(state[kind] ?? {}),
    [scope]: dedupeStrings(ids),
  };

  writeLayerStorageState(state);
}

export function readStoredTimelineSetOrder(
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
) {
  return normalizeTimelineSetOrder(
    readScopedIds(
      "orderedIdsByScope",
      SET_ORDER_SCOPE,
      () => getDefaultTimelineSetOrder(catalog),
    ),
    catalog,
  );
}

export function readStoredEnabledSetIds(
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
) {
  return new Set(
    readScopedIds(
      "enabledIdsByScope",
      SET_COLLECTION_SCOPE,
      () => Array.from(getDefaultEnabledTimelineSetIds(catalog)),
    ).filter((setId) => Boolean(catalog.setsById[setId as TimelineSetId])),
  ) as Set<TimelineSetId>;
}

export function readStoredEnabledGroupIds(
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
) {
  return new Set(
    readScopedIds(
      "enabledIdsByScope",
      GROUP_ENABLED_SCOPE,
      () => Array.from(getDefaultEnabledTimelineGroupIds(catalog)),
    ).filter((groupId) => Boolean(catalog.groupsById[groupId])),
  );
}

export function readStoredGroupToggleMode(
  groupId: string,
): StoredLayerToggleMode {
  const mode =
    readLayerStorageState().toggleModesByScope?.[GROUP_AUTO_TOGGLE_SCOPE]?.[
      groupId
    ];

  return isStoredLayerToggleMode(mode) ? mode : "auto";
}

export function readStoredExpandedSetIds() {
  return new Set(
    readScopedIds("expandedIdsByScope", SET_EXPANDED_SCOPE, () => []),
  ) as Set<TimelineSetId>;
}

export function readStoredVisibleSetIds(
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
) {
  return new Set(
    readScopedIds(
      "enabledIdsByScope",
      SET_VISIBLE_SCOPE,
      () => Array.from(readStoredEnabledSetIds(catalog)),
    ).filter((setId) => Boolean(catalog.setsById[setId as TimelineSetId])),
  ) as Set<TimelineSetId>;
}

export function writeStoredEnabledSetIds(setIds: ReadonlySet<TimelineSetId>) {
  writeScopedIds("enabledIdsByScope", SET_COLLECTION_SCOPE, Array.from(setIds));
}

export function writeStoredEnabledGroupIds(groupIds: ReadonlySet<string>) {
  writeScopedIds("enabledIdsByScope", GROUP_ENABLED_SCOPE, Array.from(groupIds));
}

export function writeStoredGroupToggleMode(
  groupId: string,
  mode: StoredLayerToggleMode,
) {
  const state = readLayerStorageState();

  state.toggleModesByScope = {
    ...(state.toggleModesByScope ?? {}),
    [GROUP_AUTO_TOGGLE_SCOPE]: {
      ...(state.toggleModesByScope?.[GROUP_AUTO_TOGGLE_SCOPE] ?? {}),
      [groupId]: mode,
    },
  };

  writeLayerStorageState(state);
}

export function writeStoredExpandedSetIds(setIds: ReadonlySet<TimelineSetId>) {
  writeScopedIds("expandedIdsByScope", SET_EXPANDED_SCOPE, Array.from(setIds));
}

export function writeStoredVisibleSetIds(setIds: ReadonlySet<TimelineSetId>) {
  writeScopedIds("enabledIdsByScope", SET_VISIBLE_SCOPE, Array.from(setIds));
}

export function writeStoredTimelineSetOrder(
  setIds: readonly TimelineSetId[],
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
) {
  writeScopedIds(
    "orderedIdsByScope",
    SET_ORDER_SCOPE,
    normalizeTimelineSetOrder(setIds, catalog),
  );
}

export function readStoredSidebarOpen(): boolean | null {
  const value = readLayerStorageState().ui?.[SIDEBAR_OPEN_UI_KEY];

  return typeof value === "boolean" ? value : null;
}

export function writeStoredSidebarOpen(value: boolean) {
  const state = readLayerStorageState();

  state.ui = {
    ...(state.ui ?? {}),
    [SIDEBAR_OPEN_UI_KEY]: value,
  };

  writeLayerStorageState(state);
}

export function readStoredMapPreviewEnabled(): boolean {
  const value = readLayerStorageState().ui?.[MAP_PREVIEW_ENABLED_UI_KEY];

  return typeof value === "boolean" ? value : false;
}

export function writeStoredMapPreviewEnabled(value: boolean) {
  const state = readLayerStorageState();

  state.ui = {
    ...(state.ui ?? {}),
    [MAP_PREVIEW_ENABLED_UI_KEY]: value,
  };

  writeLayerStorageState(state);
}
