import type { TimelineExactTimestamp } from "./exactTimestamp";

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

export type EraFamilyId = "cosmic" | "geological" | "human-history";

export type TimelineSetId = "cosmic" | "earth" | "human";

export type TimelineSetConfig = {
  id: TimelineSetId;
  label: string;
  description?: string;
  order: number;
  defaultEnabled?: boolean;
  familyIds: EraFamilyId[];
};

export type TimelineEraFamilyConfig = {
  id: EraFamilyId;
  label: string;
  description?: string;
  order: number;
  priority: number;
  defaultEnabled?: boolean;
};

export type Era = TimelineRegionalScope &
  TimelineApproximateRange & {
    id: string;
    name: string;
    alternateName?: string;
    startYear: number;
    endYear: number;
    exactStartTime?: TimelineExactTimestamp;
    exactEndTime?: TimelineExactTimestamp;
    color: string;
    timeLabel?: string;
    description?: string;
    scheme?: EraScheme;
    familyId?: EraFamilyId;
    priority?: number;
    setPriorityBoost?: number;
    isFamilyRoot?: boolean;
    sourceIds?: string[];
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

export type TimelineLayerAutoToggleRule =
  | {
      kind: "coverage-after-year";
      thresholdYear: number;
      hideCoverage?: number;
      showCoverage?: number;
      onlyWhenAnySetEnabled?: TimelineSetId[];
      onlyWhenAnyGroupEnabled?: string[];
      onlyWhenAnyGroupVisible?: string[];
    }
  | {
      kind: "max-visible-span";
      hideAtOrBelowYears: number;
      showAboveYears?: number;
      onlyWhenAnySetEnabled?: TimelineSetId[];
      onlyWhenAnyGroupEnabled?: string[];
      onlyWhenAnyGroupVisible?: string[];
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
  autoToggleRule?: TimelineLayerAutoToggleRule;
};

type TimelineDecorationBase = TimelineZoomVisibility &
  TimelineRegionalScope & {
    id: string;
    label: string;
    shortLabel?: string;
    description?: string;
    priority?: number;
    setPriorityBoost?: number;
    groupId?: string;
    setId?: TimelineSetId;
    subGroup?: string;
    sourceIds?: string[];
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
    autoToggleRule?: TimelineLayerAutoToggleRule;
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
