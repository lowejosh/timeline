import { smoothstep01 } from "@/lib/core/easing";
import { parseColor } from "./colors";

const reducedMotion = typeof window === "undefined"
  ? null
  : window.matchMedia("(prefers-reduced-motion: reduce)");

type GradientFrame = {
  zoom: number;
  height: number;
  axisY: number;
  fills: Map<string, CanvasGradient | string>;
};

const frames = new WeakMap<CanvasRenderingContext2D, GradientFrame>();

function getEraSeed(id: string) {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index++) {
    hash = Math.imul(hash ^ id.charCodeAt(index), 16777619);
  }
  return (hash >>> 0) / 4294967296 * 127;
}

const TINT_ZOOM_SPAN = 4; // One new tint per 16x change in camera scale.
const TINT_STRENGTH = 1.3;
const PALETTE = [
  { hue: -22, saturation: 0.08, lightness: 0.035 },
  { hue: 18, saturation: 0.2, lightness: -0.05 },
  { hue: -12, saturation: -0.1, lightness: 0.065 },
  { hue: 24, saturation: 0.14, lightness: -0.025 },
  { hue: -24, saturation: 0.04, lightness: 0.04 },
  { hue: 14, saturation: 0.18, lightness: -0.055 },
  { hue: 0, saturation: -0.06, lightness: 0.015 },
];

/** A slow sequence of related hues. The axis sees the next tint first;
 * existing tints expand outward at camera scale. No repeating light/dark waves.
 */
export function sampleZoomTint(position: number, zoom: number, seed = 0, axisPosition = 0.8, originSize = 0.03) {
  const distance = (position - axisPosition) / originSize;
  const travel = (zoom - Math.log2(1 + distance * distance) * 0.5) / TINT_ZOOM_SPAN + seed % 1;
  const index = Math.floor(travel);
  // Distinct areas of colour with a broad, moving transition between them.
  // Hold the destination briefly so it reads as somewhere we are zooming into,
  // rather than continuously averaging the whole backdrop between two tints.
  const blend = smoothstep01((travel - index - 0.04) / 0.68) ** 0.75;
  const paletteAt = (level: number) => {
    const offset = level + Math.floor(seed);
    const tint = PALETTE[((offset % PALETTE.length) + PALETTE.length) % PALETTE.length];
    // Slightly different destinations on later visits, still within this era's hue family.
    return { ...tint, hue: tint.hue + Math.sin(level * 2.39996 + seed) * 4 };
  };
  const from = paletteAt(index);
  const to = paletteAt(index + 1);
  return {
    hue: from.hue + (to.hue - from.hue) * blend,
    saturation: from.saturation + (to.saturation - from.saturation) * blend,
    lightness: from.lightness + (to.lightness - from.lightness) * blend,
  };
}

function toHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const lightness = (max + min) / 2;
  const saturation = chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * lightness - 1));
  const hue = chroma === 0 ? 0 : 60 * (max === r
    ? ((g - b) / chroma + 6) % 6
    : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4);
  return { hue, saturation, lightness };
}

/** Era-specific shading follows zoom and rests when the camera rests.
 * Cache only the current frame; panning and hover reuse the same gradients.
 */
export function getEraZoomFill(
  context: CanvasRenderingContext2D,
  color: string,
  height: number,
  axisY: number,
  zoom: number,
  eraId: string,
): CanvasGradient | string {
  if (height <= 0 || !Number.isFinite(zoom)) return color;
  const effectiveZoom = reducedMotion?.matches ? 0 : zoom;
  let frame = frames.get(context);
  if (!frame || frame.zoom !== effectiveZoom || frame.height !== height || frame.axisY !== axisY) {
    frame = {
      zoom: effectiveZoom,
      height,
      axisY,
      fills: new Map(),
    };
    frames.set(context, frame);
  }
  const key = `${eraId}\0${color}`;
  const existing = frame.fills.get(key);
  if (existing !== undefined) return existing;

  const base = parseColor(color);
  if (!base || base.a <= 0) return color;

  const gradient = context.createLinearGradient(0, 0, 0, height);
  const seed = getEraSeed(eraId);
  const hsl = toHsl(base.r, base.g, base.b);
  const axisPosition = axisY / height;
  const originRadius = 32;
  const originSize = originRadius / height;
  // Sample densely where colour is born, then more sparsely as it expands.
  // Give the upcoming tint a small, readable area on either side of the line.
  const positions = new Set([0, 1, Math.max(0, Math.min(1, axisPosition))]);
  const reach = Math.max(Math.abs(axisY), Math.abs(height - axisY));
  for (let index = 0; index <= 72; index++) {
    const distance = originRadius * Math.expm1(Math.log1p(reach / originRadius) * index / 72);
    for (const y of [axisY - distance, axisY + distance]) {
      if (y > 0 && y < height) positions.add(y / height);
    }
  }
  for (const position of [...positions].sort((a, b) => a - b)) {
    const tint = sampleZoomTint(position, effectiveZoom, seed, axisPosition, originSize);
    const hue = hsl.hue + (hsl.saturation > 0.02 ? tint.hue * TINT_STRENGTH : 0);
    const saturation = Math.max(0, Math.min(1, hsl.saturation * (1 + tint.saturation * TINT_STRENGTH)));
    const lightness = Math.max(0, Math.min(1, hsl.lightness + tint.lightness * TINT_STRENGTH));
    gradient.addColorStop(position,
      `hsla(${hue.toFixed(3)}, ${(saturation * 100).toFixed(3)}%, ${(lightness * 100).toFixed(3)}%, ${base.a})`,
    );
  }

  // Retain only the current camera frame, and bound colour edits at a fixed zoom.
  if (frame.fills.size >= 128) frame.fills.clear();
  frame.fills.set(key, gradient);
  return gradient;
}
