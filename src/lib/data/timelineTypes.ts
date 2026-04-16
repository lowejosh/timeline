import type { EraSourceId } from "./eraSources";

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

export type Era = TimelineRegionalScope & TimelineApproximateRange & {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  color: string;
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

type TimelineDecorationBase = TimelineZoomVisibility & TimelineRegionalScope & {
  id: string;
  label: string;
  shortLabel?: string;
  description?: string;
  priority?: number;
  sourceRefs?: TimelineSourceRef[];
};

export type TimelineMarker = TimelineDecorationBase & TimelineApproximatePoint & {
  year: number;
  color?: string;
  dateLabel?: string;
  timeLabel?: string;
};

export type TimelineOverlayBand =
  TimelineDecorationBase & TimelineApproximateRange & {
  startYear: number;
  endYear: number;
  color: string;
  groupId?: string;
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
