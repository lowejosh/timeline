import {
  formatApproximateLabel,
  formatTimelinePointLabel,
  formatTimelineRange,
} from "../time/bands";
import { ERA_SOURCES } from "./eraSources";
import type {
  Era,
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSourceRef,
} from "./timelineTypes";

export type TimelineTooltipSource = {
  id: string;
  shortTitle: string;
  title: string;
  organization: string;
  url?: string;
};

export type TimelineTooltipContent = {
  kind: "era" | "marker" | "overlay";
  kindLabel: string;
  title: string;
  timeLabel: string;
  regionalScopeLabel?: string;
  description?: string;
  sources: TimelineTooltipSource[];
};

function resolveTooltipSources(sourceRefs?: TimelineSourceRef[]) {
  const seen = new Set<string>();

  return (sourceRefs ?? []).flatMap((sourceRef) => {
    if (seen.has(sourceRef.sourceId)) {
      return [];
    }

    seen.add(sourceRef.sourceId);
    const source = ERA_SOURCES[sourceRef.sourceId];

    return [
      {
        id: sourceRef.sourceId,
        shortTitle: source.shortTitle,
        title: source.title,
        organization: source.organization,
        url: "url" in source ? source.url : undefined,
      },
    ];
  });
}

export function getMarkerTooltipContent(
  marker: TimelineMarker,
): TimelineTooltipContent {
  return {
    kind: "marker",
    kindLabel: "Marker",
    title: marker.label,
    timeLabel: formatApproximateLabel(
      marker.timeLabel ?? formatTimelinePointLabel(marker.year, {
        label: marker.dateLabel,
      }),
      marker.approximate,
    ),
    regionalScopeLabel: marker.regionalScopeLabel,
    description: marker.description,
    sources: resolveTooltipSources(marker.sourceRefs),
  };
}

export function getOverlayTooltipContent(
  overlay: TimelineOverlayBand,
): TimelineTooltipContent {
  return {
    kind: "overlay",
    kindLabel: "Band",
    title: overlay.label,
    timeLabel: formatTimelineRange(overlay.startYear, overlay.endYear, {
      approximateStart: overlay.approximateStart,
      approximateEnd: overlay.approximateEnd,
    }),
    regionalScopeLabel: overlay.regionalScopeLabel,
    description: overlay.description,
    sources: resolveTooltipSources(overlay.sourceRefs),
  };
}

export function getEraTooltipContent(era: Era): TimelineTooltipContent {
  return {
    kind: "era",
    kindLabel: "Era",
    title: era.name,
    timeLabel:
      era.timeLabel ??
      formatTimelineRange(era.startYear, era.endYear, {
        approximateStart: era.approximateStart,
        approximateEnd: era.approximateEnd,
      }),
    regionalScopeLabel: era.regionalScopeLabel,
    description: era.description,
    sources: resolveTooltipSources(era.sourceRefs),
  };
}
