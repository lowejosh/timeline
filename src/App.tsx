import { lazy, Suspense } from "react";

import { useStandaloneViewportHeight } from "./hooks/useStandaloneViewportHeight";
import { getTimelineAppLayoutState } from "./lib/app/layout";
import { TimelineSidebarChrome } from "./components/TimelineSidebar";
import { useTimelineAppState } from "./hooks/useTimelineAppState";
import { TimelineSettings } from "./components/TimelineSettings";
import { TimelineView } from "./views/TimelineView";
import "./App.styles.css";

const AvailableSetsView = lazy(() =>
  import("./views/AvailableSetsView").then((module) => ({
    default: module.AvailableSetsView,
  })),
);

function App() {
  const app = useTimelineAppState();
  const { activeView, isSidebarOpen, setIsSidebarOpen } = app;
  const layout = getTimelineAppLayoutState({
    height: app.stageSize.height,
    isOverviewVisible: app.isOverviewVisible,
    width: app.stageSize.width,
  });

  useStandaloneViewportHeight();

  return (
    <main
      className="app-shell relative flex items-stretch w-full overflow-hidden overscroll-none"
      data-active-view={activeView}
      data-sidebar-mode={layout.shouldUseMobileDrawer ? "drawer" : "popup"}
      data-sidebar-open={isSidebarOpen ? "true" : "false"}
    >
      {activeView === "timeline" ? (
        <TimelineSettings
          isCosmicCalendarMode={app.isCosmicCalendarMode}
          onToggleCosmicCalendarMode={() => {
            app.setIsCosmicCalendarMode((current) => !current);
          }}
        />
      ) : null}
      <TimelineSidebarChrome
        activeView={activeView}
        expandedSetIds={app.expandedSetIds}
        isOpen={isSidebarOpen}
        mode={layout.shouldUseMobileDrawer ? "drawer" : "popup"}
        onOpenSetManager={app.handleOpenSetManager}
        onReorderSets={app.handleReorderSets}
        onToggleEntry={app.handleToggleEntry}
        onToggleSet={app.handleToggleSet}
        onToggleSetExpanded={app.handleToggleSetExpanded}
        setIsOpen={setIsSidebarOpen}
        sets={app.sidebarTree}
      />
      <section
        className="app-stage relative flex-1 min-w-0 h-full"
        ref={app.stageRef}
      >
        <div className="app-view-stack relative w-full h-full overflow-hidden">
          <TimelineView app={app} layout={layout} />
          {activeView === "available-sets" ? (
            <Suspense fallback={null}>
              <AvailableSetsView app={app} />
            </Suspense>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default App;
