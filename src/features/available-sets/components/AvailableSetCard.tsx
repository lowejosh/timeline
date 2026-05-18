import type { KeyboardEvent, MutableRefObject, PointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Pencil,
  GripVertical,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TimelineSetDefinition } from "@/lib/catalog/setSchema";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import { cn } from "@/lib/utils";
import type { ColumnId, DragState } from "../AvailableSetsPage.types";

type AvailableSetCardProps = {
  columnId: ColumnId;
  dragState: DragState | null;
  itemRefs: MutableRefObject<Map<TimelineSetId, HTMLElement>>;
  isCustom: boolean;
  obscuredCount: number;
  onDragHandlePointerDown: (
    event: PointerEvent<HTMLElement>,
    setId: TimelineSetId,
    columnId: ColumnId,
  ) => void;
  onReorderKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    setId: TimelineSetId,
    columnId: ColumnId,
  ) => void;
  onToggleDraft: (setId: TimelineSetId, nextEnabled: boolean) => void;
  onToggleVisible: (setId: TimelineSetId, nextVisible: boolean) => void;
  onDeleteCustomSet: (setId: TimelineSetId) => void;
  onEditCustomSet: (setId: TimelineSetId) => void;
  reorderHelpId: string;
  set: TimelineSetDefinition;
  timeRange: string | null;
  visibleSetIds: ReadonlySet<TimelineSetId>;
};

export function AvailableSetCard({
  columnId,
  dragState,
  itemRefs,
  isCustom,
  obscuredCount,
  onDragHandlePointerDown,
  onReorderKeyDown,
  onToggleDraft,
  onToggleVisible,
  onDeleteCustomSet,
  onEditCustomSet,
  reorderHelpId,
  set,
  timeRange,
  visibleSetIds,
}: AvailableSetCardProps) {
  const setId = set.metadata.id;
  const isEnabled = columnId === "enabled";
  const isVisible = visibleSetIds.has(setId);
  const isDragged = dragState?.setId === setId;

  const card = (
    <li
      className={cn(
        "flex w-full list-none select-none items-start gap-2 rounded-lg border border-border/60 bg-surface/20 px-2.5 py-2.5 transition-[background-color,border-color,box-shadow] duration-150 will-change-transform hover:border-border hover:bg-surface/50 sm:gap-3 sm:px-3 sm:py-3",
        isDragged &&
          "pointer-events-none cursor-grabbing bg-surface shadow-panel",
        isEnabled && !isVisible && "pointer-events-auto opacity-50 grayscale-[0.25]",
      )}
      data-drag-state={isDragged ? "dragging" : dragState ? "shifting" : "idle"}
      key={setId}
      ref={(element) => {
        if (element) {
          itemRefs.current.set(setId, element);
        } else {
          itemRefs.current.delete(setId);
        }
      }}
      style={
        isDragged && dragState
          ? {
              left: `${dragState.currentClientX - dragState.pointerOffsetX}px`,
              position: "fixed",
              top: `${dragState.currentClientY - dragState.pointerOffsetY}px`,
              transition: "none",
              width: `${dragState.draggedWidth}px`,
              zIndex: 50,
            }
          : undefined
      }
    >
      <Button
        aria-describedby={reorderHelpId}
        aria-label={`Reorder ${set.metadata.label}`}
        className="mt-0.5 cursor-grab touch-none rounded-full text-muted-foreground active:cursor-grabbing"
        data-drag-handle="true"
        onKeyDown={(event) => {
          onReorderKeyDown(event, setId, columnId);
        }}
        onPointerDown={(event) => {
          onDragHandlePointerDown(event, setId, columnId);
        }}
        size="icon"
        type="button"
        variant="ghost"
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </Button>

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

      <div className="flex shrink-0 items-center gap-1 self-center">
        {isCustom ? (
          <>
            <Button
              aria-label={`Edit ${set.metadata.label}`}
              className="rounded-full text-muted-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onEditCustomSet(setId);
              }}
              size="icon"
              type="button"
              variant="glass"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              aria-label={`Delete ${set.metadata.label}`}
              className="rounded-full text-muted-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteCustomSet(setId);
              }}
              size="icon"
              type="button"
              variant="glass"
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        ) : null}

        {isEnabled ? (
          <Button
            aria-label={
              isVisible ? `Hide ${set.metadata.label}` : `Show ${set.metadata.label}`
            }
            aria-pressed={isVisible}
            className={cn(
              "rounded-full text-muted-foreground",
              isVisible && "text-muted-foreground/90",
            )}
            data-visible={isVisible ? "true" : "false"}
            onClick={(event) => {
              event.stopPropagation();
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
          aria-label={isEnabled ? `Remove ${set.metadata.label}` : `Add ${set.metadata.label}`}
          className={cn(
            "rounded-full text-muted-foreground",
            !isEnabled && "text-foreground/70",
          )}
          data-variant={isEnabled ? "remove" : "add"}
          onClick={() => {
            onToggleDraft(setId, !isEnabled);
          }}
          size="icon"
          type="button"
          variant="glass"
        >
          {isEnabled ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </Button>
      </div>
    </li>
  );

  if (isDragged && dragState && typeof document !== "undefined") {
    return createPortal(<ul className="contents">{card}</ul>, document.body);
  }

  return card;
}
