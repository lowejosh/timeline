import { useEffect, type MutableRefObject, type RefObject } from "react";

import {
  getZoomAnchorForCanvasX,
  zoomAtPosition,
  type TimelineViewport,
} from "@/lib/core/viewport";
import type { HoveredTooltipState } from "@/lib/rendering/canvas/tooltip";
import type {
  DragState,
  DualEdgeTouchZoomState,
  PinchZoomState,
} from "../model/TimelineCanvas.types";
import { DUAL_EDGE_CENTER_ZOOM_DELTA_PER_PIXEL } from "./constants";
import { getPinchZoomForScale } from "./pinch";

type LastPointerState = {
  x: number;
  y: number;
  pointerType: string;
};

type UseTouchGesturesArgs = {
  applyTouchZoomDelta: (zoomDelta: number, anchorX: number) => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  commitHoveredTooltip: (tooltip: HoveredTooltipState | null) => void;
  dragStateRef: MutableRefObject<DragState | null>;
  dualEdgeTouchZoomRef: MutableRefObject<DualEdgeTouchZoomState | null>;
  lastPointerRef: MutableRefObject<LastPointerState | null>;
  markViewportInteraction: (eventName: string) => void;
  onViewportChange: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  pad: number;
  pinchZoomRef: MutableRefObject<PinchZoomState | null>;
  recordVerboseInteractionEvent: (eventName: string) => void;
  shellRef: RefObject<HTMLDivElement | null>;
  stopDualEdgeTouchZoom: () => void;
  stopEdgeRailInteraction: () => void;
  stopPinchZoom: () => void;
  viewportRef: RefObject<TimelineViewport>;
  width: number;
};

export function useTouchGestures({
  applyTouchZoomDelta,
  canvasRef,
  commitHoveredTooltip,
  dragStateRef,
  dualEdgeTouchZoomRef,
  lastPointerRef,
  markViewportInteraction,
  onViewportChange,
  pad,
  pinchZoomRef,
  recordVerboseInteractionEvent,
  shellRef,
  stopDualEdgeTouchZoom,
  stopEdgeRailInteraction,
  stopPinchZoom,
  viewportRef,
  width,
}: UseTouchGesturesArgs) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = shellRef.current;

    if (!canvas || !surface || !width) {
      return;
    }

    const getTouchById = (touches: TouchList, identifier: number) => {
      for (let index = 0; index < touches.length; index += 1) {
        if (touches[index].identifier === identifier) {
          return touches[index];
        }
      }

      return null;
    };

    const resolveLocalTouchPoint = (touch: Touch, rect: DOMRect) => ({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });

    const stopActiveCanvasDrag = () => {
      const dragState = dragStateRef.current;

      if (!dragState) {
        return;
      }

      dragStateRef.current = null;

      if (canvas.hasPointerCapture(dragState.pointerId)) {
        canvas.releasePointerCapture(dragState.pointerId);
      }
    };

    const startPinchZoom = (touches: TouchList) => {
      if (touches.length !== 2 || width <= pad * 2) {
        stopPinchZoom();
        return false;
      }

      const [firstTouch, secondTouch] = [touches[0], touches[1]];
      const dx = secondTouch.clientX - firstTouch.clientX;
      const dy = secondTouch.clientY - firstTouch.clientY;
      const distance = Math.hypot(dx, dy);

      if (!Number.isFinite(distance) || distance <= 0) {
        stopPinchZoom();
        return false;
      }

      pinchZoomRef.current = {
        firstTouchId: firstTouch.identifier,
        secondTouchId: secondTouch.identifier,
        startDistance: distance,
        startViewport: { ...viewportRef.current },
      };

      return true;
    };

    const tryStartDualEdgeTouchZoom = (touches: TouchList, rect: DOMRect) => {
      if (touches.length !== 2 || width <= pad * 2) {
        stopDualEdgeTouchZoom();
        return false;
      }

      const [firstTouch, secondTouch] = [touches[0], touches[1]];
      const firstPoint = resolveLocalTouchPoint(firstTouch, rect);
      const secondPoint = resolveLocalTouchPoint(secondTouch, rect);
      const leftTouch =
        firstPoint.x <= pad
          ? { touch: firstTouch, point: firstPoint }
          : secondPoint.x <= pad
            ? { touch: secondTouch, point: secondPoint }
            : null;
      const rightTouch =
        firstPoint.x >= width - pad
          ? { touch: firstTouch, point: firstPoint }
          : secondPoint.x >= width - pad
            ? { touch: secondTouch, point: secondPoint }
            : null;

      if (
        !leftTouch ||
        !rightTouch ||
        leftTouch.touch.identifier === rightTouch.touch.identifier
      ) {
        stopDualEdgeTouchZoom();
        return false;
      }

      stopEdgeRailInteraction();
      dragStateRef.current = null;
      lastPointerRef.current = null;
      commitHoveredTooltip(null);
      dualEdgeTouchZoomRef.current = {
        leftTouchId: leftTouch.touch.identifier,
        rightTouchId: rightTouch.touch.identifier,
        lastAverageY: (leftTouch.point.y + rightTouch.point.y) * 0.5,
      };

      return true;
    };

    const handleGesture = (event: Event) => {
      event.preventDefault();
    };

    const handleTouchStart = (event: TouchEvent) => {
      const rect = surface.getBoundingClientRect();

      if (tryStartDualEdgeTouchZoom(event.touches, rect)) {
        event.preventDefault();
        stopPinchZoom();
        stopActiveCanvasDrag();
        recordVerboseInteractionEvent("dual-edge-center-zoom-start");
        return;
      }

      if (event.touches.length !== 2) {
        if (event.touches.length < 2) {
          stopPinchZoom();
        }

        return;
      }

      event.preventDefault();
      stopEdgeRailInteraction();
      stopDualEdgeTouchZoom();
      stopActiveCanvasDrag();
      lastPointerRef.current = null;
      commitHoveredTooltip(null);

      if (startPinchZoom(event.touches)) {
        recordVerboseInteractionEvent("touch-pinch-start");
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      const rect = surface.getBoundingClientRect();
      const dualEdgeTouchZoom = dualEdgeTouchZoomRef.current;

      if (dualEdgeTouchZoom) {
        const leftTouch = getTouchById(
          event.touches,
          dualEdgeTouchZoom.leftTouchId,
        );
        const rightTouch = getTouchById(
          event.touches,
          dualEdgeTouchZoom.rightTouchId,
        );

        if (!leftTouch || !rightTouch) {
          stopDualEdgeTouchZoom();
          return;
        }

        event.preventDefault();
        markViewportInteraction("dual-edge-center-zoom");

        const leftPoint = resolveLocalTouchPoint(leftTouch, rect);
        const rightPoint = resolveLocalTouchPoint(rightTouch, rect);
        const averageY = (leftPoint.y + rightPoint.y) * 0.5;
        const deltaY = averageY - dualEdgeTouchZoom.lastAverageY;
        const innerWidth = Math.max(width - pad * 2, 1);

        dualEdgeTouchZoom.lastAverageY = averageY;
        applyTouchZoomDelta(
          -deltaY * DUAL_EDGE_CENTER_ZOOM_DELTA_PER_PIXEL,
          innerWidth * 0.5,
        );
        return;
      }

      const pinchZoom = pinchZoomRef.current;

      if (!pinchZoom || event.touches.length !== 2) {
        return;
      }

      const firstTouch = getTouchById(event.touches, pinchZoom.firstTouchId);
      const secondTouch = getTouchById(event.touches, pinchZoom.secondTouchId);

      if (!firstTouch || !secondTouch) {
        stopPinchZoom();
        return;
      }

      event.preventDefault();
      markViewportInteraction("touch-pinch");

      const dx = secondTouch.clientX - firstTouch.clientX;
      const dy = secondTouch.clientY - firstTouch.clientY;
      const dist = Math.hypot(dx, dy);

      if (!Number.isFinite(dist) || dist <= 0) {
        return;
      }

      const localX =
        (firstTouch.clientX + secondTouch.clientX) * 0.5 - rect.left;
      const anchorX = getZoomAnchorForCanvasX(localX, width, pad);
      const nextZoom = getPinchZoomForScale(
        pinchZoom.startViewport.zoom,
        dist / pinchZoom.startDistance,
      );

      if (nextZoom === null) {
        return;
      }

      const innerWidth = Math.max(width - pad * 2, 1);

      onViewportChange(() =>
        zoomAtPosition(pinchZoom.startViewport, nextZoom, anchorX, innerWidth),
      );
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const dualEdgeTouchZoom = dualEdgeTouchZoomRef.current;

      if (dualEdgeTouchZoom) {
        const leftTouch = getTouchById(
          event.touches,
          dualEdgeTouchZoom.leftTouchId,
        );
        const rightTouch = getTouchById(
          event.touches,
          dualEdgeTouchZoom.rightTouchId,
        );

        if (!leftTouch || !rightTouch) {
          stopDualEdgeTouchZoom();
        }
      }

      if (event.touches.length < 2) {
        stopPinchZoom();
      }
    };

    const handleTouchCancel = () => {
      stopPinchZoom();
      stopDualEdgeTouchZoom();
    };

    canvas.addEventListener("gesturestart", handleGesture, { passive: false });
    canvas.addEventListener("gesturechange", handleGesture, {
      passive: false,
    });
    canvas.addEventListener("gestureend", handleGesture, { passive: false });
    surface.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    surface.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    surface.addEventListener("touchend", handleTouchEnd, { passive: false });
    surface.addEventListener("touchcancel", handleTouchCancel, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("gesturestart", handleGesture);
      canvas.removeEventListener("gesturechange", handleGesture);
      canvas.removeEventListener("gestureend", handleGesture);
      surface.removeEventListener("touchstart", handleTouchStart);
      surface.removeEventListener("touchmove", handleTouchMove);
      surface.removeEventListener("touchend", handleTouchEnd);
      surface.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    applyTouchZoomDelta,
    canvasRef,
    commitHoveredTooltip,
    dragStateRef,
    dualEdgeTouchZoomRef,
    lastPointerRef,
    markViewportInteraction,
    onViewportChange,
    pad,
    pinchZoomRef,
    recordVerboseInteractionEvent,
    shellRef,
    stopDualEdgeTouchZoom,
    stopEdgeRailInteraction,
    stopPinchZoom,
    viewportRef,
    width,
  ]);
}
