// Thin barrel re-export. The actual content lives in focused modules.
// New consumers should import from those modules directly.
export {
  TIMELINE_DECORATION_CATEGORIES,
  TIMELINE_DECORATION_CATEGORY_IDS,
} from "./categories";
export {
  TIMELINE_DECORATION_GROUPS,
  TIMELINE_DECORATION_GROUPS_BY_ID,
  getDefaultEnabledTimelineGroupIds,
} from "./groups";
export {
  TIMELINE_DISPLAY,
  TIMELINE_MARKERS,
  TIMELINE_OVERLAYS,
} from "./content";
