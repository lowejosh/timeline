import { getTimelineYearFromExactTimestamp } from "../core/exactTimestamp";
import {
  createExactCalendarTimestamp,
  createExactElapsedTimestamp,
} from "../core/exactTimestamp";

export function bce(year: number) {
  return getTimelineYearFromExactTimestamp(
    createExactCalendarTimestamp({
      era: "bce",
      year,
      precision: "year",
    }),
  );
}

export function ce(year: number) {
  return getTimelineYearFromExactTimestamp(
    createExactCalendarTimestamp({
      era: "ce",
      year,
      precision: "year",
    }),
  );
}

export function yearsAgo(years: number) {
  return getTimelineYearFromExactTimestamp(
    createExactElapsedTimestamp({
      reference: "ago",
      years: BigInt(Math.round(years)),
      precision: "year",
    }),
  );
}

export function afterBigBang(years: number) {
  return getTimelineYearFromExactTimestamp(
    createExactElapsedTimestamp({
      reference: "after-big-bang",
      years: BigInt(Math.round(years)),
      precision: "year",
    }),
  );
}
