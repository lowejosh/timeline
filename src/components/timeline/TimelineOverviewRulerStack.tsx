import { useEffect, useMemo, useRef, useState } from "react";
import { type Era } from "../../lib/data/eras";
import {
  formatOverviewRulerPercentageLabel,
  formatOverviewRulerSpanLabel,
  OVERVIEW_RULER_FULL_TIMELINE_DOMAIN,
  resolveAnchoredOverviewRulerTiers,
  resolveOverviewRulerTiers,
  type OverviewRulerDomain,
  type OverviewRulerTier,
  type ResolveOverviewRulerTiersOptions,
} from "../../lib/time/overviewRuler";
import {
  getVisibleRange,
  type TimelineViewport,
} from "../../lib/time/viewport";
import { TimelineOverviewRuler } from "./TimelineOverviewRuler";
import "./TimelineOverviewRulerStack.css";

type TimelineOverviewRulerStackProps = {
  width: number;
  tierHeight: number;
  pad: number;
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
      className="timeline-overview-ruler-stack"
      style={{ height: stackHeight }}
    >
      {tiers.map((tier, index) => {
        const isRoot = index === 0;
        // Root tier stays visually on top; deeper tiers stack beneath it.
        const top = index * tierHeight;
        const tierSpanLabel = formatOverviewRulerSpanLabel(
          tier.spotlightEndYear - tier.spotlightStartYear,
        );
        const tierPercentageLabel = formatOverviewRulerPercentageLabel(
          tier.spotlightEndYear - tier.spotlightStartYear,
          totalSpanYears,
        );

        return (
          <div
            className="timeline-overview-ruler-stack__tier"
            data-root={isRoot ? "true" : "false"}
            key={index}
            style={{
              height: tierHeight,
              top,
            }}
          >
            <div
              aria-hidden="true"
              className="timeline-overview-ruler-stack__tier-mag"
              style={{ width: pad }}
            >
              <span className="timeline-overview-ruler-stack__tier-mag-value">
                {tierPercentageLabel}
              </span>
            </div>
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
              spotlightStartYear={tier.spotlightStartYear}
              viewport={viewport}
              width={width}
            />
            <div
              aria-hidden="true"
              className="timeline-overview-ruler-stack__tier-label"
              style={{ width: pad }}
            >
              <span className="timeline-overview-ruler-stack__tier-label-value">
                {tierSpanLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
