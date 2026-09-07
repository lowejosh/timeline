import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { placeTimelineTooltip, type TooltipBounds } from "@/lib/rendering/tooltipPlacement";

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

function useTooltipImage({
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

    setStatus("loading");
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

function getTooltipStyle({ bounds, measuredHeight, renderedTooltip }: {
  bounds: TooltipBounds;
  measuredHeight: number;
  renderedTooltip: RenderedTooltipState;
}): CSSProperties {
  const state = renderedTooltip.tooltipState;
  const { placeBelow, ...placement } = placeTimelineTooltip({
    bounds, measuredHeight, anchorX: state.anchorX, anchorY: state.anchorY,
    preferredBelow: state.placement === "below",
    maxWidth: TOOLTIP_MAX_WIDTH, offset: TOOLTIP_OFFSET,
  });
  return {
    ...placement,
    transform: renderedTooltip.phase === "present" ? "translateY(0)" : `translateY(${placeBelow ? -4 : 4}px)`,
    transformOrigin: placeBelow ? "top center" : "bottom center",
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
  const [bounds, setBounds] = useState<TooltipBounds>({ left: 10, top: 64, right: width - 10, bottom: height - 10 });

  useLayoutEffect(() => {
    const updateBounds = () => {
      const parent = tooltipRef.current?.offsetParent;
      if (!(parent instanceof HTMLElement)) return;
      const rect = parent.getBoundingClientRect();
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const right = left + (viewport?.width ?? window.innerWidth);
      const bottom = top + (viewport?.height ?? window.innerHeight);
      const styles = getComputedStyle(document.documentElement);
      const inset = (side: string) => Number.parseFloat(styles.getPropertyValue(`--safe-area-${side}`)) || 0;
      // Reserve the actual floating controls, including safe areas and font scaling.
      const controlsBottom = Math.max(top, ...Array.from(document.querySelectorAll("[data-timeline-controls]"), el => el.getBoundingClientRect().bottom));
      setBounds({
        left: Math.max(0, left - rect.left, inset("left") - rect.left) + 10,
        top: Math.max(0, controlsBottom - rect.top, top + inset("top") - rect.top) + 10,
        right: Math.min(width, right - rect.left - inset("right")) - 10,
        bottom: Math.min(height, bottom - rect.top - inset("bottom")) - 10,
      });
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    window.visualViewport?.addEventListener("resize", updateBounds);
    window.visualViewport?.addEventListener("scroll", updateBounds);
    return () => {
      window.removeEventListener("resize", updateBounds);
      window.visualViewport?.removeEventListener("resize", updateBounds);
      window.visualViewport?.removeEventListener("scroll", updateBounds);
    };
  }, [width, height]);

  useEffect(() => {
    tooltipRef.current?.scrollTo({ top: 0 });
  }, [renderedTooltip.tooltipState.id]);

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
    useTooltipImage({
      enabled: renderedTooltip.phase === "present",
      src: tooltipImage?.src,
      tooltipId: renderedTooltip.tooltipState.id,
    });

  return (
    <div
      ref={(element) => {
        tooltipRef.current = element;
        interactiveContentRef.current = element;
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
      className={cn(
        "absolute z-[50] rounded-lg border border-border bg-glass p-3 text-foreground shadow-glass backdrop-blur-md transition-[opacity,transform] duration-200 ease-out",
        "pointer-events-auto overflow-y-auto overscroll-contain touch-pan-y break-words timeline-scrollbar motion-reduce:transition-none",
        renderedTooltip.phase === "present"
          ? "opacity-100"
          : "opacity-0 will-change-[transform,opacity]",
      )}
      data-timeline-tooltip
      data-phase={renderedTooltip.phase}
      style={getTooltipStyle({
        bounds,
        measuredHeight,
        renderedTooltip,
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
        <div>
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
            <TooltipSources key={renderedTooltip.tooltipState.id} sources={tooltip.sources} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TooltipSources({ sources }: { sources: RenderedTooltipState["tooltipState"]["tooltip"]["sources"] }) {
  const list = <ul className="m-0 list-none p-0">
    {sources.map(source => <li className="mt-2 first:mt-0" key={source.id}>
      {source.url ? <a className="block py-1 text-[0.71rem] font-medium leading-snug text-foreground/90 hover:underline" href={source.url} rel="noreferrer" target="_blank">{source.shortTitle}</a>
        : <span className="block text-[0.71rem] font-medium leading-snug">{source.shortTitle}</span>}
      <span className="block text-[0.66rem] leading-tight text-muted-foreground">{source.organization}</span>
    </li>)}
  </ul>;
  if (sources.length === 1) return <div className="mt-2 border-t border-border/60 pt-2">{list}</div>;
  return <Collapsible className="mt-2 border-t border-border/60 pt-1">
    <CollapsibleTrigger className="group flex cursor-pointer min-h-9 w-full items-center justify-between text-xs font-semibold text-muted-foreground">
      Sources ({sources.length})
      <ChevronDown className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
    </CollapsibleTrigger>
    <CollapsibleContent className="motion-reduce:animate-none"><div className="pb-1 pt-1">{list}</div></CollapsibleContent>
  </Collapsible>;
}
