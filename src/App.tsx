import { TimelineCanvas } from "./components/timeline/TimelineCanvas";
import { TIMELINE_CANVAS_PAD } from "./lib/rendering/layout/padding";
import { TimelineDisclaimer } from "./components/chrome/TimelineDisclaimer";
import { TimelineSidebar } from "./components/chrome/TimelineSidebar";
import { TimelineOverviewRulerStack } from "./components/timeline/TimelineOverviewRulerStack";
import {
  TIMELINE_APP_LAYOUT,
  useTimelineAppState,
} from "./lib/app/useTimelineAppState";
import "./App.css";

function App() {
  const app = useTimelineAppState();

  return (
    <main
      className="app-shell"
      data-sidebar-open={app.isSidebarOpen ? "true" : "false"}
    >
      <TimelineDisclaimer />
      <button
        aria-controls="timeline-layers-panel"
        aria-expanded={app.isSidebarOpen}
        aria-label={
          app.isSidebarOpen ? "Hide layers controls" : "Show layers controls"
        }
        className="timeline-sidebar-toggle"
        onClick={() => {
          app.setIsSidebarOpen((current) => !current);
        }}
        type="button"
      >
        <span aria-hidden="true" className="timeline-sidebar-toggle__glyph" />
        <span className="timeline-sidebar-toggle__label">Layers</span>
      </button>
      <div
        aria-hidden={!app.isSidebarOpen}
        className="timeline-sidebar-shell"
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
        />
      </div>
      <section className="app-stage" ref={app.stageRef}>
        {app.stageSize.width > 0 && app.stageSize.height > 0 ? (
          <div className="app-stage__stack">
            <div className="app-stage__timeline" ref={app.timelineRef}>
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
              <div className="app-stage__overview">
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
      </section>
    </main>
  );
}

export default App;
