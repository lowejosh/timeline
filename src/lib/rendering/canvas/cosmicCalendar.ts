import {
  UNIVERSE_AGE_YEARS,
  getYearsAfterBigBang,
} from "../../core/timelineYears";
import {
  toApproximateTimelineYear,
  type PreciseTimelineYear,
} from "../../core/viewport";

/**
 * Carl Sagan's Cosmic Calendar: the entire 13.8-billion-year history of the
 * universe compressed into a single calendar year.
 *
 *   Jan 1, 00:00:00 → Big Bang
 *   Dec 31, 23:59:59 → Present day
 */

const COSMIC_YEAR_DAYS = 365;
const COSMIC_SECONDS_PER_DAY = 24 * 60 * 60;
const COSMIC_TOTAL_SECONDS = COSMIC_YEAR_DAYS * COSMIC_SECONDS_PER_DAY;

const MONTH_START_DAY = [
  0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
] as const;

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

// Actual-year thresholds for each label granularity
export const COSMIC_MONTH_YEARS = UNIVERSE_AGE_YEARS / 12;
export const COSMIC_DAY_YEARS = UNIVERSE_AGE_YEARS / COSMIC_YEAR_DAYS;
export const COSMIC_HOUR_YEARS = COSMIC_DAY_YEARS / 24;
export const COSMIC_MINUTE_YEARS = COSMIC_HOUR_YEARS / 60;
export const COSMIC_SECOND_YEARS = COSMIC_MINUTE_YEARS / 60;

type CosmicDate = {
  month: number; // 1–12
  day: number; // 1–31
  hour: number; // 0–23
  minute: number; // 0–59
  second: number; // 0–59
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function yearToCosmicDate(year: number | PreciseTimelineYear): CosmicDate {
  const approx =
    typeof year === "number" ? year : toApproximateTimelineYear(year);
  const yearsAfter = Math.max(0, getYearsAfterBigBang(approx));
  const position = Math.min(
    yearsAfter / UNIVERSE_AGE_YEARS,
    1 - Number.EPSILON,
  );
  const totalSeconds = position * COSMIC_TOTAL_SECONDS;
  const dayOfYear = Math.floor(totalSeconds / COSMIC_SECONDS_PER_DAY); // 0–364
  const secondsInDay = totalSeconds % COSMIC_SECONDS_PER_DAY;

  let month = 0;
  while (month < 11 && dayOfYear >= MONTH_START_DAY[month + 1]) {
    month++;
  }

  return {
    month: month + 1,
    day: dayOfYear - MONTH_START_DAY[month] + 1,
    hour: Math.floor(secondsInDay / 3600),
    minute: Math.floor((secondsInDay % 3600) / 60),
    second: Math.floor(secondsInDay % 60),
  };
}

export function formatCosmicCalendarLabel(
  year: number | PreciseTimelineYear,
  step: number,
): string {
  const d = yearToCosmicDate(year);
  const safeStep = Math.abs(step);

  if (safeStep >= COSMIC_MONTH_YEARS) {
    return MONTH_LONG[d.month - 1];
  }

  if (safeStep >= COSMIC_DAY_YEARS) {
    return `${MONTH_SHORT[d.month - 1]} ${d.day}`;
  }

  const time = `${pad2(d.hour)}:${pad2(d.minute)}`;

  if (safeStep >= COSMIC_MINUTE_YEARS) {
    return `${MONTH_SHORT[d.month - 1]} ${d.day} · ${time}`;
  }

  return `${MONTH_SHORT[d.month - 1]} ${d.day} · ${time}:${pad2(d.second)}`;
}
