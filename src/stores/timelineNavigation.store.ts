import { create } from "zustand";

import { ROOT_ERA } from "@/lib/catalog/eras";

export type ExpandOverlayRequest = {
  overlayId: string;
  seq: number;
};

type TimelineNavigationState = {
  activeEraId: string;
  expandOverlayRequest: ExpandOverlayRequest | null;
  expandOverlaySeq: number;
};

type TimelineNavigationActions = {
  requestExpandOverlay: (overlayId: string) => void;
  resetActiveEra: () => void;
  setActiveEraId: (activeEraId: string) => void;
};

export type TimelineNavigationStore = TimelineNavigationState &
  TimelineNavigationActions;

export const useTimelineNavigationStore = create<TimelineNavigationStore>(
  (set) => ({
    activeEraId: ROOT_ERA.id,
    expandOverlayRequest: null,
    expandOverlaySeq: 0,

    requestExpandOverlay: (overlayId) => {
      set((state) => {
        const seq = state.expandOverlaySeq + 1;

        return {
          expandOverlayRequest: { overlayId, seq },
          expandOverlaySeq: seq,
        };
      });
    },

    resetActiveEra: () => {
      set({ activeEraId: ROOT_ERA.id });
    },

    setActiveEraId: (activeEraId) => {
      set({ activeEraId });
    },
  }),
);
