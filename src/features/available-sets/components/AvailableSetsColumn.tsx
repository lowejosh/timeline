import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  type WheelEvent,
} from "react";

import type { TimelineSetDefinition } from "@/lib/catalog/setSchema";
import { cn } from "@/lib/utils";
import type { ColumnId, DragState } from "../AvailableSetsPage.types";

type AvailableSetsColumnProps = {
  children?: ReactNode;
  columnId: ColumnId;
  columnRef: RefObject<HTMLUListElement | null>;
  description: string;
  dragState: DragState | null;
  emptyMessage: string;
  renderSetCard: (set: TimelineSetDefinition, columnId: ColumnId) => ReactNode;
  scrollContainerRef: RefObject<HTMLElement | null>;
  sets: TimelineSetDefinition[];
  title: string;
  titleId: string;
  variant?: "plain" | "divided";
};

const SCROLL_EDGE_TOLERANCE = 1;

function canScroll(element: HTMLElement, deltaY: number) {
  if (deltaY < 0) {
    return element.scrollTop > SCROLL_EDGE_TOLERANCE;
  }

  if (deltaY > 0) {
    return (
      element.scrollTop + element.clientHeight <
      element.scrollHeight - SCROLL_EDGE_TOLERANCE
    );
  }

  return false;
}

function handOffScroll(
  source: HTMLElement,
  target: HTMLElement | null,
  deltaY: number,
) {
  if (!target || deltaY === 0 || canScroll(source, deltaY) || !canScroll(target, deltaY)) {
    return false;
  }

  target.scrollTop += deltaY;
  return true;
}

export function AvailableSetsColumn({
  children,
  columnId,
  columnRef,
  description,
  dragState,
  emptyMessage,
  renderSetCard,
  scrollContainerRef,
  sets,
  title,
  titleId,
  variant = "plain",
}: AvailableSetsColumnProps) {
  const lastTouchYRef = useRef<number | null>(null);
  const dragStateRef = useRef<DragState | null>(dragState);
  const isDropTarget =
    dragState !== null && dragState.targetColumn === columnId;
  const isSourceColumn =
    dragState !== null && dragState.sourceColumn === columnId;
  const draggedSet =
    isSourceColumn && dragState
      ? sets.find((set) => set.metadata.id === dragState.setId)
      : undefined;
  const cards = sets
    .filter((set) => !dragState || set.metadata.id !== dragState.setId)
    .map((set) => renderSetCard(set, columnId));
  const draggedCard = draggedSet ? renderSetCard(draggedSet, columnId) : null;

  const dropZone = (
    <li
      aria-live="polite"
      className={cn(
        "grid min-h-36 list-none place-items-center rounded-lg border border-dashed border-border/80 bg-surface/25 px-4 py-5 text-center text-sm leading-snug text-muted-foreground transition-[background-color,border-color,color] duration-150",
        isDropTarget && "border-primary/40 bg-surface/60 text-primary",
      )}
      key="empty-drop-zone"
      style={
        isDropTarget && dragState
          ? ({
              minHeight: `${Math.max(128, dragState.draggedHeight)}px`,
            } as CSSProperties)
          : undefined
      }
    >
      {/* ??  */}
      <span>{isDropTarget ? "" : emptyMessage}</span>
    </li>
  );

  const listItems = (() => {
    if (sets.length === 0) {
      return dropZone;
    }

    if (!isDropTarget || !dragState) {
      return draggedCard ? [...cards, draggedCard] : cards;
    }

    const insertAt = Math.min(dragState.targetIndex, cards.length);
    const ghost = (
      <li
        aria-hidden="true"
        className="list-none rounded-lg border border-dashed border-primary/40 bg-surface/50"
        key="drag-ghost"
        style={
          {
            height: `${dragState.draggedHeight}px`,
          } as CSSProperties
        }
      />
    );

    return [
      ...cards.slice(0, insertAt),
      ghost,
      ...cards.slice(insertAt),
      ...(draggedCard ? [draggedCard] : []),
    ];
  })();

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    const element = columnRef.current;

    if (!element) {
      return;
    }

    const handleTouchStart = (event: globalThis.TouchEvent) => {
      lastTouchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: globalThis.TouchEvent) => {
      if (dragStateRef.current) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? null;
      const lastY = lastTouchYRef.current;

      if (currentY === null || lastY === null) {
        lastTouchYRef.current = currentY;
        return;
      }

      const deltaY = lastY - currentY;

      if (handOffScroll(element, scrollContainerRef.current, deltaY)) {
        event.preventDefault();
      }

      lastTouchYRef.current = currentY;
    };

    const handleTouchEnd = () => {
      lastTouchYRef.current = null;
    };

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [columnRef, scrollContainerRef]);

  const handleWheel = (event: WheelEvent<HTMLUListElement>) => {
    if (dragState) {
      return;
    }

    if (
      handOffScroll(
        event.currentTarget,
        scrollContainerRef.current,
        event.deltaY,
      )
    ) {
      event.preventDefault();
    }
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] content-start gap-0 max-sm:h-auto max-sm:grid-rows-none",
        variant === "divided" &&
          "border-l border-border/70 pl-5 max-sm:border-l-0 max-sm:border-t max-sm:pl-0 max-sm:pt-4",
      )}
    >
      <header
        className={cn(
          children ? "grid gap-2" : "flex items-start justify-between gap-3",
        )}
      >
        <div>
          <h2
            className="m-0 font-display text-sm font-semibold leading-tight text-primary"
            id={titleId}
          >
            {title}
          </h2>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
        {children}
      </header>
      <ul
        aria-labelledby={titleId}
        className={cn(
          "timeline-scrollbar m-0 grid h-full min-h-0 content-start items-start gap-2 overflow-y-auto overflow-x-clip overscroll-y-contain p-0 pb-1 pt-4 max-sm:max-h-[32rem] max-sm:min-h-48",
          dragState && "max-h-none overflow-visible",
        )}
        data-dragging={dragState ? "true" : "false"}
        onWheel={handleWheel}
        ref={columnRef}
      >
        {listItems}
      </ul>
    </section>
  );
}
