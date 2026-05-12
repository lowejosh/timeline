import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAvailableSetsDrag } from "./hooks/useAvailableSetsDrag";
import type { TimelineSetDefinition } from "@/lib/catalog/setSchema";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import {
  computeEraObscuredCounts,
  computeSetTimeRanges,
} from "@/lib/catalog/timelineSetMetrics";
import { REORDER_EASING } from "@/lib/ui/reorder";
import type {
  AvailableSetsPageProps,
  ColumnId,
  DraftColumns,
} from "./AvailableSetsPage.types";
import {
  createDraftColumns,
  deriveAvailableTags,
  matchesQuery,
  removeItem,
} from "./utils/availableSetsPage";
import { cn } from "@/lib/utils";

export function AvailableSetsPage({
  allSets,
  enabledSetIds,
  visibleSetIds,
  orderedSetIds,
  isActive,
  onApply,
  onToggleVisible,
  onClose,
}: AvailableSetsPageProps) {
  const [draftColumns, setDraftColumns] = useState<DraftColumns>(() =>
    createDraftColumns(orderedSetIds, enabledSetIds),
  );
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(() => new Set());

  // Track sets that passed through the available column during this session.
  // When such a set is re-added to enabled, restore its visibility so a hidden
  // set never stays hidden simply because it was removed and re-added.
  const setsById = useMemo(
    () => new Map(allSets.map((set) => [set.metadata.id, set] as const)),
    [allSets],
  );

  // Reset draft state whenever the page becomes active with fresh external state.
  useEffect(() => {
    if (!isActive) {
      return;
    }

    setDraftColumns(createDraftColumns(orderedSetIds, enabledSetIds));
    setQuery("");
    setActiveTags(new Set());
  }, [enabledSetIds, isActive, orderedSetIds]);

  const enabledSets = draftColumns.enabled
    .map((setId) => setsById.get(setId))
    .filter((set): set is TimelineSetDefinition => Boolean(set));

  const availableSets = draftColumns.available
    .map((setId) => setsById.get(setId))
    .filter((set): set is TimelineSetDefinition => Boolean(set));

  const visibleAvailableSetIds = useMemo(
    () =>
      availableSets
        .filter((set) => {
          if (
            activeTags.size > 0 &&
            !(
              set.metadata.tags?.some((tag) =>
                activeTags.has(tag.toLowerCase()),
              ) ?? false
            )
          ) {
            return false;
          }

          return matchesQuery(set, query);
        })
        .map((set) => set.metadata.id),
    [activeTags, availableSets, query],
  );

  // Tags are derived from the current available column so filters stay relevant.
  const availableTags = useMemo(
    () => deriveAvailableTags(availableSets),
    [availableSets],
  );

  const eraObscuredCounts = useMemo(
    () => computeEraObscuredCounts(draftColumns.enabled),
    [draftColumns.enabled],
  );

  const setTimeRanges = useMemo(
    () => computeSetTimeRanges(allSets.map((set) => set.metadata.id)),
    [allSets],
  );

  const ensureSetStartsVisible = (setId: TimelineSetId) => {
    if (!visibleSetIds.has(setId)) {
      onToggleVisible(setId, true);
    }
  };

  const {
    dragState,
    enabledColumnRef,
    availableColumnRef,
    itemRefs,
    previewTopByColumn,
    handlePointerDown,
  } = useAvailableSetsDrag(
    draftColumns,
    visibleAvailableSetIds,
    setDraftColumns,
    (setId) => {
      ensureSetStartsVisible(setId);
    },
    (setId) => {
      if (!visibleSetIds.has(setId)) {
        onToggleVisible(setId, true);
      }
    },
  );

  const handleToggleTag = (tag: string) => {
    setActiveTags((current) => {
      const next = new Set(current);
      const normalized = tag.toLowerCase();

      if (next.has(normalized)) {
        next.delete(normalized);
      } else {
        next.add(normalized);
      }

      return next;
    });
  };

  const handleToggleDraft = (setId: TimelineSetId, nextEnabled: boolean) => {
    if (nextEnabled) {
      ensureSetStartsVisible(setId);
    }

    // When a set is moved to the available column, clear any hidden state
    // immediately so it comes back visible if the user re-adds it.
    if (!nextEnabled && !visibleSetIds.has(setId)) {
      onToggleVisible(setId, true);
    }

    setDraftColumns((current) => {
      if (nextEnabled) {
        if (current.enabled.includes(setId)) {
          return current;
        }

        return {
          enabled: [...current.enabled, setId],
          available: removeItem(current.available, setId),
        };
      }

      if (current.available.includes(setId)) {
        return current;
      }

      return {
        enabled: removeItem(current.enabled, setId),
        available: [...current.available, setId],
      };
    });
  };

  const handleApply = () => {
    onApply(new Set(draftColumns.enabled), [
      ...draftColumns.enabled,
      ...draftColumns.available,
    ]);
  };

  const renderColumnItems = (
    sets: TimelineSetDefinition[],
    columnId: ColumnId,
    emptyMessage: string,
  ): React.ReactNode => {
    const isCrossColumnTarget =
      dragState !== null &&
      dragState.targetColumn === columnId &&
      dragState.sourceColumn !== columnId;

    const cards = sets.map((set) => renderSetCard(set, columnId));

    if (!isCrossColumnTarget) {
      return sets.length === 0 ? (
        <p className="mx-auto mb-1 mt-4 justify-self-stretch text-center text-sm leading-snug text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        cards
      );
    }

    const insertAt = Math.min(dragState.targetIndex, cards.length);
    const ghost = (
      <div
        key="drag-ghost"
        aria-hidden="true"
        className="rounded-lg border border-dashed border-border/80 bg-muted/30"
        style={
          {
            height: `${dragState.draggedHeight}px`,
          } as React.CSSProperties
        }
      />
    );

    return [...cards.slice(0, insertAt), ghost, ...cards.slice(insertAt)];
  };

  const renderSetCard = (set: TimelineSetDefinition, columnId: ColumnId) => {
    const setId = set.metadata.id;
    const isEnabled = columnId === "enabled";
    const isVisible = visibleSetIds.has(setId);
    const obscuredCount = isEnabled ? (eraObscuredCounts.get(setId) ?? 0) : 0;
    const timeRange = setTimeRanges.get(setId) ?? null;
    const isDragged = dragState?.setId === setId;
    const isCrossColumnDrag =
      dragState !== null && dragState.sourceColumn !== dragState.targetColumn;
    const layout = dragState?.layouts[columnId] ?? null;
    const previewTop = previewTopByColumn?.[columnId]?.get(setId);
    const originalTop = layout?.tops.get(setId);
    const shiftY =
      dragState &&
      !isDragged &&
      !isCrossColumnDrag &&
      previewTop !== undefined &&
      originalTop !== undefined
        ? previewTop - originalTop
        : 0;
    const dragX =
      isDragged && dragState
        ? dragState.currentClientX - dragState.startClientX
        : 0;
    const dragY =
      isDragged && dragState
        ? dragState.currentClientY - dragState.startClientY
        : shiftY;

    return (
      <article
        className={cn(
          "flex w-full cursor-grab touch-none select-none items-start gap-3 rounded-lg border border-border/60 bg-surface/20 px-3 py-3 transition-[background-color,border-color,box-shadow] duration-150 will-change-transform hover:border-border hover:bg-surface/50",
          isDragged && "cursor-grabbing bg-surface shadow-panel",
          isEnabled &&
            !isVisible &&
            "pointer-events-auto opacity-50 grayscale-[0.25]",
        )}
        data-drag-state={
          isDragged ? "dragging" : dragState ? "shifting" : "idle"
        }
        key={setId}
        onPointerDown={(event) => {
          handlePointerDown(event, setId, columnId);
        }}
        ref={(element) => {
          if (element) {
            itemRefs.current.set(setId, element);
          } else {
            itemRefs.current.delete(setId);
          }
        }}
        style={
          dragState
            ? {
                transform: `translate3d(${isDragged ? dragX : 0}px, ${dragY}px, 0)`,
                transition: isDragged
                  ? "none"
                  : `transform 180ms ${REORDER_EASING}`,
                zIndex: isDragged ? 4 : 1,
              }
          : undefined
        }
        role="listitem"
      >
        <div className="grid min-w-0 flex-1 gap-1">
          <span className="font-display text-sm font-semibold leading-tight text-foreground">
            {set.metadata.label}
          </span>
          {timeRange ? (
            <span className="text-[0.6rem] leading-none tracking-[0.015em] text-muted-foreground/70">
              {timeRange}
            </span>
          ) : null}
          <div
            aria-hidden={!isEnabled || obscuredCount === 0}
            className={cn(
              "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200",
              isEnabled && obscuredCount > 0
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="flex min-h-0 items-center gap-1.5 pt-0.5 text-[0.62rem] font-semibold leading-tight tracking-[0.01em] text-warning">
              <AlertTriangle
                aria-hidden="true"
                className="size-3.5 shrink-0 fill-warning/20 stroke-[1.8]"
              />
              {obscuredCount} era{obscuredCount !== 1 ? "s" : ""} covered by
              higher-priority sets
            </div>
          </div>
          {set.metadata.description ? (
            <span className="text-[0.69rem] leading-snug text-muted-foreground">
              {set.metadata.description}
            </span>
          ) : null}
          {set.metadata.tags && set.metadata.tags.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {set.metadata.tags.map((tag) => (
                <Badge className="px-1.5 py-0.5 text-[0.56rem]" key={tag}>
                  {tag}
                </Badge>
              ))}
            </span>
          ) : null}
        </div>

        {isEnabled ? (
          <Button
            aria-label={isVisible ? `Hide ${set.metadata.label}` : `Show ${set.metadata.label}`}
            aria-pressed={isVisible}
            className={cn(
              "self-center rounded-full text-muted-foreground",
              isVisible && "text-muted-foreground/90",
            )}
            data-visible={isVisible ? "true" : "false"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisible(setId, !isVisible);
            }}
            size="icon"
            type="button"
            variant="glass"
          >
            {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>
        ) : null}

        <Button
          aria-label={
            isEnabled
              ? `Remove ${set.metadata.label}`
              : `Add ${set.metadata.label}`
          }
          className={cn(
            "self-center rounded-full text-muted-foreground",
            !isEnabled && "text-foreground/70",
          )}
          data-variant={isEnabled ? "remove" : "add"}
          onClick={() => {
            handleToggleDraft(setId, !isEnabled);
          }}
          size="icon"
          type="button"
          variant="glass"
        >
          {isEnabled ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </Button>
      </article>
    );
  };

  return (
    <div className="flex h-full w-full items-start justify-start overflow-auto p-[calc(env(safe-area-inset-top,0px)+1.2rem)_calc(env(safe-area-inset-right,0px)+1.4rem)_calc(env(safe-area-inset-bottom,0px)+1.2rem)_calc(env(safe-area-inset-left,0px)+1.4rem)] text-foreground overscroll-contain max-sm:p-[calc(env(safe-area-inset-top,0px)+0.84rem)_calc(env(safe-area-inset-right,0px)+0.84rem)_calc(env(safe-area-inset-bottom,0px)+0.84rem)_calc(env(safe-area-inset-left,0px)+0.84rem)]">
      <Card className="mx-auto grid w-[min(72rem,100%)] content-start gap-3 rounded-lg bg-card p-4 backdrop-blur-xl max-sm:w-full max-sm:p-3">
        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:items-start">
          <Button
            aria-label="Back to layers"
            className="rounded-full"
            onClick={handleApply}
            size="icon"
            type="button"
            variant="glass"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="grid min-w-0 gap-1">
            <h2 className="m-0 font-display text-base font-semibold leading-none text-foreground">
              Available sets
            </h2>
            <p className="m-0 text-[0.69rem] leading-snug text-muted-foreground">
              Drag between columns to add, remove, and set the order of the
              layers.
            </p>
          </div>

          <Button
            aria-label="Create a set, coming soon"
            className="ml-auto max-sm:ml-0"
            disabled
            size="pill"
            title="Create set, coming soon"
            type="button"
            variant="subtle"
          >
            <Plus className="size-3.5" />
            <span>Create</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 items-start gap-5 max-sm:grid-cols-1">
          <section className="grid min-w-0 content-start gap-0">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h3 className="m-0 font-display text-sm font-semibold leading-tight text-foreground">
                  Selected
                </h3>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  Shown in Layers
                </p>
              </div>
            </header>
            <div
              className={cn(
                "grid min-h-48 content-start items-start gap-2 overflow-y-auto overflow-x-clip overscroll-contain pb-1 pt-4 [scrollbar-width:thin]",
                dragState && "max-h-none overflow-visible",
                !dragState && "max-h-[32rem]",
              )}
              data-dragging={dragState ? "true" : "false"}
              ref={enabledColumnRef}
              role="list"
            >
              {renderColumnItems(
                enabledSets,
                "enabled",
                "Drag sets here to show them in Layers.",
              )}
            </div>
          </section>

          <section className="grid min-w-0 content-start gap-0 border-l border-border/70 pl-5 max-sm:border-l-0 max-sm:border-t max-sm:pl-0 max-sm:pt-4">
            <header className="grid gap-2">
              <div>
                <h3 className="m-0 font-display text-sm font-semibold leading-tight text-foreground">
                  Available
                </h3>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  Not currently shown
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 max-sm:w-full">
                <div className="relative w-[min(18rem,100%)] max-sm:w-full">
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                  />
                  <Input
                    aria-label="Search available sets"
                    className="pl-9 text-xs"
                    onChange={(event) => {
                      setQuery(event.currentTarget.value);
                    }}
                    placeholder="Search available"
                    type="search"
                    value={query}
                  />
                </div>

                {availableTags.length > 0 ? (
                  <div
                    aria-label="Filter available sets by tag"
                    className="flex flex-wrap gap-1.5"
                    role="group"
                  >
                    <Button
                      aria-pressed={activeTags.size === 0}
                      data-active={activeTags.size === 0 ? "true" : "false"}
                      onClick={() => {
                        setActiveTags(new Set());
                      }}
                      size="pill"
                      type="button"
                      variant={activeTags.size === 0 ? "outline" : "ghost"}
                    >
                      All
                    </Button>
                    {availableTags.map((tag) => {
                      const isActiveTag = activeTags.has(tag.toLowerCase());

                      return (
                        <Button
                          aria-pressed={isActiveTag}
                          data-active={isActiveTag ? "true" : "false"}
                          key={tag}
                          onClick={() => {
                            handleToggleTag(tag);
                          }}
                          size="pill"
                          type="button"
                          variant={isActiveTag ? "outline" : "ghost"}
                        >
                          {tag}
                        </Button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </header>
            <div
              className={cn(
                "grid min-h-48 content-start items-start gap-2 overflow-y-auto overflow-x-clip overscroll-contain pb-1 pt-4 [scrollbar-width:thin]",
                dragState && "max-h-none overflow-visible",
                !dragState && "max-h-[32rem]",
              )}
              data-dragging={dragState ? "true" : "false"}
              ref={availableColumnRef}
              role="list"
            >
              {renderColumnItems(
                visibleAvailableSetIds
                  .map((setId) => setsById.get(setId))
                  .filter((set): set is TimelineSetDefinition => Boolean(set)),
                "available",
                "No available sets match this search or filter.",
              )}
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-2 pt-1 max-sm:justify-stretch">
          <Button
            className="max-sm:flex-1"
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Discard changes
          </Button>
          <Button
            className="max-sm:flex-1"
            onClick={handleApply}
            type="button"
          >
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}
