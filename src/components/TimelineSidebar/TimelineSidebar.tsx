import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { flushSync } from "react-dom";
import { AlertTriangle, ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tooltip } from "@/components/ui/tooltip";
import { OverlayGroupIconSvg } from "@/features/timeline-viewer/canvas";
import { computeEraObscuredCounts } from "@/lib/catalog/timelineSetMetrics";
import { useGlobalPointerDrag } from "@/hooks/useGlobalPointerDrag";
import {
  REORDER_EASING,
  REORDER_SETTLE_MS,
  areOrdersEqual,
  moveItem,
} from "@/lib/ui/reorder";
import { cn } from "@/lib/utils";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import type {
  TimelineSidebarChildState,
  TimelineSidebarSetState,
} from "@/lib/app/sidebarModel";
import {
  getChildLayerShortcutId,
  getSetLayerShortcutId,
  type TimelineLayerShortcutTarget,
} from "@/lib/app/timelineKeyboard";

type TimelineSidebarProps = {
  sets: TimelineSidebarSetState[];
  expandedSetIds: ReadonlySet<TimelineSetId>;
  layerShortcuts: readonly TimelineLayerShortcutTarget[];
  mode?: "drawer" | "popup";
  onReorderSets: (nextSetIds: TimelineSetId[]) => void;
  onToggleSet: (setId: TimelineSetId, nextEnabled: boolean) => void;
  onToggleSetExpanded: (setId: TimelineSetId, nextExpanded: boolean) => void;
  onToggleEntry: (groupIds: string[], nextEnabled: boolean) => void;
  onOpenSetManager: () => void;
  showShortcuts?: boolean;
};

type SetLayoutSnapshot = {
  order: TimelineSetId[];
  baseTop: number;
  tops: Map<TimelineSetId, number>;
  heights: Map<TimelineSetId, number>;
};

type DragState = {
  pointerId: number;
  captureElement: HTMLElement;
  setId: TimelineSetId;
  startClientY: number;
  currentClientY: number;
  initialIndex: number;
  projectedIndex: number;
  layout: SetLayoutSnapshot;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
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

function HotkeyBadge({ value }: { value: string }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded border border-border/70 bg-surface/70 px-1.5 font-mono text-[0.62rem] font-semibold leading-none text-muted-foreground shadow-[inset_0_-1px_0_rgba(77,61,47,0.08)]">
      {value}
    </kbd>
  );
}

export function TimelineSidebar({
  sets,
  expandedSetIds,
  layerShortcuts,
  mode = "popup",
  onReorderSets,
  onToggleSet,
  onToggleSetExpanded,
  onToggleEntry,
  onOpenSetManager,
  showShortcuts = true,
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
  const shortcutById = useMemo(
    () =>
      new Map(
        layerShortcuts.map((shortcut) => [shortcut.id, shortcut.key] as const),
      ),
    [layerShortcuts],
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

  const handleDragPointerMove = useCallback((event: PointerEvent) => {
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
          const freshIndex = freshLayout.order.indexOf(currentDragState.setId);

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
  }, []);

  const finishDrag = useCallback(
    (event: PointerEvent) => {
      const currentDragState = dragStateRef.current;

      if (!currentDragState || currentDragState.pointerId !== event.pointerId) {
        return;
      }

      const nextOrder = moveItem(
        currentDragState.layout.order,
        currentDragState.initialIndex,
        currentDragState.projectedIndex,
      );

      try {
        if (
          currentDragState.captureElement.hasPointerCapture(event.pointerId)
        ) {
          currentDragState.captureElement.releasePointerCapture(
            event.pointerId,
          );
        }
      } catch {
        // Some platforms can report the pointer as no longer active by the
        // time teardown runs. Losing capture here is harmless.
      }

      collapseOnDragRef.current = null;
      setDragState(null);

      if (!areOrdersEqual(nextOrder, currentDragState.layout.order)) {
        onReorderSets(nextOrder);
      }
    },
    [onReorderSets],
  );

  useGlobalPointerDrag({
    active: Boolean(dragState),
    onPointerEnd: finishDrag,
    onPointerMove: handleDragPointerMove,
  });

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

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture can fail on some touch/browser paths. Drag still
      // works with the window listeners below, so we fall back gracefully.
    }

    setDragState({
      pointerId: event.pointerId,
      captureElement: event.currentTarget,
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
    <aside
      aria-label="Timeline layer controls"
      className={cn(
        "relative flex max-h-[var(--sidebar-max-height)] w-full flex-col overflow-hidden border border-border bg-card text-card-foreground opacity-[0.98] shadow-panel backdrop-blur-md",
        mode === "drawer" ? "h-full max-h-full rounded-none" : "rounded-lg",
      )}
    >
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-2 pb-1 pt-2 [scrollbar-width:thin]",
          mode === "drawer" && "pl-[calc(env(safe-area-inset-left,0px)+0.6rem)] pt-4",
        )}
      >
        <header className="flex items-baseline justify-between gap-2 px-0.5">
          <h1 className="m-0 font-display text-base font-semibold leading-none text-foreground">
            Layers
          </h1>
          <span className="shrink-0 text-[0.56rem] font-semibold uppercase leading-none tracking-[0.08em] text-muted-foreground">
            {pluralize(sets.length, "set")}
          </span>
        </header>
        <span className="block px-0.5 py-1 text-[0.54rem] uppercase tracking-[0.08em] text-muted-foreground">
          Drag to reorder
        </span>
        <div
          className={cn(
            "relative -mx-2 -mb-1 grid gap-0",
            mode === "drawer" && "ml-[calc(-1*(env(safe-area-inset-left,0px)+0.6rem))]",
          )}
          data-dragging={dragState ? "true" : "false"}
          ref={treeRef}
        >
          {sets.map((set) => {
            const expanded = expandedSetIds.has(set.id);
            const isDragged = dragState?.setId === set.id;
            const setShortcut = shortcutById.get(getSetLayerShortcutId(set.id));
            const previewTop = previewTopBySetId?.get(set.id);
            const originalTop = dragState?.layout.tops.get(set.id);
            const translateY = dragState
              ? isDragged
                ? dragState.currentClientY - dragState.startClientY
                : (previewTop ?? originalTop ?? 0) - (originalTop ?? 0)
              : 0;

            return (
              <section
                className={cn(
                  "grid translate-z-0 will-change-transform",
                  "border-t border-border/50 first:border-t-0",
                  isDragged && "drop-shadow-xl",
                )}
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
                <Collapsible
                  className={cn(
                    "grid bg-transparent shadow-none transition-colors",
                    !set.enabled && "opacity-80",
                    isDragged && "bg-surface/80 backdrop-blur-md",
                  )}
                  onOpenChange={(nextOpen) => {
                    onToggleSetExpanded(set.id, nextOpen);
                  }}
                  open={expanded}
                >
                  <CollapsibleTrigger asChild>
                    <div
                      aria-label={`${expanded ? "Collapse" : "Expand"} ${set.label}`}
                      className={cn(
                        "grid cursor-grab touch-none select-none grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-surface/40",
                        expanded && "bg-surface/20",
                        isDragged && "cursor-grabbing",
                        mode === "drawer" &&
                          "pl-[calc(env(safe-area-inset-left,0px)+0.62rem)]",
                      )}
                      data-expanded={expanded ? "true" : "false"}
                      role="button"
                      onClick={(event) => {
                        if (dragMovedRef.current) {
                          // Consume the flag so the next click works normally.
                          dragMovedRef.current = false;
                          event.preventDefault();
                        }
                      }}
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
                      tabIndex={0}
                    >
                      <span
                        className="inline-flex items-center"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <Checkbox
                          aria-label={`${set.enabled ? "Hide" : "Show"} ${set.label}`}
                          checked={set.enabled}
                          onChange={(event) => {
                            onToggleSet(set.id, event.currentTarget.checked);
                          }}
                        />
                      </span>

                      <span className="grid min-w-0 gap-0.5">
                        <span
                          className="min-w-0 flex-1 text-[0.76rem] font-semibold leading-tight text-foreground"
                          title={set.description}
                        >
                          {set.label}
                          {(eraObscuredCounts.get(set.id) ?? 0) > 0 ? (
                            <Tooltip
                              content={`${eraObscuredCounts.get(set.id)} era${eraObscuredCounts.get(set.id) !== 1 ? "s" : ""} covered by higher-priority sets`}
                            >
                              <span
                                aria-hidden="true"
                                className="ml-1 inline-flex align-middle text-warning"
                              >
                                <AlertTriangle className="size-3 fill-warning/20 stroke-[1.8]" />
                              </span>
                            </Tooltip>
                          ) : null}
                        </span>
                        <span className="text-[0.6rem] font-semibold leading-tight tracking-[0.01em] text-muted-foreground">
                          {formatSetMeta(set)}
                        </span>
                      </span>

                      <span className="inline-flex shrink-0 items-center gap-1.5">
                        {showShortcuts && setShortcut ? (
                          <HotkeyBadge value={setShortcut} />
                        ) : null}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-4 text-muted-foreground transition-transform duration-200",
                            expanded && "rotate-180",
                          )}
                        />
                      </span>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <ul className="m-0 grid list-none gap-0 border-t border-border/50 p-0">
                      {set.children.map((child) => {
                        const childShortcut = shortcutById.get(
                          getChildLayerShortcutId(child),
                        );

                        return (
                          <li
                            className={cn(
                              "border-t border-border/40 first:border-t-0",
                              !set.enabled && "opacity-60",
                            )}
                            data-parent-enabled={
                              set.enabled ? "true" : "false"
                            }
                            key={child.id}
                          >
                            <label
                              className={cn(
                                "grid w-full min-w-0 cursor-pointer grid-cols-[auto_1fr] items-center gap-2 bg-muted/20 px-2 py-2 transition-colors hover:bg-muted/50",
                                !set.enabled && "cursor-default",
                                mode === "drawer"
                                  ? "pl-[calc(env(safe-area-inset-left,0px)+0.62rem)]"
                                  : "pl-8",
                              )}
                            >
                              <Checkbox
                                checked={child.enabled}
                                disabled={!set.enabled}
                                indeterminate={child.mixed}
                                onChange={(event) => {
                                  onToggleEntry(
                                    child.groupIds,
                                    event.currentTarget.checked,
                                  );
                                }}
                              />
                              <span className="grid min-w-0 gap-0.5">
                                <span className="flex min-w-0 items-center justify-between gap-1.5">
                                  <span className="min-w-0 flex-1 text-[0.76rem] font-semibold leading-tight text-foreground">
                                    {child.label}
                                  </span>
                                  <span className="inline-flex shrink-0 items-center gap-1.5">
                                    <OverlayGroupIconSvg
                                      className="size-4 shrink-0 self-center text-muted-foreground opacity-75 empty:hidden"
                                      groupId={child.id}
                                    />
                                    {showShortcuts && childShortcut ? (
                                      <HotkeyBadge value={childShortcut} />
                                    ) : null}
                                  </span>
                                </span>
                                <span className="text-[0.6rem] font-semibold leading-tight tracking-[0.01em] text-muted-foreground">
                                  {formatChildMeta(child)}
                                </span>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </section>
            );
          })}
        </div>
      </div>

      <footer
        className={cn(
          "shrink-0 overflow-hidden border-t border-border/60",
          mode === "drawer" && "pb-[calc(env(safe-area-inset-bottom,0px)+0.2rem)]",
        )}
      >
        <Button
          className={cn(
            "h-auto w-full rounded-none border-0 py-3 text-[0.72rem] text-muted-foreground shadow-none hover:translate-y-0 hover:bg-surface/60 hover:text-foreground",
            mode === "drawer" &&
              "pl-[calc(env(safe-area-inset-left,0px)+0.62rem)]",
          )}
          onClick={onOpenSetManager}
          type="button"
          variant="ghost"
        >
          <Plus className="size-3.5" />
          Add or create more
        </Button>
      </footer>
    </aside>
  );
}
