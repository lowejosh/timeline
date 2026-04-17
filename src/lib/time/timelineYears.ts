import { getPresentTimelineYear } from "./present";

export type TimelineYearLike =
  | number
  | {
      wholeYear: number;
      fraction: number;
    };

export const UNIVERSE_AGE_YEARS = 13_800_000_000;

function splitApproximateTimelineYear(year: number) {
  const wholeYear = Math.floor(year);

  return {
    wholeYear,
    fraction: year - wholeYear,
  };
}

function resolvePreciseTimelineYear(value: TimelineYearLike) {
  return typeof value === "number" ? splitApproximateTimelineYear(value) : value;
}

function toApproximateTimelineYear(value: TimelineYearLike) {
  const preciseYear = resolvePreciseTimelineYear(value);

  return preciseYear.wholeYear + preciseYear.fraction;
}

function toAstronomicalPreciseTimelineYear(value: TimelineYearLike) {
  const preciseYear = resolvePreciseTimelineYear(value);

  return {
    wholeYear:
      preciseYear.wholeYear < 1
        ? preciseYear.wholeYear + 1
        : preciseYear.wholeYear,
    fraction: preciseYear.fraction,
  };
}

export function getAstronomicalTimelineYear(value: TimelineYearLike) {
  const approximateYear = toApproximateTimelineYear(value);

  return approximateYear < 1 ? approximateYear + 1 : approximateYear;
}

export function getTimelineYearFromAstronomicalYearValue(year: number) {
  return year < 1 ? year - 1 : year;
}

export function getTimelineYearDelta(
  later: TimelineYearLike,
  earlier: TimelineYearLike,
) {
  const laterPreciseYear = toAstronomicalPreciseTimelineYear(later);
  const earlierPreciseYear = toAstronomicalPreciseTimelineYear(earlier);

  return (
    laterPreciseYear.wholeYear - earlierPreciseYear.wholeYear +
    (laterPreciseYear.fraction - earlierPreciseYear.fraction)
  );
}

export function getPreciseTimelineYearDelta(
  later: TimelineYearLike,
  earlier: TimelineYearLike,
) {
  const laterPreciseYear = toAstronomicalPreciseTimelineYear(later);
  const earlierPreciseYear = toAstronomicalPreciseTimelineYear(earlier);
  let wholeYears = laterPreciseYear.wholeYear - earlierPreciseYear.wholeYear;
  let fractionalYears = laterPreciseYear.fraction - earlierPreciseYear.fraction;

  if (fractionalYears < 0) {
    wholeYears -= 1;
    fractionalYears += 1;
  }

  if (fractionalYears >= 1) {
    wholeYears += 1;
    fractionalYears -= 1;
  }

  return {
    wholeYears,
    fractionalYears,
  };
}

export const TIMELINE_MAX_YEAR = getPresentTimelineYear();

export const TIMELINE_MIN_YEAR = getTimelineYearFromAstronomicalYearValue(
  getAstronomicalTimelineYear(TIMELINE_MAX_YEAR) - UNIVERSE_AGE_YEARS,
);

export function getTimelineYearFromYearsAgo(
  yearsAgo: number,
  referenceYear: TimelineYearLike = TIMELINE_MAX_YEAR,
) {
  return getTimelineYearFromAstronomicalYearValue(
    getAstronomicalTimelineYear(referenceYear) - yearsAgo,
  );
}

export function getTimelineYearFromYearsAfterBigBang(yearsAfterBigBang: number) {
  return getTimelineYearFromAstronomicalYearValue(
    getAstronomicalTimelineYear(TIMELINE_MIN_YEAR) + yearsAfterBigBang,
  );
}

export function getYearsAgoFromPresent(
  year: TimelineYearLike,
  presentYear: TimelineYearLike = TIMELINE_MAX_YEAR,
) {
  return getTimelineYearDelta(presentYear, year);
}

export function getYearsAfterBigBang(year: TimelineYearLike) {
  return getTimelineYearDelta(year, TIMELINE_MIN_YEAR);
}