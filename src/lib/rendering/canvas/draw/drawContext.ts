import type { RefObject } from "react";
import type { Era, TimelineMarker } from "@/lib/core/timelineTypes";
import type { PreciseTimelineYear } from "@/lib/core/viewport";
import type { ResolvedTimelineEraLayer } from "@/lib/rendering/childLayers";
import type { ResolvedTimelineOverlayBand } from "@/lib/rendering/overlayTracks";
import type { AnimatedOverlayBandState } from "@/lib/rendering/animation/overlayBand";
import type { AnimatedAxisTickState } from "@/lib/rendering/animation/axisTickState";
import type { MarkerPriorityBoostState } from "@/lib/rendering/animation/markerPriorityBoost";
import type { ExpandedOverlayLayoutResult } from "@/lib/rendering/expandedOverlayLayout";
import type {
  TimelineCanvasLayout,
  ExpandedOverlayDetail,
} from "../overlayLayout";
import type {
  EraScreenSpan,
  PrimordialDetailStripSegment,
} from "../primordial";
import type { CanvasOcclusionRect } from "../drawing";
import type { TimelinePerfBreakdown } from "../perf";
import type { TimelineTooltipContent } from "@/lib/app/tooltipModel";

export type HoverRegion = {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  anchorX: number;
  anchorY: number;
  anchorMode?: "fixed" | "follow-x";
  placement: "above" | "below";
  tooltip: TimelineTooltipContent;
};

export type OverlayInteractionRegion = {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  role: "parent" | "child" | "panel";
  parentId?: string;
  tooltip?: TimelineTooltipContent;
};

export type ExpandedOverlayExpansionState = {
  detail: ExpandedOverlayDetail;
  fullHeight: number;
  progress: number;
  animatedHeight: number;
};

export type CanvasDrawFrameFlags = {
  hasActivePrimordialDetailStripAnimation: boolean;
};

export type CanvasDrawContext = {
  // Canvas
  context: CanvasRenderingContext2D;
  sceneWidth: number;
  sceneHeight: number;
  pad: number;
  innerWidth: number;
  devicePixelRatio: number;

  // Viewport
  sceneViewport: import("@/lib/core/viewport").TimelineViewport;

  // Layout
  layout: TimelineCanvasLayout;

  // Theme
  background: CanvasGradient;
  paper: string;
  line: string;
  lineSoft: string;
  labelColor: string;
  fontSans: string;

  // Frame time
  drawNow: number;

  // Scene data
  sceneActiveEra: Era;
  sceneActiveChain: Era[];
  sceneParentEra: Era | null;
  sceneVisibleMarkers: TimelineMarker[];
  sceneResolvedOverlayBands: ResolvedTimelineOverlayBand[];

  // Frame-resolved state
  visibleEraLayers: ResolvedTimelineEraLayer[];
  paintOrderedEraLayers: ResolvedTimelineEraLayer[];
  eraScreenSpanById: Map<string, EraScreenSpan>;
  breadcrumbChain: Era[];
  breadcrumbChainIds: Set<string>;
  visibleOverlayIds: Set<string>;
  animatedOverlayBands: AnimatedOverlayBandState[];
  animatedOverlayLaneCount: number;
  resolvedOverlayLayout: ExpandedOverlayLayoutResult;
  expandedOverlayExpansionStates: ExpandedOverlayExpansionState[];
  resolvedAxisTickStates: AnimatedAxisTickState[];
  primordialDetailStripSegments: PrimordialDetailStripSegment[];
  renderedPrimordialDetailStripSegments: PrimordialDetailStripSegment[];
  primordialDetailStripOpacity: number;
  allowPrimordialSyntheticDetail: boolean;
  sceneMaxZoom: number;

  // Animation refs (mutable)
  markerPriorityBoostRef: RefObject<Map<string, MarkerPriorityBoostState>>;
  expandedOverlayProgressByIdRef: RefObject<Map<string, number>>;

  // Mutable draw outputs (written by draw phases, consumed post-draw)
  hoverRegions: HoverRegion[];
  overlayInteractionRegions: OverlayInteractionRegion[];
  overlayOcclusionRects: CanvasOcclusionRect[];
  frameFlags: CanvasDrawFrameFlags;

  // Coordinate helpers
  toX: (year: number) => number;
  fromX: (px: number) => PreciseTimelineYear;

  // Perf
  markPerf: (key: Exclude<keyof TimelinePerfBreakdown, "totalMs">) => void;

  // Interaction state
  isViewportInteractionActive: boolean;
  preferredAxisLabelStepRef: RefObject<number | undefined>;

  // Display modes
  isCosmicCalendarMode: boolean;
};
