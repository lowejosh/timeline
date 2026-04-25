import { useEffect, useMemo, useRef, useState } from "react";
import { type Era } from "@/lib/catalog/eras";
import {
  formatOverviewRulerPercentageLabel,
  formatOverviewRulerSpanLabel,
  OVERVIEW_RULER_DEFAULT_TIER_THRESHOLD_PX,
  OVERVIEW_RULER_FULL_TIMELINE_DOMAIN,
  OVERVIEW_RULER_MIN_SPOTLIGHT_WIDTH,
  resolveAnchoredOverviewRulerTiers,
  resolveOverviewRulerTiers,
  type OverviewRulerDomain,
  type OverviewRulerTier,
  type ResolveOverviewRulerTiersOptions,
} from "@/lib/rendering/overviewRuler";
import {
  getVisibleRange,
  getVisibleRangePrecise,
  subtractPreciseTimelineYears,
  type TimelineViewport,
} from "@/lib/core/viewport";
import { TimelineOverviewRuler } from "../TimelineOverviewRuler";
import { THEME } from "@/lib/ui/theme";

type TimelineOverviewRulerStackProps = {
  width: number;
  tierHeight: number;
  pad: number;
  bottomInset?: number | string;
  showSideLabels?: boolean;
  eras: Era[];
  viewport: TimelineViewport;
  mainInnerWidth: number;
  fullDomain?: OverviewRulerDomain;
  tierOptions?: ResolveOverviewRulerTiersOptions;
  onViewportChange: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
};

export function TimelineOverviewRulerStack({
  width,
  tierHeight,
  pad,
  bottomInset = 0,
  showSideLabels = true,
  eras,
  viewport,
  mainInnerWidth,
  fullDomain = OVERVIEW_RULER_FULL_TIMELINE_DOMAIN,
  tierOptions,
  onViewportChange,
}: TimelineOverviewRulerStackProps) {
  const settleTimerRef = useRef<number | null>(null);
  const [dragAnchor, setDragAnchor] = useState<{
    tierIndex: number;
    frozenTiers: OverviewRulerTier[];
  } | null>(null);
  const [isSettling, setIsSettling] = useState(false);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, []);
  const visibleRange = useMemo(
    () => getVisibleRange(viewport, mainInnerWidth),
    [mainInnerWidth, viewport],
  );
  const preciseVisibleSpan = useMemo(() => {
    const [precStart, precEnd] = getVisibleRangePrecise(
      viewport,
      mainInnerWidth,
    );
    return Math.abs(subtractPreciseTimelineYears(precEnd, precStart));
  }, [mainInnerWidth, viewport]);
  const addTierThresholdPx = Math.max(
    tierOptions?.addTierThresholdPx ?? OVERVIEW_RULER_DEFAULT_TIER_THRESHOLD_PX,
    1,
  );
  const baseTiers = useMemo(
    () =>
      resolveOverviewRulerTiers(
        fullDomain,
        visibleRange[0],
        visibleRange[1],
        width,
        pad,
        tierOptions,
      ),
    [fullDomain, pad, tierOptions, visibleRange, width],
  );
  const tiers = useMemo(() => {
    if (!dragAnchor) {
      return baseTiers;
    }

    return resolveAnchoredOverviewRulerTiers(
      dragAnchor.frozenTiers,
      dragAnchor.tierIndex,
      visibleRange[0],
      visibleRange[1],
      width,
      pad,
      tierOptions,
    );
  }, [baseTiers, dragAnchor, pad, tierOptions, visibleRange, width]);

  const stackHeight = Math.max(tiers.length, 1) * tierHeight;
  const totalSpanYears = fullDomain.endYear - fullDomain.startYear;

  return (
    <div
      className="absolute inset-x-0 bottom-0 w-full pointer-events-auto overflow-hidden"
      style={{
        bottom: bottomInset,
        height: stackHeight,
        transition: `height 200ms ${THEME.easing.spring}`,
      }}
    >
      {tiers.map((tier, index) => {
        const isRoot = index === 0;
        // Root tier stays visually on top; deeper tiers stack beneath it.
        const top = index * tierHeight;
        const tierSpanYears = tier.isFinalTier
          ? preciseVisibleSpan
          : tier.spotlightEndYear - tier.spotlightStartYear;
        const tierSpanLabel = formatOverviewRulerSpanLabel(tierSpanYears);
        const tierPercentageLabel = formatOverviewRulerPercentageLabel(
          tierSpanYears,
          totalSpanYears,
        );

        return (
          <div
            className="absolute left-0 right-0"
            data-root={isRoot ? "true" : "false"}
            key={index}
            style={{
              height: tierHeight,
              top,
              transition: `top 200ms ${THEME.easing.spring}`,
              animation: isRoot
                ? "none"
                : `timeline-overview-ruler-tier-in 220ms ${THEME.easing.spring}`,
            }}
          >
            {showSideLabels ? (
              <div
                aria-hidden="true"
                className="absolute top-0 bottom-0 left-0 z-[1] flex items-center justify-end pr-[0.42rem] pl-[0.28rem] text-right pointer-events-none whitespace-nowrap tabular-nums tracking-[0.01em] text-[0.55rem] leading-none font-medium font-sans text-[rgba(54,41,30,0.42)]"
                style={{ width: pad }}
              >
                <span className="text-[rgba(54,41,30,0.46)]">
                  {tierPercentageLabel}
                </span>
              </div>
            ) : null}
            <TimelineOverviewRuler
              domain={tier.domain}
              eras={eras}
              height={tierHeight}
              isFollowingDrag={
                dragAnchor !== null && index > dragAnchor.tierIndex
              }
              isSettling={isSettling}
              mainInnerWidth={mainInnerWidth}
              onDragEnd={() => {
                if (settleTimerRef.current !== null) {
                  window.clearTimeout(settleTimerRef.current);
                }

                setIsSettling(true);
                setDragAnchor((current) =>
                  current?.tierIndex === index ? null : current,
                );
                settleTimerRef.current = window.setTimeout(() => {
                  setIsSettling(false);
                  settleTimerRef.current = null;
                }, 180);
              }}
              onDragStart={() => {
                if (settleTimerRef.current !== null) {
                  window.clearTimeout(settleTimerRef.current);
                  settleTimerRef.current = null;
                }

                setIsSettling(false);
                setDragAnchor({
                  tierIndex: index,
                  frozenTiers: tiers,
                });
              }}
              onViewportChange={onViewportChange}
              pad={pad}
              spotlightEndYear={tier.spotlightEndYear}
              spotlightMinDisplayWidth={
                tier.isFinalTier
                  ? OVERVIEW_RULER_MIN_SPOTLIGHT_WIDTH
                  : addTierThresholdPx
              }
              spotlightStartYear={tier.spotlightStartYear}
              viewport={viewport}
              width={width}
            />
            {showSideLabels ? (
              <div
                aria-hidden="true"
                className="absolute top-0 right-0 bottom-0 z-[1] flex items-center justify-start gap-[0.22rem] pr-[0.28rem] pl-[0.5rem] text-left pointer-events-none whitespace-nowrap tabular-nums tracking-[0.01em] text-[0.56rem] leading-none font-medium font-sans text-[rgba(54,41,30,0.5)] lowercase"
                style={{ width: pad }}
              >
                <span className="text-[rgba(54,41,30,0.54)] font-semibold">
                  {tierSpanLabel}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
