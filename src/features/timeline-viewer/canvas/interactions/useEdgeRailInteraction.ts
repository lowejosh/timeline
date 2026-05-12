import { useCallback, useRef, useState, type PointerEvent } from "react";

import { zoomAtPosition, type TimelineViewport } from "@/lib/core/viewport";
import {
  getEdgeRailGlowIntensity,
  getEdgeRailZoomDelta,
  hasEdgeRailVerticalIntent,
  shouldShowEdgeRailZoomState,
  type EdgeRailSide,
} from "./edgeInteraction";
import type {
  DualEdgeTouchZoomState,
  EdgeRailInteractionState,
} from "../model/TimelineCanvas.types";

type UseEdgeRailInteractionArgs = {
  dualEdgeTouchZoomRef: React.RefObject<DualEdgeTouchZoomState | null>;
  markViewportInteraction: (eventName: string) => void;
  onInteractionStart: () => void;
  onViewportChange: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  pad: number;
  recordVerboseInteractionEvent: (eventName: string) => void;
  width: number;
};

export function useEdgeRailInteraction({
  dualEdgeTouchZoomRef,
  markViewportInteraction,
  onInteractionStart,
  onViewportChange,
  pad,
  recordVerboseInteractionEvent,
  width,
}: UseEdgeRailInteractionArgs) {
  const edgeRailInteractionRef = useRef<EdgeRailInteractionState | null>(null);
  const [hoveredEdgeZoomSide, setHoveredEdgeZoomSide] =
    useState<EdgeRailSide | null>(null);
  const [pressedEdgeZoomSide, setPressedEdgeZoomSide] =
    useState<EdgeRailSide | null>(null);
  const [draggingEdgeZoomSide, setDraggingEdgeZoomSide] =
    useState<EdgeRailSide | null>(null);
  const [edgeZoomGlow, setEdgeZoomGlow] = useState<{
    side: EdgeRailSide;
    yPercent: number;
    intensity: number;
  } | null>(null);

  const stopEdgeRailInteraction = useCallback(
    (pointerId?: number) => {
      const edgeRailInteraction = edgeRailInteractionRef.current;

      if (!edgeRailInteraction) {
        return;
      }

      if (
        pointerId !== undefined &&
        edgeRailInteraction.pointerId !== pointerId
      ) {
        return;
      }

      edgeRailInteractionRef.current = null;
      setPressedEdgeZoomSide(null);
      setDraggingEdgeZoomSide(null);
      setEdgeZoomGlow(null);

      if (
        edgeRailInteraction.element.hasPointerCapture(
          edgeRailInteraction.pointerId,
        )
      ) {
        edgeRailInteraction.element.releasePointerCapture(
          edgeRailInteraction.pointerId,
        );
      }

      recordVerboseInteractionEvent("edge-rail-stop");
    },
    [recordVerboseInteractionEvent],
  );

  const handleEdgeRailPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>, side: EdgeRailSide) => {
      if (dualEdgeTouchZoomRef.current || width <= pad * 2) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onInteractionStart();
      stopEdgeRailInteraction();
      recordVerboseInteractionEvent("edge-rail-start");

      const zoneRect = event.currentTarget.getBoundingClientRect();

      edgeRailInteractionRef.current = {
        pointerId: event.pointerId,
        side,
        startY: event.clientY,
        lastY: event.clientY,
        lastEventTime: event.timeStamp,
        hasEngagedZoom: false,
        element: event.currentTarget,
      };
      setPressedEdgeZoomSide(side);
      setEdgeZoomGlow({
        side,
        yPercent: ((event.clientY - zoneRect.top) / zoneRect.height) * 100,
        intensity: 0.22,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [
      dualEdgeTouchZoomRef,
      onInteractionStart,
      pad,
      recordVerboseInteractionEvent,
      stopEdgeRailInteraction,
      width,
    ],
  );

  const handleEdgeRailPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const edgeRailInteraction = edgeRailInteractionRef.current;

      if (
        !edgeRailInteraction ||
        edgeRailInteraction.pointerId !== event.pointerId ||
        dualEdgeTouchZoomRef.current
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const zoneRect = event.currentTarget.getBoundingClientRect();
      const deltaY = event.clientY - edgeRailInteraction.lastY;
      const totalTravel = Math.abs(event.clientY - edgeRailInteraction.startY);
      const dt = Math.max(
        event.timeStamp - edgeRailInteraction.lastEventTime,
        8,
      );
      const glowIntensity = getEdgeRailGlowIntensity({
        totalTravelPx: totalTravel,
        deltaYPx: deltaY,
        deltaTimeMs: dt,
      });

      edgeRailInteraction.lastY = event.clientY;
      edgeRailInteraction.lastEventTime = event.timeStamp;
      setEdgeZoomGlow({
        side: edgeRailInteraction.side,
        yPercent: ((event.clientY - zoneRect.top) / zoneRect.height) * 100,
        intensity: glowIntensity,
      });

      if (!hasEdgeRailVerticalIntent(deltaY)) {
        return;
      }

      if (shouldShowEdgeRailZoomState(totalTravel)) {
        setDraggingEdgeZoomSide(edgeRailInteraction.side);

        if (!edgeRailInteraction.hasEngagedZoom) {
          edgeRailInteraction.hasEngagedZoom = true;
          recordVerboseInteractionEvent("edge-zoom-engaged");
        }
      }

      const zoomDelta = getEdgeRailZoomDelta({
        deltaYPx: deltaY,
        deltaTimeMs: dt,
      });

      if (zoomDelta === null) {
        return;
      }

      const innerWidth = Math.max(width - pad * 2, 1);
      const anchorX = edgeRailInteraction.side === "left" ? 0 : innerWidth;

      markViewportInteraction("edge-zoom");
      onViewportChange((current) =>
        zoomAtPosition(current, current.zoom + zoomDelta, anchorX, innerWidth),
      );
    },
    [
      dualEdgeTouchZoomRef,
      markViewportInteraction,
      onViewportChange,
      pad,
      recordVerboseInteractionEvent,
      width,
    ],
  );

  const handleEdgeRailPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      stopEdgeRailInteraction(event.pointerId);
    },
    [stopEdgeRailInteraction],
  );

  return {
    draggingEdgeZoomSide,
    edgeZoomGlow,
    handleEdgeRailPointerDown,
    handleEdgeRailPointerMove,
    handleEdgeRailPointerUp,
    hoveredEdgeZoomSide,
    pressedEdgeZoomSide,
    setHoveredEdgeZoomSide,
    stopEdgeRailInteraction,
  };
}
