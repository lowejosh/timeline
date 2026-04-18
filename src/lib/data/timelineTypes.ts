import type { EraSourceId } from "./eraSources";
import type { TimelineExactTimestamp } from "../time/exactTimestamp";

export type TimelineSourceRef = {
  sourceId: EraSourceId;
  note?: string;
};

export type TimelineRegionalScope = {
  regionalScopeLabel?: string;
};

export type TimelineApproximatePoint = {
  approximate?: boolean;
};

export type TimelineApproximateRange = {
  approximateStart?: boolean;
  approximateEnd?: boolean;
};

export type EraScheme =
  | "app-canonical"
  | "cosmic"
  | "chronostratigraphic"
  | "world-history"
  | "archaeological";

export type Era = TimelineRegionalScope &
  TimelineApproximateRange & {
    id: string;
    name: string;
    startYear: number;
    endYear: number;
    exactStartTime?: TimelineExactTimestamp;
    exactEndTime?: TimelineExactTimestamp;
    color: string;
    timeLabel?: string;
    description?: string;
    scheme?: EraScheme;
    sourceRefs?: TimelineSourceRef[];
    children?: Era[];
  };

export type EraDefinition = Omit<Era, "color" | "children"> & {
  color?: string;
  children?: EraDefinition[];
};

export type TimelineZoomVisibility = {
  minZoom?: number;
  maxZoom?: number;
};

export type TimelineDecorationContentType = "markers" | "overlays" | "mixed";

export type TimelineDecorationCategory = {
  id: string;
  label: string;
  description?: string;
  order: number;
};

export type TimelineDecorationGroup = {
  id: string;
  categoryId: string;
  label: string;
  description?: string;
  contentType: TimelineDecorationContentType;
  order: number;
  defaultEnabled?: boolean;
};

type TimelineDecorationBase = TimelineZoomVisibility &
  TimelineRegionalScope & {
    id: string;
    label: string;
    shortLabel?: string;
    description?: string;
    priority?: number;
    groupId?: string;
    subGroup?: string;
    sourceRefs?: TimelineSourceRef[];
  };

export type TimelineMarker = TimelineDecorationBase &
  TimelineApproximatePoint & {
    year: number;
    exactTime?: TimelineExactTimestamp;
    color?: string;
    dateLabel?: string;
    timeLabel?: string;
  };

export type TimelineOverlayBand = TimelineDecorationBase &
  TimelineApproximateRange & {
    startYear: number;
    endYear: number;
    exactStartTime?: TimelineExactTimestamp;
    exactEndTime?: TimelineExactTimestamp;
    color: string;
    children?: TimelineOverlayBand[];
  };

export type TimelineDisplayConfig = {
  markers: TimelineMarker[];
  overlays: TimelineOverlayBand[];
};

export type RootTimelineData = {
  rootEra: Era;
  display: TimelineDisplayConfig;
};
