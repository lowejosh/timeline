export type AxisLabelCandidate = {
  x: number;
  text: string;
  secondaryText?: string;
  width: number;
  alpha: number;
  step: number;
  pixelsPerStep: number;
};

const AXIS_LABEL_HYSTERESIS_KEEP_RATIO = 0.86;
const AXIS_LABEL_SECONDARY_STEP_RATIO = 0.82;
const AXIS_SUBYEAR_SECONDARY_STEP_RATIO = 0.7;
const SUBYEAR_LABEL_MIN_CLEARANCE_PX = 12;

export function getAllowedAxisLabelSteps(
  candidates: AxisLabelCandidate[],
  useSubYearAxis: boolean,
  options: { preferredStep?: number } = {},
) {
  const stepMetrics = new Map<
    number,
    { score: number; maxWidth: number; minPixelsPerStep: number }
  >();

  for (const candidate of candidates) {
    const existing = stepMetrics.get(candidate.step);

    stepMetrics.set(candidate.step, {
      score: (existing?.score ?? 0) + candidate.alpha,
      maxWidth: Math.max(existing?.maxWidth ?? 0, candidate.width),
      minPixelsPerStep: Math.min(
        existing?.minPixelsPerStep ?? Number.POSITIVE_INFINITY,
        candidate.pixelsPerStep,
      ),
    });
  }

  const entries = [...stepMetrics.entries()].map(([step, metrics]) => ({
    step,
    ...metrics,
  }));
  const allowedSteps = new Set<number>();

  if (entries.length === 0) {
    return { allowedSteps, primaryStep: undefined as number | undefined };
  }

  const pickPreferredEntry = (
    candidatesByScore: typeof entries,
    readableSubYearEntries: typeof entries = candidatesByScore,
  ) => {
    const strongestEntry = candidatesByScore[0];
    const preferredEntry =
      options.preferredStep === undefined
        ? undefined
        : entries.find((entry) => entry.step === options.preferredStep);

    if (!preferredEntry) {
      return strongestEntry;
    }

    if (useSubYearAxis) {
      const readablePreferred = readableSubYearEntries.find(
        (entry) => entry.step === preferredEntry.step,
      );
      const strongestReadable = readableSubYearEntries[0] ?? strongestEntry;

      if (
        readablePreferred &&
        readablePreferred.score >=
          strongestReadable.score * AXIS_LABEL_HYSTERESIS_KEEP_RATIO
      ) {
        return readablePreferred;
      }

      return strongestReadable;
    }

    const strongestScaleDistance = Math.abs(
      Math.log(strongestEntry.step / preferredEntry.step),
    );

    if (
      strongestScaleDistance <= Math.log(3) &&
      preferredEntry.score >=
        strongestEntry.score * AXIS_LABEL_HYSTERESIS_KEEP_RATIO
    ) {
      return preferredEntry;
    }

    return strongestEntry;
  };

  if (useSubYearAxis) {
    const readableEntries = entries
      .filter(
        (entry) =>
          entry.step < 1 &&
          entry.minPixelsPerStep >=
            entry.maxWidth + SUBYEAR_LABEL_MIN_CLEARANCE_PX,
      )
      .sort(
        (left, right) =>
          left.step - right.step || right.score - left.score,
      );
    const preferredEntry = pickPreferredEntry(
      entries.sort(
        (left, right) =>
          right.score - left.score || right.step - left.step,
      ),
      readableEntries,
    );

    allowedSteps.add(preferredEntry.step);

    const sortedReadableEntries = [...readableEntries].sort(
      (left, right) =>
        right.score - left.score || right.step - left.step,
    );

    for (const entry of sortedReadableEntries) {
      if (entry.step === preferredEntry.step) {
        continue;
      }

      const ratio = entry.score / preferredEntry.score;
      const isAdjacentScale =
        Math.abs(Math.log(entry.step / preferredEntry.step)) <= Math.log(3);

      if (
        ratio >= AXIS_SUBYEAR_SECONDARY_STEP_RATIO &&
        isAdjacentScale &&
        allowedSteps.size < 2
      ) {
        allowedSteps.add(entry.step);
      }
    }

    return { allowedSteps, primaryStep: preferredEntry.step };
  }

  const sortedEntries = entries.sort(
    (left, right) => right.score - left.score || right.step - left.step,
  );
  const primaryEntry = pickPreferredEntry(sortedEntries);

  allowedSteps.add(primaryEntry.step);

  for (const entry of sortedEntries.slice(1)) {
    const ratio = entry.score / primaryEntry.score;
    const isAdjacentScale =
      Math.abs(Math.log(entry.step / primaryEntry.step)) <= Math.log(3);

    if (
      ratio >= AXIS_LABEL_SECONDARY_STEP_RATIO &&
      isAdjacentScale &&
      allowedSteps.size < 2
    ) {
      allowedSteps.add(entry.step);
    }
  }

  return { allowedSteps, primaryStep: primaryEntry.step };
}

export function getPrimaryAxisLabelStepFromResolvedLabels(
  labels: AxisLabelCandidate[],
  preferredStep?: number,
) {
  if (labels.length === 0) {
    return preferredStep;
  }

  const scores = new Map<number, number>();

  for (const label of labels) {
    scores.set(label.step, (scores.get(label.step) ?? 0) + label.alpha);
  }

  return [...scores.entries()].sort(
    (left, right) =>
      right[1] - left[1] ||
      (preferredStep !== undefined && left[0] === preferredStep ? -1 : 0) ||
      right[0] - left[0],
  )[0]?.[0];
}
