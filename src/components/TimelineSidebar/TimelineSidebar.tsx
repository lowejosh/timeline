import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import type {
  TimelineSidebarChildState,
  TimelineSidebarSetState,
} from "../../lib/app/sidebarModel";
import type { TimelineSetId } from "../../lib/core/timelineTypes";
import { OverlayGroupIconSvg } from "../TimelineCanvas/OverlayGroupIconSvg";
import { computeEraObscuredCounts } from "../AvailableSets/AvailableSetsPage.utils";
import "./TimelineSidebar.styles.css";

type TimelineSidebarProps = {
  sets: TimelineSidebarSetState[];
  expandedSetIds: ReadonlySet<TimelineSetId>;
  onReorderSets: (nextSetIds: TimelineSetId[]) => void;
  onToggleSet: (setId: TimelineSetId, nextEnabled: boolean) => void;
  onToggleSetExpanded: (setId: TimelineSetId, nextExpanded: boolean) => void;
  onToggleEntry: (
    entryId: string,
    groupIds: string[],
    nextEnabled: boolean,
  ) => void;
  onOpenSetManager: () => void;
};

type SetLayoutSnapshot = {
  order: TimelineSetId[];
  baseTop: number;
  tops: Map<TimelineSetId, number>;
  heights: Map<TimelineSetId, number>;
};

type DragState = {
  pointerId: number;
  setId: TimelineSetId;
  startClientY: number;
  currentClientY: number;
  initialIndex: number;
  projectedIndex: number;
  layout: SetLayoutSnapshot;
};

const REORDER_SETTLE_MS = 220;
const REORDER_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function moveItem<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);

  next.splice(toIndex, 0, moved);

  return next;
}

function areOrdersEqual(
  left: readonly TimelineSetId[],
  right: readonly TimelineSetId[],
) {
  return (
    left.length === right.length &&
    left.every((setId, index) => setId === right[index])
  );
}

function getProjectedIndex(dragState: DragState, nextClientY: number): number {
  const draggedHeight = dragState.layout.heights.get(dragState.setId) ?? 0;
  const draggedTop =
    (dragState.layout.tops.get(dragState.setId) ?? 0) +
    (nextClientY - dragState.startClientY);
  const draggedCenter = draggedTop + draggedHeight / 2;
  const remainingIds = dragState.layout.order.filter(
    (setId) => setId !== dragState.setId,
  );

  for (let index = 0; index < remainingIds.length; index += 1) {
    const setId = remainingIds[index];
    const top = dragState.layout.tops.get(setId) ?? 0;
    const height = dragState.layout.heights.get(setId) ?? 0;

    if (draggedCenter < top + height / 2) {
      return index;
    }
  }

  return remainingIds.length;
}

function getPreviewTopBySetId(
  order: readonly TimelineSetId[],
  layout: SetLayoutSnapshot,
) {
  const nextTopBySetId = new Map<TimelineSetId, number>();
  let nextTop = layout.baseTop;

  for (const setId of order) {
    nextTopBySetId.set(setId, nextTop);
    nextTop += layout.heights.get(setId) ?? 0;
  }

  return nextTopBySetId;
}

function formatVisibleCounts({
  markerCount,
  overlayCount,
}: Pick<TimelineSidebarChildState, "markerCount" | "overlayCount">) {
  const parts: string[] = [];

  if (overlayCount > 0) {
    parts.push(pluralize(overlayCount, "band"));
  }

  if (markerCount > 0) {
    parts.push(pluralize(markerCount, "marker"));
  }

  return parts;
}

function formatSetMeta(set: TimelineSidebarSetState) {
  const parts = formatVisibleCounts(set);

  if (parts.length === 0) {
    return "No visible items";
  }

  return parts.join(" · ");
}

function formatChildMeta(child: TimelineSidebarChildState) {
  const parts = formatVisibleCounts(child);

  if (parts.length === 0) {
    switch (child.contentType) {
      case "markers":
        parts.push("No visible markers");
        break;
      case "overlays":
        parts.push("No visible bands");
        break;
      case "mixed":
        parts.push("No visible items");
        break;
    }
  }

  return parts.join(" · ");
}

function WarnTooltip({
  content,
  children,
}: {
  content: string;
  children: ReactNode;
}) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [clampedLeft, setClampedLeft] = useState<number | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!anchor || !tooltipRef.current) {
      setClampedLeft(null);
      return;
    }
    const { width } = tooltipRef.current.getBoundingClientRect();
    const PADDING = 8;
    const centered = anchor.x - width / 2;
    setClampedLeft(
      Math.max(
        PADDING,
        Math.min(centered, window.innerWidth - width - PADDING),
      ),
    );
  }, [anchor]);

  return (
    <>
      <span
        className="timeline-sidebar__set-warn-wrap"
        onMouseEnter={() => {
          const rect = wrapRef.current?.getBoundingClientRect();
          if (rect) {
            setAnchor({ x: rect.left + rect.width / 2, y: rect.top });
          }
        }}
        onMouseLeave={() => setAnchor(null)}
        ref={wrapRef}
      >
        {children}
      </span>
      {anchor
        ? createPortal(
            <div
              className="sidebar-warn-tooltip"
              ref={tooltipRef}
              style={{
                left: clampedLeft ?? anchor.x,
                top: anchor.y,
                visibility: clampedLeft !== null ? "visible" : "hidden",
              }}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export function TimelineSidebar({
  sets,
  expandedSetIds,
  onReorderSets,
  onToggleSet,
  onToggleSetExpanded,
  onToggleEntry,
  onOpenSetManager,
}: TimelineSidebarProps) {
  const treeRef = useRef<HTMLDivElement | null>(null);
  const setShellRefs = useRef(new Map<TimelineSetId, HTMLElement>());
  const previousRectsRef = useRef(new Map<TimelineSetId, DOMRect>());
  const previousOrderSignatureRef = useRef<string | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const dragMovedRef = useRef(false);
  const collapseOnDragRef = useRef<(() => void) | null>(null);
  const measureSetLayoutRef = useRef<() => ReturnType<typeof measureSetLayout>>(
    null as never,
  );
  const [dragState, setDragState] = useState<DragState | null>(null);
  const setIds = useMemo(() => sets.map((set) => set.id), [sets]);
  const orderSignature = useMemo(() => setIds.join("|"), [setIds]);
  const orderedEnabledSetIds = useMemo(
    () => sets.filter((set) => set.enabled).map((set) => set.id),
    [sets],
  );
  const eraObscuredCounts = useMemo(
    () => computeEraObscuredCounts(orderedEnabledSetIds),
    [orderedEnabledSetIds],
  );

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const measureSetLayout = () => {
    const tree = treeRef.current;

    if (!tree || setIds.length === 0) {
      return null;
    }

    const treeRect = tree.getBoundingClientRect();
    const tops = new Map<TimelineSetId, number>();
    const heights = new Map<TimelineSetId, number>();
    let baseTop = Number.POSITIVE_INFINITY;

    for (const setId of setIds) {
      const element = setShellRefs.current.get(setId);

      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();
      const top = rect.top - treeRect.top;

      tops.set(setId, top);
      heights.set(setId, rect.height);
      baseTop = Math.min(baseTop, top);
    }

    return {
      order: [...setIds],
      baseTop: Number.isFinite(baseTop) ? baseTop : 0,
      tops,
      heights,
    } satisfies SetLayoutSnapshot;
  };

  // Keep the ref in sync so it can be called from inside useEffect without
  // violating the exhaustive-deps rule. It uses only refs + setIds (stable
  // during drag) so the stale-closure risk is negligible.
  measureSetLayoutRef.current = measureSetLayout;

  const previewOrder = useMemo(() => {
    if (!dragState) {
      return setIds;
    }

    return moveItem(
      dragState.layout.order,
      dragState.initialIndex,
      dragState.projectedIndex,
    );
  }, [dragState, setIds]);

  const previewTopBySetId = useMemo(() => {
    if (!dragState) {
      return null;
    }

    return getPreviewTopBySetId(previewOrder, dragState.layout);
  }, [dragState, previewOrder]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "grabbing";

    const handlePointerMove = (event: PointerEvent) => {
      const currentDragState = dragStateRef.current;

      if (!currentDragState || currentDragState.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();

      if (
        !dragMovedRef.current &&
        Math.abs(event.clientY - currentDragState.startClientY) > 4
      ) {
        dragMovedRef.current = true;

        if (collapseOnDragRef.current) {
          flushSync(() => {
            collapseOnDragRef.current!();
          });
          collapseOnDragRef.current = null;

          // Re-measure with collapsed DOM heights and update drag state.
          const freshLayout = measureSetLayoutRef.current();

          if (freshLayout) {
            const freshIndex = freshLayout.order.indexOf(
              currentDragState.setId,
            );

            if (freshIndex >= 0) {
              // Compensate startClientY for any layout shift of the dragged
              // item so the visual position stays continuous.
              const oldTop =
                currentDragState.layout.tops.get(currentDragState.setId) ?? 0;
              const newTop = freshLayout.tops.get(currentDragState.setId) ?? 0;

              const updatedState = {
                ...currentDragState,
                startClientY: currentDragState.startClientY + (newTop - oldTop),
                layout: freshLayout,
                initialIndex: freshIndex,
                projectedIndex: freshIndex,
              };

              // Update the ref synchronously so the next pointermove event
              // sees the fresh state before React re-renders.
              dragStateRef.current = updatedState;
              setDragState(updatedState);
              return;
            }
          }
        }
      }

      const nextProjectedIndex = getProjectedIndex(
        currentDragState,
        event.clientY,
      );

      setDragState((current) => {
        if (!current || current.pointerId !== event.pointerId) {
          return current;
        }

        if (
          current.currentClientY === event.clientY &&
          current.projectedIndex === nextProjectedIndex
        ) {
          return current;
        }

        return {
          ...current,
          currentClientY: event.clientY,
          projectedIndex: nextProjectedIndex,
        };
      });
    };

    const finishDrag = (event: PointerEvent) => {
      const currentDragState = dragStateRef.current;

      if (!currentDragState || currentDragState.pointerId !== event.pointerId) {
        return;
      }

      const nextOrder = moveItem(
        currentDragState.layout.order,
        currentDragState.initialIndex,
        currentDragState.projectedIndex,
      );

      collapseOnDragRef.current = null;
      setDragState(null);

      if (!areOrdersEqual(nextOrder, currentDragState.layout.order)) {
        onReorderSets(nextOrder);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      document.body.style.cursor = previousCursor;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [dragState, onReorderSets]);

  useLayoutEffect(() => {
    const currentRects = new Map<TimelineSetId, DOMRect>();

    for (const setId of setIds) {
      const element = setShellRefs.current.get(setId);

      if (!element) {
        continue;
      }

      currentRects.set(setId, element.getBoundingClientRect());
    }

    if (
      previousOrderSignatureRef.current !== null &&
      previousOrderSignatureRef.current !== orderSignature &&
      !dragState
    ) {
      for (const [setId, currentRect] of currentRects) {
        const previousRect = previousRectsRef.current.get(setId);
        const element = setShellRefs.current.get(setId);

        if (!previousRect || !element) {
          continue;
        }

        const deltaY = previousRect.top - currentRect.top;

        if (Math.abs(deltaY) < 0.5) {
          continue;
        }

        element.animate(
          [
            { transform: `translate3d(0, ${deltaY}px, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration: REORDER_SETTLE_MS,
            easing: REORDER_EASING,
          },
        );
      }
    }

    previousRectsRef.current = currentRects;
    previousOrderSignatureRef.current = orderSignature;
  });

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    setId: TimelineSetId,
  ) => {
    if (event.button !== 0 || sets.length <= 1) {
      return;
    }

    if ((event.target as HTMLElement).closest("button, input, label")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const layout = measureSetLayout();

    if (!layout) {
      return;
    }

    for (const element of setShellRefs.current.values()) {
      element.getAnimations().forEach((animation) => animation.cancel());
    }

    const initialIndex = layout.order.indexOf(setId);

    if (initialIndex < 0) {
      return;
    }

    dragMovedRef.current = false;
    collapseOnDragRef.current =
      expandedSetIds.size > 0
        ? () => {
            for (const expandedId of expandedSetIds) {
              onToggleSetExpanded(expandedId, false);
            }
          }
        : null;

    setDragState({
      pointerId: event.pointerId,
      setId,
      startClientY: event.clientY,
      currentClientY: event.clientY,
      initialIndex,
      projectedIndex: initialIndex,
      layout,
    });
  };

  const handleMoveSetByKeyboard = (setId: TimelineSetId, delta: number) => {
    const currentIndex = setIds.indexOf(setId);

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = Math.max(
      0,
      Math.min(setIds.length - 1, currentIndex + delta),
    );

    if (nextIndex === currentIndex) {
      return;
    }

    onReorderSets(moveItem(setIds, currentIndex, nextIndex));
  };

  return (
    <aside className="timeline-sidebar" aria-label="Timeline layer controls">
      <div className="timeline-sidebar__inner">
        <header className="timeline-sidebar__header">
          <h1 className="timeline-sidebar__title">Layers</h1>
          <span className="timeline-sidebar__title-meta">
            {pluralize(sets.length, "set")}
          </span>
        </header>
        <span className="timeline-sidebar__drag-instruction">
          Drag to reorder
        </span>
        <div
          className="timeline-sidebar__tree"
          data-dragging={dragState ? "true" : "false"}
          ref={treeRef}
        >
          {sets.map((set) => {
            const expanded = expandedSetIds.has(set.id);
            const isDragged = dragState?.setId === set.id;
            const previewTop = previewTopBySetId?.get(set.id);
            const originalTop = dragState?.layout.tops.get(set.id);
            const translateY = dragState
              ? isDragged
                ? dragState.currentClientY - dragState.startClientY
                : (previewTop ?? originalTop ?? 0) - (originalTop ?? 0)
              : 0;

            return (
              <section
                className="timeline-sidebar__set-shell"
                data-drag-state={
                  isDragged ? "dragging" : dragState ? "shifting" : "idle"
                }
                data-enabled={set.enabled ? "true" : "false"}
                key={set.id}
                ref={(element) => {
                  if (element) {
                    setShellRefs.current.set(set.id, element);
                  } else {
                    setShellRefs.current.delete(set.id);
                  }
                }}
                style={
                  dragState
                    ? {
                        transform: `translate3d(0, ${translateY}px, 0)`,
                        transition: isDragged
                          ? "none"
                          : `transform 180ms ${REORDER_EASING}`,
                        zIndex: isDragged ? 3 : 1,
                      }
                    : undefined
                }
              >
                <div className="timeline-sidebar__set-card">
                  <div
                    className="timeline-sidebar__set-row"
                    onClick={() => {
                      if (dragMovedRef.current) {
                        // Consume the flag so the next click works normally.
                        dragMovedRef.current = false;
                        return;
                      }

                      onToggleSetExpanded(set.id, !expanded);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    aria-label={`${expanded ? "Collapse" : "Expand"} ${set.label}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onToggleSetExpanded(set.id, !expanded);
                      }

                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        handleMoveSetByKeyboard(set.id, -1);
                      }

                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        handleMoveSetByKeyboard(set.id, 1);
                      }
                    }}
                    onPointerDown={(event) => {
                      handlePointerDown(event, set.id);
                    }}
                    data-expanded={expanded ? "true" : "false"}
                  >
                    <label
                      className="timeline-sidebar__toggle timeline-sidebar__toggle--set-checkbox"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <input
                        checked={set.enabled}
                        onChange={(event) => {
                          onToggleSet(set.id, event.currentTarget.checked);
                        }}
                        type="checkbox"
                      />
                      <span
                        aria-hidden="true"
                        className="timeline-sidebar__checkbox"
                      />
                    </label>

                    <span className="timeline-sidebar__set-copy">
                      <span
                        className="timeline-sidebar__item-title"
                        title={set.description}
                      >
                        {set.label}
                        {(eraObscuredCounts.get(set.id) ?? 0) > 0 ? (
                          <WarnTooltip
                            content={`${eraObscuredCounts.get(set.id)} era${eraObscuredCounts.get(set.id) !== 1 ? "s" : ""} covered by higher-priority sets`}
                          >
                            <svg
                              aria-hidden="true"
                              className="timeline-sidebar__set-warn"
                              viewBox="0 0 12 12"
                            >
                              <path d="M6 1.5 11 10.5H1L6 1.5z" />
                              <path d="M6 5v2.5M6 9v.5" strokeLinecap="round" />
                            </svg>
                          </WarnTooltip>
                        ) : null}
                      </span>
                      <span className="timeline-sidebar__item-meta">
                        {formatSetMeta(set)}
                      </span>
                    </span>

                    <svg
                      aria-hidden="true"
                      className="timeline-sidebar__disclosure-glyph"
                      viewBox="0 0 12 12"
                    >
                      <path d="M3 4.5 6 7.5 9 4.5" />
                    </svg>
                  </div>

                  {expanded ? (
                    <ul className="timeline-sidebar__item-list timeline-sidebar__child-list">
                      {set.children.map((child) => (
                        <li
                          className="timeline-sidebar__item timeline-sidebar__item--child"
                          data-parent-enabled={set.enabled ? "true" : "false"}
                          key={child.id}
                        >
                          <label className="timeline-sidebar__toggle timeline-sidebar__toggle--item timeline-sidebar__toggle--child">
                            <input
                              checked={child.enabled}
                              disabled={!set.enabled}
                              onChange={(event) => {
                                onToggleEntry(
                                  child.id,
                                  child.groupIds,
                                  event.currentTarget.checked,
                                );
                              }}
                              ref={(element) => {
                                if (element) {
                                  element.indeterminate = child.mixed;
                                }
                              }}
                              type="checkbox"
                            />
                            <span
                              className="timeline-sidebar__checkbox"
                              aria-hidden="true"
                            />
                            <span className="timeline-sidebar__toggle-copy">
                              <span className="timeline-sidebar__item-header">
                                <span className="timeline-sidebar__item-title">
                                  {child.label}
                                </span>
                                <OverlayGroupIconSvg
                                  className="timeline-sidebar__item-icon"
                                  groupId={child.id}
                                />
                              </span>
                              <span className="timeline-sidebar__item-meta">
                                {formatChildMeta(child)}
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <footer className="timeline-sidebar__footer">
        <button
          className="timeline-sidebar__manage-btn"
          onClick={onOpenSetManager}
          type="button"
        >
          Add or create more
        </button>
      </footer>
    </aside>
  );
}
