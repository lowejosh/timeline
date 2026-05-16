import {
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { TimelineSetId } from "@/lib/core/timelineTypes";
import { useGlobalPointerDrag } from "@/hooks/useGlobalPointerDrag";
import { REORDER_EASING, REORDER_SETTLE_MS } from "@/lib/ui/reorder";
import type {
  ColumnId,
  ColumnLayoutSnapshot,
  DragLayouts,
  DragState,
  DraftColumns,
} from "../AvailableSetsPage.types";
import {
  getDropColumn,
  getProjectedIndex,
  insertIntoFilteredColumn,
  insertItem,
  moveItemToProjectedIndex,
  removeItem,
  reorderVisibleSubsetToProjectedIndex,
} from "../utils/availableSetsPage";

const AUTO_SCROLL_EDGE_PX = 84;
const AUTO_SCROLL_MAX_PX = 18;

function getAutoScrollDelta(container: HTMLElement, clientY: number) {
  const rect = container.getBoundingClientRect();
  const distanceToTop = clientY - rect.top;
  const distanceToBottom = rect.bottom - clientY;

  if (distanceToTop < AUTO_SCROLL_EDGE_PX) {
    const intensity = 1 - Math.max(0, distanceToTop) / AUTO_SCROLL_EDGE_PX;

    return -Math.ceil(intensity * AUTO_SCROLL_MAX_PX);
  }

  if (distanceToBottom < AUTO_SCROLL_EDGE_PX) {
    const intensity = 1 - Math.max(0, distanceToBottom) / AUTO_SCROLL_EDGE_PX;

    return Math.ceil(intensity * AUTO_SCROLL_MAX_PX);
  }

  return 0;
}

export function useAvailableSetsDrag(
  draftColumns: DraftColumns,
  visibleAvailableSetIds: readonly TimelineSetId[],
  scrollContainerRef: RefObject<HTMLElement | null>,
  setDraftColumns: Dispatch<SetStateAction<DraftColumns>>,
  onMovedToEnabled: (setId: TimelineSetId) => void,
  onMovedToAvailable: (setId: TimelineSetId) => void,
) {
  const enabledColumnRef = useRef<HTMLUListElement | null>(null);
  const availableColumnRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef(new Map<TimelineSetId, HTMLElement>());
  const previousRectsRef = useRef(new Map<TimelineSetId, DOMRect>());
  const previousSignatureRef = useRef<string | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const visibleSignature = `${draftColumns.enabled.join("|")}::${visibleAvailableSetIds.join("|")}`;
  const layoutSignature = dragState
    ? `${visibleSignature}::${dragState.setId}:${dragState.sourceColumn}:${dragState.targetColumn}:${dragState.targetIndex}`
    : visibleSignature;
  const isDragging = Boolean(dragState);

  // Keep a ref in sync so pointer event callbacks always see the latest state
  // without being re-registered on every state change.
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const measureColumnLayout = useCallback((
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

    for (const setId of order) {
      const element = itemRefs.current.get(setId);

      if (!element) {
        continue;
      }

      const itemRect = element.getBoundingClientRect();
      const top = itemRect.top - rect.top;

      tops.set(setId, top);
      heights.set(setId, itemRect.height);
    }

    return {
      order: [...order],
      rect,
      tops,
      heights,
    };
  }, []);

  const updateDragLayoutRects = useCallback((layouts: DragLayouts) => {
    const enabledRect = enabledColumnRef.current?.getBoundingClientRect();
    const availableRect = availableColumnRef.current?.getBoundingClientRect();

    return {
      enabled:
        layouts.enabled && enabledRect
          ? { ...layouts.enabled, rect: enabledRect }
          : layouts.enabled,
      available:
        layouts.available && availableRect
          ? { ...layouts.available, rect: availableRect }
          : layouts.available,
    } satisfies DragLayouts;
  }, []);

  const handleDragPointerMove = useCallback(
    (event: PointerEvent) => {
      const current = dragStateRef.current;

      if (!current || current.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const nextLayouts = updateDragLayoutRects(current.layouts);
      const nextScrollTop = current.scrollContainer
        ? current.scrollContainer.scrollTop
        : 0;
      const nextTargetColumn = getDropColumn(
        nextLayouts,
        event.clientX,
        event.clientY,
      );
      const nextTargetIndex = getProjectedIndex(
        nextLayouts[nextTargetColumn],
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
          prev.targetIndex === nextTargetIndex &&
          prev.currentScrollTop === nextScrollTop
        ) {
          return prev;
        }

        return {
          ...prev,
          currentClientX: event.clientX,
          currentClientY: event.clientY,
          currentScrollTop: nextScrollTop,
          layouts: nextLayouts,
          targetColumn: nextTargetColumn,
          targetIndex: nextTargetIndex,
        };
      });
    },
    [updateDragLayoutRects],
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const tick = () => {
      const current = dragStateRef.current;

      if (!current || !current.scrollContainer) {
        autoScrollFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const scrollDelta = getAutoScrollDelta(
        current.scrollContainer,
        current.currentClientY,
      );

      if (scrollDelta !== 0) {
        current.scrollContainer.scrollTop += scrollDelta;

        const nextLayouts = updateDragLayoutRects(current.layouts);
        const nextScrollTop = current.scrollContainer.scrollTop;
        const nextTargetColumn = getDropColumn(
          nextLayouts,
          current.currentClientX,
          current.currentClientY,
        );
        const nextTargetIndex = getProjectedIndex(
          nextLayouts[nextTargetColumn],
          current,
          nextTargetColumn,
          current.currentClientY,
        );

        setDragState((prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            currentScrollTop: nextScrollTop,
            layouts: nextLayouts,
            targetColumn: nextTargetColumn,
            targetIndex: nextTargetIndex,
          };
        });
      }

      autoScrollFrameRef.current = window.requestAnimationFrame(tick);
    };

    autoScrollFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (autoScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
    };
  }, [isDragging, updateDragLayoutRects]);

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
              enabled: moveItemToProjectedIndex(
                cols.enabled,
                current.setId,
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
            available: reorderVisibleSubsetToProjectedIndex(
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
    active: isDragging,
    onPointerEnd: finishDrag,
    onPointerMove: handleDragPointerMove,
  });

  // FLIP: capture rects before render, animate from old position to new.
  useLayoutEffect(() => {
    const visibleIds = [...draftColumns.enabled, ...visibleAvailableSetIds];
    const currentRects = new Map<TimelineSetId, DOMRect>();

    for (const setId of visibleIds) {
      if (dragState?.setId === setId) {
        continue;
      }

      const element = itemRefs.current.get(setId);

      if (element) {
        currentRects.set(setId, element.getBoundingClientRect());
      }
    }

    if (
      previousSignatureRef.current !== null &&
      previousSignatureRef.current !== layoutSignature
    ) {
      for (const [setId, currentRect] of currentRects) {
        if (dragState?.setId === setId) {
          continue;
        }

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
    previousSignatureRef.current = layoutSignature;
  }, [
    draftColumns.enabled,
    dragState,
    layoutSignature,
    visibleAvailableSetIds,
  ]);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    setId: TimelineSetId,
    sourceColumn: ColumnId,
  ) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    const dragHandle = target.closest("[data-drag-handle]");

    if (!dragHandle) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const element = itemRefs.current.get(setId);

    if (!element) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;
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
      scrollContainer,
      setId,
      sourceColumn,
      targetColumn: sourceColumn,
      sourceIndex,
      targetIndex: sourceIndex,
      startClientX: event.clientX,
      startClientY: event.clientY,
      currentClientX: event.clientX,
      currentClientY: event.clientY,
      pointerOffsetX: event.clientX - itemRect.left,
      pointerOffsetY: event.clientY - itemRect.top,
      draggedWidth: itemRect.width,
      draggedHeight: itemRect.height,
      currentScrollTop: scrollContainer ? scrollContainer.scrollTop : 0,
      layouts: { enabled: enabledLayout, available: availableLayout },
    });
  };

  return {
    dragState,
    enabledColumnRef,
    availableColumnRef,
    itemRefs,
    handlePointerDown,
  };
}
