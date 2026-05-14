import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import { useStandaloneViewportHeight } from "./hooks/useStandaloneViewportHeight";
import { getTimelineAppLayoutState } from "./lib/app/layout";
import { TimelineSidebarChrome } from "./components/TimelineSidebar";
import { TimelineKeyboardHelp } from "./components/TimelineKeyboardHelp/TimelineKeyboardHelp";
import { useTimelineAppState } from "./hooks/useTimelineAppState";
import { TimelineSettings } from "./components/TimelineSettings";
import { TimelineView } from "./views/TimelineView";
import {
  getPrimaryShortcutModifierLabel,
  isPrimaryShortcutModifier,
} from "./lib/app/timelineKeyboard";

const AvailableSetsView = lazy(() =>
  import("./views/AvailableSetsView").then((module) => ({
    default: module.AvailableSetsView,
  })),
);

function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

function App() {
  const app = useTimelineAppState();
  const { activeView, isSidebarOpen, setIsSidebarOpen } = app;
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
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

  useStandaloneViewportHeight();

  useEffect(() => {
    if (shortcutUiEnabled) {
      return;
    }

    setIsKeyboardHelpOpen(false);
  }, [shortcutUiEnabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !shortcutUiEnabled) {
        return;
      }

      const key = event.key;
      const normalizedKey = key.toLowerCase();
      const primaryModified = isPrimaryShortcutModifier(event);

      if (primaryModified && normalizedKey === "/") {
        event.preventDefault();
        setIsKeyboardHelpOpen((current) => !current);
        return;
      }

      if (isKeyboardHelpOpen) {
        if (key === "Escape") {
          event.preventDefault();
          setIsKeyboardHelpOpen(false);
        }

        return;
      }

      if (isEditableShortcutTarget(event.target)) {
        return;
      }

      if (primaryModified && normalizedKey === "k") {
        event.preventDefault();
        setIsKeyboardHelpOpen(true);
        return;
      }

      if (event.altKey || event.metaKey || event.ctrlKey) {
        return;
      }

      if (normalizedKey === "l") {
        event.preventDefault();
        setIsSidebarOpen((current) => !current);
        return;
      }

      if (key === "+" || key === "=" || key === "ArrowUp") {
        event.preventDefault();
        app.handleKeyboardZoom(1);
        return;
      }

      if (key === "-" || key === "_" || key === "ArrowDown") {
        event.preventDefault();
        app.handleKeyboardZoom(-1);
        return;
      }

      if (key === "ArrowLeft") {
        event.preventDefault();
        app.handleKeyboardPan(event.shiftKey ? 360 : 120);
        return;
      }

      if (key === "ArrowRight") {
        event.preventDefault();
        app.handleKeyboardPan(event.shiftKey ? -360 : -120);
        return;
      }

      if (key === "Home") {
        event.preventDefault();
        app.handleHomeRange();
        return;
      }

      if (key === "0") {
        event.preventDefault();
        app.handleFullTimelineRange();
        return;
      }

      if (key === "Escape" && isSidebarOpen) {
        event.preventDefault();
        setIsSidebarOpen(false);
        return;
      }

      if (app.handleLayerShortcut(normalizedKey)) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    app,
    isKeyboardHelpOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    shortcutUiEnabled,
  ]);

  return (
    <main
      className="fixed inset-0 flex h-[var(--app-standalone-viewport-height,100dvh)] min-h-[var(--app-standalone-viewport-height,100svh)] w-full items-stretch overflow-hidden overscroll-none bg-background pt-[env(safe-area-inset-top,0px)] text-foreground [--sidebar-max-height:min(calc(100svh-80px),540px)] [--sidebar-width:268px] max-[980px]:[--sidebar-width:252px] max-[720px]:[--sidebar-max-height:100%] max-[720px]:[--sidebar-width:min(320px,calc(100vw-28px))] data-[sidebar-mode=drawer]:[--sidebar-max-height:100%] data-[sidebar-mode=drawer]:[--sidebar-width:min(320px,calc(100vw-env(safe-area-inset-left,0px)-28px))]"
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
        onClose={() => {
          setIsKeyboardHelpOpen(false);
        }}
      />
    </main>
  );
}

export default App;
