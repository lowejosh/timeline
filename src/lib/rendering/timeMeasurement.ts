import { DURATION_UNITS, SECONDS_PER_YEAR } from "@/lib/core/time/duration";

const number = new Intl.NumberFormat("en", { maximumSignificantDigits: 3 });

export function formatMeasuredSpan(years: number): string {
  const span = Math.abs(years);
  if (!Number.isFinite(span) || span === 0) return "0 years";
  for (const [size, label] of [[1e9, "billion years"], [1e6, "million years"], [1e3, "thousand years"], [1, "years"], [1 / 365.2425, "days"], [1 / (365.2425 * 24), "hours"], [1 / (365.2425 * 1440), "minutes"]] as const) {
    if (span >= size) {
      const value = Number((span / size).toPrecision(3));
      return `${number.format(value)} ${value === 1 ? label.replace(/s$/, "") : label}`;
    }
  }
  const seconds = span * SECONDS_PER_YEAR;
  const unit = DURATION_UNITS.find(unit => seconds >= unit.seconds);
  return unit ? `${number.format(seconds / unit.seconds)} ${unit.label}` : `${seconds.toExponential(2)} s`;
}
