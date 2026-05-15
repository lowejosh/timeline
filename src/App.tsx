import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useStandaloneViewportHeight } from "./hooks/useStandaloneViewportHeight";
import { useTimelineKeyboardShortcuts } from "./hooks/useTimelineKeyboardShortcuts";
import { getTimelineAppLayoutState } from "./lib/app/layout";
import { TimelineSidebarChrome } from "./components/TimelineSidebar";
import {
  TimelineKeyboardHelp,
  TimelineKeyboardHelpButton,
} from "./components/TimelineKeyboardHelp/TimelineKeyboardHelp";
import { TimelineSearch } from "./components/TimelineSearch/TimelineSearch";
import { useTimelineAppState } from "./hooks/useTimelineAppState";
import { TimelineSettings } from "./components/TimelineSettings";
import { TimelineView } from "./views/TimelineView";
import { getPrimaryShortcutModifierLabel } from "./lib/app/timelineKeyboard";

const AvailableSetsView = lazy(() =>
  import("./views/AvailableSetsView").then((module) => ({
    default: module.AvailableSetsView,
  })),
);

function App() {
  const app = useTimelineAppState();
  const { activeView, isSidebarOpen, setIsSidebarOpen } = app;
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const layout = getTimelineAppLayoutState({
    height: app.stageSize.height,
    isOverviewVisible: app.isOverviewVisible,
    width: app.stageSize.width,
  });
  const shortcutUiEnabled =
    activeView === "timeline" && !layout.shouldUseMobileDrawer;
  const shortcutModifierLabel = useMemo(
    () => getPrimaryShortcutModifierLabel(),
    [],
  );
  const closeKeyboardHelp = useCallback(() => {
    setIsKeyboardHelpOpen(false);
  }, []);
  const toggleKeyboardHelp = useCallback(() => {
    setIsKeyboardHelpOpen((current) => {
      const nextOpen = !current;

      if (nextOpen) {
        setIsSearchOpen(false);
      }

      return nextOpen;
    });
  }, []);
  const toggleSearch = useCallback(() => {
    setIsSearchOpen((current) => {
      const nextOpen = !current;

      if (nextOpen) {
        setIsKeyboardHelpOpen(false);
      }

      return nextOpen;
    });
  }, []);

  useStandaloneViewportHeight();

  useEffect(() => {
    if (shortcutUiEnabled) {
      return;
    }

    setIsKeyboardHelpOpen(false);
    setIsSearchOpen(false);
  }, [shortcutUiEnabled]);

  useTimelineKeyboardShortcuts({
    enabled: shortcutUiEnabled,
    isHelpOpen: isKeyboardHelpOpen,
    isSidebarOpen,
    onCloseHelp: closeKeyboardHelp,
    onFullTimelineRange: app.handleFullTimelineRange,
    onHelpOpenChange: setIsKeyboardHelpOpen,
    onHomeRange: app.handleHomeRange,
    onLayerShortcut: app.handleLayerShortcut,
    onNavigationEnd: app.handleKeyboardNavigationEnd,
    onNavigationFrame: app.handleKeyboardNavigationFrame,
    onSearchToggle: toggleSearch,
    onSidebarOpenChange: setIsSidebarOpen,
  });

  return (
    <main
      className="fixed inset-0 flex h-[max(var(--app-standalone-viewport-height,100dvh),100dvh)] min-h-[max(var(--app-standalone-viewport-height,100svh),100svh)] w-full items-stretch overflow-hidden overscroll-none bg-background pt-[env(safe-area-inset-top,0px)] text-foreground [--app-chrome-left:calc(env(safe-area-inset-left,0px)+0.75rem)] [--app-chrome-right:calc(env(safe-area-inset-right,0px)+0.75rem)] [--app-chrome-top:calc(env(safe-area-inset-top,0px)+0.75rem)] [--sidebar-max-height:min(calc(100svh-80px),540px)] [--sidebar-width:268px] max-[980px]:[--sidebar-width:252px] max-sm:[--app-chrome-left:calc(env(safe-area-inset-left,0px)+0.625rem)] max-sm:[--app-chrome-right:calc(env(safe-area-inset-right,0px)+0.625rem)] max-sm:[--app-chrome-top:calc(env(safe-area-inset-top,0px)+0.625rem)] max-[720px]:[--sidebar-max-height:100%] max-[720px]:[--sidebar-width:min(320px,calc(100vw-28px))] data-[sidebar-mode=drawer]:[--sidebar-max-height:100%] data-[sidebar-mode=drawer]:[--sidebar-width:min(320px,calc(100vw-env(safe-area-inset-left,0px)-28px))]"
      data-active-view={activeView}
      data-sidebar-mode={layout.shouldUseMobileDrawer ? "drawer" : "popup"}
      data-sidebar-open={isSidebarOpen ? "true" : "false"}
    >
      {activeView === "timeline" ? (
        <>
          <div className="absolute right-[var(--app-chrome-right)] top-[var(--app-chrome-top)] z-[5] flex items-start justify-end gap-2">
            {shortcutUiEnabled ? (
              <>
                <TimelineKeyboardHelpButton
                  className="order-1"
                  isOpen={isKeyboardHelpOpen}
                  modifierLabel={shortcutModifierLabel}
                  onClick={toggleKeyboardHelp}
                />
                <TimelineSearch
                  className="order-2"
                  enabledGroupIds={app.searchEnabledGroupIds}
                  enabledSetIds={app.visibleSetIds}
                  isOpen={isSearchOpen}
                  modifierLabel={shortcutModifierLabel}
                  onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                      setIsKeyboardHelpOpen(false);
                    }
                    setIsSearchOpen(nextOpen);
                  }}
                  onSelectResult={app.handleSearchResultSelect}
                />
              </>
            ) : null}
            {!shortcutUiEnabled ? (
              <TimelineSearch
                className="order-2"
                enabledGroupIds={app.searchEnabledGroupIds}
                enabledSetIds={app.visibleSetIds}
                isOpen={isSearchOpen}
                modifierLabel={shortcutModifierLabel}
                onOpenChange={(nextOpen) => {
                  if (nextOpen) {
                    setIsKeyboardHelpOpen(false);
                  }
                  setIsSearchOpen(nextOpen);
                }}
                onSelectResult={app.handleSearchResultSelect}
                variant="mobile"
              />
            ) : null}
            <TimelineSettings
              className="order-3"
              isCosmicCalendarMode={app.isCosmicCalendarMode}
              onToggleCosmicCalendarMode={() => {
                app.setIsCosmicCalendarMode((current) => !current);
              }}
            />
          </div>
        </>
      ) : null}
      <TimelineSidebarChrome
        activeView={activeView}
        expandedSetIds={app.expandedSetIds}
        isOpen={isSidebarOpen}
        layerShortcuts={app.layerShortcuts}
        mode={layout.shouldUseMobileDrawer ? "drawer" : "popup"}
        onOpenSetManager={app.handleOpenSetManager}
        onReorderSets={app.handleReorderSets}
        onToggleEntry={app.handleToggleEntry}
        onToggleSet={app.handleToggleSet}
        onToggleSetExpanded={app.handleToggleSetExpanded}
        setIsOpen={setIsSidebarOpen}
        showShortcuts={shortcutUiEnabled}
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
      <TimelineKeyboardHelp
        isOpen={isKeyboardHelpOpen && shortcutUiEnabled}
        layerShortcuts={app.layerShortcuts}
        modifierLabel={shortcutModifierLabel}
        onClose={closeKeyboardHelp}
      />
    </main>
  );
}

export default App;
