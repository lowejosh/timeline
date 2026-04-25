import { useCallback, useEffect, useRef } from "react";
import {
  getZoomAnchorForCanvasX,
  panByPixels,
  type TimelineViewport,
  zoomAtPosition,
} from "../lib/core/viewport";

const WHEEL_LINE_DELTA_PX = 16;
const WHEEL_PAGE_DELTA_PX = 320;
const COARSE_WHEEL_PIXEL_STEP = 100;
const COARSE_WHEEL_ZOOM_IMPULSE_PER_STEP = 0.11;
const SMOOTH_WHEEL_ZOOM_IMPULSE_PER_PIXEL = 0.0022;
const COARSE_WHEEL_PAN_IMPULSE_PER_STEP = 48;
const SMOOTH_WHEEL_PAN_IMPULSE_PER_PIXEL = 1.1;
const WHEEL_ZOOM_DAMPING_MS = 120;
const WHEEL_PAN_DAMPING_MS = 90;
const MAX_WHEEL_ZOOM_VELOCITY = 0.34;
const MAX_WHEEL_PAN_VELOCITY = 220;
const MIN_WHEEL_ZOOM_VELOCITY = 0.0008;
const MIN_WHEEL_PAN_VELOCITY = 0.08;

type WheelMotionState = {
  panVelocity: number;
  zoomVelocity: number;
  anchorX: number;
  lastFrameTime: number;
};

function normalizeWheelDeltaPx(delta: number, deltaMode: number) {
  if (deltaMode === 1) {
    return delta * WHEEL_LINE_DELTA_PX;
  }

  if (deltaMode === 2) {
    return delta * WHEEL_PAGE_DELTA_PX;
  }

  return delta;
}

function clampWheelZoomDelta(value: number, maxAbsDelta: number) {
  return Math.max(-maxAbsDelta, Math.min(maxAbsDelta, value));
}

function isLikelyCoarseWheel(
  event: Pick<globalThis.WheelEvent, "deltaMode" | "deltaX" | "deltaY">,
) {
  if (event.deltaMode === 1 || event.deltaMode === 2) {
    return true;
  }

  const absDeltaX = Math.abs(event.deltaX);
  const absDeltaY = Math.abs(event.deltaY);

  return (
    absDeltaY >= 24 &&
    Number.isInteger(event.deltaY) &&
    absDeltaX <= absDeltaY * 0.35
  );
}

function clampMagnitude(value: number, maxMagnitude: number) {
  return Math.max(-maxMagnitude, Math.min(maxMagnitude, value));
}

function getWheelZoomImpulse(deltaPx: number, coarseWheel: boolean) {
  const magnitude = Math.abs(deltaPx);

  if (magnitude <= 0.01) {
    return 0;
  }

  if (coarseWheel) {
    const stepCount = Math.max(
      1,
      Math.round(magnitude / COARSE_WHEEL_PIXEL_STEP),
    );

    return clampWheelZoomDelta(
      -Math.sign(deltaPx) * stepCount * COARSE_WHEEL_ZOOM_IMPULSE_PER_STEP,
      MAX_WHEEL_ZOOM_VELOCITY,
    );
  }

  return clampWheelZoomDelta(
    -deltaPx * SMOOTH_WHEEL_ZOOM_IMPULSE_PER_PIXEL,
    MAX_WHEEL_ZOOM_VELOCITY,
  );
}

function getWheelPanImpulse(deltaPx: number, coarseWheel: boolean) {
  const magnitude = Math.abs(deltaPx);

  if (magnitude <= 0.01) {
    return 0;
  }

  if (coarseWheel) {
    const stepCount = Math.max(
      1,
      Math.round(magnitude / COARSE_WHEEL_PIXEL_STEP),
    );

    return clampMagnitude(
      -Math.sign(deltaPx) * stepCount * COARSE_WHEEL_PAN_IMPULSE_PER_STEP,
      MAX_WHEEL_PAN_VELOCITY,
    );
  }

  return clampMagnitude(
    -deltaPx * SMOOTH_WHEEL_PAN_IMPULSE_PER_PIXEL,
    MAX_WHEEL_PAN_VELOCITY,
  );
}

export function useWheelZoomPan({
  surfaceRef,
  pad,
  width,
  onViewportChange,
  recordVerboseInteractionEvent,
  markViewportInteraction,
}: {
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  pad: number;
  width: number;
  onViewportChange: (
    producer: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  recordVerboseInteractionEvent: (eventName: string) => void;
  markViewportInteraction: (reason: string) => void;
}) {
  const wheelFrameRef = useRef(0);
  const wheelMotionRef = useRef<WheelMotionState>({
    panVelocity: 0,
    zoomVelocity: 0,
    anchorX: 0,
    lastFrameTime: 0,
  });

  const flushWheelUpdates = useCallback(() => {
    wheelFrameRef.current = 0;
    const wheelMotion = wheelMotionRef.current;

    if (!width) {
      wheelMotion.panVelocity = 0;
      wheelMotion.zoomVelocity = 0;
      wheelMotion.lastFrameTime = 0;
      return;
    }

    const now = performance.now();
    const dt = wheelMotion.lastFrameTime
      ? Math.max(now - wheelMotion.lastFrameTime, 0)
      : 16;
    wheelMotion.lastFrameTime = now;
    const panDecay = Math.exp(-dt / WHEEL_PAN_DAMPING_MS);
    const zoomDecay = Math.exp(-dt / WHEEL_ZOOM_DAMPING_MS);
    const frameScale = dt / 16;

    const pendingPan = wheelMotion.panVelocity * frameScale;
    const pendingZoom = wheelMotion.zoomVelocity * frameScale;
    const pendingAnchor = wheelMotion.anchorX;

    if (Math.abs(pendingPan) <= 0.001 && Math.abs(pendingZoom) <= 0.0001) {
      wheelMotion.panVelocity *= panDecay;
      wheelMotion.zoomVelocity *= zoomDecay;

      if (Math.abs(wheelMotion.panVelocity) <= MIN_WHEEL_PAN_VELOCITY) {
        wheelMotion.panVelocity = 0;
      }

      if (Math.abs(wheelMotion.zoomVelocity) <= MIN_WHEEL_ZOOM_VELOCITY) {
        wheelMotion.zoomVelocity = 0;
      }

      if (
        Math.abs(wheelMotion.panVelocity) > MIN_WHEEL_PAN_VELOCITY ||
        Math.abs(wheelMotion.zoomVelocity) > MIN_WHEEL_ZOOM_VELOCITY
      ) {
        wheelFrameRef.current = requestAnimationFrame(flushWheelUpdates);
      } else {
        wheelMotion.lastFrameTime = 0;
      }

      return;
    }

    recordVerboseInteractionEvent("wheel-flush");

    const innerW = width - pad * 2;
    onViewportChange((current) => {
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

    wheelMotion.panVelocity *= panDecay;
    wheelMotion.zoomVelocity *= zoomDecay;

    if (Math.abs(wheelMotion.panVelocity) <= MIN_WHEEL_PAN_VELOCITY) {
      wheelMotion.panVelocity = 0;
    }

    if (Math.abs(wheelMotion.zoomVelocity) <= MIN_WHEEL_ZOOM_VELOCITY) {
      wheelMotion.zoomVelocity = 0;
    }

    if (
      Math.abs(wheelMotion.panVelocity) > MIN_WHEEL_PAN_VELOCITY ||
      Math.abs(wheelMotion.zoomVelocity) > MIN_WHEEL_ZOOM_VELOCITY
    ) {
      wheelFrameRef.current = requestAnimationFrame(flushWheelUpdates);
    } else {
      wheelMotion.lastFrameTime = 0;
    }
  }, [onViewportChange, pad, recordVerboseInteractionEvent, width]);

  const handleWheel = useCallback(
    (event: globalThis.WheelEvent, surface: HTMLElement) => {
      if (!width) return;

      if (event.cancelable) {
        event.preventDefault();
      }

      markViewportInteraction("wheel");

      const rect = surface.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const anchorX = getZoomAnchorForCanvasX(localX, width, pad);
      const deltaX = normalizeWheelDeltaPx(event.deltaX, event.deltaMode);
      const deltaY = normalizeWheelDeltaPx(event.deltaY, event.deltaMode);
      const coarseWheel = isLikelyCoarseWheel(event);
      const horizontalIntent = Math.abs(deltaX) > Math.abs(deltaY);
      const wheelMotion = wheelMotionRef.current;

      wheelMotion.anchorX = anchorX;

      if (horizontalIntent) {
        recordVerboseInteractionEvent("wheel-pan-intent");
        wheelMotion.panVelocity = clampMagnitude(
          wheelMotion.panVelocity + getWheelPanImpulse(deltaX, coarseWheel),
          MAX_WHEEL_PAN_VELOCITY,
        );
      } else {
        recordVerboseInteractionEvent("wheel-zoom-intent");
        wheelMotion.zoomVelocity = clampWheelZoomDelta(
          wheelMotion.zoomVelocity + getWheelZoomImpulse(deltaY, coarseWheel),
          MAX_WHEEL_ZOOM_VELOCITY,
        );
      }

      if (!wheelFrameRef.current) {
        wheelFrameRef.current = requestAnimationFrame(flushWheelUpdates);
      }
    },
    [
      flushWheelUpdates,
      markViewportInteraction,
      pad,
      recordVerboseInteractionEvent,
      width,
    ],
  );

  useEffect(() => {
    const surface = surfaceRef.current;
    const wheelMotion = wheelMotionRef.current;

    if (!surface || !width) {
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

      wheelMotion.panVelocity = 0;
      wheelMotion.zoomVelocity = 0;
      wheelMotion.lastFrameTime = 0;
    };
  }, [handleWheel, surfaceRef, width]);
}
