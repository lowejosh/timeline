import {
  TIMELINE_DECORATION_GROUPS,
  TIMELINE_DECORATION_GROUPS_BY_ID,
} from "./timelineRegistry";

export { TIMELINE_DECORATION_GROUPS, TIMELINE_DECORATION_GROUPS_BY_ID };

export function getDefaultEnabledTimelineGroupIds(): Set<string> {
  return new Set<string>(
    TIMELINE_DECORATION_GROUPS.filter(
      (group) => group.defaultEnabled !== false,
    ).map((group) => group.id),
  );
}
