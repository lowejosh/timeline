/** Split coordinates for existing year-based rendering; no camera dependencies. */
export type PreciseTimelineYear = { wholeYear: number; fraction: number };

export function normalizePreciseTimelineYear(
  wholeYear: number,
  fraction: number,
): PreciseTimelineYear {
  let nextWholeYear = Math.trunc(wholeYear);
  let nextFraction = fraction;

  if (!Number.isFinite(nextFraction)) {
    nextFraction = 0;
  }

  if (nextFraction >= 1 || nextFraction < 0) {
    const carry = Math.floor(nextFraction);
    nextWholeYear += carry;
    nextFraction -= carry;
  }

  if (nextFraction < 0) {
    nextWholeYear -= 1;
    nextFraction += 1;
  }

  return {
    wholeYear: nextWholeYear,
    fraction: nextFraction,
  };
}

export function splitTimelineYear(year: number): PreciseTimelineYear {
  const wholeYear = Math.floor(year);

  return normalizePreciseTimelineYear(wholeYear, year - wholeYear);
}

export function toApproximateTimelineYear(year: PreciseTimelineYear) {
  return year.wholeYear + year.fraction;
}

export function addPreciseTimelineYears(
  year: PreciseTimelineYear,
  deltaYears: number,
) {
  return normalizePreciseTimelineYear(
    year.wholeYear,
    year.fraction + deltaYears,
  );
}

export function subtractPreciseTimelineYears(
  left: PreciseTimelineYear,
  right: PreciseTimelineYear,
) {
  return left.wholeYear - right.wholeYear + (left.fraction - right.fraction);
}

export function comparePreciseTimelineYears(
  left: PreciseTimelineYear,
  right: PreciseTimelineYear,
) {
  return left.wholeYear - right.wholeYear || left.fraction - right.fraction;
}

