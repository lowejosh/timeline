import {
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { TimelineSetId } from "@/lib/core/timelineTypes";
import { useGlobalPointerDrag } from "@/hooks/useGlobalPointerDrag";
import {
  REORDER_EASING,
  REORDER_SETTLE_MS,
  moveItem,
} from "@/lib/ui/reorder";
import type {
  ColumnId,
  ColumnLayoutSnapshot,
  DragState,
  DraftColumns,
} from "../AvailableSetsPage.types";
import {
  estimateGap,
  getDropColumn,
  getPreviewTopBySetId,
  getProjectedIndex,
  insertIntoFilteredColumn,
  insertItem,
  removeItem,
  reorderVisibleSubset,
} from "../utils/availableSetsPage";

export function useAvailableSetsDrag(
  draftColumns: DraftColumns,
  visibleAvailableSetIds: readonly TimelineSetId[],
  setDraftColumns: Dispatch<SetStateAction<DraftColumns>>,
  onMovedToEnabled: (setId: TimelineSetId) => void,
  onMovedToAvailable: (setId: TimelineSetId) => void,
) {
  const enabledColumnRef = useRef<HTMLDivElement | null>(null);
  const availableColumnRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<TimelineSetId, HTMLElement>());
  const previousRectsRef = useRef(new Map<TimelineSetId, DOMRect>());
  const previousSignatureRef = useRef<string | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const visibleSignature = `${draftColumns.enabled.join("|")}::${visibleAvailableSetIds.join("|")}`;

  // Keep a ref in sync so pointer event callbacks always see the latest state
  // without being re-registered on every state change.
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const measureColumnLayout = (
    columnId: ColumnId,
    order: readonly TimelineSetId[],
  ): ColumnLayoutSnapshot | null => {
    const columnElement =
      columnId === "enabled"
        ? enabledColumnRef.current
        : availableColumnRef.current;

    if (!columnElement) {
      return null;
    }

    const rect = columnElement.getBoundingClientRect();
    const tops = new Map<TimelineSetId, number>();
    const heights = new Map<TimelineSetId, number>();
    let baseTop = Number.POSITIVE_INFINITY;

    for (const setId of order) {
      const element = itemRefs.current.get(setId);

      if (!element) {
        continue;
      }

      const itemRect = element.getBoundingClientRect();
      const top = itemRect.top - rect.top;

      tops.set(setId, top);
      heights.set(setId, itemRect.height);
      baseTop = Math.min(baseTop, top);
    }

    return {
      order: [...order],
      baseTop: Number.isFinite(baseTop) ? baseTop : 0,
      rect,
      tops,
      heights,
    };
  };

  const handleDragPointerMove = useCallback(
    (event: PointerEvent) => {
      const current = dragStateRef.current;

      if (!current || current.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const nextTargetColumn = getDropColumn(current.layouts, event.clientX);
      const nextTargetIndex = getProjectedIndex(
        current.layouts[nextTargetColumn],
        current,
        nextTargetColumn,
        event.clientY,
      );

      setDragState((prev) => {
        if (!prev || prev.pointerId !== event.pointerId) {
          return prev;
        }

        if (
          prev.currentClientX === event.clientX &&
          prev.currentClientY === event.clientY &&
          prev.targetColumn === nextTargetColumn &&
          prev.targetIndex === nextTargetIndex
        ) {
          return prev;
        }

        return {
          ...prev,
          currentClientX: event.clientX,
          currentClientY: event.clientY,
          targetColumn: nextTargetColumn,
          targetIndex: nextTargetIndex,
        };
      });
    },
    [],
  );

  const finishDrag = useCallback(
    (event: PointerEvent) => {
      const current = dragStateRef.current;

      if (!current || current.pointerId !== event.pointerId) {
        return;
      }

      if (current.captureElement.hasPointerCapture(current.pointerId)) {
        current.captureElement.releasePointerCapture(current.pointerId);
      }

      setDragState(null);

      if (
        current.sourceColumn === "enabled" &&
        current.targetColumn === "available"
      ) {
        onMovedToAvailable(current.setId);
      } else if (
        current.sourceColumn === "available" &&
        current.targetColumn === "enabled"
      ) {
        onMovedToEnabled(current.setId);
      }

      setDraftColumns((cols) => {
        if (
          current.sourceColumn === current.targetColumn &&
          current.sourceIndex === current.targetIndex
        ) {
          return cols;
        }

        if (current.sourceColumn === "enabled") {
          if (current.targetColumn === "enabled") {
            return {
              ...cols,
              enabled: moveItem(
                cols.enabled,
                cols.enabled.indexOf(current.setId),
                current.targetIndex,
              ),
            };
          }

          return {
            enabled: removeItem(cols.enabled, current.setId),
            available: insertIntoFilteredColumn(
              cols.available,
              current.layouts.available?.order ?? [],
              current.setId,
              current.targetIndex,
            ),
          };
        }

        if (current.targetColumn === "available") {
          return {
            ...cols,
            available: reorderVisibleSubset(
              cols.available,
              current.layouts.available?.order ?? [],
              current.setId,
              current.targetIndex,
            ),
          };
        }

        return {
          enabled: insertItem(cols.enabled, current.targetIndex, current.setId),
          available: removeItem(cols.available, current.setId),
        };
      });
    },
    [onMovedToAvailable, onMovedToEnabled, setDraftColumns],
  );

  useGlobalPointerDrag({
    active: Boolean(dragState),
    onPointerEnd: finishDrag,
    onPointerMove: handleDragPointerMove,
  });

  // FLIP: capture rects before render, animate from old position to new.
  useLayoutEffect(() => {
    const visibleIds = [...draftColumns.enabled, ...visibleAvailableSetIds];
    const currentRects = new Map<TimelineSetId, DOMRect>();

    for (const setId of visibleIds) {
      const element = itemRefs.current.get(setId);

      if (element) {
        currentRects.set(setId, element.getBoundingClientRect());
      }
    }

    if (
      previousSignatureRef.current !== null &&
      previousSignatureRef.current !== visibleSignature &&
      !dragState
    ) {
      for (const [setId, currentRect] of currentRects) {
        const previousRect = previousRectsRef.current.get(setId);
        const element = itemRefs.current.get(setId);

        if (!previousRect || !element) {
          continue;
        }

        const deltaX = previousRect.left - currentRect.left;
        const deltaY = previousRect.top - currentRect.top;

        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
          continue;
        }

        element.animate(
          [
            { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          { duration: REORDER_SETTLE_MS, easing: REORDER_EASING },
        );
      }
    }

    previousRectsRef.current = currentRects;
    previousSignatureRef.current = visibleSignature;
  }, [
    draftColumns.enabled,
    dragState,
    visibleAvailableSetIds,
    visibleSignature,
  ]);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    setId: TimelineSetId,
    sourceColumn: ColumnId,
  ) => {
    if (event.button !== 0) {
      return;
    }

    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const element = itemRefs.current.get(setId);

    if (!element) {
      return;
    }

    const enabledLayout = measureColumnLayout("enabled", draftColumns.enabled);
    const availableLayout = measureColumnLayout(
      "available",
      visibleAvailableSetIds,
    );
    const itemRect = element.getBoundingClientRect();
    const sourceLayout =
      sourceColumn === "enabled" ? enabledLayout : availableLayout;

    if (!sourceLayout) {
      return;
    }

    const sourceIndex = sourceLayout.order.indexOf(setId);

    if (sourceIndex < 0) {
      return;
    }

    for (const itemElement of itemRefs.current.values()) {
      itemElement.getAnimations().forEach((animation) => animation.cancel());
    }

    element.setPointerCapture(event.pointerId);

    setDragState({
      pointerId: event.pointerId,
      captureElement: element,
      setId,
      sourceColumn,
      targetColumn: sourceColumn,
      sourceIndex,
      targetIndex: sourceIndex,
      startClientX: event.clientX,
      startClientY: event.clientY,
      currentClientX: event.clientX,
      currentClientY: event.clientY,
      pointerOffsetY: event.clientY - itemRect.top,
      draggedHeight: itemRect.height,
      layouts: { enabled: enabledLayout, available: availableLayout },
    });
  };

  // Compute live preview order for both columns while dragging.
  const previewOrders = useMemo(() => {
    if (!dragState) {
      return {
        enabled: draftColumns.enabled,
        available: visibleAvailableSetIds,
      } satisfies Record<ColumnId, readonly TimelineSetId[]>;
    }

    const nextEnabledOrder =
      dragState.layouts.enabled?.order ?? draftColumns.enabled;
    const nextAvailableOrder =
      dragState.layouts.available?.order ?? visibleAvailableSetIds;

    if (dragState.sourceColumn === dragState.targetColumn) {
      const sourceOrder =
        dragState.sourceColumn === "enabled"
          ? nextEnabledOrder
          : nextAvailableOrder;
      const reordered = moveItem(
        sourceOrder,
        dragState.sourceIndex,
        dragState.targetIndex,
      );

      return {
        enabled:
          dragState.sourceColumn === "enabled" ? reordered : nextEnabledOrder,
        available:
          dragState.sourceColumn === "available"
            ? reordered
            : nextAvailableOrder,
      } satisfies Record<ColumnId, readonly TimelineSetId[]>;
    }

    return {
      enabled:
        dragState.sourceColumn === "enabled"
          ? nextEnabledOrder.filter((id) => id !== dragState.setId)
          : insertItem(
              nextEnabledOrder,
              dragState.targetIndex,
              dragState.setId,
            ),
      available:
        dragState.sourceColumn === "available"
          ? nextAvailableOrder.filter((id) => id !== dragState.setId)
          : insertItem(
              nextAvailableOrder,
              dragState.targetIndex,
              dragState.setId,
            ),
    } satisfies Record<ColumnId, readonly TimelineSetId[]>;
  }, [draftColumns.enabled, dragState, visibleAvailableSetIds]);

  // Map each set to its projected top offset in the live preview.
  const previewTopByColumn = useMemo(() => {
    if (!dragState) {
      return null;
    }

    const enabledLayout = dragState.layouts.enabled;
    const availableLayout = dragState.layouts.available;
    const enabledGap = enabledLayout ? estimateGap(enabledLayout) : 0;
    const availableGap = availableLayout ? estimateGap(availableLayout) : 0;

    // Inject the dragged item's measured height into the target column so it
    // opens the correct slot even though it was never rendered there.
    const extraForEnabled: ReadonlyMap<TimelineSetId, number> =
      dragState.sourceColumn === "available"
        ? new Map([[dragState.setId, dragState.draggedHeight]])
        : new Map();

    const extraForAvailable: ReadonlyMap<TimelineSetId, number> =
      dragState.sourceColumn === "enabled"
        ? new Map([[dragState.setId, dragState.draggedHeight]])
        : new Map();

    return {
      enabled: enabledLayout
        ? getPreviewTopBySetId(
            previewOrders.enabled,
            enabledLayout,
            extraForEnabled,
            enabledGap,
          )
        : null,
      available: availableLayout
        ? getPreviewTopBySetId(
            previewOrders.available,
            availableLayout,
            extraForAvailable,
            availableGap,
          )
        : null,
    } satisfies Record<ColumnId, Map<TimelineSetId, number> | null>;
  }, [dragState, previewOrders]);

  return {
    dragState,
    enabledColumnRef,
    availableColumnRef,
    itemRefs,
    previewTopByColumn,
    handlePointerDown,
  };
}
