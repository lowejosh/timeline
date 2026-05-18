import type { TimelineSetDefinition } from "@/lib/catalog/setSchema";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";
import type { TimelineSetId } from "@/lib/core/timelineTypes";

export type ColumnId = "enabled" | "available";

export type AvailableSetsPageProps = {
  allSets: readonly TimelineSetDefinition[];
  catalog: TimelineCatalogSnapshot;
  enabledSetIds: ReadonlySet<TimelineSetId>;
  visibleSetIds: ReadonlySet<TimelineSetId>;
  orderedSetIds: readonly TimelineSetId[];
  isActive: boolean;
  customSetIds: ReadonlySet<TimelineSetId>;
  onApply: (
    nextEnabledSetIds: Set<TimelineSetId>,
    nextOrderedSetIds: TimelineSetId[],
  ) => void;
  onCreateSet: () => void;
  onDeleteCustomSet: (setId: TimelineSetId) => void;
  onEditCustomSet: (setId: TimelineSetId) => void;
  onToggleVisible: (setId: TimelineSetId, nextVisible: boolean) => void;
  onClose: () => void;
};

export type DraftColumns = {
  enabled: TimelineSetId[];
  available: TimelineSetId[];
};

export type ColumnLayoutSnapshot = {
  order: TimelineSetId[];
  rect: DOMRect;
  tops: Map<TimelineSetId, number>;
  heights: Map<TimelineSetId, number>;
};

export type DragLayouts = Record<ColumnId, ColumnLayoutSnapshot | null>;

export type DragState = {
  pointerId: number;
  captureElement: HTMLElement;
  scrollContainer: HTMLElement | null;
  setId: TimelineSetId;
  sourceColumn: ColumnId;
  targetColumn: ColumnId;
  sourceIndex: number;
  targetIndex: number;
  startClientX: number;
  startClientY: number;
  currentClientX: number;
  currentClientY: number;
  pointerOffsetX: number;
  pointerOffsetY: number;
  draggedWidth: number;
  draggedHeight: number;
  currentScrollTop: number;
  layouts: DragLayouts;
};
