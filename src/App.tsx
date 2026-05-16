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
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const layout = getTimelineAppLayoutState({
    height: app.stageSize.height,
    isOverviewVisible: app.isOverviewVisible,
    width: app.stageSize.width,
  });
  const shortcutUiEnabled =
    activeView === "timeline" && !layout.shouldUseMobileDrawer;
  const shouldUseMobileSearchDialog = layout.shouldUsePortraitMobileLayout;
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
  }, [shortcutUiEnabled]);

  useEffect(() => {
    if (activeView === "timeline") {
      return;
    }

    setIsSearchOpen(false);
  }, [activeView]);

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
    onSettingsOpenChange: setIsSettingsOpen,
    onSidebarOpenChange: setIsSidebarOpen,
  });

  return (
    <main
      className="app-shell fixed inset-0 flex w-full items-stretch overflow-hidden overscroll-none bg-background text-foreground"
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
                showShortcutHint={false}
                variant={shouldUseMobileSearchDialog ? "mobile" : "desktop"}
              />
            ) : null}
            <TimelineSettings
              className="order-3"
              isCosmicCalendarMode={app.isCosmicCalendarMode}
              isMapPreviewEnabled={app.isMapPreviewEnabled}
              isOpen={isSettingsOpen}
              onOpenChange={setIsSettingsOpen}
              onToggleMapPreview={() => {
                app.setIsMapPreviewEnabled((current) => !current);
              }}
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
      <PwaInstallPrompt />
    </main>
  );
}

export default App;
