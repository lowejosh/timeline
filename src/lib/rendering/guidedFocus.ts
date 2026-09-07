/** Optional presentation state. Catalog geometry and normal explorer state stay intact. */
export type GuidedTimelineFocus = {
  subjectIds: readonly string[];
  contextIds?: readonly string[];
  revealYear: number;
  currentYear?: number;
  bandId?: string;
  stopKey?: string;
};

export function getGuidedBandEmphasis(focus: GuidedTimelineFocus | undefined, id: string, start: number, end: number, parentId?: string) {
  if (!focus) return { muted: false, highlightedEnd: end };
  const subject = focus.subjectIds.includes(id) || (!!parentId && focus.subjectIds.includes(parentId));
  return { muted: true, highlightedEnd: subject ? Math.max(start, Math.min(end, focus.revealYear)) : start };
}

export function getGuidedLabelAlpha(focus: GuidedTimelineFocus | undefined, id: string, parentId?: string) {
  if (!focus || focus.subjectIds.includes(parentId ?? id)) return 1;
  return focus.contextIds?.includes(parentId ?? id) ? 0.7 : 0.42;
}
