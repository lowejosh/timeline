import { create } from "zustand";

import { TIMELINE_DECORATION_CATEGORY_IDS } from "@/lib/catalog/decorations";
import {
  normalizeTimelineSetOrder,
  TIMELINE_SETS_BY_ID,
} from "@/lib/catalog/timelineSets";
import type { TimelineSetId } from "@/lib/catalog/eras";
import {
  readStoredEnabledGroupIds,
  readStoredEnabledSetIds,
  readStoredExpandedSetIds,
  readStoredGroupToggleMode,
  readStoredTimelineSetOrder,
  readStoredVisibleSetIds,
  writeStoredEnabledGroupIds,
  writeStoredEnabledSetIds,
  writeStoredExpandedSetIds,
  writeStoredGroupToggleMode,
  writeStoredTimelineSetOrder,
  writeStoredVisibleSetIds,
  type StoredLayerToggleMode,
} from "@/lib/app/timelineSetStorage";

export type LayerAutoToggleMode = StoredLayerToggleMode;

export const HUMAN_EVOLUTION_GROUP_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution;
const COMPUTING_SET_ID = "computing" satisfies TimelineSetId;
const COMPUTER_MODELS_GROUP_ID = "computer-models";

type TimelineLayerState = {
  autoSuppressedGroupIds: Set<string>;
  enabledSetIds: Set<TimelineSetId>;
  expandedSetIds: Set<TimelineSetId>;
  humanEvolutionToggleMode: LayerAutoToggleMode;
  manualEnabledGroupIds: Set<string>;
  orderedSetIds: TimelineSetId[];
  overlayVisibilityTransitionSeed: number;
  visibleSetIds: Set<TimelineSetId>;
};

type TimelineLayerActions = {
  applySetLibrary: (
    nextEnabledSetIds: ReadonlySet<TimelineSetId>,
    nextOrderedSetIds: readonly TimelineSetId[],
  ) => void;
  ensureGroupsEnabled: (groupIds: readonly string[]) => void;
  ensureSetVisible: (setId: TimelineSetId) => void;
  reorderSets: (nextSetIds: readonly TimelineSetId[]) => void;
  setAutoSuppressedGroupIds: (groupIds: ReadonlySet<string>) => void;
  setGroupToggleMode: (
    groupId: string,
    mode: LayerAutoToggleMode,
  ) => void;
  toggleEntry: (groupIds: readonly string[], nextEnabled: boolean) => void;
  toggleSetExpanded: (setId: TimelineSetId, nextExpanded: boolean) => void;
  toggleSetVisible: (setId: TimelineSetId, nextVisible: boolean) => void;
  triggerOverlayVisibilityTransition: () => void;
};

export type TimelineLayerStore = TimelineLayerState & TimelineLayerActions;

function getDefaultGroupIdsForSet(setId: TimelineSetId): string[] {
  const set = TIMELINE_SETS_BY_ID[setId];

  if (!set) {
    return [];
  }

  return set.groups
    .filter((group) => group.defaultEnabled !== false)
    .map((group) => group.id);
}

function areSetArraysEqual(
  left: readonly TimelineSetId[],
  right: readonly TimelineSetId[],
) {
  return (
    left.length === right.length &&
    left.every((setId, index) => setId === right[index])
  );
}

function normalizeManualGroupIds(
  enabledSetIds: ReadonlySet<TimelineSetId>,
  manualEnabledGroupIds: ReadonlySet<string>,
) {
  if (
    !enabledSetIds.has(COMPUTING_SET_ID) ||
    manualEnabledGroupIds.has(COMPUTER_MODELS_GROUP_ID)
  ) {
    return new Set(manualEnabledGroupIds);
  }

  const next = new Set(manualEnabledGroupIds);
  next.add(COMPUTER_MODELS_GROUP_ID);
  return next;
}

function writeLayerState({
  enabledSetIds,
  expandedSetIds,
  humanEvolutionToggleMode,
  manualEnabledGroupIds,
  orderedSetIds,
  visibleSetIds,
}: Pick<
  TimelineLayerState,
  | "enabledSetIds"
  | "expandedSetIds"
  | "humanEvolutionToggleMode"
  | "manualEnabledGroupIds"
  | "orderedSetIds"
  | "visibleSetIds"
>) {
  writeStoredEnabledSetIds(enabledSetIds);
  writeStoredExpandedSetIds(expandedSetIds);
  writeStoredEnabledGroupIds(manualEnabledGroupIds);
  writeStoredTimelineSetOrder(orderedSetIds);
  writeStoredVisibleSetIds(visibleSetIds);
  writeStoredGroupToggleMode(HUMAN_EVOLUTION_GROUP_ID, humanEvolutionToggleMode);
}

function createInitialLayerState(): TimelineLayerState {
  const enabledSetIds = readStoredEnabledSetIds();
  const manualEnabledGroupIds = normalizeManualGroupIds(
    enabledSetIds,
    readStoredEnabledGroupIds(),
  );
  const initialState = {
    autoSuppressedGroupIds: new Set<string>(),
    enabledSetIds,
    expandedSetIds: readStoredExpandedSetIds(),
    humanEvolutionToggleMode: readStoredGroupToggleMode(
      HUMAN_EVOLUTION_GROUP_ID,
    ),
    manualEnabledGroupIds,
    orderedSetIds: readStoredTimelineSetOrder(),
    overlayVisibilityTransitionSeed: 0,
    visibleSetIds: readStoredVisibleSetIds(),
  };

  writeLayerState(initialState);
  return initialState;
}

export const useTimelineLayerStore = create<TimelineLayerStore>((set, get) => ({
  ...createInitialLayerState(),

  applySetLibrary: (nextEnabledSetIds, nextOrderedSetIds) => {
    const current = get();
    const enabledSetIds = new Set(nextEnabledSetIds);
    const orderedSetIds = normalizeTimelineSetOrder(nextOrderedSetIds);
    const visibleSetIds = new Set(current.visibleSetIds);
    const addedSetIds = Array.from(enabledSetIds).filter(
      (setId) => !current.enabledSetIds.has(setId),
    );
    let manualEnabledGroupIds = new Set(current.manualEnabledGroupIds);

    for (const setId of Array.from(visibleSetIds)) {
      if (!enabledSetIds.has(setId)) {
        visibleSetIds.delete(setId);
      }
    }

    for (const setId of enabledSetIds) {
      if (!current.enabledSetIds.has(setId)) {
        visibleSetIds.add(setId);
      }
    }

    if (addedSetIds.length > 0) {
      for (const setId of addedSetIds) {
        for (const groupId of getDefaultGroupIdsForSet(setId)) {
          manualEnabledGroupIds.add(groupId);
        }
      }
    }

    manualEnabledGroupIds = normalizeManualGroupIds(
      enabledSetIds,
      manualEnabledGroupIds,
    );

    const next = {
      enabledSetIds,
      expandedSetIds: current.expandedSetIds,
      humanEvolutionToggleMode: current.humanEvolutionToggleMode,
      manualEnabledGroupIds,
      orderedSetIds,
      visibleSetIds,
    };

    writeLayerState(next);
    set({
      ...next,
      overlayVisibilityTransitionSeed:
        current.overlayVisibilityTransitionSeed + 1,
    });
  },

  ensureGroupsEnabled: (groupIds) => {
    const current = get();
    let changed = false;
    const manualEnabledGroupIds = new Set(current.manualEnabledGroupIds);
    let humanEvolutionToggleMode = current.humanEvolutionToggleMode;

    for (const groupId of groupIds) {
      if (!manualEnabledGroupIds.has(groupId)) {
        manualEnabledGroupIds.add(groupId);
        changed = true;
      }

      if (
        groupId === HUMAN_EVOLUTION_GROUP_ID &&
        humanEvolutionToggleMode !== "manual-on"
      ) {
        humanEvolutionToggleMode = "manual-on";
        changed = true;
      }
    }

    if (!changed) {
      return;
    }

    const next = {
      enabledSetIds: current.enabledSetIds,
      expandedSetIds: current.expandedSetIds,
      humanEvolutionToggleMode,
      manualEnabledGroupIds,
      orderedSetIds: current.orderedSetIds,
      visibleSetIds: current.visibleSetIds,
    };

    writeLayerState(next);
    set({
      humanEvolutionToggleMode,
      manualEnabledGroupIds,
      overlayVisibilityTransitionSeed:
        current.overlayVisibilityTransitionSeed + 1,
    });
  },

  ensureSetVisible: (setId) => {
    const current = get();

    if (current.visibleSetIds.has(setId)) {
      return;
    }

    const visibleSetIds = new Set(current.visibleSetIds);
    visibleSetIds.add(setId);
    writeStoredVisibleSetIds(visibleSetIds);
    set({ visibleSetIds });
  },

  reorderSets: (nextSetIds) => {
    const current = get();
    const orderedSetIds = normalizeTimelineSetOrder(nextSetIds);
    const normalizedCurrent = normalizeTimelineSetOrder(current.orderedSetIds);

    if (areSetArraysEqual(normalizedCurrent, orderedSetIds)) {
      return;
    }

    writeStoredTimelineSetOrder(orderedSetIds);
    set({ orderedSetIds });
  },

  setAutoSuppressedGroupIds: (groupIds) => {
    const current = get();
    const currentSignature = Array.from(current.autoSuppressedGroupIds)
      .sort()
      .join("|");
    const nextSignature = Array.from(groupIds).sort().join("|");

    if (currentSignature === nextSignature) {
      return;
    }

    set({ autoSuppressedGroupIds: new Set(groupIds) });
  },

  setGroupToggleMode: (groupId, mode) => {
    if (groupId !== HUMAN_EVOLUTION_GROUP_ID) {
      return;
    }

    const current = get();

    if (current.humanEvolutionToggleMode === mode) {
      return;
    }

    writeStoredGroupToggleMode(groupId, mode);
    set({ humanEvolutionToggleMode: mode });
  },

  toggleEntry: (groupIds, nextEnabled) => {
    const current = get();
    const manualEnabledGroupIds = new Set(current.manualEnabledGroupIds);
    let humanEvolutionToggleMode = current.humanEvolutionToggleMode;

    if (groupIds.includes(HUMAN_EVOLUTION_GROUP_ID)) {
      humanEvolutionToggleMode = nextEnabled ? "manual-on" : "manual-off";
    }

    for (const groupId of groupIds) {
      if (nextEnabled) {
        manualEnabledGroupIds.add(groupId);
      } else {
        manualEnabledGroupIds.delete(groupId);
      }
    }

    const next = {
      enabledSetIds: current.enabledSetIds,
      expandedSetIds: current.expandedSetIds,
      humanEvolutionToggleMode,
      manualEnabledGroupIds,
      orderedSetIds: current.orderedSetIds,
      visibleSetIds: current.visibleSetIds,
    };

    writeLayerState(next);
    set({
      humanEvolutionToggleMode,
      manualEnabledGroupIds,
      overlayVisibilityTransitionSeed:
        current.overlayVisibilityTransitionSeed + 1,
    });
  },

  toggleSetExpanded: (setId, nextExpanded) => {
    const current = get();
    const expandedSetIds = new Set(current.expandedSetIds);

    if (nextExpanded) {
      expandedSetIds.add(setId);
    } else {
      expandedSetIds.delete(setId);
    }

    writeStoredExpandedSetIds(expandedSetIds);
    set({ expandedSetIds });
  },

  toggleSetVisible: (setId, nextVisible) => {
    const current = get();
    const visibleSetIds = new Set(current.visibleSetIds);

    if (nextVisible) {
      visibleSetIds.add(setId);
    } else {
      visibleSetIds.delete(setId);
    }

    writeStoredVisibleSetIds(visibleSetIds);
    set({
      visibleSetIds,
      overlayVisibilityTransitionSeed:
        current.overlayVisibilityTransitionSeed + 1,
    });
  },

  triggerOverlayVisibilityTransition: () => {
    set((state) => ({
      overlayVisibilityTransitionSeed: state.overlayVisibilityTransitionSeed + 1,
    }));
  },
}));
