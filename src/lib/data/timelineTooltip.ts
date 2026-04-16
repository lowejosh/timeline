import { formatTimelineYear } from "../time/bands";
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

function formatTimelineRange(startYear: number, endYear: number) {
  const startLabel = formatTimelineYear(startYear, 1);
  const endLabel = formatTimelineYear(endYear, 1);

  return startLabel === endLabel ? startLabel : `${startLabel} — ${endLabel}`;
}

export function getMarkerTooltipContent(
  marker: TimelineMarker,
): TimelineTooltipContent {
  return {
    kind: "marker",
    kindLabel: "Marker",
    title: marker.label,
    timeLabel:
      marker.timeLabel ?? marker.dateLabel ?? formatTimelineYear(marker.year, 1),
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
    timeLabel: formatTimelineRange(overlay.startYear, overlay.endYear),
    description: overlay.description,
    sources: resolveTooltipSources(overlay.sourceRefs),
  };
}

export function getEraTooltipContent(era: Era): TimelineTooltipContent {
  return {
    kind: "era",
    kindLabel: "Era",
    title: era.name,
    timeLabel: formatTimelineRange(era.startYear, era.endYear),
    description: era.description,
    sources: resolveTooltipSources(era.sourceRefs),
  };
}
