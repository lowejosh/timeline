const DAY_IN_MS = 86_400_000;

function createTimelineUtcDate(
  year: number,
  month = 0,
  day = 1,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
) {
  const date = new Date(
    Date.UTC(2000, month, day, hours, minutes, seconds, milliseconds),
  );

  date.setUTCFullYear(year, month, day);
  date.setUTCHours(hours, minutes, seconds, milliseconds);

  return date;
}

function getTimelineYearStart(year: number) {
  return createTimelineUtcDate(year, 0, 1).getTime();
}

export function getTimelineYearFromDate(date: Date) {
  const year = date.getUTCFullYear();
  const start = getTimelineYearStart(year);
  const end = getTimelineYearStart(year + 1);
  const span = Math.max(end - start, DAY_IN_MS);

  return year + (date.getTime() - start) / span;
}

export function getPresentTimelineYear(now = new Date()) {
  return getTimelineYearFromDate(now);
}
