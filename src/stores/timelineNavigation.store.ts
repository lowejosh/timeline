import { create } from "zustand";

import { ROOT_ERA } from "@/lib/catalog/eras";

export type TimelineActiveView = "timeline" | "available-sets" | "create-set";

export type ExpandOverlayRequest = {
  overlayId: string;
  seq: number;
};

type TimelineNavigationState = {
  activeEraId: string;
  activeView: TimelineActiveView;
  editingCustomSetId: string | null;
  expandOverlayRequest: ExpandOverlayRequest | null;
  expandOverlaySeq: number;
};

type TimelineNavigationActions = {
  openCreateSet: () => void;
  openEditCustomSet: (setId: string) => void;
  requestExpandOverlay: (overlayId: string) => void;
  resetActiveEra: () => void;
  setActiveEraId: (activeEraId: string) => void;
  setActiveView: (activeView: TimelineActiveView) => void;
};

export type TimelineNavigationStore = TimelineNavigationState &
  TimelineNavigationActions;

export const useTimelineNavigationStore = create<TimelineNavigationStore>(
  (set) => ({
    activeEraId: ROOT_ERA.id,
    activeView: "timeline",
    editingCustomSetId: null,
    expandOverlayRequest: null,
    expandOverlaySeq: 0,

    openCreateSet: () => {
      set({ activeView: "create-set", editingCustomSetId: null });
    },

    openEditCustomSet: (setId) => {
      set({ activeView: "create-set", editingCustomSetId: setId });
    },

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

    setActiveView: (activeView) => {
      set((state) => ({
        activeView,
        editingCustomSetId:
          activeView === "create-set" ? state.editingCustomSetId : null,
      }));
    },
  }),
);
