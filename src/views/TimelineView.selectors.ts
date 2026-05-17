import { useMemo } from "react";

import { useTimelineNavigationStore } from "@/stores/timelineNavigationStore";
import { useTimelineUiStore } from "@/stores/timelineUiStore";

export const useActiveView = () =>
  useTimelineNavigationStore((state) => state.activeView);

export const useExpandOverlayRequest = () =>
  useTimelineNavigationStore((state) => state.expandOverlayRequest);

export const useIsCosmicCalendarMode = () =>
  useTimelineUiStore((state) => state.isCosmicCalendarMode);

export const useIsMapPreviewEnabled = () =>
  useTimelineUiStore((state) => state.isMapPreviewEnabled);

export function useTimelineViewActions() {
  const setIsMapPreviewEnabled = useTimelineUiStore(
    (state) => state.setIsMapPreviewEnabled,
  );

  return useMemo(
    () => ({
      closeMapPreview: () => setIsMapPreviewEnabled(false),
    }),
    [setIsMapPreviewEnabled],
  );
}
