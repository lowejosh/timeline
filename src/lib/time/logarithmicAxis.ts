export type LogarithmicAxisGeometry = {
  focusRadiusPx: number;
  focusRadiusYears: number;
  pixelsPerDecade: number;
  decadeValue: number;
  decadeFloor: number;
  decadeRemainder: number;
};

export const LOGARITHMIC_AXIS_FOCUS_RADIUS_PX = 96;
export const LOGARITHMIC_AXIS_EPSILON_YEARS = 1e-9;

function clampToSafePositive(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return LOGARITHMIC_AXIS_EPSILON_YEARS;
  }

  return Math.max(value, LOGARITHMIC_AXIS_EPSILON_YEARS);
}

export function getLogarithmicAxisPixelsPerDecade(
  focusRadiusPx = LOGARITHMIC_AXIS_FOCUS_RADIUS_PX,
) {
  return Math.max(focusRadiusPx, 1) * Math.LN10;
}

export function resolveLogarithmicAxisGeometry(
  yearsPerPixel: number,
  focusRadiusPx = LOGARITHMIC_AXIS_FOCUS_RADIUS_PX,
): LogarithmicAxisGeometry {
  const safeFocusRadiusPx = Math.max(focusRadiusPx, 1);
  const focusRadiusYears = clampToSafePositive(yearsPerPixel * safeFocusRadiusPx);
  const pixelsPerDecade = getLogarithmicAxisPixelsPerDecade(
    safeFocusRadiusPx,
  );
  const decadeValue = Math.log10(focusRadiusYears);
  const decadeFloor = Math.floor(decadeValue);

  return {
    focusRadiusPx: safeFocusRadiusPx,
    focusRadiusYears,
    pixelsPerDecade,
    decadeValue,
    decadeFloor,
    decadeRemainder: decadeValue - decadeFloor,
  };
}

export function getLogarithmicScreenDeltaFromYearsDelta(
  yearsDelta: number,
  geometry: Pick<LogarithmicAxisGeometry, "focusRadiusYears" | "pixelsPerDecade">,
) {
  if (yearsDelta === 0) {
    return 0;
  }

  const sign = Math.sign(yearsDelta);
  const scaledMagnitude =
    Math.abs(yearsDelta) / clampToSafePositive(geometry.focusRadiusYears);

  return sign * Math.log10(1 + scaledMagnitude) * geometry.pixelsPerDecade;
}

export function getLogarithmicYearsDeltaFromScreenDelta(
  screenDelta: number,
  geometry: Pick<LogarithmicAxisGeometry, "focusRadiusYears" | "pixelsPerDecade">,
) {
  if (screenDelta === 0) {
    return 0;
  }

  const sign = Math.sign(screenDelta);
  const safePixelsPerDecade = Math.max(geometry.pixelsPerDecade, 1e-9);
  const magnitude = Math.pow(10, Math.abs(screenDelta) / safePixelsPerDecade) - 1;

  return sign * clampToSafePositive(geometry.focusRadiusYears) * magnitude;
}

export function getLogarithmicAxisRangeFactor(
  width: number,
  focusRadiusPx = LOGARITHMIC_AXIS_FOCUS_RADIUS_PX,
) {
  const safeWidth = Math.max(width, 1);
  const safeFocusRadiusPx = Math.max(focusRadiusPx, 1);
  const pixelsPerDecade = getLogarithmicAxisPixelsPerDecade(safeFocusRadiusPx);

  return (
    2 *
    safeFocusRadiusPx *
    (Math.pow(10, safeWidth / 2 / pixelsPerDecade) - 1)
  );
}