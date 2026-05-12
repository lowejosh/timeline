import { useCallback, useEffect, useRef } from "react";
import {
  getZoomAnchorForCanvasX,
  panByPixels,
  type TimelineViewport,
  zoomAtPosition,
} from "@/lib/core/viewport";

const WHEEL_LINE_PX = 16;
const WHEEL_PAGE_PX = 320;

const TRACKPAD_ZOOM_PER_PX = 0.003;
const PIXEL_MOUSE_WHEEL_DELTA_THRESHOLD = 80;

const MOUSE_WHEEL_ZOOM_KICK = 0.032;
const MOUSE_WHEEL_PAN_KICK = 10;
const MOUSE_WHEEL_MAX_ZOOM_VELOCITY = 0.16;
const MOUSE_WHEEL_MAX_PAN_VELOCITY = 48;
const MOUSE_WHEEL_DECAY_MS = 180;
const MOUSE_WHEEL_MIN_ZOOM_VELOCITY = 0.0006;
const MOUSE_WHEEL_MIN_PAN_VELOCITY = 0.08;
const FRAME_MS = 1000 / 60;
const MAX_FRAME_MS = 34;

type LatestWheelValues = {
  pad: number;
  width: number;
  onViewportChange: (
    producer: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onContinuousViewportChange: (
    producer: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onViewportGestureStart: () => void;
  onViewportGestureEnd: () => void;
  onInteractionStart: () => void;
  recordVerboseInteractionEvent: (eventName: string) => void;
  markViewportInteraction: (reason: string) => void;
};

type MouseWheelMotion = {
  frameId: number;
  lastFrameTime: number;
  zoomVelocity: number;
  panVelocity: number;
  anchorX: number;
};

function normalizeWheelDelta(value: number, mode: number) {
  if (mode === WheelEvent.DOM_DELTA_LINE) return value * WHEEL_LINE_PX;
  if (mode === WheelEvent.DOM_DELTA_PAGE) return value * WHEEL_PAGE_PX;
  return value;
}

function isMouseWheelEvent(event: WheelEvent) {
  if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
    return true;
  }

  return (
    Number.isInteger(event.deltaY) &&
    Math.abs(event.deltaY) >= PIXEL_MOUSE_WHEEL_DELTA_THRESHOLD &&
    Math.abs(event.deltaX) <= 2
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useWheelZoomPan({
  surfaceRef,
  pad,
  width,
  onViewportChange,
  onContinuousViewportChange,
  onViewportGestureStart,
  onViewportGestureEnd,
  onInteractionStart,
  recordVerboseInteractionEvent,
  markViewportInteraction,
}: {
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  pad: number;
  width: number;
  onViewportChange: (
    producer: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onContinuousViewportChange: (
    producer: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onViewportGestureStart: () => void;
  onViewportGestureEnd: () => void;
  onInteractionStart: () => void;
  recordVerboseInteractionEvent: (eventName: string) => void;
  markViewportInteraction: (reason: string) => void;
}) {
  const latestRef = useRef<LatestWheelValues>({
    pad,
    width,
    onViewportChange,
    onContinuousViewportChange,
    onViewportGestureStart,
    onViewportGestureEnd,
    onInteractionStart,
    recordVerboseInteractionEvent,
    markViewportInteraction,
  });
  const wheelFrameRef = useRef(0);
  const pendingWheelPanRef = useRef(0);
  const pendingWheelZoomRef = useRef(0);
  const pendingWheelAnchorRef = useRef(0);
  const mouseWheelRef = useRef<MouseWheelMotion>({
    frameId: 0,
    lastFrameTime: 0,
    zoomVelocity: 0,
    panVelocity: 0,
    anchorX: 0,
  });

  useEffect(() => {
    latestRef.current = {
      pad,
      width,
      onViewportChange,
      onContinuousViewportChange,
      onViewportGestureStart,
      onViewportGestureEnd,
      onInteractionStart,
      recordVerboseInteractionEvent,
      markViewportInteraction,
    };
  }, [
    markViewportInteraction,
    onContinuousViewportChange,
    onInteractionStart,
    onViewportChange,
    onViewportGestureEnd,
    onViewportGestureStart,
    pad,
    recordVerboseInteractionEvent,
    width,
  ]);

  const stopMouseWheelMotion = useCallback((notifyEnd = false) => {
    const motion = mouseWheelRef.current;
    const hadActiveMotion =
      Boolean(motion.frameId) ||
      Math.abs(motion.zoomVelocity) > 0 ||
      Math.abs(motion.panVelocity) > 0;

    if (motion.frameId) {
      cancelAnimationFrame(motion.frameId);
      motion.frameId = 0;
    }

    motion.lastFrameTime = 0;
    motion.zoomVelocity = 0;
    motion.panVelocity = 0;

    if (notifyEnd && hadActiveMotion) {
      latestRef.current.recordVerboseInteractionEvent(
        "mouse-wheel-momentum-end",
      );
      latestRef.current.onViewportGestureEnd();
    }
  }, []);

  const animateMouseWheelMotion = useCallback(() => {
    const motion = mouseWheelRef.current;
    const latest = latestRef.current;

    motion.frameId = 0;

    if (!latest.width) {
      stopMouseWheelMotion();
      return;
    }

    const now = performance.now();
    const frameMs = motion.lastFrameTime
      ? Math.min(Math.max(now - motion.lastFrameTime, 1), MAX_FRAME_MS)
      : FRAME_MS;
    const frameRatio = frameMs / FRAME_MS;
    const zoomStep = motion.zoomVelocity * frameRatio;
    const panStep = motion.panVelocity * frameRatio;
    const innerW = Math.max(latest.width - latest.pad * 2, 1);

    motion.lastFrameTime = now;

    if (Math.abs(zoomStep) > 0.00001 || Math.abs(panStep) > 0.001) {
      latest.onContinuousViewportChange((current) => {
        let next = current;

        if (Math.abs(panStep) > 0.001) {
          next = panByPixels(next, panStep, innerW);
        }

        if (Math.abs(zoomStep) > 0.00001) {
          next = zoomAtPosition(
            next,
            next.zoom + zoomStep,
            motion.anchorX,
            innerW,
          );
        }

        return next;
      });
    }

    const decay = Math.exp(-frameMs / MOUSE_WHEEL_DECAY_MS);
    motion.zoomVelocity *= decay;
    motion.panVelocity *= decay;

    if (
      Math.abs(motion.zoomVelocity) <= MOUSE_WHEEL_MIN_ZOOM_VELOCITY &&
      Math.abs(motion.panVelocity) <= MOUSE_WHEEL_MIN_PAN_VELOCITY
    ) {
      motion.lastFrameTime = 0;
      motion.zoomVelocity = 0;
      motion.panVelocity = 0;
      latest.recordVerboseInteractionEvent("mouse-wheel-momentum-end");
      latest.onViewportGestureEnd();
      return;
    }

    motion.frameId = requestAnimationFrame(animateMouseWheelMotion);
  }, [stopMouseWheelMotion]);

  const ensureMouseWheelMotion = useCallback(() => {
    const motion = mouseWheelRef.current;

    if (!motion.frameId) {
      motion.lastFrameTime = 0;
      motion.frameId = requestAnimationFrame(animateMouseWheelMotion);
    }
  }, [animateMouseWheelMotion]);

  const flushWheelUpdates = useCallback(() => {
    const latest = latestRef.current;

    wheelFrameRef.current = 0;

    if (!latest.width) {
      pendingWheelPanRef.current = 0;
      pendingWheelZoomRef.current = 0;
      return;
    }

    const pendingPan = pendingWheelPanRef.current;
    const pendingZoom = pendingWheelZoomRef.current;
    const pendingAnchor = pendingWheelAnchorRef.current;

    pendingWheelPanRef.current = 0;
    pendingWheelZoomRef.current = 0;

    if (Math.abs(pendingPan) <= 0.001 && Math.abs(pendingZoom) <= 0.0001) {
      return;
    }

    latest.recordVerboseInteractionEvent("wheel-flush");

    const innerW = latest.width - latest.pad * 2;
    latest.onViewportChange((current) => {
      let next = current;

      if (Math.abs(pendingPan) > 0.001) {
        next = panByPixels(next, pendingPan, innerW);
      }

      if (Math.abs(pendingZoom) > 0.0001) {
        next = zoomAtPosition(
          next,
          next.zoom + pendingZoom,
          pendingAnchor,
          innerW,
        );
      }

      return next;
    });
  }, []);

  const handleWheel = useCallback(
    (event: globalThis.WheelEvent, surface: HTMLElement) => {
      const latest = latestRef.current;

      if (!latest.width) return;

      if (event.cancelable) {
        event.preventDefault();
      }

      const rect = surface.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const anchorX = getZoomAnchorForCanvasX(localX, latest.width, latest.pad);
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY);

      if (isMouseWheelEvent(event)) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        const motion = mouseWheelRef.current;
        const startingMomentum =
          !motion.frameId &&
          Math.abs(motion.zoomVelocity) <= MOUSE_WHEEL_MIN_ZOOM_VELOCITY &&
          Math.abs(motion.panVelocity) <= MOUSE_WHEEL_MIN_PAN_VELOCITY;
        const normalizedDx = normalizeWheelDelta(event.deltaX, event.deltaMode);
        const normalizedDy = normalizeWheelDelta(event.deltaY, event.deltaMode);

        motion.anchorX = anchorX;

        if (startingMomentum) {
          latest.recordVerboseInteractionEvent("mouse-wheel-momentum-start");
          latest.onViewportGestureStart();
          latest.onInteractionStart();
        }

        if (Math.abs(normalizedDx) > Math.abs(normalizedDy)) {
          motion.panVelocity = clamp(
            motion.panVelocity - Math.sign(normalizedDx) * MOUSE_WHEEL_PAN_KICK,
            -MOUSE_WHEEL_MAX_PAN_VELOCITY,
            MOUSE_WHEEL_MAX_PAN_VELOCITY,
          );
        } else {
          motion.zoomVelocity = clamp(
            motion.zoomVelocity -
              Math.sign(normalizedDy) * MOUSE_WHEEL_ZOOM_KICK,
            -MOUSE_WHEEL_MAX_ZOOM_VELOCITY,
            MOUSE_WHEEL_MAX_ZOOM_VELOCITY,
          );
        }

        ensureMouseWheelMotion();
        return;
      }

      stopMouseWheelMotion(true);
      latest.markViewportInteraction("wheel");
      latest.onInteractionStart();

      if (horizontalIntent) {
        latest.recordVerboseInteractionEvent("wheel-pan-intent");
        pendingWheelPanRef.current += -event.deltaX;
      } else {
        latest.recordVerboseInteractionEvent("wheel-zoom-intent");
        pendingWheelZoomRef.current += -event.deltaY * TRACKPAD_ZOOM_PER_PX;
        pendingWheelAnchorRef.current = anchorX;
      }

      if (!wheelFrameRef.current) {
        wheelFrameRef.current = requestAnimationFrame(flushWheelUpdates);
      }
    },
    [ensureMouseWheelMotion, flushWheelUpdates, stopMouseWheelMotion],
  );

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) {
      return;
    }

    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      handleWheel(event, surface);
    };

    surface.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      surface.removeEventListener("wheel", handleNativeWheel);
      if (wheelFrameRef.current) {
        cancelAnimationFrame(wheelFrameRef.current);
        wheelFrameRef.current = 0;
      }
      stopMouseWheelMotion();
    };
  }, [handleWheel, stopMouseWheelMotion, surfaceRef]);
}
