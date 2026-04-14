import type { EraSourceId } from "./eraSources";

export type TimelineSourceRef = {
  sourceId: EraSourceId;
  note?: string;
};

export type EraScheme =
  | "app-canonical"
  | "cosmic"
  | "chronostratigraphic"
  | "world-history"
  | "archaeological";

export type Era = {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  color: string;
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

type TimelineDecorationBase = TimelineZoomVisibility & {
  id: string;
  label: string;
  shortLabel?: string;
  priority?: number;
  sourceRefs?: TimelineSourceRef[];
};

export type TimelineMarker = TimelineDecorationBase & {
  year: number;
  color?: string;
};

export type TimelineOverlayBand = TimelineDecorationBase & {
  startYear: number;
  endYear: number;
  color: string;
  groupId?: string;
};

export type TimelineDisplayConfig = {
  markers: TimelineMarker[];
  overlays: TimelineOverlayBand[];
};

export type RootTimelineData = {
  rootEra: Era;
  display: TimelineDisplayConfig;
};