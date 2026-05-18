import type { TimelineRawTimelinePoint } from "@/lib/catalog/setSchema";

function formatNumber(value: number | string | undefined) {
  return Number(value ?? 0).toLocaleString();
}

export function formatTimelinePoint(point: TimelineRawTimelinePoint) {
  if (typeof point === "number") {
    if (point < 1) {
      return `${Math.round(1 - point).toLocaleString()} BCE`;
    }

    return `${Math.round(point).toLocaleString()} CE`;
  }

  if (point.kind === "relative") {
    return `${formatNumber(point.value)} ${
      point.reference === "after-big-bang" ? "after Big Bang" : "years ago"
    }`;
  }

  if (point.kind === "calendar") {
    return `${point.year.toLocaleString()} ${point.era.toUpperCase()}`;
  }

  return `${formatNumber(point.years)} ${
    point.reference === "after-big-bang" ? "after Big Bang" : "years ago"
  }`;
}
