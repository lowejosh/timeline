import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type TooltipProps = {
  children: React.ReactNode;
  content: string;
};

export function Tooltip({ children, content }: TooltipProps) {
  const [anchor, setAnchor] = React.useState<{ x: number; y: number } | null>(
    null,
  );
  const [left, setLeft] = React.useState<number | null>(null);
  const anchorRef = React.useRef<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    if (!anchor || !tooltipRef.current) {
      setLeft(null);
      return;
    }

    const { width } = tooltipRef.current.getBoundingClientRect();
    const padding = 8;
    setLeft(
      Math.max(
        padding,
        Math.min(anchor.x - width / 2, window.innerWidth - width - padding),
      ),
    );
  }, [anchor]);

  return (
    <>
      <span
        className="inline-flex"
        onBlur={() => {
          setAnchor(null);
        }}
        onFocus={() => {
          const rect = anchorRef.current?.getBoundingClientRect();
          if (rect) {
            setAnchor({ x: rect.left + rect.width / 2, y: rect.top });
          }
        }}
        onMouseEnter={() => {
          const rect = anchorRef.current?.getBoundingClientRect();
          if (rect) {
            setAnchor({ x: rect.left + rect.width / 2, y: rect.top });
          }
        }}
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
                "pointer-events-none -translate-y-[calc(100%+0.5rem)]",
              )}
              ref={tooltipRef}
              role="tooltip"
              style={{
                left: left ?? anchor.x,
                top: anchor.y,
                visibility: left === null ? "hidden" : "visible",
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
