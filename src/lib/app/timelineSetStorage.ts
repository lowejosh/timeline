import type { TimelineSetId } from "@/lib/core/timelineTypes";
import {
  getDefaultEnabledTimelineSetIds,
  getDefaultTimelineSetOrder,
  normalizeTimelineSetOrder,
} from "@/lib/catalog/timelineSets";

const TIMELINE_SET_ORDER_STORAGE_KEY = "timeline:set-order:v1";
const TIMELINE_ENABLED_SET_IDS_STORAGE_KEY = "timeline:enabled-set-ids:v1";
const TIMELINE_EXPANDED_SET_IDS_STORAGE_KEY = "timeline:expanded-set-ids:v1";
const TIMELINE_VISIBLE_SET_IDS_STORAGE_KEY = "timeline:visible-set-ids:v1";
const TIMELINE_SIDEBAR_OPEN_STORAGE_KEY = "timeline:sidebar-open:v1";

function readTimelineSetIdSet(
  key: string,
  fallback: () => Set<TimelineSetId>,
) {
  if (typeof window === "undefined") {
    return fallback();
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallback();
    }

    const parsed = JSON.parse(storedValue);

    if (!Array.isArray(parsed)) {
      return fallback();
    }

    return new Set(
      parsed.filter((id): id is TimelineSetId => typeof id === "string"),
    );
  } catch {
    return fallback();
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

export function readStoredTimelineSetOrder() {
  if (typeof window === "undefined") {
    return getDefaultTimelineSetOrder();
  }

  try {
    const storedValue = window.localStorage.getItem(
      TIMELINE_SET_ORDER_STORAGE_KEY,
    );

    if (!storedValue) {
      return getDefaultTimelineSetOrder();
    }

    const parsed = JSON.parse(storedValue);

    return normalizeTimelineSetOrder(
      Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : undefined,
    );
  } catch {
    return getDefaultTimelineSetOrder();
  }
}

export function readStoredEnabledSetIds() {
  return readTimelineSetIdSet(
    TIMELINE_ENABLED_SET_IDS_STORAGE_KEY,
    getDefaultEnabledTimelineSetIds,
  );
}

export function readStoredExpandedSetIds() {
  return readTimelineSetIdSet(
    TIMELINE_EXPANDED_SET_IDS_STORAGE_KEY,
    () => new Set(),
  );
}

export function readStoredVisibleSetIds() {
  return readTimelineSetIdSet(
    TIMELINE_VISIBLE_SET_IDS_STORAGE_KEY,
    readStoredEnabledSetIds,
  );
}

export function writeStoredEnabledSetIds(setIds: ReadonlySet<TimelineSetId>) {
  writeJsonToStorage(TIMELINE_ENABLED_SET_IDS_STORAGE_KEY, Array.from(setIds));
}

export function writeStoredExpandedSetIds(setIds: ReadonlySet<TimelineSetId>) {
  writeJsonToStorage(TIMELINE_EXPANDED_SET_IDS_STORAGE_KEY, Array.from(setIds));
}

export function writeStoredVisibleSetIds(setIds: ReadonlySet<TimelineSetId>) {
  writeJsonToStorage(TIMELINE_VISIBLE_SET_IDS_STORAGE_KEY, Array.from(setIds));
}

export function writeStoredTimelineSetOrder(setIds: readonly TimelineSetId[]) {
  writeJsonToStorage(
    TIMELINE_SET_ORDER_STORAGE_KEY,
    normalizeTimelineSetOrder(setIds),
  );
}

export function readStoredSidebarOpen(): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(
      TIMELINE_SIDEBAR_OPEN_STORAGE_KEY,
    );

    if (storedValue === null) {
      return null;
    }

    return storedValue === "true";
  } catch {
    return null;
  }
}

export function writeStoredSidebarOpen(value: boolean) {
  writeJsonToStorage(TIMELINE_SIDEBAR_OPEN_STORAGE_KEY, value);
}
