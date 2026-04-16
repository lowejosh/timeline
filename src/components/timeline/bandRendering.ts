type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type ResolveOverlayLabelPaintOptions = {
  bandColor: string;
  bandOpacity: number;
  fallbackLabelColor: string;
  backgroundColor: string;
};

type ResolveContextBandRenderStateOptions = {
  x0: number;
  x1: number;
  minX: number;
  maxX: number;
  minVisibleWidth?: number;
  minRenderWidth?: number;
  devicePixelRatio?: number;
};

export type ResolvedOverlayLabelPaint = {
  fillStyle: string;
  usesLightLabel: boolean;
};

export type ResolvedContextBandRenderState = {
  visibleWidth: number;
  renderLeft: number;
  renderWidth: number;
  alphaMultiplier: number;
};

const DEFAULT_DARK_LABEL: RgbaColor = { r: 34, g: 26, b: 19, a: 1 };
const DEFAULT_LIGHT_LABEL: RgbaColor = { r: 252, g: 248, b: 241, a: 1 };
const DEFAULT_PAPER: RgbaColor = { r: 247, g: 240, b: 226, a: 1 };
const LIGHT_LABEL_PREFERRED_MAX_LUMINANCE = 0.285;
const LIGHT_LABEL_PREFERRED_MIN_CONTRAST = 2.95;
const LIGHT_LABEL_CONTRAST_BIAS = 0.85;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function parseHexColor(color: string): RgbaColor | null {
  const hex = color.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b, a = "f"] = hex.split("");

    return {
      r: Number.parseInt(`${r}${r}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      b: Number.parseInt(`${b}${b}`, 16),
      a: Number.parseInt(`${a}${a}`, 16) / 255,
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  return null;
}

function parseRgbColor(color: string): RgbaColor | null {
  const match = color.match(/rgba?\(([^)]+)\)/i);

  if (!match) {
    return null;
  }

  const parts = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 3) {
    return null;
  }

  const [r, g, b, alpha = "1"] = parts;

  return {
    r: Number.parseFloat(r),
    g: Number.parseFloat(g),
    b: Number.parseFloat(b),
    a: Number.parseFloat(alpha),
  };
}

function parseColor(color: string): RgbaColor | null {
  const normalized = color.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("#")) {
    return parseHexColor(normalized);
  }

  if (normalized.startsWith("rgb")) {
    return parseRgbColor(normalized);
  }

  return null;
}

function withAlpha(color: RgbaColor, alpha: number): RgbaColor {
  return {
    ...color,
    a: clamp01(alpha),
  };
}

function blendColors(foreground: RgbaColor, background: RgbaColor): RgbaColor {
  const alpha = clamp01(foreground.a + background.a * (1 - foreground.a));

  if (alpha <= 0.0001) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  return {
    r:
      (foreground.r * foreground.a +
        background.r * background.a * (1 - foreground.a)) /
      alpha,
    g:
      (foreground.g * foreground.a +
        background.g * background.a * (1 - foreground.a)) /
      alpha,
    b:
      (foreground.b * foreground.a +
        background.b * background.a * (1 - foreground.a)) /
      alpha,
    a: alpha,
  };
}

function toRelativeLuminanceChannel(channel: number) {
  const normalized = channel / 255;

  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(color: RgbaColor) {
  return (
    0.2126 * toRelativeLuminanceChannel(color.r) +
    0.7152 * toRelativeLuminanceChannel(color.g) +
    0.0722 * toRelativeLuminanceChannel(color.b)
  );
}

function getContrastRatio(left: RgbaColor, right: RgbaColor) {
  const leftLuminance = getRelativeLuminance(left);
  const rightLuminance = getRelativeLuminance(right);
  const lighter = Math.max(leftLuminance, rightLuminance);
  const darker = Math.min(leftLuminance, rightLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function toCssColor(color: RgbaColor) {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a})`;
}

export function resolveOverlayLabelPaint({
  bandColor,
  bandOpacity,
  fallbackLabelColor,
  backgroundColor,
}: ResolveOverlayLabelPaintOptions): ResolvedOverlayLabelPaint {
  const parsedBandColor = parseColor(bandColor);
  const parsedLabelColor = parseColor(fallbackLabelColor) ?? DEFAULT_DARK_LABEL;
  const parsedBackgroundColor = parseColor(backgroundColor) ?? DEFAULT_PAPER;

  if (!parsedBandColor) {
    return {
      fillStyle: fallbackLabelColor,
      usesLightLabel: false,
    };
  }

  const effectiveBandColor = blendColors(
    withAlpha(parsedBandColor, parsedBandColor.a * clamp01(bandOpacity)),
    parsedBackgroundColor,
  );
  const darkCandidate = withAlpha(parsedLabelColor, 1);
  const lightContrast = getContrastRatio(
    DEFAULT_LIGHT_LABEL,
    effectiveBandColor,
  );
  const darkContrast = getContrastRatio(darkCandidate, effectiveBandColor);
  const effectiveBandLuminance = getRelativeLuminance(effectiveBandColor);
  const usesLightLabel =
    lightContrast >= darkContrast ||
    (effectiveBandLuminance <= LIGHT_LABEL_PREFERRED_MAX_LUMINANCE &&
      lightContrast >= LIGHT_LABEL_PREFERRED_MIN_CONTRAST) ||
    (lightContrast >= LIGHT_LABEL_PREFERRED_MIN_CONTRAST &&
      lightContrast + LIGHT_LABEL_CONTRAST_BIAS >= darkContrast);

  return {
    fillStyle: toCssColor(usesLightLabel ? DEFAULT_LIGHT_LABEL : darkCandidate),
    usesLightLabel,
  };
}

export function resolveContextBandRenderState({
  x0,
  x1,
  minX,
  maxX,
  minVisibleWidth,
  minRenderWidth,
  devicePixelRatio = 1,
}: ResolveContextBandRenderStateOptions): ResolvedContextBandRenderState | null {
  if (x1 < minX || x0 > maxX) {
    return null;
  }

  const pixelRatio = Math.max(devicePixelRatio, 1);
  const pixelStep = 1 / pixelRatio;
  const effectiveMinVisibleWidth = minVisibleWidth ?? pixelStep * 0.5;
  const effectiveMinRenderWidth = minRenderWidth ?? pixelStep;

  const clippedLeft = Math.max(x0, minX);
  const clippedRight = Math.min(x1, maxX);
  const visibleWidth = clippedRight - clippedLeft;

  if (visibleWidth < effectiveMinVisibleWidth) {
    return null;
  }

  if (visibleWidth >= effectiveMinRenderWidth) {
    return {
      visibleWidth,
      renderLeft: clippedLeft,
      renderWidth: visibleWidth,
      alphaMultiplier: 1,
    };
  }

  const midpoint = (clippedLeft + clippedRight) / 2;
  const renderWidth = effectiveMinRenderWidth;
  const maxRenderLeft = Math.max(minX, maxX - renderWidth);
  const snappedRenderLeft =
    Math.round((midpoint - renderWidth / 2) / pixelStep) * pixelStep;
  const renderLeft = Math.min(
    Math.max(snappedRenderLeft, minX),
    maxRenderLeft,
  );

  return {
    visibleWidth,
    renderLeft,
    renderWidth,
    alphaMultiplier: clamp01(visibleWidth / renderWidth),
  };
}