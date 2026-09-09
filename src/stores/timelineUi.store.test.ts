import { afterEach, expect, it, vi } from "vitest";
import { useTimelineUiStore } from "./timelineUi.store";
import { readStoredZoomColorsEnabled, writeStoredMapPreviewEnabled, readStoredMapPreviewEnabled } from "@/lib/app/timelineSetStorage";

afterEach(() => {
  useTimelineUiStore.setState({ isZoomColorsEnabled: false });
  vi.unstubAllGlobals();
});

it("defaults zoom colours off and saves the switch without changing other settings", () => {
  const storage = new Map<string, string>();
  vi.stubGlobal("window", { localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  } });
  expect(readStoredZoomColorsEnabled()).toBe(false);
  expect(useTimelineUiStore.getState().isZoomColorsEnabled).toBe(false);
  writeStoredMapPreviewEnabled(true);
  useTimelineUiStore.getState().setIsZoomColorsEnabled(true);
  expect(useTimelineUiStore.getState().isZoomColorsEnabled).toBe(true);
  expect(readStoredZoomColorsEnabled()).toBe(true);
  useTimelineUiStore.getState().setIsZoomColorsEnabled(false);
  expect(readStoredZoomColorsEnabled()).toBe(false);
  expect(readStoredMapPreviewEnabled()).toBe(true);
});

it("still toggles when browser storage is unavailable", () => {
  vi.stubGlobal("window", { localStorage: {
    getItem: () => { throw new Error("Storage disabled"); },
    setItem: () => { throw new Error("Storage disabled"); },
  } });
  expect(readStoredZoomColorsEnabled()).toBe(false);
  useTimelineUiStore.getState().setIsZoomColorsEnabled(true);
  expect(useTimelineUiStore.getState().isZoomColorsEnabled).toBe(true);
});
