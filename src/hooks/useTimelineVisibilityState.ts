import { useCallback, useEffect, useMemo } from "react";

import { getDefaultEnabledTimelineGroupIds } from "@/lib/catalog/decorations";
import { type TimelineSetId } from "@/lib/catalog/eras";
import {
  filterMarkersBySets,
  filterOverlaysBySets,
} from "@/lib/catalog/timelineSets";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressTimelineLayer,
} from "@/lib/catalog/layerAutoToggle";
import { getVisibleRange, type TimelineViewport } from "@/lib/core/viewport";
import {
  getVisibleTimelineGroupIds,
  getVisibleTimelineOverlayGroupIdsWithViewportEdges,
} from "@/lib/app/timelineVisibility";
import { getAutoHiddenOverlayIds } from "@/lib/rendering/overlayRedundancy";
import { HUMAN_EVOLUTION_GROUP_ID } from "@/stores/timelineLayer.store";

export function useTimelineVisibilityState({
  autoSuppressedGroupIds,
  canvasPad,
  catalog,
  humanEvolutionToggleMode,
  innerWidth,
  overlayVisibilityTransitionSeed,
  setAutoSuppressedGroupIds,
  viewport,
  viewportWidth,
  visibleSetIds,
  manualEnabledGroupIds,
}: {
  autoSuppressedGroupIds: ReadonlySet<string>;
  canvasPad: number;
  catalog: TimelineCatalogSnapshot;
  humanEvolutionToggleMode: "auto" | "manual-on" | "manual-off";
  innerWidth: number;
  overlayVisibilityTransitionSeed: number;
  setAutoSuppressedGroupIds: (groupIds: ReadonlySet<string>) => void;
  viewport: TimelineViewport;
  viewportWidth: number;
  visibleSetIds: ReadonlySet<TimelineSetId>;
  manualEnabledGroupIds: ReadonlySet<string>;
}) {
  const defaultEnabledGroupIds = useMemo(
    () => getDefaultEnabledTimelineGroupIds(catalog),
    [catalog],
  );
  const autoToggleRulesByGroupId = useMemo(
    () =>
      new Map(
        catalog.groups.flatMap((group) =>
          group.autoToggleRule
            ? [[group.id, group.autoToggleRule] as const]
            : [],
        ),
      ),
    [catalog],
  );

  const baseEnabledGroupIds = useMemo(() => {
    const next = new Set(manualEnabledGroupIds);

    if (humanEvolutionToggleMode === "manual-on") {
      next.add(HUMAN_EVOLUTION_GROUP_ID);
    } else if (humanEvolutionToggleMode === "manual-off") {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    } else if (defaultEnabledGroupIds.has(HUMAN_EVOLUTION_GROUP_ID)) {
      next.add(HUMAN_EVOLUTION_GROUP_ID);
    } else {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    }

    return next;
  }, [defaultEnabledGroupIds, humanEvolutionToggleMode, manualEnabledGroupIds]);

  const visibleSetMarkers = useMemo(
    () => filterMarkersBySets(catalog.display.markers, visibleSetIds),
    [catalog, visibleSetIds],
  );
  const visibleSetOverlays = useMemo(
    () => filterOverlaysBySets(catalog.display.overlays, visibleSetIds),
    [catalog, visibleSetIds],
  );

  const autoToggleVisibleGroupIds = useMemo(
    () =>
      getVisibleTimelineGroupIds(
        visibleSetMarkers,
        visibleSetOverlays,
        viewport,
        innerWidth,
        canvasPad,
        baseEnabledGroupIds,
      ),
    [
      baseEnabledGroupIds,
      canvasPad,
      innerWidth,
      viewport,
      visibleSetMarkers,
      visibleSetOverlays,
    ],
  );

  const autoToggleVisibleOverlayGroupIds = useMemo(
    () =>
      getVisibleTimelineOverlayGroupIdsWithViewportEdges(
        visibleSetOverlays,
        viewport,
        innerWidth,
        canvasPad,
        baseEnabledGroupIds,
      ),
    [
      baseEnabledGroupIds,
      canvasPad,
      innerWidth,
      viewport,
      visibleSetOverlays,
    ],
  );

  const autoToggleVisibleSetSpanPriorities = useMemo(() => {
    if (innerWidth <= canvasPad * 2) {
      return new Map<string, number>();
    }

    const [visibleStart, visibleEnd] = getVisibleRange(viewport, viewportWidth);
    const visibleSetSpanPriorities = new Map<string, number>();

    for (const [setId, span] of catalog.setSpanPriorityById) {
      if (
        visibleSetIds.has(setId) &&
        span.startYear <= visibleEnd &&
        span.endYear >= visibleStart
      ) {
        visibleSetSpanPriorities.set(setId, span.priority);
      }
    }

    return visibleSetSpanPriorities;
  }, [canvasPad, catalog, innerWidth, viewport, viewportWidth, visibleSetIds]);

  const hasHigherPrioritySetSpanVisible = useCallback(
    (ownerSetId: TimelineSetId | null | undefined, ownerPriority?: number) => {
      if (!ownerSetId) {
        return false;
      }

      const comparisonPriority =
        ownerPriority ??
        catalog.setSpanPriorityById.get(ownerSetId)?.priority;

      if (comparisonPriority === undefined) {
        return false;
      }

      for (const [setId, priority] of autoToggleVisibleSetSpanPriorities) {
        if (setId !== ownerSetId && priority > comparisonPriority) {
          return true;
        }
      }

      return false;
    },
    [autoToggleVisibleSetSpanPriorities, catalog],
  );

  const autoHiddenOverlayIds = useMemo(
    () =>
      getAutoHiddenOverlayIds(
        visibleSetOverlays,
        viewport,
        innerWidth,
        canvasPad,
        visibleSetIds,
        baseEnabledGroupIds,
        autoToggleVisibleGroupIds,
        autoToggleVisibleOverlayGroupIds,
        hasHigherPrioritySetSpanVisible,
      ),
    [
      autoToggleVisibleGroupIds,
      autoToggleVisibleOverlayGroupIds,
      baseEnabledGroupIds,
      canvasPad,
      hasHigherPrioritySetSpanVisible,
      innerWidth,
      viewport,
      visibleSetIds,
      visibleSetOverlays,
    ],
  );

  const autoHiddenOverlaySignature = useMemo(
    () => Array.from(autoHiddenOverlayIds).sort().join("|"),
    [autoHiddenOverlayIds],
  );
  const autoSuppressedGroupSignature = useMemo(
    () => Array.from(autoSuppressedGroupIds).sort().join("|"),
    [autoSuppressedGroupIds],
  );
  const overlayVisibilityTransitionKey = useMemo(
    () =>
      `${overlayVisibilityTransitionSeed}:${autoSuppressedGroupSignature}:${autoHiddenOverlaySignature}`,
    [
      autoHiddenOverlaySignature,
      autoSuppressedGroupSignature,
      overlayVisibilityTransitionSeed,
    ],
  );

  useEffect(() => {
    const nextAutoSuppressedGroupIds = new Set(autoSuppressedGroupIds);
    let hasSuppressionChanges = false;

    for (const [groupId, rule] of autoToggleRulesByGroupId) {
      const currentlySuppressed = autoSuppressedGroupIds.has(groupId);
      const isAutoToggleEnabled = isTimelineLayerAutoToggleEnabled(
        rule,
        visibleSetIds,
        baseEnabledGroupIds,
        autoToggleVisibleGroupIds,
        groupId,
        autoToggleVisibleOverlayGroupIds,
        hasHigherPrioritySetSpanVisible(
          catalog.setIdByGroupId.get(groupId),
        ),
      );
      const nextSuppressed = isAutoToggleEnabled
        ? shouldAutoSuppressTimelineLayer(
            rule,
            viewport,
            innerWidth,
            canvasPad,
            currentlySuppressed,
          )
        : false;

      if (nextSuppressed === currentlySuppressed) {
        continue;
      }

      hasSuppressionChanges = true;

      if (nextSuppressed) {
        nextAutoSuppressedGroupIds.add(groupId);
      } else {
        nextAutoSuppressedGroupIds.delete(groupId);
      }
    }

    if (!hasSuppressionChanges) {
      return;
    }

    setAutoSuppressedGroupIds(nextAutoSuppressedGroupIds);
  }, [
    autoSuppressedGroupIds,
    autoToggleRulesByGroupId,
    autoToggleVisibleGroupIds,
    autoToggleVisibleOverlayGroupIds,
    baseEnabledGroupIds,
    canvasPad,
    catalog.setIdByGroupId,
    hasHigherPrioritySetSpanVisible,
    innerWidth,
    setAutoSuppressedGroupIds,
    viewport,
    visibleSetIds,
  ]);

  const renderEnabledGroupIds = useMemo(() => {
    const next = new Set(baseEnabledGroupIds);

    for (const groupId of autoSuppressedGroupIds) {
      if (
        groupId === HUMAN_EVOLUTION_GROUP_ID &&
        humanEvolutionToggleMode !== "auto"
      ) {
        continue;
      }

      next.delete(groupId);
    }

    return next;
  }, [autoSuppressedGroupIds, baseEnabledGroupIds, humanEvolutionToggleMode]);

  const sidebarSuppressedGroupIds = useMemo(() => {
    const next = new Set(autoSuppressedGroupIds);

    if (humanEvolutionToggleMode !== "auto") {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    }

    return next;
  }, [autoSuppressedGroupIds, humanEvolutionToggleMode]);

  return {
    autoHiddenOverlayIds,
    baseEnabledGroupIds,
    overlayVisibilityTransitionKey,
    renderEnabledGroupIds,
    sidebarSuppressedGroupIds,
    visibleSetMarkers,
    visibleSetOverlays,
  };
}
