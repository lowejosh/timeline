const PERF_LOG_INTERVAL_MS = 2000;
const PERF_SLOW_FRAME_MS = 14;
const PERF_SLOW_LOG_INTERVAL_MS = 500;

export type TimelinePerfBreakdown = {
  setupMs: number;
  eraMs: number;
  overlayMs: number;
  axisMs: number;
  markerMs: number;
  interactionMs: number;
  totalMs: number;
};

export type TimelinePerfSample = TimelinePerfBreakdown & {
  visibleEraCount: number;
  visibleOverlayCount: number;
  visibleMarkerCount: number;
  axisTickCount: number;
};

export type TimelinePerfStats = {
  frameCount: number;
  slowFrameCount: number;
  lastLogTime: number;
  lastSlowLogTime: number;
  maxTotalMs: number;
  totals: TimelinePerfBreakdown;
};

export type TimelinePerfMode = "off" | "basic" | "verbose";

export type TimelineVerboseMarkerSnapshot = {
  labelVisible: boolean;
  label: string;
  opacityBucket: number;
};

export type TimelineVerboseMarkerFrameState = TimelineVerboseMarkerSnapshot & {
  id: string;
};

export type TimelineVerboseSample = {
  invalidateReasons: string[];
  interactionActive: boolean;
  visibleLabelCount: number;
  markerStates: TimelineVerboseMarkerFrameState[];
};

export type TimelineVerboseStats = {
  lastLogTime: number;
  drawCount: number;
  scenePublishCount: number;
  scenePublishReasonCounts: Record<string, number>;
  invalidationCounts: Record<string, number>;
  coalescedInvalidationCounts: Record<string, number>;
  drawReasonCounts: Record<string, number>;
  interactionCounts: Record<string, number>;
  activeInteractionFrameCount: number;
  settledInteractionFrameCount: number;
  visibleLabelTotal: number;
  maxVisibleLabelCount: number;
  markerVisibilityFlipCount: number;
  markerTextChangeCount: number;
  markerOpacityBucketChangeCount: number;
  markerChangedCountTotal: number;
  markerFlipCounts: Record<string, number>;
  recentMarkerChanges: Array<{
    id: string;
    label: string;
    kind: string;
    from: string | number | boolean;
    to: string | number | boolean;
  }>;
  lastMarkerSnapshot: Map<string, TimelineVerboseMarkerSnapshot>;
  lastInteractionActive: boolean | null;
  interactionStateTransitionCount: number;
};

export function createTimelinePerfBreakdown(): TimelinePerfBreakdown {
  return {
    setupMs: 0,
    eraMs: 0,
    overlayMs: 0,
    axisMs: 0,
    markerMs: 0,
    interactionMs: 0,
    totalMs: 0,
  };
}

export function createTimelinePerfStats(): TimelinePerfStats {
  return {
    frameCount: 0,
    slowFrameCount: 0,
    lastLogTime: 0,
    lastSlowLogTime: 0,
    maxTotalMs: 0,
    totals: createTimelinePerfBreakdown(),
  };
}

export function createTimelineVerboseStats(): TimelineVerboseStats {
  return {
    lastLogTime: 0,
    drawCount: 0,
    scenePublishCount: 0,
    scenePublishReasonCounts: {},
    invalidationCounts: {},
    coalescedInvalidationCounts: {},
    drawReasonCounts: {},
    interactionCounts: {},
    activeInteractionFrameCount: 0,
    settledInteractionFrameCount: 0,
    visibleLabelTotal: 0,
    maxVisibleLabelCount: 0,
    markerVisibilityFlipCount: 0,
    markerTextChangeCount: 0,
    markerOpacityBucketChangeCount: 0,
    markerChangedCountTotal: 0,
    markerFlipCounts: {},
    recentMarkerChanges: [],
    lastMarkerSnapshot: new Map(),
    lastInteractionActive: null,
    interactionStateTransitionCount: 0,
  };
}

export function incrementCounter(
  counts: Record<string, number>,
  key: string,
  amount = 1,
) {
  counts[key] = (counts[key] ?? 0) + amount;
}

export function summarizeCounters(counts: Record<string, number>, limit = 8) {
  return Object.fromEntries(
    Object.entries(counts)
      .sort(
        (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
      )
      .slice(0, limit),
  );
}

export function roundMetric(value: number) {
  return Number(value.toFixed(2));
}

export function areStringArraysEqual(
  left: readonly string[],
  right: readonly string[],
) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function pushRecentMarkerChange(
  stats: TimelineVerboseStats,
  change: TimelineVerboseStats["recentMarkerChanges"][number],
) {
  stats.recentMarkerChanges.push(change);

  if (stats.recentMarkerChanges.length > 12) {
    stats.recentMarkerChanges.shift();
  }
}

export function getTimelinePerfMode(): TimelinePerfMode {
  if (typeof window === "undefined") {
    return "off";
  }

  const searchParams = new URLSearchParams(window.location.search);
  const mode =
    searchParams.get("timelinePerf") ??
    window.localStorage.getItem("timelinePerf");

  if (mode === "2" || mode === "verbose") {
    return "verbose";
  }

  if (mode === "1") {
    return "basic";
  }

  return "off";
}

export function recordTimelinePerf(
  stats: TimelinePerfStats,
  sample: TimelinePerfSample,
  now: number,
) {
  stats.frameCount += 1;
  stats.maxTotalMs = Math.max(stats.maxTotalMs, sample.totalMs);
  stats.totals.setupMs += sample.setupMs;
  stats.totals.eraMs += sample.eraMs;
  stats.totals.overlayMs += sample.overlayMs;
  stats.totals.axisMs += sample.axisMs;
  stats.totals.markerMs += sample.markerMs;
  stats.totals.interactionMs += sample.interactionMs;
  stats.totals.totalMs += sample.totalMs;

  if (sample.totalMs >= PERF_SLOW_FRAME_MS) {
    stats.slowFrameCount += 1;

    if (now - stats.lastSlowLogTime >= PERF_SLOW_LOG_INTERVAL_MS) {
      stats.lastSlowLogTime = now;
      console.info("[timeline perf] slow frame", {
        totalMs: Number(sample.totalMs.toFixed(2)),
        setupMs: Number(sample.setupMs.toFixed(2)),
        eraMs: Number(sample.eraMs.toFixed(2)),
        overlayMs: Number(sample.overlayMs.toFixed(2)),
        axisMs: Number(sample.axisMs.toFixed(2)),
        markerMs: Number(sample.markerMs.toFixed(2)),
        interactionMs: Number(sample.interactionMs.toFixed(2)),
        visibleEraCount: sample.visibleEraCount,
        visibleOverlayCount: sample.visibleOverlayCount,
        visibleMarkerCount: sample.visibleMarkerCount,
        axisTickCount: sample.axisTickCount,
      });
    }
  }

  if (stats.lastLogTime === 0) {
    stats.lastLogTime = now;
  }

  if (now - stats.lastLogTime < PERF_LOG_INTERVAL_MS) {
    return;
  }

  const frameCount = Math.max(stats.frameCount, 1);
  console.info("[timeline perf] summary", {
    frames: stats.frameCount,
    slowFrames: stats.slowFrameCount,
    avgTotalMs: Number((stats.totals.totalMs / frameCount).toFixed(2)),
    avgSetupMs: Number((stats.totals.setupMs / frameCount).toFixed(2)),
    avgEraMs: Number((stats.totals.eraMs / frameCount).toFixed(2)),
    avgOverlayMs: Number((stats.totals.overlayMs / frameCount).toFixed(2)),
    avgAxisMs: Number((stats.totals.axisMs / frameCount).toFixed(2)),
    avgMarkerMs: Number((stats.totals.markerMs / frameCount).toFixed(2)),
    avgInteractionMs: Number(
      (stats.totals.interactionMs / frameCount).toFixed(2),
    ),
    maxTotalMs: Number(stats.maxTotalMs.toFixed(2)),
  });

  stats.frameCount = 0;
  stats.slowFrameCount = 0;
  stats.lastLogTime = now;
  stats.maxTotalMs = 0;
  stats.totals = createTimelinePerfBreakdown();
}

export function recordTimelineVerboseSample(
  stats: TimelineVerboseStats,
  sample: TimelineVerboseSample,
  now: number,
) {
  stats.drawCount += 1;

  for (const reason of sample.invalidateReasons) {
    incrementCounter(stats.drawReasonCounts, reason);
  }

  if (sample.interactionActive) {
    stats.activeInteractionFrameCount += 1;
  } else {
    stats.settledInteractionFrameCount += 1;
  }

  stats.visibleLabelTotal += sample.visibleLabelCount;
  stats.maxVisibleLabelCount = Math.max(
    stats.maxVisibleLabelCount,
    sample.visibleLabelCount,
  );

  if (
    stats.lastInteractionActive !== null &&
    stats.lastInteractionActive !== sample.interactionActive
  ) {
    stats.interactionStateTransitionCount += 1;
    console.info("[timeline perf] interaction state", {
      active: sample.interactionActive,
      invalidateReasons: sample.invalidateReasons,
      visibleLabelCount: sample.visibleLabelCount,
    });
  }

  stats.lastInteractionActive = sample.interactionActive;

  const nextSnapshot = new Map<string, TimelineVerboseMarkerSnapshot>();
  let changedMarkerCount = 0;

  for (const state of sample.markerStates) {
    nextSnapshot.set(state.id, {
      labelVisible: state.labelVisible,
      label: state.label,
      opacityBucket: state.opacityBucket,
    });

    const previous = stats.lastMarkerSnapshot.get(state.id);
    let changed = false;

    if (previous) {
      if (previous.labelVisible !== state.labelVisible) {
        stats.markerVisibilityFlipCount += 1;
        incrementCounter(stats.markerFlipCounts, state.id);
        pushRecentMarkerChange(stats, {
          id: state.id,
          label: state.label,
          kind: "visibility",
          from: previous.labelVisible,
          to: state.labelVisible,
        });
        changed = true;
      }

      if (
        previous.label !== state.label &&
        (previous.labelVisible || state.labelVisible)
      ) {
        stats.markerTextChangeCount += 1;
        pushRecentMarkerChange(stats, {
          id: state.id,
          label: state.label,
          kind: "label",
          from: previous.label,
          to: state.label,
        });
        changed = true;
      }

      if (
        previous.opacityBucket !== state.opacityBucket &&
        (previous.labelVisible || state.labelVisible)
      ) {
        stats.markerOpacityBucketChangeCount += 1;
        pushRecentMarkerChange(stats, {
          id: state.id,
          label: state.label,
          kind: "opacity-bucket",
          from: previous.opacityBucket,
          to: state.opacityBucket,
        });
        changed = true;
      }
    }

    if (changed) {
      changedMarkerCount += 1;
    }
  }

  stats.markerChangedCountTotal += changedMarkerCount;
  stats.lastMarkerSnapshot = nextSnapshot;

  if (stats.lastLogTime === 0) {
    stats.lastLogTime = now;
  }

  if (now - stats.lastLogTime < PERF_LOG_INTERVAL_MS) {
    return;
  }

  const drawCount = Math.max(stats.drawCount, 1);
  console.info("[timeline perf] diagnostics", {
    draws: stats.drawCount,
    scenePublishes: stats.scenePublishCount,
    interactionStateTransitions: stats.interactionStateTransitionCount,
    interactionFrames: {
      active: stats.activeInteractionFrameCount,
      settled: stats.settledInteractionFrameCount,
    },
    labels: {
      avgVisible: roundMetric(stats.visibleLabelTotal / drawCount),
      maxVisible: stats.maxVisibleLabelCount,
      visibilityFlips: stats.markerVisibilityFlipCount,
      textChanges: stats.markerTextChangeCount,
      opacityBucketChanges: stats.markerOpacityBucketChangeCount,
      avgChangedMarkersPerDraw: roundMetric(
        stats.markerChangedCountTotal / drawCount,
      ),
      topFlappingMarkers: summarizeCounters(stats.markerFlipCounts, 8),
      recentChanges: stats.recentMarkerChanges,
    },
    invalidateCalls: summarizeCounters(stats.invalidationCounts, 12),
    coalescedInvalidations: summarizeCounters(
      stats.coalescedInvalidationCounts,
      12,
    ),
    drawReasons: summarizeCounters(stats.drawReasonCounts, 12),
    scenePublishReasons: summarizeCounters(stats.scenePublishReasonCounts, 12),
    interactionEvents: summarizeCounters(stats.interactionCounts, 12),
  });

  const lastMarkerSnapshot = stats.lastMarkerSnapshot;
  const lastInteractionActive = stats.lastInteractionActive;
  Object.assign(stats, createTimelineVerboseStats(), {
    lastLogTime: now,
    lastMarkerSnapshot,
    lastInteractionActive,
  });
}
