import type { CSSProperties, PointerEvent } from "react";

import type { EdgeRailSide } from "../utils/edgeInteraction";

type EdgeZoomZonesProps = {
  draggingSide: EdgeRailSide | null;
  glow: {
    side: EdgeRailSide;
    yPercent: number;
    intensity: number;
  } | null;
  hoveredSide: EdgeRailSide | null;
  onHoveredSideChange: (side: EdgeRailSide | null) => void;
  onLostPointerCapture: () => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerDown: (
    event: PointerEvent<HTMLDivElement>,
    side: EdgeRailSide,
  ) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  pressedSide: EdgeRailSide | null;
  zoneWidth: number;
};

export function EdgeZoomZones({
  draggingSide,
  glow,
  hoveredSide,
  onHoveredSideChange,
  onLostPointerCapture,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  pressedSide,
  zoneWidth,
}: EdgeZoomZonesProps) {
  return (
    <>
      {(["left", "right"] as const).map((side) => (
        <div
          aria-hidden="true"
          className="timeline-canvas__edge-zoom-zone"
          data-dragging={draggingSide === side ? "true" : "false"}
          data-hovered={hoveredSide === side ? "true" : "false"}
          data-pressed={pressedSide === side ? "true" : "false"}
          data-side={side}
          key={side}
          onLostPointerCapture={onLostPointerCapture}
          onPointerCancel={onPointerCancel}
          onPointerDown={(event) => {
            onPointerDown(event, side);
          }}
          onPointerEnter={() => {
            onHoveredSideChange(side);
          }}
          onPointerLeave={() => {
            onHoveredSideChange(hoveredSide === side ? null : hoveredSide);
          }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={
            {
              width: zoneWidth,
              "--edge-zone-glow-y": `${
                glow?.side === side ? glow.yPercent : 50
              }%`,
              "--edge-zone-glow-opacity": `${
                glow?.side === side ? glow.intensity : 0.18
              }`,
            } as CSSProperties
          }
        >
          <div className="timeline-canvas__edge-zoom-hint">
            <span className="timeline-canvas__edge-zoom-hint-label timeline-canvas__edge-zoom-hint-label--top">
              Drag to zoom
            </span>
            <svg
              aria-hidden="true"
              className="timeline-canvas__edge-zoom-hint-icon"
              viewBox="0 0 16 16"
            >
              <path d="M4.5 9 8 5.5 11.5 9" />
            </svg>
            <svg
              aria-hidden="true"
              className="timeline-canvas__edge-zoom-hint-icon timeline-canvas__edge-zoom-hint-icon--glass"
              viewBox="0 0 16 16"
            >
              <circle cx="7" cy="7" r="3.5" />
              <path d="M9.7 9.7 13 13" />
            </svg>
            <svg
              aria-hidden="true"
              className="timeline-canvas__edge-zoom-hint-icon"
              viewBox="0 0 16 16"
            >
              <path d="M4.5 7 8 10.5 11.5 7" />
            </svg>
          </div>
        </div>
      ))}
    </>
  );
}
