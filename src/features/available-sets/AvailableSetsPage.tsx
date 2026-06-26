import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import type { TimelineSetDefinition } from "@/lib/catalog/setSchema";
import {
  computeEraObscuredCounts,
  computeSetTimeRanges,
} from "@/lib/catalog/timelineSetMetrics";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import {
  AvailableSetCard,
  AvailableSetsActions,
  AvailableSetsColumn,
  AvailableSetsFilters,
} from "./components";
import { useAvailableSetsDrag } from "./hooks/useAvailableSetsDrag";
import { useAvailableSetsKeyboardReorder } from "./hooks/useAvailableSetsKeyboardReorder";
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
} from "./AvailableSets.utils";

export function AvailableSetsPage({
  allSets,
  catalog,
  customSetIds,
  enabledSetIds,
  visibleSetIds,
  orderedSetIds,
  isActive,
  onApply,
  onCreateSet,
  onDeleteCustomSet,
  onEditCustomSet,
  onToggleVisible,
  onClose,
}: AvailableSetsPageProps) {
  const [draftColumns, setDraftColumns] = useState<DraftColumns>(() =>
    createDraftColumns(orderedSetIds, enabledSetIds),
  );
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(() => new Set());
  const pageTitleId = useId();
  const selectedTitleId = useId();
  const availableTitleId = useId();
  const reorderHelpId = useId();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const setsById = useMemo(
    () => new Map(allSets.map((set) => [set.metadata.id, set] as const)),
    [allSets],
  );

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

  const visibleAvailableSets = visibleAvailableSetIds
    .map((setId) => setsById.get(setId))
    .filter((set): set is TimelineSetDefinition => Boolean(set));

  const availableTags = useMemo(
    () => deriveAvailableTags(availableSets),
    [availableSets],
  );

  const eraObscuredCounts = useMemo(
    () => computeEraObscuredCounts(draftColumns.enabled, catalog),
    [catalog, draftColumns.enabled],
  );

  const setTimeRanges = useMemo(
    () => computeSetTimeRanges(allSets.map((set) => set.metadata.id), catalog),
    [allSets, catalog],
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
    handlePointerDown,
  } = useAvailableSetsDrag(
    draftColumns,
    visibleAvailableSetIds,
    scrollContainerRef,
    setDraftColumns,
    ensureSetStartsVisible,
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

  const handleReorderKeyDown = useAvailableSetsKeyboardReorder({
    onToggleDraft: handleToggleDraft,
    setDraftColumns,
    visibleAvailableSetIds,
  });

  const handleApply = () => {
    onApply(new Set(draftColumns.enabled), [
      ...draftColumns.enabled,
      ...draftColumns.available,
    ]);
  };

  const renderSetCard = (set: TimelineSetDefinition, columnId: ColumnId) => {
    const setId = set.metadata.id;
    const obscuredCount =
      columnId === "enabled" ? (eraObscuredCounts.get(setId) ?? 0) : 0;

    return (
      <AvailableSetCard
        columnId={columnId}
        dragState={dragState}
        itemRefs={itemRefs}
        key={setId}
        isCustom={customSetIds.has(setId)}
        obscuredCount={obscuredCount}
        onDeleteCustomSet={onDeleteCustomSet}
        onDragHandlePointerDown={handlePointerDown}
        onEditCustomSet={onEditCustomSet}
        onReorderKeyDown={handleReorderKeyDown}
        onToggleDraft={handleToggleDraft}
        onToggleVisible={onToggleVisible}
        reorderHelpId={reorderHelpId}
        set={set}
        timeRange={setTimeRanges.get(setId) ?? null}
        visibleSetIds={visibleSetIds}
      />
    );
  };

  return (
    <div className="h-full w-full">
      <PageShell
        actions={
          <Button onClick={onCreateSet} size="pill" type="button" variant="subtle">
            <Plus className="size-3.5" />
            Create set
          </Button>
        }
        backLabel="Back to layers"
        className="w-[min(92rem,100%)]"
        contentClassName="overflow-hidden max-sm:overflow-auto"
        description="Drag with the handle to add, remove, and order timeline layers."
        footer={<AvailableSetsActions onApply={handleApply} onClose={onClose} />}
        onBack={handleApply}
        scrollRef={scrollContainerRef}
        title="Available sets"
        titleId={pageTitleId}
      >
        <p className="sr-only" id={reorderHelpId}>
          Use the arrow keys to reorder this set. Use left and right arrows to
          move it between selected and available.
        </p>

        <div className="grid h-full min-h-0 grid-cols-2 items-stretch gap-5 max-sm:h-auto max-sm:grid-cols-1 max-sm:gap-3">
          <AvailableSetsColumn
            columnId="enabled"
            columnRef={enabledColumnRef}
            description="Shown in Layers"
            dragState={dragState}
            emptyMessage="Drag sets here to show them in Layers."
            renderSetCard={renderSetCard}
            scrollContainerRef={scrollContainerRef}
            sets={enabledSets}
            title="Selected"
            titleId={selectedTitleId}
          />

          <AvailableSetsColumn
            columnId="available"
            columnRef={availableColumnRef}
            description="Not currently shown"
            dragState={dragState}
            emptyMessage="No available sets match this search or filter."
            renderSetCard={renderSetCard}
            scrollContainerRef={scrollContainerRef}
            sets={visibleAvailableSets}
            title="Available"
            titleId={availableTitleId}
            variant="divided"
          >
            <AvailableSetsFilters
              activeTags={activeTags}
              availableTags={availableTags}
              onClearTags={() => {
                setActiveTags(new Set());
              }}
              onQueryChange={setQuery}
              onToggleTag={handleToggleTag}
              query={query}
            />
          </AvailableSetsColumn>
        </div>
      </PageShell>
    </div>
  );
}
