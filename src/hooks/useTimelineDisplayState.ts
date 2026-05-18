import { useMemo } from "react";

import { resolveTimelineSidebarTree } from "@/lib/app/sidebarModel";
import {
  allocateTimelineLayerShortcuts,
  getChildLayerShortcutId,
  getSetLayerShortcutId,
} from "@/lib/app/timelineKeyboard";
import {
  findEraById,
  getAncestorChain,
  getEraDisplayChain,
  getRootDisplayErasBySets,
  isEraFamilyRoot,
  type TimelineSetId,
} from "@/lib/catalog/eras";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";
import {
  computeGroupYearRanges,
  computeSetYearRanges,
  type TimelineYearRange,
} from "@/lib/catalog/timelineSetMetrics";
import {
  applyTimelineSetOrderToEraTree,
  applyTimelineSetOrderToMarkers,
  applyTimelineSetOrderToOverlays,
} from "@/lib/catalog/timelineSets";
import type { TimelineViewport } from "@/lib/core/viewport";
import { filterHiddenOverlayBands } from "@/lib/app/timelineVisibility";

export function useTimelineDisplayState({
  activeEraId,
  autoHiddenOverlayIds,
  baseEnabledGroupIds,
  canvasPad,
  catalog,
  enabledSetIds,
  innerWidth,
  orderedSetIds,
  sidebarSuppressedGroupIds,
  viewport,
  visibleSetIds,
  visibleSetMarkers,
  visibleSetOverlays,
}: {
  activeEraId: string;
  baseEnabledGroupIds: ReadonlySet<string>;
  canvasPad: number;
  catalog: TimelineCatalogSnapshot;
  enabledSetIds: ReadonlySet<TimelineSetId>;
  innerWidth: number;
  orderedSetIds: readonly TimelineSetId[];
  sidebarSuppressedGroupIds: ReadonlySet<string>;
  viewport: TimelineViewport;
  autoHiddenOverlayIds: ReadonlySet<string>;
  visibleSetIds: ReadonlySet<TimelineSetId>;
  visibleSetOverlays: ReturnType<typeof applyTimelineSetOrderToOverlays>;
  visibleSetMarkers: ReturnType<typeof applyTimelineSetOrderToMarkers>;
}) {
  const prioritizedRootEra = useMemo(
    () => applyTimelineSetOrderToEraTree(catalog.rootEra, orderedSetIds, catalog),
    [catalog, orderedSetIds],
  );

  const rootDisplayEras = useMemo(
    () => getRootDisplayErasBySets(prioritizedRootEra, visibleSetIds, catalog),
    [catalog, prioritizedRootEra, visibleSetIds],
  );

  const setFilteredMarkers = useMemo(
    () => applyTimelineSetOrderToMarkers(visibleSetMarkers, orderedSetIds, catalog),
    [catalog, orderedSetIds, visibleSetMarkers],
  );

  const setFilteredOverlays = useMemo(
    () => applyTimelineSetOrderToOverlays(visibleSetOverlays, orderedSetIds, catalog),
    [catalog, orderedSetIds, visibleSetOverlays],
  );

  const visibleFilteredOverlays = useMemo(
    () => filterHiddenOverlayBands(setFilteredOverlays, autoHiddenOverlayIds),
    [autoHiddenOverlayIds, setFilteredOverlays],
  );

  const setFilteredDisplay = useMemo(
    () => ({
      markers: setFilteredMarkers,
      overlays: visibleFilteredOverlays,
    }),
    [setFilteredMarkers, visibleFilteredOverlays],
  );

  const activeEra =
    findEraById(prioritizedRootEra, activeEraId) ?? prioritizedRootEra;
  const rawChain = getAncestorChain(prioritizedRootEra, activeEraId);
  const chain = getEraDisplayChain(prioritizedRootEra, activeEraId);
  const rawParentEra =
    rawChain.length > 1 ? rawChain[rawChain.length - 2] : null;
  const parentEra =
    rawParentEra &&
    rawParentEra.id !== prioritizedRootEra.id &&
    !isEraFamilyRoot(rawParentEra)
      ? rawParentEra
      : null;
  const isTopLevelDisplayEra =
    rawParentEra?.id === prioritizedRootEra.id ||
    (rawParentEra !== null && isEraFamilyRoot(rawParentEra));
  const siblingEras =
    activeEra.id === prioritizedRootEra.id || isTopLevelDisplayEra
      ? rootDisplayEras
      : rawParentEra
        ? (rawParentEra.children ?? [])
        : (activeEra.children ?? []);

  const sidebarTree = useMemo(
    () =>
      resolveTimelineSidebarTree(
        setFilteredDisplay,
        viewport,
        innerWidth,
        canvasPad,
        enabledSetIds,
        visibleSetIds,
        baseEnabledGroupIds,
        sidebarSuppressedGroupIds,
        orderedSetIds,
        catalog,
      ),
    [
      baseEnabledGroupIds,
      canvasPad,
      enabledSetIds,
      innerWidth,
      orderedSetIds,
      catalog,
      setFilteredDisplay,
      sidebarSuppressedGroupIds,
      viewport,
      visibleSetIds,
    ],
  );

  const layerShortcuts = useMemo(
    () => allocateTimelineLayerShortcuts(sidebarTree),
    [sidebarTree],
  );

  const layerRangeByShortcutId = useMemo(() => {
    const setRanges = computeSetYearRanges(
      sidebarTree.map((set) => set.id),
      catalog,
    );
    const childGroupIds = sidebarTree.flatMap((set) =>
      set.children.flatMap((child) => child.groupIds),
    );
    const groupRanges = computeGroupYearRanges(childGroupIds, catalog);
    const ranges = new Map<string, TimelineYearRange>();

    for (const [setId, range] of setRanges) {
      ranges.set(getSetLayerShortcutId(setId), range);
    }

    for (const set of sidebarTree) {
      for (const child of set.children) {
        let childRange: TimelineYearRange | null = null;

        for (const groupId of child.groupIds) {
          const groupRange = groupRanges.get(groupId);

          if (!groupRange) {
            continue;
          }

          childRange = childRange
            ? {
                startYear: Math.min(childRange.startYear, groupRange.startYear),
                endYear: Math.max(childRange.endYear, groupRange.endYear),
              }
            : groupRange;
        }

        if (childRange) {
          ranges.set(getChildLayerShortcutId(child), childRange);
        }
      }
    }

    return ranges;
  }, [catalog, sidebarTree]);

  return {
    activeEra,
    chain,
    layerRangeByShortcutId,
    layerShortcuts,
    parentEra,
    prioritizedRootEra,
    rootDisplayEras,
    setFilteredMarkers,
    siblingEras,
    sidebarTree,
    visibleFilteredOverlays,
  };
}
