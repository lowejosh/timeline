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

export type ContextBandLabelVariant = "hidden" | "short" | "full";

export type AnimatedContextBandLabelState = {
  fromVariant: ContextBandLabelVariant;
  toVariant: ContextBandLabelVariant;
  queuedVariant: ContextBandLabelVariant | null;
  startTime: number;
  duration: number;
};

export type ResolvedContextBandLabelLayer = {
  variant: Exclude<ContextBandLabelVariant, "hidden">;
  opacity: number;
};

const DEFAULT_DARK_LABEL: RgbaColor = { r: 34, g: 26, b: 19, a: 1 };
const DEFAULT_LIGHT_LABEL: RgbaColor = { r: 252, g: 248, b: 241, a: 1 };
const DEFAULT_PAPER: RgbaColor = { r: 247, g: 240, b: 226, a: 1 };
const LIGHT_LABEL_PREFERRED_MAX_LUMINANCE = 0.315;
const LIGHT_LABEL_PREFERRED_MIN_CONTRAST = 2.7;
const LIGHT_LABEL_CONTRAST_BIAS = 1.05;
const CONTEXT_BAND_LABEL_PADDING = 10;
const CONTEXT_BAND_LABEL_SHOW_ENTER_SLACK = 6;
const CONTEXT_BAND_LABEL_SHOW_EXIT_SLACK = -2;
const CONTEXT_BAND_LABEL_FULL_ENTER_SLACK = 10;
const CONTEXT_BAND_LABEL_FULL_EXIT_SLACK = 2;
const CONTEXT_BAND_LABEL_SWAP_POINT = 0.48;
const MIN_VISIBLE_BAND_WIDTH_PX = 0;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function getContextBandLabelTransitionProgress(
  state: AnimatedContextBandLabelState,
  now: number,
) {
  if (state.duration <= 0) {
    return 1;
  }

  return clamp01((now - state.startTime) / state.duration);
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

export function resolveContextBandLabelVariant({
  availableWidth,
  fullLabelWidth,
  shortLabelWidth,
  currentVariant,
  hasDistinctShortLabel = true,
}: {
  availableWidth: number;
  fullLabelWidth: number;
  shortLabelWidth: number;
  currentVariant: ContextBandLabelVariant;
  hasDistinctShortLabel?: boolean;
}): ContextBandLabelVariant {
  const effectiveWidth = Math.max(availableWidth, 0);
  const normalizedCurrentVariant =
    !hasDistinctShortLabel && currentVariant === "short"
      ? "full"
      : currentVariant;
  const fullRoom =
    effectiveWidth - (Math.max(fullLabelWidth, 0) + CONTEXT_BAND_LABEL_PADDING);
  const shortRoom =
    hasDistinctShortLabel
      ? effectiveWidth -
        (Math.max(Math.min(shortLabelWidth, fullLabelWidth), 0) +
          CONTEXT_BAND_LABEL_PADDING)
      : Number.NEGATIVE_INFINITY;

  switch (normalizedCurrentVariant) {
    case "full":
      if (fullRoom >= CONTEXT_BAND_LABEL_FULL_EXIT_SLACK) {
        return "full";
      }

      if (shortRoom >= CONTEXT_BAND_LABEL_SHOW_EXIT_SLACK) {
        return "short";
      }

      return "hidden";
    case "short":
      if (fullRoom >= CONTEXT_BAND_LABEL_FULL_ENTER_SLACK) {
        return "full";
      }

      if (shortRoom >= CONTEXT_BAND_LABEL_SHOW_EXIT_SLACK) {
        return "short";
      }

      return "hidden";
    case "hidden":
    default:
      if (fullRoom >= CONTEXT_BAND_LABEL_FULL_ENTER_SLACK) {
        return "full";
      }

      if (shortRoom >= CONTEXT_BAND_LABEL_SHOW_ENTER_SLACK) {
        return "short";
      }

      return "hidden";
  }
}

export function stepAnimatedContextBandLabelState(
  state: AnimatedContextBandLabelState,
  now: number,
): AnimatedContextBandLabelState {
  const progress = getContextBandLabelTransitionProgress(state, now);

  if (progress < 1) {
    return state;
  }

  if (state.queuedVariant && state.queuedVariant !== state.toVariant) {
    return {
      fromVariant: state.toVariant,
      toVariant: state.queuedVariant,
      queuedVariant: null,
      startTime: now,
      duration: state.duration,
    };
  }

  return {
    ...state,
    fromVariant: state.toVariant,
    toVariant: state.toVariant,
    queuedVariant: null,
    startTime: now,
  };
}

export function syncAnimatedContextBandLabelState({
  existing,
  nextVariant,
  now,
  duration,
  hasInitialized,
}: {
  existing?: AnimatedContextBandLabelState;
  nextVariant: ContextBandLabelVariant;
  now: number;
  duration: number;
  hasInitialized: boolean;
}): AnimatedContextBandLabelState {
  if (!hasInitialized) {
    return {
      fromVariant: nextVariant,
      toVariant: nextVariant,
      queuedVariant: null,
      startTime: now,
      duration,
    };
  }

  if (!existing) {
    return {
      fromVariant: "hidden",
      toVariant: nextVariant,
      queuedVariant: null,
      startTime: now,
      duration,
    };
  }

  const steppedState = stepAnimatedContextBandLabelState(existing, now);
  const isActiveTransition = steppedState.fromVariant !== steppedState.toVariant;

  if (!isActiveTransition) {
    if (steppedState.toVariant === nextVariant) {
      return {
        ...steppedState,
        duration,
      };
    }

    return {
      fromVariant: steppedState.toVariant,
      toVariant: nextVariant,
      queuedVariant: null,
      startTime: now,
      duration,
    };
  }

  if (nextVariant === steppedState.toVariant) {
    return {
      ...steppedState,
      queuedVariant: null,
      duration,
    };
  }

  return {
    ...steppedState,
    queuedVariant: nextVariant,
    duration,
  };
}

export function isAnimatedContextBandLabelStateActive(
  state: AnimatedContextBandLabelState,
  now: number,
) {
  const steppedState = stepAnimatedContextBandLabelState(state, now);
  return steppedState.fromVariant !== steppedState.toVariant;
}

export function resolveAnimatedContextBandLabelLayers(
  state: AnimatedContextBandLabelState,
  now: number,
): ResolvedContextBandLabelLayer[] {
  const steppedState = stepAnimatedContextBandLabelState(state, now);

  if (steppedState.fromVariant === steppedState.toVariant) {
    return steppedState.toVariant === "hidden"
      ? []
      : [{ variant: steppedState.toVariant, opacity: 1 }];
  }

  const progress = getContextBandLabelTransitionProgress(steppedState, now);

  if (steppedState.fromVariant === "hidden") {
    return steppedState.toVariant === "hidden"
      ? []
      : [
          {
            variant: steppedState.toVariant,
            opacity: smoothstep01(progress),
          },
        ];
  }

  if (steppedState.toVariant === "hidden") {
    return [
      {
        variant: steppedState.fromVariant,
        opacity: 1 - smoothstep01(progress),
      },
    ];
  }

  if (progress < CONTEXT_BAND_LABEL_SWAP_POINT) {
    return [
      {
        variant: steppedState.fromVariant,
        opacity:
          1 - smoothstep01(progress / CONTEXT_BAND_LABEL_SWAP_POINT),
      },
    ];
  }

  return [
    {
      variant: steppedState.toVariant,
      opacity: smoothstep01(
        (progress - CONTEXT_BAND_LABEL_SWAP_POINT) /
          (1 - CONTEXT_BAND_LABEL_SWAP_POINT),
      ),
    },
  ];
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
  const effectiveMinVisibleWidth = minVisibleWidth ?? MIN_VISIBLE_BAND_WIDTH_PX;
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
