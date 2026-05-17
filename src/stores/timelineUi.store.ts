import { create } from "zustand";

import { shouldUseMobileTimelineDrawer } from "@/lib/app/layout";
import {
  readStoredMapPreviewEnabled,
  readStoredSidebarOpen,
  writeStoredMapPreviewEnabled,
  writeStoredSidebarOpen,
} from "@/lib/app/timelineSetStorage";

type TimelineUiState = {
  isCosmicCalendarMode: boolean;
  isKeyboardHelpOpen: boolean;
  isMapPreviewEnabled: boolean;
  isSearchOpen: boolean;
  isSettingsOpen: boolean;
  isSidebarOpen: boolean;
  hasResolvedInitialSidebarVisibility: boolean;
};

type TimelineUiActions = {
  closeKeyboardHelp: () => void;
  resolveInitialSidebarVisibility: (width: number, height: number) => void;
  setIsCosmicCalendarMode: (
    value: boolean | ((current: boolean) => boolean),
  ) => void;
  setIsKeyboardHelpOpen: (
    value: boolean | ((current: boolean) => boolean),
  ) => void;
  setIsMapPreviewEnabled: (
    value: boolean | ((current: boolean) => boolean),
  ) => void;
  setIsSearchOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  setIsSettingsOpen: (
    value: boolean | ((current: boolean) => boolean),
  ) => void;
  setIsSidebarOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  toggleKeyboardHelp: () => void;
  toggleSearch: () => void;
};

export type TimelineUiStore = TimelineUiState & TimelineUiActions;

function resolveBooleanUpdate(
  value: boolean | ((current: boolean) => boolean),
  current: boolean,
) {
  return typeof value === "function" ? value(current) : value;
}

function shouldStartWithSidebarOpen() {
  const stored = readStoredSidebarOpen();

  if (stored !== null) {
    return stored;
  }

  if (typeof window === "undefined") {
    return true;
  }

  return !shouldUseMobileTimelineDrawer(window.innerWidth, window.innerHeight);
}

export const useTimelineUiStore = create<TimelineUiStore>((set, get) => ({
  hasResolvedInitialSidebarVisibility: false,
  isCosmicCalendarMode: false,
  isKeyboardHelpOpen: false,
  isMapPreviewEnabled: readStoredMapPreviewEnabled(),
  isSearchOpen: false,
  isSettingsOpen: false,
  isSidebarOpen: shouldStartWithSidebarOpen(),

  closeKeyboardHelp: () => {
    set({ isKeyboardHelpOpen: false });
  },

  resolveInitialSidebarVisibility: (width, height) => {
    const current = get();

    if (
      current.hasResolvedInitialSidebarVisibility ||
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    if (readStoredSidebarOpen() !== null) {
      set({ hasResolvedInitialSidebarVisibility: true });
      return;
    }

    const isSidebarOpen = !shouldUseMobileTimelineDrawer(width, height);
    writeStoredSidebarOpen(isSidebarOpen);
    set({
      hasResolvedInitialSidebarVisibility: true,
      isSidebarOpen,
    });
  },

  setIsCosmicCalendarMode: (value) => {
    set((state) => ({
      isCosmicCalendarMode: resolveBooleanUpdate(
        value,
        state.isCosmicCalendarMode,
      ),
    }));
  },

  setIsKeyboardHelpOpen: (value) => {
    set((state) => {
      const isKeyboardHelpOpen = resolveBooleanUpdate(
        value,
        state.isKeyboardHelpOpen,
      );

      return {
        isKeyboardHelpOpen,
        isSearchOpen: isKeyboardHelpOpen ? false : state.isSearchOpen,
      };
    });
  },

  setIsMapPreviewEnabled: (value) => {
    const isMapPreviewEnabled = resolveBooleanUpdate(
      value,
      get().isMapPreviewEnabled,
    );

    writeStoredMapPreviewEnabled(isMapPreviewEnabled);
    set({ isMapPreviewEnabled });
  },

  setIsSearchOpen: (value) => {
    set((state) => {
      const isSearchOpen = resolveBooleanUpdate(value, state.isSearchOpen);

      return {
        isKeyboardHelpOpen: isSearchOpen ? false : state.isKeyboardHelpOpen,
        isSearchOpen,
      };
    });
  },

  setIsSettingsOpen: (value) => {
    set((state) => ({
      isSettingsOpen: resolveBooleanUpdate(value, state.isSettingsOpen),
    }));
  },

  setIsSidebarOpen: (value) => {
    const isSidebarOpen = resolveBooleanUpdate(value, get().isSidebarOpen);

    writeStoredSidebarOpen(isSidebarOpen);
    set({ isSidebarOpen });
  },

  toggleKeyboardHelp: () => {
    set((state) => {
      const isKeyboardHelpOpen = !state.isKeyboardHelpOpen;

      return {
        isKeyboardHelpOpen,
        isSearchOpen: isKeyboardHelpOpen ? false : state.isSearchOpen,
      };
    });
  },

  toggleSearch: () => {
    set((state) => {
      const isSearchOpen = !state.isSearchOpen;

      return {
        isKeyboardHelpOpen: isSearchOpen ? false : state.isKeyboardHelpOpen,
        isSearchOpen,
      };
    });
  },
}));
