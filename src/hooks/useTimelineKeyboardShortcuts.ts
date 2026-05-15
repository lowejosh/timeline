import { useEffect, useRef } from "react";

import { isPrimaryShortcutModifier } from "@/lib/app/timelineKeyboard";

type KeyboardNavigationFrame = {
  panPixels: number;
  zoomAnchorRatio: number;
  zoomDelta: number;
};

type UseTimelineKeyboardShortcutsOptions = {
  enabled: boolean;
  isHelpOpen: boolean;
  isSidebarOpen: boolean;
  onCloseHelp: () => void;
  onFullTimelineRange: () => void;
  onHelpOpenChange: (updater: boolean | ((current: boolean) => boolean)) => void;
  onHomeRange: () => void;
  onLayerShortcut: (normalizedKey: string) => boolean;
  onNavigationEnd: () => void;
  onNavigationFrame: (frame: KeyboardNavigationFrame) => void;
  onSearchToggle: () => void;
  onSidebarOpenChange: (updater: boolean | ((current: boolean) => boolean)) => void;
};

const BASE_PAN_PIXELS_PER_SECOND = 760;
const FAST_PAN_PIXELS_PER_SECOND = 2_000;
const BASE_ZOOM_UNITS_PER_SECOND = 8.5;
const FAST_ZOOM_UNITS_PER_SECOND = 18;
const MAX_FRAME_SECONDS = 0.05;
const RESPONSE_SECONDS = 0.095;
const RELEASE_SECONDS = 0.22;
const MIN_PAN_VELOCITY = 0.5;
const MIN_ZOOM_VELOCITY = 0.01;
const LEFT_ZOOM_ANCHOR_RATIO = 0.08;
const RIGHT_ZOOM_ANCHOR_RATIO = 0.92;

function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

function claimKeyboardEvent(event: KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function getPressedDirection(keys: ReadonlySet<string>, negative: string, positive: string) {
  return (keys.has(positive) ? 1 : 0) - (keys.has(negative) ? 1 : 0);
}

function isNavigationKey(key: string) {
  return (
    key === "arrowleft" ||
    key === "arrowright" ||
    key === "arrowup" ||
    key === "arrowdown" ||
    key === "+" ||
    key === "=" ||
    key === "-" ||
    key === "_"
  );
}

function hasActiveNavigationKeys(keys: ReadonlySet<string>) {
  for (const key of keys) {
    if (key !== "shift") {
      return true;
    }
  }

  return false;
}

function normalizeNavigationKey(key: string) {
  const normalized = key.toLowerCase();

  if (normalized === "=") {
    return "+";
  }

  if (normalized === "_") {
    return "-";
  }

  return normalized;
}

function approachValue(
  current: number,
  target: number,
  deltaSeconds: number,
  timeConstant: number,
) {
  const amount = 1 - Math.exp(-deltaSeconds / timeConstant);

  return current + (target - current) * amount;
}

export function useTimelineKeyboardShortcuts({
  enabled,
  isHelpOpen,
  isSidebarOpen,
  onCloseHelp,
  onFullTimelineRange,
  onHelpOpenChange,
  onHomeRange,
  onLayerShortcut,
  onNavigationEnd,
  onNavigationFrame,
  onSearchToggle,
  onSidebarOpenChange,
}: UseTimelineKeyboardShortcutsOptions) {
  const latestRef = useRef<UseTimelineKeyboardShortcutsOptions>({
    enabled,
    isHelpOpen,
    isSidebarOpen,
    onCloseHelp,
    onFullTimelineRange,
    onHelpOpenChange,
    onHomeRange,
    onLayerShortcut,
    onNavigationEnd,
    onNavigationFrame,
    onSearchToggle,
    onSidebarOpenChange,
  });
  const pressedKeysRef = useRef(new Set<string>());
  const rafRef = useRef(0);
  const previousFrameTimeRef = useRef(0);
  const velocityRef = useRef({
    panPixelsPerSecond: 0,
    zoomUnitsPerSecond: 0,
  });

  useEffect(() => {
    latestRef.current = {
      enabled,
      isHelpOpen,
      isSidebarOpen,
      onCloseHelp,
      onFullTimelineRange,
      onHelpOpenChange,
      onHomeRange,
      onLayerShortcut,
      onNavigationEnd,
      onNavigationFrame,
      onSearchToggle,
      onSidebarOpenChange,
    };
  }, [
    enabled,
    isHelpOpen,
    isSidebarOpen,
    onCloseHelp,
    onFullTimelineRange,
    onHelpOpenChange,
    onHomeRange,
    onLayerShortcut,
    onNavigationEnd,
    onNavigationFrame,
    onSearchToggle,
    onSidebarOpenChange,
  ]);

  useEffect(() => {
    if (enabled) {
      return;
    }

    pressedKeysRef.current.clear();
    velocityRef.current.panPixelsPerSecond = 0;
    velocityRef.current.zoomUnitsPerSecond = 0;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, [enabled]);

  useEffect(() => {
    const resetNavigationLoop = (notifyEnd: boolean) => {
      const hadMotion =
        rafRef.current !== 0 ||
        Math.abs(velocityRef.current.panPixelsPerSecond) > 0 ||
        Math.abs(velocityRef.current.zoomUnitsPerSecond) > 0;

      pressedKeysRef.current.clear();
      velocityRef.current.panPixelsPerSecond = 0;
      velocityRef.current.zoomUnitsPerSecond = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;

      if (notifyEnd && hadMotion) {
        latestRef.current.onNavigationEnd();
      }
    };

    const stopNavigationLoop = () => {
      resetNavigationLoop(true);
    };

    const tick = (timestamp: number) => {
      const keys = pressedKeysRef.current;
      const velocity = velocityRef.current;

      const previous = previousFrameTimeRef.current || timestamp;
      const deltaSeconds = Math.min(
        Math.max((timestamp - previous) / 1000, 0),
        MAX_FRAME_SECONDS,
      );
      previousFrameTimeRef.current = timestamp;

      const fast = keys.has("shift");
      const panDirection = getPressedDirection(
        keys,
        "arrowright",
        "arrowleft",
      );
      const zoomDirection =
        (keys.has("+") || keys.has("arrowup") ? 1 : 0) -
        (keys.has("-") || keys.has("arrowdown") ? 1 : 0);
      const panSpeed = fast
        ? FAST_PAN_PIXELS_PER_SECOND
        : BASE_PAN_PIXELS_PER_SECOND;
      const zoomSpeed = fast
        ? FAST_ZOOM_UNITS_PER_SECOND
        : BASE_ZOOM_UNITS_PER_SECOND;
      const targetPanVelocity = panDirection * panSpeed;
      const targetZoomVelocity = zoomDirection * zoomSpeed;
      const easingSeconds =
        panDirection !== 0 || zoomDirection !== 0
          ? RESPONSE_SECONDS
          : RELEASE_SECONDS;

      velocity.panPixelsPerSecond = approachValue(
        velocity.panPixelsPerSecond,
        targetPanVelocity,
        deltaSeconds,
        easingSeconds,
      );
      velocity.zoomUnitsPerSecond = approachValue(
        velocity.zoomUnitsPerSecond,
        targetZoomVelocity,
        deltaSeconds,
        easingSeconds,
      );

      if (
        targetPanVelocity === 0 &&
        Math.abs(velocity.panPixelsPerSecond) < MIN_PAN_VELOCITY
      ) {
        velocity.panPixelsPerSecond = 0;
      }

      if (
        targetZoomVelocity === 0 &&
        Math.abs(velocity.zoomUnitsPerSecond) < MIN_ZOOM_VELOCITY
      ) {
        velocity.zoomUnitsPerSecond = 0;
      }

      if (
        Math.abs(velocity.panPixelsPerSecond) > 0 ||
        Math.abs(velocity.zoomUnitsPerSecond) > 0
      ) {
        latestRef.current.onNavigationFrame({
          panPixels: velocity.panPixelsPerSecond * deltaSeconds,
          zoomAnchorRatio:
            panDirection > 0
              ? LEFT_ZOOM_ANCHOR_RATIO
              : panDirection < 0
                ? RIGHT_ZOOM_ANCHOR_RATIO
                : 0.5,
          zoomDelta: velocity.zoomUnitsPerSecond * deltaSeconds,
        });
      }

      if (
        !hasActiveNavigationKeys(keys) &&
        velocity.panPixelsPerSecond === 0 &&
        velocity.zoomUnitsPerSecond === 0
      ) {
        rafRef.current = 0;
        latestRef.current.onNavigationEnd();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const startNavigationLoop = () => {
      if (rafRef.current) {
        return;
      }

      previousFrameTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const latest = latestRef.current;

      if (event.defaultPrevented || !latest.enabled) {
        return;
      }

      const normalizedKey = normalizeNavigationKey(event.key);
      const primaryModified = isPrimaryShortcutModifier(event);
      const isContinuousNavigationKey =
        normalizedKey === "shift" || isNavigationKey(normalizedKey);

      if (event.repeat && !isContinuousNavigationKey) {
        return;
      }

      if (primaryModified && normalizedKey === "/") {
        claimKeyboardEvent(event);
        latest.onHelpOpenChange((current) => !current);
        return;
      }

      if (primaryModified && normalizedKey === "k") {
        claimKeyboardEvent(event);
        latest.onSearchToggle();
        return;
      }

      if (latest.isHelpOpen) {
        if (normalizedKey === "escape") {
          claimKeyboardEvent(event);
          latest.onCloseHelp();
        }

        return;
      }

      if (isEditableShortcutTarget(event.target)) {
        return;
      }

      if (event.altKey || event.metaKey || event.ctrlKey) {
        return;
      }

      if (normalizedKey === "l") {
        claimKeyboardEvent(event);
        latest.onSidebarOpenChange((current) => !current);
        return;
      }

      if (normalizedKey === "h" || normalizedKey === "home") {
        claimKeyboardEvent(event);
        resetNavigationLoop(false);
        latest.onHomeRange();
        return;
      }

      if (normalizedKey === "o" || normalizedKey === "0") {
        claimKeyboardEvent(event);
        resetNavigationLoop(false);
        latest.onFullTimelineRange();
        return;
      }

      if (normalizedKey === "escape" && latest.isSidebarOpen) {
        claimKeyboardEvent(event);
        latest.onSidebarOpenChange(false);
        return;
      }

      if (normalizedKey === "shift") {
        pressedKeysRef.current.add("shift");
        return;
      }

      if (isNavigationKey(normalizedKey)) {
        claimKeyboardEvent(event);
        pressedKeysRef.current.add(normalizedKey);
        startNavigationLoop();
        return;
      }

      if (latest.onLayerShortcut(normalizedKey)) {
        claimKeyboardEvent(event);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!latestRef.current.enabled) {
        return;
      }

      const normalizedKey = normalizeNavigationKey(event.key);

      if (normalizedKey === "shift") {
        pressedKeysRef.current.delete("shift");
        return;
      }

      if (isNavigationKey(normalizedKey)) {
        claimKeyboardEvent(event);
        pressedKeysRef.current.delete(normalizedKey);
      }
    };

    const handleBlur = () => {
      stopNavigationLoop();
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      window.removeEventListener("blur", handleBlur);
      resetNavigationLoop(false);
    };
  }, []);
}
