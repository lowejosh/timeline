export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep01(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

export function interpolateProgress(
  progress: number,
  start: number,
  end: number,
) {
  if (end <= start) {
    return progress >= end ? 1 : 0;
  }

  return smoothstep01((progress - start) / (end - start));
}
