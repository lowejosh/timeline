import type { CSSProperties, RefObject } from "react";

import type { RenderedTooltipState } from "@/lib/rendering/canvas/tooltip";
import { OverlayGroupIconSvg } from "@/components/OverlayGroupIconSvg";
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

function getSafeViewportInsets() {
  if (typeof window === "undefined") {
    return { top: 0, right: 0, bottom: 0, left: 0 };
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

  return {
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
}

function getTooltipStyle({
  height,
  renderedTooltip,
  width,
}: {
  height: number;
  renderedTooltip: RenderedTooltipState;
  width: number;
}): CSSProperties & Record<string, string | number> {
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
    "--tooltip-translate-x": horizontalPlacement === "center" ? "-50%" : "0%",
    "--tooltip-translate-y": shouldPlaceBelow
      ? `${TOOLTIP_OFFSET}px`
      : `calc(-100% - ${TOOLTIP_OFFSET}px)`,
    "--tooltip-origin": shouldPlaceBelow ? "top center" : "bottom center",
    "--tooltip-motion-offset-y": shouldPlaceBelow ? "-4px" : "4px",
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
      className="timeline-tooltip"
      data-phase={renderedTooltip.phase}
      style={getTooltipStyle({ height, renderedTooltip, width })}
    >
      <div className="timeline-tooltip__header">
        <OverlayGroupIconSvg
          className="timeline-tooltip__icon"
          groupId={tooltip.iconGroupId}
        />
        <div className="timeline-tooltip__title">{tooltip.title}</div>
      </div>
      {tooltip.regionalScopeLabel ? (
        <div className="timeline-tooltip__subtitle">
          {tooltip.regionalScopeLabel}
        </div>
      ) : null}
      <div className="timeline-tooltip__time">{tooltip.timeLabel}</div>
      {tooltip.description ? (
        <div className="timeline-tooltip__description">
          {tooltip.description}
        </div>
      ) : null}
      {tooltip.sources.length > 0 ? (
        <div className="timeline-tooltip__sources" ref={sourcesRef}>
          <div className="timeline-tooltip__sources-label">Sources</div>
          <ul className="timeline-tooltip__source-list">
            {tooltip.sources.map((source) => (
              <li className="timeline-tooltip__source-item" key={source.id}>
                {source.url ? (
                  <a
                    className="timeline-tooltip__source-link"
                    href={source.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source.shortTitle}
                  </a>
                ) : (
                  <span className="timeline-tooltip__source-title">
                    {source.shortTitle}
                  </span>
                )}
                <span className="timeline-tooltip__source-org">
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
