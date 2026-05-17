import { lazy, Suspense, useEffect, useMemo } from "react";

import * as rx from "./App.selectors";
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
  const activeView = rx.useActiveView();
  const isSidebarOpen = rx.useIsSidebarOpen();
  const isKeyboardHelpOpen = rx.useIsKeyboardHelpOpen();
  const isSearchOpen = rx.useIsSearchOpen();
  const isSettingsOpen = rx.useIsSettingsOpen();
  const isCosmicCalendarMode = rx.useIsCosmicCalendarMode();
  const isMapPreviewEnabled = rx.useIsMapPreviewEnabled();
  const searchScope = rx.useTimelineSearchScope();
  const actions = rx.useAppActions();
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

  useStandaloneViewportHeight();

  useEffect(() => {
    if (shortcutUiEnabled) {
      return;
    }

    actions.setIsKeyboardHelpOpen(false);
  }, [actions, shortcutUiEnabled]);

  useEffect(() => {
    if (activeView === "timeline") {
      return;
    }

    actions.setIsSearchOpen(false);
  }, [actions, activeView]);

  useTimelineKeyboardShortcuts({
    enabled: shortcutUiEnabled,
    isHelpOpen: isKeyboardHelpOpen,
    isSidebarOpen,
    onCloseHelp: actions.closeKeyboardHelp,
    onFullTimelineRange: app.handleFullTimelineRange,
    onHelpOpenChange: actions.setIsKeyboardHelpOpen,
    onHomeRange: app.handleHomeRange,
    onLayerShortcut: app.handleLayerShortcut,
    onNavigationEnd: app.handleKeyboardNavigationEnd,
    onNavigationFrame: app.handleKeyboardNavigationFrame,
    onSearchToggle: actions.toggleSearch,
    onSettingsOpenChange: actions.setIsSettingsOpen,
    onSidebarOpenChange: actions.setIsSidebarOpen,
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
                  onClick={actions.toggleKeyboardHelp}
                />
                <TimelineSearch
                  className="order-2"
                  enabledGroupIds={searchScope.enabledGroupIds}
                  enabledSetIds={searchScope.enabledSetIds}
                  isOpen={isSearchOpen}
                  modifierLabel={shortcutModifierLabel}
                  onOpenChange={(nextOpen) => {
                    if (nextOpen) {
                      actions.setIsKeyboardHelpOpen(false);
                    }
                    actions.setIsSearchOpen(nextOpen);
                  }}
                  onSelectResult={app.handleSearchResultSelect}
                />
              </>
            ) : null}
            {!shortcutUiEnabled ? (
              <TimelineSearch
                className="order-2"
                enabledGroupIds={searchScope.enabledGroupIds}
                enabledSetIds={searchScope.enabledSetIds}
                isOpen={isSearchOpen}
                modifierLabel={shortcutModifierLabel}
                onOpenChange={(nextOpen) => {
                  if (nextOpen) {
                    actions.setIsKeyboardHelpOpen(false);
                  }
                  actions.setIsSearchOpen(nextOpen);
                }}
                onSelectResult={app.handleSearchResultSelect}
                showShortcutHint={false}
                variant={shouldUseMobileSearchDialog ? "mobile" : "desktop"}
              />
            ) : null}
            <TimelineSettings
              className="order-3"
              isCosmicCalendarMode={isCosmicCalendarMode}
              isMapPreviewEnabled={isMapPreviewEnabled}
              isOpen={isSettingsOpen}
              onOpenChange={actions.setIsSettingsOpen}
              onToggleMapPreview={() => {
                actions.setIsMapPreviewEnabled((current) => !current);
              }}
              onToggleCosmicCalendarMode={() => {
                actions.setIsCosmicCalendarMode((current) => !current);
              }}
            />
          </div>
        </>
      ) : null}
      <TimelineSidebarChrome
        layerShortcuts={app.layerShortcuts}
        mode={layout.shouldUseMobileDrawer ? "drawer" : "popup"}
        onToggleSet={app.handleToggleSet}
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
            <AvailableSetsView />
          </Suspense>
        </div>
      </section>
      <TimelineKeyboardHelp
        isOpen={isKeyboardHelpOpen && shortcutUiEnabled}
        layerShortcuts={app.layerShortcuts}
        modifierLabel={shortcutModifierLabel}
        onClose={actions.closeKeyboardHelp}
      />
      <PwaInstallPrompt />
    </main>
  );
}

export default App;
