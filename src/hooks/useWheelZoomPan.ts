import { useCallback, useEffect, useRef } from "react";
import {
  getZoomAnchorForCanvasX,
  panByPixels,
  type TimelineViewport,
  zoomAtPosition,
} from "../lib/core/viewport";
import { PAD } from "../lib/rendering/canvas/constants";

export function useWheelZoomPan({
  canvasRef,
  width,
  onViewportChange,
  recordVerboseInteractionEvent,
  markViewportInteraction,
}: {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  width: number;
  onViewportChange: (
    producer: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  recordVerboseInteractionEvent: (eventName: string) => void;
  markViewportInteraction: (reason: string) => void;
}) {
  const wheelFrameRef = useRef(0);
  const pendingWheelPanRef = useRef(0);
  const pendingWheelZoomRef = useRef(0);
  const pendingWheelAnchorRef = useRef(0);

  const flushWheelUpdates = useCallback(() => {
    wheelFrameRef.current = 0;

    if (!width) {
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

    recordVerboseInteractionEvent("wheel-flush");

    const innerW = width - PAD * 2;
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
  }, [onViewportChange, recordVerboseInteractionEvent, width]);

  const handleWheel = useCallback(
    (event: globalThis.WheelEvent, canvas: HTMLCanvasElement) => {
      if (!width) return;

      if (event.cancelable) {
        event.preventDefault();
      }

      markViewportInteraction("wheel");

      const rect = canvas.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const anchorX = getZoomAnchorForCanvasX(localX, width, PAD);
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY);

      if (horizontalIntent) {
        recordVerboseInteractionEvent("wheel-pan-intent");
        pendingWheelPanRef.current += -event.deltaX;
      } else {
        recordVerboseInteractionEvent("wheel-zoom-intent");
        pendingWheelZoomRef.current += -event.deltaY * 0.003;
        pendingWheelAnchorRef.current = anchorX;
      }

      if (!wheelFrameRef.current) {
        wheelFrameRef.current = requestAnimationFrame(flushWheelUpdates);
      }
    },
    [
      flushWheelUpdates,
      markViewportInteraction,
      recordVerboseInteractionEvent,
      width,
    ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !width) {
      return;
    }

    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      handleWheel(event, canvas);
    };

    canvas.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleNativeWheel);
      if (wheelFrameRef.current) {
        cancelAnimationFrame(wheelFrameRef.current);
        wheelFrameRef.current = 0;
      }
    };
  }, [canvasRef, handleWheel, width]);
}
