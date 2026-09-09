import type { ResolvedTimelineOverlayBand } from "./overlayTracks";

/** Keep guide subjects together without changing dates or removing context. */
export function arrangeGuidedTracks(tracks: ResolvedTimelineOverlayBand[], subjectIds?: readonly string[]) {
  if (!subjectIds?.length || !tracks.length) return tracks;
  const contextLanes = [...new Set(tracks.filter(track => !subjectIds.includes(track.band.id)).map(track => track.laneIndex))].sort((a, b) => a - b);
  const laneCount = contextLanes.length + subjectIds.length;
  return tracks.map(track => {
    const subject = subjectIds.indexOf(track.band.id);
    return { ...track, laneCount, laneIndex: subject >= 0 ? subject : subjectIds.length + contextLanes.indexOf(track.laneIndex) };
  });
}
