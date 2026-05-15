import type { getTimelineAppLayoutState } from "@/lib/app/layout";
import type { useTimelineAppState } from "@/hooks/useTimelineAppState";

import { TimelineOverviewRulerStack } from "@/components/TimelineOverviewRuler/TimelineOverviewRulerStack";
import { TIMELINE_APP_LAYOUT } from "@/lib/app/layout";
import { TimelineCanvas } from "@/features/timeline-viewer/canvas";
import { cn } from "@/lib/utils";

type TimelineAppLayoutState = ReturnType<typeof getTimelineAppLayoutState>;
type TimelineAppState = ReturnType<typeof useTimelineAppState>;

type TimelineViewProps = {
  app: TimelineAppState;
  layout: TimelineAppLayoutState;
};

export function TimelineView({ app, layout }: TimelineViewProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full transition-[transform,opacity] duration-300 ease-out",
        app.activeView === "available-sets"
          ? "pointer-events-none -translate-x-[6%] opacity-0 will-change-[transform,opacity]"
          : "translate-x-0 opacity-100",
      )}
    >
      {app.stageSize.width > 0 && app.stageSize.height > 0 ? (
        <div className="relative flex flex-col w-full h-full gap-0">
          <div className="relative flex-1 min-h-0" ref={app.timelineRef}>
            <TimelineCanvas
              activeChain={app.chain}
              activeEra={app.activeEra}
              enabledGroupIds={app.renderEnabledGroupIds}
              height={app.mainCanvasHeight}
              isAnimating={app.animated.isAnimating}
              isCosmicCalendarMode={app.isCosmicCalendarMode}
              markers={app.setFilteredMarkers}
              onAnimateToRange={app.animated.animateToRange}
              onAnimateZoom={app.handleZoom}
              onContinuousViewportChange={app.handleContinuousViewportChange}
              onDrillIntoEra={app.handleDrillIntoEra}
              onNavigateUp={app.handleNavigateUp}
              onRecordDragSample={app.animated.recordDragSample}
              onReleaseMomentum={app.animated.releaseMomentum}
              onViewportChange={app.handleViewportChange}
              onViewportGestureEnd={app.handleViewportGestureEnd}
              onViewportGestureStart={app.handleViewportGestureStart}
              overlayBands={app.visibleFilteredOverlays}
              overlayVisibilityTransitionKey={
                app.overlayVisibilityTransitionKey
              }
              overviewReservedHeight={layout.overviewReservedHeight}
              pad={app.canvasPad}
              parentEra={app.parentEra}
              siblingEras={app.siblingEras}
              viewport={app.animated.viewport}
              width={app.stageSize.width}
            />
          </div>
          {app.isOverviewVisible ? (
            <div
              className={
                layout.shouldDockOverviewRuler
                  ? "relative shrink-0 z-[1] pointer-events-none"
                  : "absolute right-0 bottom-0 left-0 z-[1] pointer-events-none"
              }
              style={
                layout.shouldDockOverviewRuler
                  ? {
                      height: `calc(${layout.overviewRulerDockHeight}px + ${layout.overviewRulerDockBottomInset})`,
                    }
                  : undefined
              }
            >
              <TimelineOverviewRulerStack
                bottomInset={0}
                eras={app.rootDisplayEras}
                mainInnerWidth={Math.max(
                  app.stageSize.width - app.canvasPad * 2,
                  1,
                )}
                onViewportChange={app.handleViewportChange}
                pad={app.canvasPad}
                showSideLabels={!layout.shouldHideOverviewSideLabels}
                tierHeight={TIMELINE_APP_LAYOUT.overviewRulerTierHeight}
                tierOptions={{
                  maxTiers: TIMELINE_APP_LAYOUT.overviewRulerMaxTiers,
                }}
                viewport={app.animated.viewport}
                width={app.stageSize.width}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
