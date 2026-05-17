import { useMemo } from "react";

import { getDefaultEnabledTimelineGroupIds } from "@/lib/catalog/decorations";
import {
  HUMAN_EVOLUTION_GROUP_ID,
  useTimelineLayerStore,
} from "@/stores/timelineLayer.store";
import { useTimelineNavigationStore } from "@/stores/timelineNavigation.store";
import { useTimelineUiStore } from "@/stores/timelineUi.store";

export const useActiveView = () =>
  useTimelineNavigationStore((state) => state.activeView);

export const useIsSidebarOpen = () =>
  useTimelineUiStore((state) => state.isSidebarOpen);

export const useIsKeyboardHelpOpen = () =>
  useTimelineUiStore((state) => state.isKeyboardHelpOpen);

export const useIsSearchOpen = () =>
  useTimelineUiStore((state) => state.isSearchOpen);

export const useIsSettingsOpen = () =>
  useTimelineUiStore((state) => state.isSettingsOpen);

export const useIsCosmicCalendarMode = () =>
  useTimelineUiStore((state) => state.isCosmicCalendarMode);

export const useIsMapPreviewEnabled = () =>
  useTimelineUiStore((state) => state.isMapPreviewEnabled);

export function useTimelineSearchScope() {
  const manualEnabledGroupIds = useTimelineLayerStore(
    (state) => state.manualEnabledGroupIds,
  );
  const humanEvolutionToggleMode = useTimelineLayerStore(
    (state) => state.humanEvolutionToggleMode,
  );
  const visibleSetIds = useTimelineLayerStore((state) => state.visibleSetIds);
  const defaultEnabledGroupIds = useMemo(
    () => getDefaultEnabledTimelineGroupIds(),
    [],
  );
  const enabledGroupIds = useMemo(() => {
    const next = new Set(manualEnabledGroupIds);

    if (humanEvolutionToggleMode === "manual-on") {
      next.add(HUMAN_EVOLUTION_GROUP_ID);
    } else if (humanEvolutionToggleMode === "manual-off") {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    } else if (defaultEnabledGroupIds.has(HUMAN_EVOLUTION_GROUP_ID)) {
      next.add(HUMAN_EVOLUTION_GROUP_ID);
    } else {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    }

    return next;
  }, [defaultEnabledGroupIds, humanEvolutionToggleMode, manualEnabledGroupIds]);

  return {
    enabledGroupIds,
    enabledSetIds: visibleSetIds,
  };
}

export function useAppActions() {
  const closeKeyboardHelp = useTimelineUiStore(
    (state) => state.closeKeyboardHelp,
  );
  const setIsKeyboardHelpOpen = useTimelineUiStore(
    (state) => state.setIsKeyboardHelpOpen,
  );
  const setIsSearchOpen = useTimelineUiStore(
    (state) => state.setIsSearchOpen,
  );
  const setIsSettingsOpen = useTimelineUiStore(
    (state) => state.setIsSettingsOpen,
  );
  const setIsSidebarOpen = useTimelineUiStore(
    (state) => state.setIsSidebarOpen,
  );
  const setIsCosmicCalendarMode = useTimelineUiStore(
    (state) => state.setIsCosmicCalendarMode,
  );
  const setIsMapPreviewEnabled = useTimelineUiStore(
    (state) => state.setIsMapPreviewEnabled,
  );
  const toggleKeyboardHelp = useTimelineUiStore(
    (state) => state.toggleKeyboardHelp,
  );
  const toggleSearch = useTimelineUiStore((state) => state.toggleSearch);

  return useMemo(
    () => ({
      closeKeyboardHelp,
      setIsCosmicCalendarMode,
      setIsKeyboardHelpOpen,
      setIsMapPreviewEnabled,
      setIsSearchOpen,
      setIsSettingsOpen,
      setIsSidebarOpen,
      toggleKeyboardHelp,
      toggleSearch,
    }),
    [
      closeKeyboardHelp,
      setIsCosmicCalendarMode,
      setIsKeyboardHelpOpen,
      setIsMapPreviewEnabled,
      setIsSearchOpen,
      setIsSettingsOpen,
      setIsSidebarOpen,
      toggleKeyboardHelp,
      toggleSearch,
    ],
  );
}
