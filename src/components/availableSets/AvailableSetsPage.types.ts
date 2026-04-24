import type { TimelineSetDefinition } from "@/lib/catalog/setSchema";
import type { TimelineSetId } from "@/lib/core/timelineTypes";

export type ColumnId = "enabled" | "available";

export type AvailableSetsPageProps = {
  allSets: readonly TimelineSetDefinition[];
  enabledSetIds: ReadonlySet<TimelineSetId>;
  orderedSetIds: readonly TimelineSetId[];
  isActive: boolean;
  onApply: (
    nextEnabledSetIds: Set<TimelineSetId>,
    nextOrderedSetIds: TimelineSetId[],
  ) => void;
  onClose: () => void;
};

export type DraftColumns = {
  enabled: TimelineSetId[];
  available: TimelineSetId[];
};

export type ColumnLayoutSnapshot = {
  order: TimelineSetId[];
  baseTop: number;
  rect: DOMRect;
  tops: Map<TimelineSetId, number>;
  heights: Map<TimelineSetId, number>;
};

export type DragLayouts = Record<ColumnId, ColumnLayoutSnapshot | null>;

export type DragState = {
  pointerId: number;
  setId: TimelineSetId;
  sourceColumn: ColumnId;
  targetColumn: ColumnId;
  sourceIndex: number;
  targetIndex: number;
  startClientX: number;
  startClientY: number;
  currentClientX: number;
  currentClientY: number;
  pointerOffsetY: number;
  draggedHeight: number;
  layouts: DragLayouts;
};
