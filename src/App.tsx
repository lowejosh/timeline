import { TimelineCanvas } from "./components/TimelineCanvas";
import { TIMELINE_CANVAS_PAD } from "./lib/rendering/layout/padding";
import { TimelineDisclaimer } from "./components/TimelineDisclaimer";
import { TimelineSettings } from "./components/TimelineSettings";
import { TimelineSidebar } from "./components/TimelineSidebar";
import { TimelineOverviewRulerStack } from "./components/TimelineOverviewRuler/TimelineOverviewRulerStack";
import { AvailableSetsPage } from "./components/AvailableSets";
import {
  TIMELINE_APP_LAYOUT,
  useTimelineAppState,
} from "./lib/app/useTimelineAppState";
import { TIMELINE_SETS } from "./lib/catalog/timelineSets";
import { THEME } from "./lib/ui/theme";
import "./App.styles.css";

function App() {
  const app = useTimelineAppState();

  return (
    <main
      className="app-shell relative flex items-stretch w-full h-svh overflow-hidden overscroll-none"
      data-sidebar-open={app.isSidebarOpen ? "true" : "false"}
      data-active-view={app.activeView}
    >
      {/* kind of cringe might add back later */}
      {/* <TimelineDisclaimer /> */}
      <TimelineSettings
        isCosmicCalendarMode={app.isCosmicCalendarMode}
        onToggleCosmicCalendarMode={() =>
          app.setIsCosmicCalendarMode((current) => !current)
        }
      />
      <button
        aria-controls="timeline-layers-panel"
        aria-expanded={app.isSidebarOpen}
        aria-label={
          app.isSidebarOpen ? "Hide layers controls" : "Show layers controls"
        }
        className="timeline-sidebar-toggle__wrap absolute top-3 left-3 z-[4] inline-flex items-center gap-[0.45rem] py-[0.46rem] px-[0.68rem] border rounded-full text-[var(--ink)] backdrop-blur-[14px] cursor-pointer bg-[var(--glass-base)] border-[var(--brown-14)] [box-shadow:0_8px_18px_var(--shadow-8)] [transition:background-color_180ms_ease,box-shadow_180ms_ease,border-color_180ms_ease,transform_180ms_ease] hover:bg-[var(--glass-hover)] hover:border-[var(--brown-20)] hover:[box-shadow:0_10px_22px_var(--shadow-10)] hover:-translate-y-px data-[open=true]:bg-[var(--glass-active)] data-[open=true]:border-[var(--brown-18)] data-[open=true]:[box-shadow:0_10px_22px_var(--shadow-10)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--focus)] max-sm:top-[10px] max-sm:left-[10px] max-sm:py-[0.42rem]"
        data-open={app.isSidebarOpen ? "true" : "false"}
        onClick={() => {
          app.setIsSidebarOpen((current) => !current);
        }}
        type="button"
      >
        <span
          aria-hidden="true"
          className="timeline-sidebar-toggle__glyph relative w-[0.8rem] h-[0.8rem]"
        />
        <span className="font-semibold text-[0.76rem] leading-none tracking-[0.01em] font-sans">
          Layers
        </span>
      </button>
      <div
        aria-hidden={!app.isSidebarOpen}
        className="timeline-sidebar-shell absolute top-14 left-3 z-[3] w-[min(var(--sidebar-width),calc(100vw-24px))] max-h-[min(calc(100%-68px),var(--sidebar-max-height))] max-sm:top-[50px] max-sm:left-[10px] max-sm:w-[min(var(--sidebar-width),calc(100vw-20px))] max-sm:max-h-[min(calc(100%-60px),var(--sidebar-max-height))]"
        data-open={app.isSidebarOpen ? "true" : "false"}
        id="timeline-layers-panel"
      >
        <TimelineSidebar
          expandedSetIds={app.expandedSetIds}
          onReorderSets={app.handleReorderSets}
          onToggleSet={app.handleToggleSet}
          onToggleSetExpanded={app.handleToggleSetExpanded}
          sets={app.sidebarTree}
          onToggleEntry={app.handleToggleEntry}
          onOpenSetManager={app.handleOpenSetManager}
        />
      </div>
      <section
        className="app-stage relative flex-1 min-w-0 h-full"
        ref={app.stageRef}
      >
        <div className="app-view-stack relative w-full h-full overflow-hidden">
          <div className="app-view app-view--timeline absolute inset-0 w-full h-full">
            {app.stageSize.width > 0 && app.stageSize.height > 0 ? (
              <div className="relative flex flex-col w-full h-full gap-0">
                <div className="relative flex-1 min-h-0" ref={app.timelineRef}>
                  <TimelineCanvas
                    height={app.mainCanvasHeight}
                    viewport={app.animated.viewport}
                    width={app.stageSize.width}
                    activeEra={app.activeEra}
                    activeChain={app.chain}
                    siblingEras={app.siblingEras}
                    markers={app.setFilteredMarkers}
                    overlayBands={app.visibleFilteredOverlays}
                    enabledGroupIds={app.renderEnabledGroupIds}
                    overlayVisibilityTransitionKey={
                      app.overlayVisibilityTransitionKey
                    }
                    parentEra={app.parentEra}
                    isCosmicCalendarMode={app.isCosmicCalendarMode}
                    isAnimating={app.animated.isAnimating}
                    onViewportChange={app.handleViewportChange}
                    onAnimateZoom={app.handleZoom}
                    onAnimateToRange={app.animated.animateToRange}
                    onDrillIntoEra={app.handleDrillIntoEra}
                    onNavigateUp={app.handleNavigateUp}
                    onRecordDragSample={app.animated.recordDragSample}
                    onReleaseMomentum={app.animated.releaseMomentum}
                  />
                </div>
                {app.isOverviewVisible ? (
                  <div className="absolute right-0 bottom-0 left-0 z-[1] pointer-events-none">
                    <TimelineOverviewRulerStack
                      eras={app.rootDisplayEras}
                      mainInnerWidth={Math.max(
                        app.stageSize.width - TIMELINE_CANVAS_PAD * 2,
                        1,
                      )}
                      onViewportChange={app.handleViewportChange}
                      pad={TIMELINE_CANVAS_PAD}
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

          <div
            className="app-view app-view--available-sets absolute inset-0 w-full h-full"
            style={{
              background: `linear-gradient(180deg, ${THEME.color.glass.setsFrom} 0%, ${THEME.color.glass.setsTo} 100%)`,
            }}
          >
            <AvailableSetsPage
              allSets={TIMELINE_SETS}
              enabledSetIds={app.enabledSetIds}
              orderedSetIds={app.orderedSetIds}
              isActive={app.activeView === "available-sets"}
              onApply={app.handleApplySets}
              onClose={app.handleCloseSetManager}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
