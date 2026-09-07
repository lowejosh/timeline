/** Exact decimal seconds, including scales smaller than a microsecond. */
export type Duration = { coefficient: bigint; exponent10: number };
export const SECONDS_PER_YEAR = 31_556_952;
export const MICROSECOND: Duration = { coefficient: 1n, exponent10: -6 };

export function duration(coefficient: bigint, exponent10: number): Duration {
  if (!Number.isInteger(exponent10) || Math.abs(exponent10) > 1000) throw new RangeError("Invalid duration exponent");
  if (coefficient === 0n) return { coefficient: 0n, exponent10: 0 };
  while (coefficient % 10n === 0n && exponent10 < 1000) { coefficient /= 10n; exponent10 += 1; }
  return { coefficient, exponent10 };
}

export function subtractDurations(a: Duration, b: Duration): Duration {
  a = duration(a.coefficient, a.exponent10);
  b = duration(b.coefficient, b.exponent10);
  const exponent = Math.min(a.exponent10, b.exponent10);
  return duration(a.coefficient * 10n ** BigInt(a.exponent10 - exponent) - b.coefficient * 10n ** BigInt(b.exponent10 - exponent), exponent);
}

export function compareDurations(a: Duration, b: Duration) {
  const difference = subtractDurations(a, b).coefficient;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

/** Convert only after subtracting the local origin, never before. */
export function durationInSeconds(value: Duration) {
  return Number(`${value.coefficient}e${value.exponent10}`);
}
export function durationInYears(value: Duration) { return durationInSeconds(value) / SECONDS_PER_YEAR; }
export function serializeDuration(value: Duration) { return { coefficient: value.coefficient.toString(), exponent10: value.exponent10 }; }
export function deserializeDuration(value: { coefficient: string; exponent10: number }) {
  if (!/^-?\d+$/.test(value.coefficient)) throw new TypeError("Invalid duration coefficient");
  return duration(BigInt(value.coefficient), value.exponent10);
}

export const DURATION_UNITS = [
  { label: "s", seconds: 1 }, { label: "ms", seconds: 1e-3 },
  { label: "µs", seconds: 1e-6 }, { label: "ns", seconds: 1e-9 },
  { label: "ps", seconds: 1e-12 }, { label: "fs", seconds: 1e-15 },
] as const;
export function formatDuration(value: Duration) {
  const seconds = durationInSeconds(value);
  if (!seconds) return "0 s";
  const unit = DURATION_UNITS.find(unit => Math.abs(seconds) >= unit.seconds);
  return unit ? `${Number((seconds / unit.seconds).toPrecision(6))} ${unit.label}` : `${seconds.toExponential(5)} s`;
}

/** One policy for all calendar-unit adapters: at least 1 µs per 1200px. */
export function minimumViewportDuration(width: number): Duration {
  const safeWidth = Number.isFinite(width) ? Math.max(1, width) : 1;
  return duration(BigInt(Math.ceil(Math.max(1, safeWidth / 1200) * 1e6)), -12);
}
