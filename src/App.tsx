import { useEffect } from "react";
import { TimelineCanvas } from "./components/TimelineCanvas";
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
  const { activeView, isSidebarOpen, setIsSidebarOpen } = app;
  const shouldUseMobileDrawer =
    app.stageSize.width <= 720 ||
    (app.stageSize.width <= 980 && app.stageSize.height <= 560);
  const shouldHideOverviewSideLabels =
    app.stageSize.width <= 720 && app.stageSize.height > app.stageSize.width;
  const shouldDockOverviewRuler =
    shouldUseMobileDrawer && app.isOverviewVisible;
  const overviewRulerDockHeight =
    TIMELINE_APP_LAYOUT.overviewRulerTierHeight *
    TIMELINE_APP_LAYOUT.overviewRulerMaxTiers;

  useEffect(() => {
    if (!isSidebarOpen || activeView !== "timeline") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeView, isSidebarOpen, setIsSidebarOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !("ontouchstart" in window)) {
      return;
    }

    const CHROME_NUDGE_PX = 96;
    const nudgeBrowserChrome = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo(0, CHROME_NUDGE_PX);
        });
      });
    };
    const handleTouchStart = () => {
      if (window.scrollY < CHROME_NUDGE_PX * 0.5) {
        nudgeBrowserChrome();
      }
    };

    const timeoutId = window.setTimeout(nudgeBrowserChrome, 48);

    nudgeBrowserChrome();
    window.addEventListener("pageshow", nudgeBrowserChrome);
    window.addEventListener("resize", nudgeBrowserChrome);
    window.addEventListener("orientationchange", nudgeBrowserChrome);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.visualViewport?.addEventListener("resize", nudgeBrowserChrome);
    window.visualViewport?.addEventListener("scroll", nudgeBrowserChrome);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("pageshow", nudgeBrowserChrome);
      window.removeEventListener("resize", nudgeBrowserChrome);
      window.removeEventListener("orientationchange", nudgeBrowserChrome);
      window.removeEventListener("touchstart", handleTouchStart);
      window.visualViewport?.removeEventListener("resize", nudgeBrowserChrome);
      window.visualViewport?.removeEventListener("scroll", nudgeBrowserChrome);
    };
  }, [activeView]);

  return (
    <main
      className="app-shell relative flex items-stretch w-full overflow-hidden overscroll-none"
      data-sidebar-open={isSidebarOpen ? "true" : "false"}
      data-sidebar-mode={shouldUseMobileDrawer ? "drawer" : "popup"}
      data-active-view={activeView}
    >
      {/* kind of cringe might add back later */}
      {/* <TimelineDisclaimer /> */}
      {activeView === "timeline" ? (
        <TimelineSettings
          isCosmicCalendarMode={app.isCosmicCalendarMode}
          onToggleCosmicCalendarMode={() =>
            app.setIsCosmicCalendarMode((current) => !current)
          }
        />
      ) : null}
      <button
        aria-controls="timeline-layers-panel"
        aria-expanded={isSidebarOpen}
        aria-label={
          isSidebarOpen ? "Hide layers controls" : "Show layers controls"
        }
        className="timeline-sidebar-toggle__wrap absolute top-3 left-3 z-[4] inline-flex items-center gap-[0.45rem] py-[0.46rem] px-[0.68rem] border rounded-full text-[var(--ink)] backdrop-blur-[14px] cursor-pointer bg-[var(--glass-base)] border-[var(--brown-14)] [box-shadow:0_8px_18px_var(--shadow-8)] [transition:background-color_180ms_ease,box-shadow_180ms_ease,border-color_180ms_ease,transform_180ms_ease,opacity_180ms_ease] hover:bg-[var(--glass-hover)] hover:border-[var(--brown-20)] hover:[box-shadow:0_10px_22px_var(--shadow-10)] hover:-translate-y-px data-[open=true]:bg-[var(--glass-active)] data-[open=true]:border-[var(--brown-18)] data-[open=true]:[box-shadow:0_10px_22px_var(--shadow-10)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--focus)] max-sm:top-[10px] max-sm:left-[10px] max-sm:py-[0.42rem] max-sm:data-[open=true]:opacity-0 max-sm:data-[open=true]:pointer-events-none max-sm:data-[open=true]:-translate-y-1 max-sm:data-[open=true]:scale-[0.98]"
        data-open={isSidebarOpen ? "true" : "false"}
        onClick={() => {
          setIsSidebarOpen((current) => !current);
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
      <button
        aria-label="Close layers controls"
        className="timeline-sidebar-backdrop absolute inset-0 z-[2] border-0 bg-transparent p-0"
        data-open={isSidebarOpen ? "true" : "false"}
        onClick={() => {
          setIsSidebarOpen(false);
        }}
        tabIndex={isSidebarOpen ? 0 : -1}
        type="button"
      />
      <div
        aria-hidden={!isSidebarOpen}
        className="timeline-sidebar-shell absolute top-14 left-3 z-[3] w-[min(var(--sidebar-width),calc(100vw-24px))] max-h-[min(calc(100%-68px),var(--sidebar-max-height))] max-sm:top-[50px] max-sm:left-[10px] max-sm:w-[min(var(--sidebar-width),calc(100vw-20px))] max-sm:max-h-[min(calc(100%-60px),var(--sidebar-max-height))]"
        data-open={isSidebarOpen ? "true" : "false"}
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
                    pad={app.canvasPad}
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
                  <div
                    className={
                      shouldDockOverviewRuler
                        ? "relative shrink-0 z-[1] pointer-events-none"
                        : "absolute right-0 bottom-0 left-0 z-[1] pointer-events-none"
                    }
                    style={
                      shouldDockOverviewRuler
                        ? {
                            height: overviewRulerDockHeight,
                          }
                        : undefined
                    }
                  >
                    <TimelineOverviewRulerStack
                      eras={app.rootDisplayEras}
                      mainInnerWidth={Math.max(
                        app.stageSize.width - app.canvasPad * 2,
                        1,
                      )}
                      onViewportChange={app.handleViewportChange}
                      pad={app.canvasPad}
                      showSideLabels={!shouldHideOverviewSideLabels}
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
              visibleSetIds={app.visibleSetIds}
              orderedSetIds={app.orderedSetIds}
              isActive={activeView === "available-sets"}
              onApply={app.handleApplySets}
              onToggleVisible={app.handleToggleSet}
              onClose={app.handleCloseSetManager}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
