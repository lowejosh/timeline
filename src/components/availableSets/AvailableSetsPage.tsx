import { useEffect, useMemo, useState } from "react";

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
import "./AvailableSetsPage.styles.css";

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
        <p className="avsets__empty">{emptyMessage}</p>
      ) : (
        cards
      );
    }

    const insertAt = Math.min(dragState.targetIndex, cards.length);
    const ghost = (
      <div
        key="drag-ghost"
        aria-hidden="true"
        className="avsets__drag-ghost"
        style={
          {
            "--ghost-height": `${dragState.draggedHeight}px`,
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

    const cardWash = isEnabled && !isVisible
      ? "opacity-50 grayscale-[0.25] pointer-events-auto"
      : "";
    return (
      <article
        className={`avsets__card ${cardWash}`}
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
      >
        <div className="avsets__item-body">
          <span className="avsets__item-label">{set.metadata.label}</span>
          {timeRange ? (
            <span className="avsets__item-meta">{timeRange}</span>
          ) : null}
          <div
            aria-hidden={!isEnabled || obscuredCount === 0}
            className="avsets__item-era-warning"
            data-visible={isEnabled && obscuredCount > 0 ? "true" : "false"}
          >
            <div className="avsets__item-era-warning-inner">
              <svg
                aria-hidden="true"
                className="avsets__item-era-warning-icon"
                viewBox="0 0 12 12"
              >
                <path d="M6 1.5 11 10.5H1L6 1.5z" />
                <path d="M6 5v2.5M6 9v.5" strokeLinecap="round" />
              </svg>
              {obscuredCount} era{obscuredCount !== 1 ? "s" : ""} covered by
              higher-priority sets
            </div>
          </div>
          {set.metadata.description ? (
            <span className="avsets__item-desc">
              {set.metadata.description}
            </span>
          ) : null}
          {set.metadata.tags && set.metadata.tags.length > 0 ? (
            <span className="avsets__item-tags">
              {set.metadata.tags.map((tag) => (
                <span className="avsets__item-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </span>
          ) : null}
        </div>

        {isEnabled ? (
          <button
            aria-label={isVisible ? `Hide ${set.metadata.label}` : `Show ${set.metadata.label}`}
            aria-pressed={isVisible}
            className="avsets__item-visibility"
            data-visible={isVisible ? "true" : "false"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisible(setId, !isVisible);
            }}
            type="button"
          >
            {isVisible ? (
              // Heroicons Eye (solid)
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 4c-4.418 0-8 3.134-8 6s3.582 6 8 6 8-3.134 8-6-3.582-6-8-6Zm0 10c-2.21 0-4-1.567-4-3.5S7.79 7 10 7s4 1.567 4 3.5S12.21 14 10 14Zm0-5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" clipRule="evenodd"/>
              </svg>
            ) : (
              // Heroicons Eye Slash (solid)
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd"/>
                <path d="M10.748 13.93a2.5 2.5 0 0 1-3.678-3.678l-.748-.748a4 4 0 0 0 5.424 5.425l-.998-.999ZM15.44 12.576l.392.392a10.048 10.048 0 0 1-2.106 1.564.75.75 0 1 1-.695-1.326 8.549 8.549 0 0 0 2.409-1.63ZM4.508 8.56l-1.5-1.5A9.949 9.949 0 0 0 1.934 9.41a1.651 1.651 0 0 0 0 1.185 10.004 10.004 0 0 0 9.999 5.388c.307-.032.61-.079.908-.138l-1.12-1.12a4 4 0 0 1-4.747-4.747L4.508 8.56Z"/>
              </svg>
            )}
          </button>
        ) : null}

        <button
          aria-label={
            isEnabled
              ? `Remove ${set.metadata.label}`
              : `Add ${set.metadata.label}`
          }
          className="avsets__item-toggle"
          data-variant={isEnabled ? "remove" : "add"}
          onClick={() => {
            handleToggleDraft(setId, !isEnabled);
          }}
          type="button"
        >
          {isEnabled ? (
            // Minus icon
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
              <rect x="4" y="9" width="12" height="2" rx="1" />
            </svg>
          ) : (
            // Plus icon
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
              <rect x="9" y="4" width="2" height="12" rx="1" />
              <rect x="4" y="9" width="12" height="2" rx="1" />
            </svg>
          )}
        </button>
      </article>
    );
  };

  return (
    <div className="avsets">
      <div className="avsets__surface">
        <div className="avsets__topbar">
          <button
            aria-label="Back to layers"
            className="avsets__back"
            onClick={handleApply}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="avsets__back-chevron"
              viewBox="0 0 12 12"
            >
              <path d="M7.5 2.5 4 6 7.5 9.5" />
            </svg>
          </button>

          <div className="avsets__heading">
            <h2 className="avsets__title">Available sets</h2>
            <p className="avsets__subtitle">
              Drag between columns to add, remove, and set the order of the
              layers.
            </p>
          </div>

          <button
            aria-label="Create a set, coming soon"
            className="avsets__create"
            disabled
            title="Create set, coming soon"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="avsets__create-icon"
              viewBox="0 0 12 12"
            >
              <path d="M6 2.25v7.5M2.25 6h7.5" />
            </svg>
            <span>Create</span>
          </button>
        </div>

        <div className="avsets__columns">
          <section className="avsets__column avsets__column--enabled">
            <header className="avsets__column-header">
              <div>
                <h3 className="avsets__column-title">Selected</h3>
                <p className="avsets__column-meta">Shown in Layers</p>
              </div>
            </header>
            <div
              className="avsets__column-list"
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

          <section className="avsets__column avsets__column--available">
            <header className="avsets__column-header avsets__column-header--stacked">
              <div>
                <h3 className="avsets__column-title">Available</h3>
                <p className="avsets__column-meta">Not currently shown</p>
              </div>

              <div className="avsets__controls">
                <div className="avsets__search-wrap">
                  <svg
                    aria-hidden="true"
                    className="avsets__search-icon"
                    viewBox="0 0 16 16"
                  >
                    <circle cx="6.5" cy="6.5" r="4" />
                    <path d="M10 10 14 14" />
                  </svg>
                  <input
                    aria-label="Search available sets"
                    className="avsets__search"
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
                    className="avsets__tags"
                    role="group"
                  >
                    <button
                      aria-pressed={activeTags.size === 0}
                      className="avsets__tag"
                      data-active={activeTags.size === 0 ? "true" : "false"}
                      onClick={() => {
                        setActiveTags(new Set());
                      }}
                      type="button"
                    >
                      All
                    </button>
                    {availableTags.map((tag) => {
                      const isActiveTag = activeTags.has(tag.toLowerCase());

                      return (
                        <button
                          aria-pressed={isActiveTag}
                          className="avsets__tag"
                          data-active={isActiveTag ? "true" : "false"}
                          key={tag}
                          onClick={() => {
                            handleToggleTag(tag);
                          }}
                          type="button"
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </header>
            <div
              className="avsets__column-list"
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

        <div className="avsets__actions">
          <button
            className="avsets__action avsets__action--cancel"
            onClick={onClose}
            type="button"
          >
            Discard changes
          </button>
          <button
            className="avsets__action avsets__action--save"
            onClick={handleApply}
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
