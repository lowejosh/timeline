import {
  TIMELINE_DECORATION_GROUPS,
  TIMELINE_DECORATION_GROUPS_BY_ID,
} from "./timelineRegistry";
import {
  STATIC_TIMELINE_CATALOG,
  type TimelineCatalogSnapshot,
} from "./timelineCatalog";

export { TIMELINE_DECORATION_GROUPS, TIMELINE_DECORATION_GROUPS_BY_ID };

export function getDefaultEnabledTimelineGroupIds(
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
): Set<string> {
  return new Set<string>(catalog.defaultEnabledGroupIds);
}
