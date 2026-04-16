import { formatTimelinePointLabel } from "./bands";
import type { TimelineMarker } from "../data/timelineTypes";

export type VisibleMarkerPosition = {
  marker: TimelineMarker;
  x: number;
};

export type MarkerTextMeasureInput = {
  fullLabel: string;
  shortLabel: string;
  dateLabel: string;
};

export type MeasuredMarkerText = {
  fullLabelWidth: number;
  shortLabelWidth: number;
  dateLabelWidth: number;
};

export type MarkerTextMeasurer = (
  marker: TimelineMarker,
  input: MarkerTextMeasureInput,
) => MeasuredMarkerText;

export type ResolvedMarkerRenderState = VisibleMarkerPosition & {
  revealProgress: number;
  timingProgress: number;
  dotProgress: number;
  stemProgress: number;
  intrinsicLabelOpacity: number;
  labelOpacity: number;
  label: string;
  dateLabel: string;
  width: number;
};

export type ResolveMarkerRenderOptions = {
  highlightedMarkerId?: string | null;
};

const MAX_MARKER_LABEL_WIDTH = 140;
const MARKER_LABEL_EDGE_INSET = 12;
const MARKER_LABEL_BOUNDARY_INSET = 8;
const MARKER_LABEL_OCCUPIED_PADDING = 14;

export const MARKER_STEM_REVEAL_START = 4;
export const MARKER_STEM_REVEAL_END = 20;
export const MARKER_DOT_REVEAL_START = 0;
export const MARKER_DOT_REVEAL_END = 42;
export const MARKER_MIN_TIMING_PROGRESS = 0.28;
export const MARKER_LABEL_FADE_START = 0.42;
export const MARKER_LABEL_FADE_END = 0.9;
export const MARKER_LABEL_CLEARANCE_FADE_START = -10;
export const MARKER_LABEL_CLEARANCE_FADE_END = 18;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value: number) {
  const clamped = clamp01(value);

  return clamped * clamped * (3 - 2 * clamped);
}

function getIntervalClearance(
  left: number,
  right: number,
  bounds: { left: number; right: number },
) {
  if (right < bounds.left) {
    return bounds.left - right;
  }

  if (left > bounds.right) {
    return left - bounds.right;
  }

  return -Math.min(right - bounds.left, bounds.right - left);
}

type MarkerTimingState = VisibleMarkerPosition & {
  revealProgress: number;
  timingProgress: number;
  dotProgress: number;
};

type PreparedMarkerRenderState = MarkerTimingState & {
  intrinsicLabelOpacity: number;
  label: string;
  dateLabel: string;
  width: number;
};

export function getVisibleMarkerPositions(
  markers: TimelineMarker[],
  width: number,
  pad: number,
  toX: (year: number) => number,
): VisibleMarkerPosition[] {
  return markers
    .map((marker) => ({ marker, x: toX(marker.year) }))
    .filter((marker) => marker.x >= pad + 4 && marker.x <= width - pad - 4);
}

function getEffectivePriority(
  marker: TimelineMarker,
  highlightedMarkerId?: string | null,
) {
  return (
    (marker.priority ?? 0) + (marker.id === highlightedMarkerId ? 1_000_000 : 0)
  );
}

function resolveMarkerTimingStates(
  markers: VisibleMarkerPosition[],
  options: ResolveMarkerRenderOptions = {},
) {
  const sortedByPriority = [...markers].sort(
    (left, right) =>
      getEffectivePriority(right.marker, options.highlightedMarkerId) -
        getEffectivePriority(left.marker, options.highlightedMarkerId) ||
      left.x - right.x,
  );
  const resolvedById = new Map<string, MarkerTimingState>();
  const higherPriorityMarkers: VisibleMarkerPosition[] = [];

  for (const marker of sortedByPriority) {
    const nearestHigherPriorityDistance = higherPriorityMarkers.reduce(
      (closest, otherMarker) =>
        Math.min(closest, Math.abs(marker.x - otherMarker.x)),
      Number.POSITIVE_INFINITY,
    );
    const revealProgress =
      nearestHigherPriorityDistance === Number.POSITIVE_INFINITY
        ? 1
        : clamp01(
            (nearestHigherPriorityDistance - MARKER_STEM_REVEAL_START) /
              (MARKER_STEM_REVEAL_END - MARKER_STEM_REVEAL_START),
          );
    const dotProgress =
      nearestHigherPriorityDistance === Number.POSITIVE_INFINITY
        ? 1
        : smoothstep01(
            clamp01(
              (nearestHigherPriorityDistance - MARKER_DOT_REVEAL_START) /
                (MARKER_DOT_REVEAL_END - MARKER_DOT_REVEAL_START),
            ),
          );

    resolvedById.set(marker.marker.id, {
      ...marker,
      revealProgress,
      timingProgress:
        nearestHigherPriorityDistance === Number.POSITIVE_INFINITY
          ? 1
          : MARKER_MIN_TIMING_PROGRESS +
            revealProgress * (1 - MARKER_MIN_TIMING_PROGRESS),
      dotProgress,
    });
    higherPriorityMarkers.push(marker);
  }

  return markers
    .map(
      (marker) =>
        resolvedById.get(marker.marker.id) ?? {
          ...marker,
          revealProgress: 1,
          timingProgress: 1,
          dotProgress: 1,
        },
    )
    .sort((left, right) => left.x - right.x);
}

export function resolveMarkerRenderStates(
  markers: VisibleMarkerPosition[],
  width: number,
  pad: number,
  measureText: MarkerTextMeasurer,
  options: ResolveMarkerRenderOptions = {},
): ResolvedMarkerRenderState[] {
  const timingStates = resolveMarkerTimingStates(markers, options);
  const preparedStates: PreparedMarkerRenderState[] = timingStates.map(
    (state) => {
      const fullLabel = state.marker.label;
      const shortLabel = state.marker.shortLabel ?? fullLabel;
      const dateLabel = formatTimelinePointLabel(state.marker.year, {
        label: state.marker.dateLabel,
        approximate: state.marker.approximate,
      });
      const { fullLabelWidth, shortLabelWidth, dateLabelWidth } = measureText(
        state.marker,
        {
          fullLabel,
          shortLabel,
          dateLabel,
        },
      );
      const useFullLabel = fullLabelWidth <= MAX_MARKER_LABEL_WIDTH;
      const label = useFullLabel ? fullLabel : shortLabel;
      const labelWidth = useFullLabel ? fullLabelWidth : shortLabelWidth;

      return {
        ...state,
        intrinsicLabelOpacity: clamp01(
          (state.timingProgress - MARKER_LABEL_FADE_START) /
            (MARKER_LABEL_FADE_END - MARKER_LABEL_FADE_START),
        ),
        label,
        dateLabel,
        width: Math.max(labelWidth, dateLabelWidth),
      };
    },
  );

  const candidates = preparedStates
    .filter(
      (state) =>
        state.x >= pad + MARKER_LABEL_EDGE_INSET &&
        state.x <= width - pad - MARKER_LABEL_EDGE_INSET,
    )
    .sort(
      (left, right) =>
        getEffectivePriority(right.marker, options.highlightedMarkerId) -
          getEffectivePriority(left.marker, options.highlightedMarkerId) ||
        left.x - right.x,
    );

  const finalLabelOpacityById = new Map(
    preparedStates.map((state) => [state.marker.id, 0]),
  );
  const occupied: Array<{ left: number; right: number }> = [];

  for (const candidate of candidates) {
    const left = Math.max(
      pad + MARKER_LABEL_BOUNDARY_INSET,
      candidate.x - candidate.width / 2 - MARKER_LABEL_OCCUPIED_PADDING,
    );
    const right = Math.min(
      width - pad - MARKER_LABEL_BOUNDARY_INSET,
      candidate.x + candidate.width / 2 + MARKER_LABEL_OCCUPIED_PADDING,
    );
    const nearestClearance = occupied.reduce(
      (closest, bounds) =>
        Math.min(closest, getIntervalClearance(left, right, bounds)),
      Number.POSITIVE_INFINITY,
    );
    const spacingOpacity =
      nearestClearance === Number.POSITIVE_INFINITY
        ? 1
        : clamp01(
            (nearestClearance - MARKER_LABEL_CLEARANCE_FADE_START) /
              (MARKER_LABEL_CLEARANCE_FADE_END -
                MARKER_LABEL_CLEARANCE_FADE_START),
          );

    if (spacingOpacity <= 0.01) {
      continue;
    }

    occupied.push({ left, right });
    finalLabelOpacityById.set(
      candidate.marker.id,
      candidate.intrinsicLabelOpacity * spacingOpacity,
    );
  }

  return preparedStates
    .map<ResolvedMarkerRenderState>((state) => {
      const labelOpacity = finalLabelOpacityById.get(state.marker.id) ?? 0;

      return {
        ...state,
        labelOpacity,
        stemProgress: smoothstep01(labelOpacity),
      };
    })
    .sort((left, right) => left.x - right.x);
}
