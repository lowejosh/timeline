import { useMemo } from "react";

import { useRouteView } from "@/app/routePaths";
import { useTimelineNavigationStore } from "@/stores/timelineNavigation.store";
import { useTimelineUiStore } from "@/stores/timelineUi.store";

export const useActiveView = useRouteView;

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
