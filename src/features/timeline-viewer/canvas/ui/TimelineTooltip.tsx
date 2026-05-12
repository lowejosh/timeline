import type { CSSProperties, RefObject } from "react";

import type { RenderedTooltipState } from "@/lib/rendering/canvas/tooltip";
import { OverlayGroupIconSvg } from "./OverlayGroupIconSvg";
import { cn } from "@/lib/utils";
import {
  TOOLTIP_MAX_WIDTH,
  TOOLTIP_OFFSET,
} from "@/lib/rendering/canvas/constants";

type TimelineTooltipProps = {
  height: number;
  renderedTooltip: RenderedTooltipState;
  sourcesRef: RefObject<HTMLDivElement | null>;
  width: number;
};

let cachedSafeViewportInsets: { top: number; right: number; bottom: number; left: number } | null = null;

function getSafeViewportInsets() {
  if (typeof window === "undefined") {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  if (cachedSafeViewportInsets) {
    return cachedSafeViewportInsets;
  }

  const rootStyles = getComputedStyle(document.documentElement);
  const readInset = (name: string) => {
    const value = Number.parseFloat(rootStyles.getPropertyValue(name));
    return Number.isFinite(value) ? value : 0;
  };
  const visualViewport = window.visualViewport;
  const viewportTop = visualViewport?.offsetTop ?? 0;
  const viewportLeft = visualViewport?.offsetLeft ?? 0;
  const viewportHeight = visualViewport?.height ?? window.innerHeight;
  const viewportWidth = visualViewport?.width ?? window.innerWidth;

  cachedSafeViewportInsets = {
    top: Math.max(readInset("--safe-area-top"), viewportTop) + 10,
    right:
      Math.max(
        readInset("--safe-area-right"),
        Math.max(window.innerWidth - (viewportLeft + viewportWidth), 0),
      ) + 10,
    bottom:
      Math.max(
        readInset("--safe-area-bottom"),
        Math.max(window.innerHeight - (viewportTop + viewportHeight), 0),
      ) + 10,
    left: Math.max(readInset("--safe-area-left"), viewportLeft) + 10,
  };

  // Invalidate on resize
  window.addEventListener("resize", () => { cachedSafeViewportInsets = null; }, { once: true });

  return cachedSafeViewportInsets;
}

function getTooltipStyle({
  height,
  renderedTooltip,
  width,
}: {
  height: number;
  renderedTooltip: RenderedTooltipState;
  width: number;
}): CSSProperties {
  const displayedTooltip = renderedTooltip.tooltipState;
  const safeViewportInsets = getSafeViewportInsets();
  const tooltipHorizontalPadding = 10;
  const tooltipWidth = Math.min(
    TOOLTIP_MAX_WIDTH,
    Math.max(
      width - safeViewportInsets.left - safeViewportInsets.right - 24,
      220,
    ),
  );
  const centeredMinX = safeViewportInsets.left + tooltipWidth * 0.5;
  const centeredMaxX = width - safeViewportInsets.right - tooltipWidth * 0.5;
  const horizontalPlacement =
    displayedTooltip.anchorX < centeredMinX
      ? "left"
      : displayedTooltip.anchorX > centeredMaxX
        ? "right"
        : "center";
  const shouldPlaceBelow =
    displayedTooltip.anchorY < safeViewportInsets.top + 96 ||
    (displayedTooltip.placement === "below" &&
      displayedTooltip.anchorY <= height - safeViewportInsets.bottom - 120);
  const translateX = horizontalPlacement === "center" ? "-50%" : "0%";
  const translateY = shouldPlaceBelow
    ? `${TOOLTIP_OFFSET}px`
    : `calc(-100% - ${TOOLTIP_OFFSET}px)`;
  const motionOffset = shouldPlaceBelow ? "-4px" : "4px";
  const isTransitioning = renderedTooltip.phase !== "present";

  return {
    ...(horizontalPlacement === "right"
      ? { right: safeViewportInsets.right + tooltipHorizontalPadding }
      : {
          left:
            horizontalPlacement === "center"
              ? displayedTooltip.anchorX
              : safeViewportInsets.left + tooltipHorizontalPadding,
        }),
    top: Math.min(
      Math.max(displayedTooltip.anchorY, safeViewportInsets.top + 6),
      height - safeViewportInsets.bottom - 6,
    ),
    width: `${tooltipWidth}px`,
    maxWidth: `${tooltipWidth}px`,
    transform: isTransitioning
      ? `translate(${translateX}, calc(${translateY} + ${motionOffset})) scale(0.965)`
      : `translate(${translateX}, ${translateY}) scale(1)`,
    transformOrigin: shouldPlaceBelow ? "top center" : "bottom center",
  };
}

export function TimelineTooltip({
  height,
  renderedTooltip,
  sourcesRef,
  width,
}: TimelineTooltipProps) {
  const tooltip = renderedTooltip.tooltipState.tooltip;

  return (
    <div
      className={cn(
        "absolute z-[2] rounded-lg border border-border bg-glass p-3 text-foreground shadow-glass backdrop-blur-md transition-[opacity,transform] duration-200 ease-out",
        "pointer-events-none",
        renderedTooltip.phase === "present"
          ? "opacity-100"
          : "opacity-0 will-change-[transform,opacity]",
      )}
      data-phase={renderedTooltip.phase}
      style={getTooltipStyle({ height, renderedTooltip, width })}
    >
      <div className="flex items-start gap-2">
        <OverlayGroupIconSvg
          className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-75"
          groupId={tooltip.iconGroupId}
        />
        <div className="text-sm font-semibold leading-snug text-foreground">
          {tooltip.title}
        </div>
      </div>
      {tooltip.regionalScopeLabel ? (
        <div className="mt-1 text-[0.68rem] font-medium leading-tight text-muted-foreground">
          {tooltip.regionalScopeLabel}
        </div>
      ) : null}
      <div className="mt-1 text-xs font-medium leading-snug text-foreground/80">
        {tooltip.timeLabel}
      </div>
      {tooltip.description ? (
        <div className="mt-2 text-[0.74rem] leading-snug text-foreground/80">
          {tooltip.description}
        </div>
      ) : null}
      {tooltip.sources.length > 0 ? (
        <div className="mt-2" ref={sourcesRef}>
          <div className="mb-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.08em] text-muted-foreground">
            Sources
          </div>
          <ul className="m-0 list-none p-0">
            {tooltip.sources.map((source) => (
              <li className="mt-1 first:mt-0" key={source.id}>
                {source.url ? (
                  <a
                    className="pointer-events-auto block text-[0.71rem] font-medium leading-snug text-foreground/90 no-underline hover:underline"
                    href={source.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.shortTitle}
                  </a>
                ) : (
                  <span className="block text-[0.71rem] font-medium leading-snug text-foreground/90">
                    {source.shortTitle}
                  </span>
                )}
                <span className="block text-[0.66rem] leading-tight text-muted-foreground">
                  {source.organization}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
