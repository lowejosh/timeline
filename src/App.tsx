import { lazy, Suspense } from "react";

import { useStandaloneViewportHeight } from "./hooks/useStandaloneViewportHeight";
import { getTimelineAppLayoutState } from "./lib/app/layout";
import { TimelineSidebarChrome } from "./components/TimelineSidebar";
import { useTimelineAppState } from "./hooks/useTimelineAppState";
import { TimelineSettings } from "./components/TimelineSettings";
import { TimelineView } from "./views/TimelineView";

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
      className="fixed inset-0 flex h-[var(--app-standalone-viewport-height,100dvh)] min-h-[var(--app-standalone-viewport-height,100svh)] w-full items-stretch overflow-hidden overscroll-none bg-background pt-[env(safe-area-inset-top,0px)] text-foreground [--sidebar-max-height:min(calc(100svh-80px),540px)] [--sidebar-width:224px] max-[980px]:[--sidebar-width:212px] max-[720px]:[--sidebar-max-height:100%] max-[720px]:[--sidebar-width:min(320px,calc(100vw-28px))] data-[sidebar-mode=drawer]:[--sidebar-max-height:100%] data-[sidebar-mode=drawer]:[--sidebar-width:min(320px,calc(100vw-env(safe-area-inset-left,0px)-28px))]"
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
          <Suspense fallback={null}>
            <AvailableSetsView app={app} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

export default App;
