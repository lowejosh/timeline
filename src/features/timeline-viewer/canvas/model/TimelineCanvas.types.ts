import type { ResolvedTimelineOverlayBand } from "@/lib/rendering/overlayTracks";
import type { TimelineViewport } from "@/lib/core/viewport";
import type { EdgeRailSide } from "../interactions/edgeInteraction";
import type {
  Era,
  TimelineMarker,
  TimelineOverlayBand,
} from "@/lib/catalog/eras";

export type TimelineCanvasProps = {
  width: number;
  height: number;
  pad: number;
  overviewReservedHeight?: number;
  viewport: TimelineViewport;
  /** The currently drilled-into era (or root) */
  activeEra: Era;
  activeChain: Era[];
  /** Children of the active era's parent (the "base" layer, always visible) */
  siblingEras: Era[];
  markers: TimelineMarker[];
  overlayBands: TimelineOverlayBand[];
  enabledGroupIds: ReadonlySet<string>;
  overlayVisibilityTransitionKey: string;
  parentEra: Era | null;
  isCosmicCalendarMode: boolean;
  isAnimating: boolean;
  expandOverlayRequest?: { overlayId: string; seq: number } | null;
  onViewportChange: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onContinuousViewportChange: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onViewportGestureStart: () => void;
  onViewportGestureEnd: () => void;
  onAnimateZoom: (zoomDelta: number, anchorX: number) => void;
  onAnimateToRange: (startYear: number, endYear: number) => void;
  onDrillIntoEra: (era: Era) => void;
  onNavigateUp: () => void;
  onRecordDragSample: (dx: number) => void;
  onReleaseMomentum: () => void;
};

export type DragState = {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
  mode: "pending" | "pan" | "overlay-scroll";
};

export type EdgeRailInteractionState = {
  pointerId: number;
  side: EdgeRailSide;
  startY: number;
  lastY: number;
  lastEventTime: number;
  hasEngagedZoom: boolean;
  element: HTMLDivElement;
};

export type DualEdgeTouchZoomState = {
  leftTouchId: number;
  rightTouchId: number;
  lastAverageY: number;
};

export type PinchZoomState = {
  firstTouchId: number;
  secondTouchId: number;
  startDistance: number;
  startViewport: TimelineViewport;
};

export type TimelineCanvasScene = {
  width: number;
  height: number;
  viewport: TimelineViewport;
  activeEra: Era;
  activeChain: Era[];
  siblingEras: Era[];
  parentEra: Era | null;
  visibleMarkers: TimelineMarker[];
  resolvedOverlayBands: ResolvedTimelineOverlayBand[];
  overlayLaneCount: number;
};

export type TimelineSceneDiagnosticsSnapshot = {
  width: number;
  height: number;
  centerYear: number;
  zoom: number;
  activeEraId: string;
  visibleMarkerCount: number;
  overlayCount: number;
  overlayLaneCount: number;
  axisTickCount: number;
};
