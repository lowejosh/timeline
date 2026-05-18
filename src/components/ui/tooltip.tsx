import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type TooltipProps = {
  children: React.ReactNode;
  className?: string;
  content: string;
  placement?: "top" | "right";
  showOnFocus?: boolean;
};

type TooltipAnchor = {
  x: number;
  y: number;
};

type TooltipPosition = {
  left: number;
  top: number;
};

export function Tooltip({
  children,
  className,
  content,
  placement = "top",
  showOnFocus = true,
}: TooltipProps) {
  const [anchor, setAnchor] = React.useState<TooltipAnchor | null>(null);
  const [position, setPosition] = React.useState<TooltipPosition | null>(null);
  const anchorRef = React.useRef<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    if (!anchor || !tooltipRef.current) {
      setPosition(null);
      return;
    }

    const { height, width } = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    if (placement === "right") {
      setPosition({
        left: Math.max(
          padding,
          Math.min(anchor.x + padding, window.innerWidth - width - padding),
        ),
        top: Math.max(
          padding,
          Math.min(anchor.y - height / 2, window.innerHeight - height - padding),
        ),
      });
      return;
    }

    setPosition({
      left: Math.max(
        padding,
        Math.min(anchor.x - width / 2, window.innerWidth - width - padding),
      ),
      top: anchor.y,
    });
  }, [anchor, placement]);

  const updateAnchor = () => {
    const rect = anchorRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setAnchor(
      placement === "right"
        ? { x: rect.right, y: rect.top + rect.height / 2 }
        : { x: rect.left + rect.width / 2, y: rect.top },
    );
  };

  return (
    <>
      <span
        className={cn("inline-flex", className)}
        onBlur={() => {
          setAnchor(null);
        }}
        onFocus={() => {
          if (showOnFocus) {
            updateAnchor();
          }
        }}
        onMouseEnter={updateAnchor}
        onMouseLeave={() => {
          setAnchor(null);
        }}
        ref={anchorRef}
      >
        {children}
      </span>
      {anchor
        ? createPortal(
            <div
              className={cn(
                "fixed z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md",
                placement === "top" &&
                  "pointer-events-none -translate-y-[calc(100%+0.5rem)] animate-popover-in",
                placement === "right" &&
                  "pointer-events-none animate-popover-in",
              )}
              ref={tooltipRef}
              role="tooltip"
              style={{
                left: position?.left ?? anchor.x,
                top: position?.top ?? anchor.y,
                visibility: position === null ? "hidden" : "visible",
              }}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
