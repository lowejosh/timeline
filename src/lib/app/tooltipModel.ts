import {
  formatApproximateLabel,
  formatTimelinePointLabel,
  formatTimelineRange,
} from "../rendering/bands";
import {
  formatTimelineExactRange,
  formatTimelineExactTimestamp,
} from "../core/exactTimestamp";
import { ERA_SOURCES, type EraSourceId } from "../domain/eraSources";
import type {
  Era,
  TimelineMarker,
  TimelineOverlayBand,
} from "../core/timelineTypes";

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
  iconGroupId?: string;
  regionalScopeLabel?: string;
  description?: string;
  sources: TimelineTooltipSource[];
};

const EXPLICIT_RANGE_SEPARATORS = [" — ", " to "] as const;

function resolveTooltipSources(sourceIds?: EraSourceId[]) {
  const seen = new Set<string>();

  return (sourceIds ?? []).flatMap((sourceId) => {
    if (seen.has(sourceId)) {
      return [];
    }

    seen.add(sourceId);
    const source = ERA_SOURCES[sourceId];

    return [
      {
        id: sourceId,
        shortTitle: source.shortTitle,
        title: source.title,
        organization: source.organization,
        url: "url" in source ? source.url : undefined,
      },
    ];
  });
}

function formatExplicitApproximateRangeLabel(
  label: string,
  approximateStart?: boolean,
  approximateEnd?: boolean,
) {
  if (!approximateStart && !approximateEnd) {
    return label;
  }

  for (const separator of EXPLICIT_RANGE_SEPARATORS) {
    const separatorIndex = label.indexOf(separator);

    if (separatorIndex === -1) {
      continue;
    }

    const startLabel = label.slice(0, separatorIndex);
    const endLabel = label.slice(separatorIndex + separator.length);

    return `${formatApproximateLabel(startLabel, approximateStart)}${separator}${formatApproximateLabel(endLabel, approximateEnd)}`;
  }

  return formatApproximateLabel(label, approximateStart || approximateEnd);
}

export function getMarkerTooltipContent(
  marker: TimelineMarker,
): TimelineTooltipContent {
  return {
    kind: "marker",
    kindLabel: "Marker",
    title: marker.label,
    timeLabel: formatApproximateLabel(
      marker.timeLabel ??
        (marker.exactTime
          ? formatTimelineExactTimestamp(marker.exactTime)
          : formatTimelinePointLabel(marker.year, {
              label: marker.dateLabel,
            })),
      marker.approximate,
    ),
    regionalScopeLabel: marker.regionalScopeLabel,
    description: marker.description,
    sources: resolveTooltipSources(marker.sourceIds),
  };
}

export function getOverlayTooltipContent(
  overlay: TimelineOverlayBand,
): TimelineTooltipContent {
  return {
    kind: "overlay",
    kindLabel: "Band",
    title: overlay.label,
    iconGroupId: overlay.groupId,
    timeLabel:
      overlay.exactStartTime && overlay.exactEndTime
        ? formatTimelineExactRange(overlay.exactStartTime, overlay.exactEndTime)
        : formatTimelineRange(overlay.startYear, overlay.endYear, {
            approximateStart: overlay.approximateStart,
            approximateEnd: overlay.approximateEnd,
          }),
    regionalScopeLabel: overlay.regionalScopeLabel,
    description: overlay.description,
    sources: resolveTooltipSources(overlay.sourceIds),
  };
}

export function getEraTooltipContent(era: Era): TimelineTooltipContent {
  return {
    kind: "era",
    kindLabel: "Era",
    title: era.alternateName ? `${era.name} (${era.alternateName})` : era.name,
    timeLabel: era.timeLabel
      ? formatExplicitApproximateRangeLabel(
          era.timeLabel,
          era.approximateStart,
          era.approximateEnd,
        )
      : era.exactStartTime && era.exactEndTime
        ? formatTimelineExactRange(era.exactStartTime, era.exactEndTime)
        : formatTimelineRange(era.startYear, era.endYear, {
            approximateStart: era.approximateStart,
            approximateEnd: era.approximateEnd,
          }),
    regionalScopeLabel: era.regionalScopeLabel,
    description: era.description,
    sources: resolveTooltipSources(era.sourceIds),
  };
}
