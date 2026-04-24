import { clamp01 } from "@/lib/core/easing";

export type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export function parseHexColor(color: string): RgbaColor | null {
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

export function parseRgbColor(color: string): RgbaColor | null {
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

export function parseColor(color: string): RgbaColor | null {
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

export function withAlpha(color: RgbaColor, alpha: number): RgbaColor {
  return {
    ...color,
    a: clamp01(alpha),
  };
}

export function toCssColor(color: RgbaColor) {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a})`;
}
