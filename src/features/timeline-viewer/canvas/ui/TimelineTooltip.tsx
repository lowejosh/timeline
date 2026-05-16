import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

import type { RenderedTooltipState } from "@/lib/rendering/canvas/tooltip";
import { OverlayGroupIconSvg } from "./OverlayGroupIconSvg";
import { cn } from "@/lib/utils";
import {
  TOOLTIP_MAX_WIDTH,
  TOOLTIP_OFFSET,
} from "@/lib/rendering/canvas/constants";

type TimelineTooltipProps = {
  height: number;
  interactiveContentRef: RefObject<HTMLDivElement | null>;
  renderedTooltip: RenderedTooltipState;
  width: number;
};

const TOOLTIP_IMAGE_DELAY_MS = 420;
const MAX_TRACKED_TOOLTIP_IMAGE_SRCS = 160;

const loadedTooltipImageSrcs = new Set<string>();
const erroredTooltipImageSrcs = new Set<string>();

function getFullTooltipImageUrl(src: string) {
  try {
    const url = new URL(src);

    if (
      url.hostname === "commons.wikimedia.org" &&
      url.pathname.includes("/wiki/Special:FilePath/")
    ) {
      url.search = "";
      url.hash = "";
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
}

type DelayedTooltipImageStatus =
  | "idle"
  | "waiting"
  | "loading"
  | "loaded"
  | "error";

function rememberTooltipImageSrc(cache: Set<string>, src: string) {
  cache.delete(src);
  cache.add(src);

  if (cache.size <= MAX_TRACKED_TOOLTIP_IMAGE_SRCS) {
    return;
  }

  const oldestSrc = cache.values().next().value;

  if (oldestSrc) {
    cache.delete(oldestSrc);
  }
}

let cachedSafeViewportInsets: {
  top: number;
  right: number;
  bottom: number;
  left: number;
} | null = null;

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
  window.addEventListener(
    "resize",
    () => {
      cachedSafeViewportInsets = null;
    },
    { once: true },
  );

  return cachedSafeViewportInsets;
}

function useDelayedTooltipImage({
  enabled,
  src,
  tooltipId,
}: {
  enabled: boolean;
  src?: string;
  tooltipId: string;
}) {
  const [status, setStatus] = useState<DelayedTooltipImageStatus>("idle");

  useEffect(() => {
    if (!src || !enabled) {
      setStatus("idle");
      return;
    }

    if (loadedTooltipImageSrcs.has(src)) {
      setStatus("loaded");
      return;
    }

    if (erroredTooltipImageSrcs.has(src)) {
      setStatus("error");
      return;
    }

    setStatus("waiting");

    const timeout = window.setTimeout(() => {
      setStatus((current) => (current === "waiting" ? "loading" : current));
    }, TOOLTIP_IMAGE_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [enabled, src, tooltipId]);

  return {
    markErrored: () => {
      if (src) {
        rememberTooltipImageSrc(erroredTooltipImageSrcs, src);
      }

      setStatus("error");
    },
    markLoaded: () => {
      if (src) {
        rememberTooltipImageSrc(loadedTooltipImageSrcs, src);
      }

      setStatus("loaded");
    },
    shouldRenderImage: status === "loading" || status === "loaded",
    showSkeleton: status === "waiting" || status === "loading",
  };
}

function getTooltipStyle({
  height,
  measuredHeight,
  renderedTooltip,
  width,
}: {
  height: number;
  measuredHeight: number;
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
  const anchorY = displayedTooltip.anchorY;
  const availableAbove = anchorY - safeViewportInsets.top - TOOLTIP_OFFSET;
  const availableBelow =
    height - safeViewportInsets.bottom - anchorY - TOOLTIP_OFFSET;
  const preferBelow = displayedTooltip.placement === "below";
  // When height is known, use exact fit check; otherwise fall back to a heuristic
  const fitsAbove =
    measuredHeight > 0
      ? availableAbove >= measuredHeight
      : availableAbove >= 80;
  const fitsBelow =
    measuredHeight > 0
      ? availableBelow >= measuredHeight
      : availableBelow >= 80;
  const shouldPlaceBelow = (preferBelow && fitsBelow) || !fitsAbove;

  // Compute exact top so the tooltip never clips past a safe edge
  let tooltipTop: number;
  if (shouldPlaceBelow) {
    tooltipTop = anchorY + TOOLTIP_OFFSET;
    if (measuredHeight > 0) {
      tooltipTop = Math.min(
        tooltipTop,
        height - safeViewportInsets.bottom - measuredHeight,
      );
    }
  } else {
    tooltipTop = anchorY - TOOLTIP_OFFSET - measuredHeight;
    tooltipTop = Math.max(tooltipTop, safeViewportInsets.top);
  }

  const translateX = horizontalPlacement === "center" ? "-50%" : "0%";
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
    top: tooltipTop,
    width: `${tooltipWidth}px`,
    maxWidth: `${tooltipWidth}px`,
    transform: isTransitioning
      ? `translate(${translateX}, ${motionOffset}) scale(0.965)`
      : `translate(${translateX}, 0px) scale(1)`,
    transformOrigin: shouldPlaceBelow ? "top center" : "bottom center",
  };
}

export function TimelineTooltip({
  height,
  interactiveContentRef,
  renderedTooltip,
  width,
}: TimelineTooltipProps) {
  const tooltip = renderedTooltip.tooltipState.tooltip;
  const tooltipImage = tooltip.image;
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    const el = tooltipRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setMeasuredHeight(el.offsetHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { markErrored, markLoaded, shouldRenderImage, showSkeleton } =
    useDelayedTooltipImage({
      enabled: renderedTooltip.phase === "present",
      src: tooltipImage?.src,
      tooltipId: renderedTooltip.tooltipState.id,
    });

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "absolute z-[2] rounded-lg border border-border bg-glass p-3 text-foreground shadow-glass backdrop-blur-md transition-[opacity,transform] duration-200 ease-out",
        "pointer-events-none",
        renderedTooltip.phase === "present"
          ? "opacity-100"
          : "opacity-0 will-change-[transform,opacity]",
      )}
      data-phase={renderedTooltip.phase}
      style={getTooltipStyle({
        height,
        measuredHeight,
        renderedTooltip,
        width,
      })}
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
      {tooltipImage ? (
        <figure className="mt-2">
          <div
            className="relative overflow-hidden rounded-md border border-border/60 bg-surface/45"
            style={{ height: "clamp(72px, 35svh, 157px)" }}
          >
            {showSkeleton ? (
              <div
                aria-hidden="true"
                className="timeline-tooltip-image-skeleton absolute inset-0"
              />
            ) : null}
            {shouldRenderImage ? (
              <img
                alt=""
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 h-full w-full scale-105 object-cover opacity-50 blur-md brightness-105 saturate-125 transition-opacity duration-200",
                  showSkeleton ? "opacity-0" : "opacity-50",
                )}
                decoding="async"
                draggable={false}
                fetchPriority="low"
                height={tooltipImage.height}
                loading="lazy"
                referrerPolicy="no-referrer"
                src={tooltipImage.src}
                width={tooltipImage.width}
              />
            ) : null}
            {shouldRenderImage ? (
              <img
                alt={tooltipImage.alt}
                className={cn(
                  "relative z-[1] h-full w-full object-contain transition-opacity duration-200",
                  showSkeleton ? "opacity-0" : "opacity-100",
                )}
                decoding="async"
                fetchPriority="low"
                height={tooltipImage.height}
                loading="lazy"
                onError={markErrored}
                onLoad={markLoaded}
                referrerPolicy="no-referrer"
                src={tooltipImage.src}
                width={tooltipImage.width}
              />
            ) : null}
          </div>
        </figure>
      ) : null}
      {tooltipImage || tooltip.sources.length > 0 ? (
        <div ref={interactiveContentRef}>
          {tooltipImage ? (
            <div
              className="mt-1 text-[0.64rem] font-medium leading-tight text-muted-foreground"
              title={`${tooltipImage.alt} - open full image`}
            >
              <a
                className="pointer-events-auto text-muted-foreground underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
                href={getFullTooltipImageUrl(tooltipImage.src)}
                rel="noreferrer"
                target="_blank"
              >
                {tooltipImage.alt}
              </a>
              {tooltipImage.credit ? (
                <span className="text-muted-foreground/75">
                  {" "}
                  ({tooltipImage.credit})
                </span>
              ) : null}
            </div>
          ) : null}
          {tooltip.sources.length > 0 ? (
            <div className="mt-2">
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
      ) : null}
    </div>
  );
}
