import type { CSSProperties, PointerEvent } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import { THEME } from "@/lib/ui/theme";
import { cn } from "@/lib/utils";
import type { EdgeRailSide } from "../interactions/edgeInteraction";

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
      {(["left", "right"] as const).map((side) => {
        const isHovered = hoveredSide === side;
        const isPressed = pressedSide === side;
        const isDragging = draggingSide === side;
        const isActive = isHovered || isPressed || isDragging;
        const glowY = glow?.side === side ? glow.yPercent : 50;
        const glowOpacity = glow?.side === side ? glow.intensity : 0.18;

        return (
          <div
            aria-hidden="true"
            className={cn(
              "absolute top-0 bottom-0 z-[1] overflow-hidden rounded-none opacity-100 touch-none transition-[opacity,transform,box-shadow] duration-200",
              side === "left" ? "left-0" : "right-0",
              isHovered && "scale-x-[1.02]",
              isPressed && "shadow-[inset_0_0_0_1px_var(--accent)]",
              isDragging && "shadow-[inset_0_0_0_1px_var(--accent)]",
              "[@media(hover:none)]:data-[hovered=true]:scale-x-100",
            )}
            data-dragging={isDragging ? "true" : "false"}
            data-hovered={isHovered ? "true" : "false"}
            data-pressed={isPressed ? "true" : "false"}
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
            style={{ width: zoneWidth }}
          >
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-0",
              )}
              style={{
                background:
                  side === "left"
                    ? `linear-gradient(90deg, ${THEME.color.brown[12]} 0%, ${THEME.color.brown[6]} 42%, transparent 100%)`
                    : `linear-gradient(270deg, ${THEME.color.brown[12]} 0%, ${THEME.color.brown[6]} 42%, transparent 100%)`,
              }}
            />
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 transition-[opacity,filter,transform] duration-200",
                isDragging
                  ? "scale-105 blur-[1px]"
                  : isPressed
                    ? "scale-[0.98] blur-[3px]"
                    : "scale-90 blur-lg",
              )}
              style={
                {
                  background: `radial-gradient(140px circle at ${side === "left" ? "34%" : "66%"} ${glowY}%, ${THEME.color.accent} 0%, ${THEME.color.accentChip} 32%, transparent 76%)`,
                  opacity: isDragging
                    ? glowOpacity
                    : isPressed
                      ? glowOpacity * 0.78
                      : 0,
                } satisfies CSSProperties
              }
            />
            <div
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-muted-foreground/50 opacity-25 transition-[color,opacity,transform] duration-200",
                isActive && "text-muted-foreground opacity-60",
                isDragging && "scale-[1.02]",
              )}
            >
              <span className="mb-0.5 whitespace-nowrap text-[0.48rem] font-semibold uppercase leading-none tracking-[0.08em] [@media(hover:hover)_and_(pointer:fine)]:hidden max-[720px]:hidden">
                Drag to zoom
              </span>
              <ChevronUp className="size-4 stroke-[1.5]" />
              <Search className="size-4 stroke-[1.5]" />
              <ChevronDown className="size-4 stroke-[1.5]" />
            </div>
          </div>
        );
      })}
    </>
  );
}
