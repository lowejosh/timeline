import {
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
  useCallback,
} from "react";

import { moveItem } from "@/lib/ui/reorder";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import type { ColumnId, DraftColumns } from "../AvailableSetsPage.types";
import { reorderVisibleSubset } from "../AvailableSets.utils";

type UseAvailableSetsKeyboardReorderArgs = {
  onToggleDraft: (setId: TimelineSetId, nextEnabled: boolean) => void;
  setDraftColumns: Dispatch<SetStateAction<DraftColumns>>;
  visibleAvailableSetIds: readonly TimelineSetId[];
};

function getKeyboardTargetIndex(
  key: string,
  currentIndex: number,
  length: number,
) {
  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return length - 1;
  }

  if (key === "ArrowUp") {
    return Math.max(0, currentIndex - 1);
  }

  if (key === "ArrowDown") {
    return Math.min(length - 1, currentIndex + 1);
  }

  return currentIndex;
}

export function useAvailableSetsKeyboardReorder({
  onToggleDraft,
  setDraftColumns,
  visibleAvailableSetIds,
}: UseAvailableSetsKeyboardReorderArgs) {
  return useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      setId: TimelineSetId,
      columnId: ColumnId,
    ) => {
      const key = event.key;

      if (
        ![
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ].includes(key)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (key === "ArrowLeft" && columnId === "available") {
        onToggleDraft(setId, true);
        return;
      }

      if (key === "ArrowRight" && columnId === "enabled") {
        onToggleDraft(setId, false);
        return;
      }

      setDraftColumns((current) => {
        if (columnId === "enabled") {
          const currentIndex = current.enabled.indexOf(setId);

          if (currentIndex < 0) {
            return current;
          }

          const targetIndex = getKeyboardTargetIndex(
            key,
            currentIndex,
            current.enabled.length,
          );

          if (targetIndex === currentIndex) {
            return current;
          }

          return {
            ...current,
            enabled: moveItem(current.enabled, currentIndex, targetIndex),
          };
        }

        const visibleOrder = visibleAvailableSetIds.filter((candidate) =>
          current.available.includes(candidate),
        );
        const currentIndex = visibleOrder.indexOf(setId);

        if (currentIndex < 0) {
          return current;
        }

        const targetIndex = getKeyboardTargetIndex(
          key,
          currentIndex,
          visibleOrder.length,
        );

        if (targetIndex === currentIndex) {
          return current;
        }

        return {
          ...current,
          available: reorderVisibleSubset(
            current.available,
            visibleOrder,
            setId,
            targetIndex,
          ),
        };
      });
    },
    [onToggleDraft, setDraftColumns, visibleAvailableSetIds],
  );
}
