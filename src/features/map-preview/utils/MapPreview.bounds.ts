import {
  MAP_WINDOW_DEFAULT_HEIGHT,
  MAP_WINDOW_DEFAULT_WIDTH,
  MAP_WINDOW_EDGE_GAP,
  MAP_WINDOW_MIN_HEIGHT,
  MAP_WINDOW_MIN_WIDTH,
  MAP_WINDOW_STORAGE_KEY,
} from "../MapPreview.const";
import type { MapWindowBounds, ResizeHandle } from "../MapPreview.types";
import { clamp } from "./MapPreview.utils";

export function getDefaultMapWindowBounds(stageWidth: number): MapWindowBounds {
  const width = Math.min(
    MAP_WINDOW_DEFAULT_WIDTH,
    Math.max(MAP_WINDOW_MIN_WIDTH, stageWidth - MAP_WINDOW_EDGE_GAP * 2),
  );

  return {
    height: MAP_WINDOW_DEFAULT_HEIGHT,
    left: Math.max(MAP_WINDOW_EDGE_GAP, (stageWidth - width) / 2),
    top: 44,
    width,
  };
}

export function normalizeMapWindowBounds(
  bounds: MapWindowBounds,
  stageWidth: number,
  stageHeight: number,
): MapWindowBounds {
  const maxWidth = Math.max(
    MAP_WINDOW_MIN_WIDTH,
    stageWidth - MAP_WINDOW_EDGE_GAP * 2,
  );
  const maxHeight = Math.max(
    MAP_WINDOW_MIN_HEIGHT,
    stageHeight - MAP_WINDOW_EDGE_GAP * 2,
  );
  const width = clamp(bounds.width, MAP_WINDOW_MIN_WIDTH, maxWidth);
  const height = clamp(bounds.height, MAP_WINDOW_MIN_HEIGHT, maxHeight);

  return {
    height,
    left: clamp(
      bounds.left,
      MAP_WINDOW_EDGE_GAP,
      Math.max(MAP_WINDOW_EDGE_GAP, stageWidth - width - MAP_WINDOW_EDGE_GAP),
    ),
    top: clamp(
      bounds.top,
      MAP_WINDOW_EDGE_GAP,
      Math.max(MAP_WINDOW_EDGE_GAP, stageHeight - height - MAP_WINDOW_EDGE_GAP),
    ),
    width,
  };
}

export function resizeMapWindowBounds(
  bounds: MapWindowBounds,
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
) {
  let nextLeft = bounds.left;
  let nextTop = bounds.top;
  let nextWidth = bounds.width;
  let nextHeight = bounds.height;

  if (handle.includes("e")) {
    nextWidth = bounds.width + deltaX;
  }

  if (handle.includes("s")) {
    nextHeight = bounds.height + deltaY;
  }

  if (handle.includes("w")) {
    nextLeft = bounds.left + deltaX;
    nextWidth = bounds.width - deltaX;
  }

  if (handle.includes("n")) {
    nextTop = bounds.top + deltaY;
    nextHeight = bounds.height - deltaY;
  }

  if (nextWidth < MAP_WINDOW_MIN_WIDTH && handle.includes("w")) {
    nextLeft = bounds.left + bounds.width - MAP_WINDOW_MIN_WIDTH;
    nextWidth = MAP_WINDOW_MIN_WIDTH;
  }

  if (nextHeight < MAP_WINDOW_MIN_HEIGHT && handle.includes("n")) {
    nextTop = bounds.top + bounds.height - MAP_WINDOW_MIN_HEIGHT;
    nextHeight = MAP_WINDOW_MIN_HEIGHT;
  }

  return {
    height: nextHeight,
    left: nextLeft,
    top: nextTop,
    width: nextWidth,
  };
}

export function readStoredMapWindowBounds() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(MAP_WINDOW_STORAGE_KEY) ?? "null",
    ) as Partial<MapWindowBounds> | null;

    if (
      !parsed ||
      typeof parsed.height !== "number" ||
      typeof parsed.left !== "number" ||
      typeof parsed.top !== "number" ||
      typeof parsed.width !== "number"
    ) {
      return null;
    }

    return parsed as MapWindowBounds;
  } catch {
    return null;
  }
}

export function writeStoredMapWindowBounds(bounds: MapWindowBounds) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(MAP_WINDOW_STORAGE_KEY, JSON.stringify(bounds));
  } catch {
    // The panel still works if storage is unavailable.
  }
}
