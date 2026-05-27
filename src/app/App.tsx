import { Suspense, useEffect, useMemo } from "react";
import { Outlet } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import * as rx from "./App.selectors";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useStandaloneViewportHeight } from "@/hooks/useStandaloneViewportHeight";
import { useTimelineAppState } from "@/hooks/useTimelineAppState";
import { useTimelineCatalog } from "@/hooks/useTimelineCatalog";
import { useTimelineKeyboardShortcuts } from "@/hooks/useTimelineKeyboardShortcuts";
import { getTimelineAppLayoutState } from "@/lib/app/layout";
import {
  TimelineKeyboardHelp,
  TimelineKeyboardHelpButton,
  TimelineSearch,
  TimelineSettings,
  TimelineSidebarChrome,
} from "@/features/timeline-viewer/components";
import { TimelineView } from "@/pages/TimelineView/TimelineView";
import { getPrimaryShortcutModifierLabel } from "@/lib/app/timelineKeyboard";
import { PwaInstallPrompt } from "@/components/misc";

function App() {
  const catalog = useTimelineCatalog();
  const app = useTimelineAppState(catalog);
  const activeView = rx.useActiveView();
  const isSidebarOpen = rx.useIsSidebarOpen();
  const isKeyboardHelpOpen = rx.useIsKeyboardHelpOpen();
  const isSearchOpen = rx.useIsSearchOpen();
  const isSettingsOpen = rx.useIsSettingsOpen();
  const isCosmicCalendarMode = rx.useIsCosmicCalendarMode();
  const isMapPreviewEnabled = rx.useIsMapPreviewEnabled();
  const searchScope = rx.useTimelineSearchScope(catalog);
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
    onMapPreviewToggle: () => {
      actions.setIsMapPreviewEnabled((current) => !current);
    },
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
                  catalog={catalog}
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
                catalog={catalog}
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
              isOpen={isSettingsOpen}
              onOpenChange={actions.setIsSettingsOpen}
              onToggleCosmicCalendarMode={() => {
                actions.setIsCosmicCalendarMode((current) => !current);
              }}
            />
            <Tooltip className="order-4" content="Create set" placement="bottom">
              <Button
                aria-label="Create set"
                className="rounded-full text-primary"
                onClick={actions.openCreateSet}
                size="icon"
                type="button"
                variant="glass"
              >
                <Plus className="size-4 shrink-0" />
              </Button>
            </Tooltip>
          </div>
        </>
      ) : null}
      <TimelineSidebarChrome
        isMapPreviewEnabled={isMapPreviewEnabled}
        layerShortcuts={app.layerShortcuts}
        mode={layout.shouldUseMobileDrawer ? "drawer" : "popup"}
        onToggleMapPreview={() => {
          actions.setIsMapPreviewEnabled((current) => !current);
        }}
        onToggleSet={app.handleToggleSet}
        catalog={catalog}
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
            <Outlet />
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
