import type { ResolvedTimelineOverlayBand } from "../overlayTracks";

export type AnimatedOverlayBandState = {
  overlay: ResolvedTimelineOverlayBand;
  currentOpacity: number;
  targetOpacity: number;
  currentY: number;
  targetY: number;
};

export function isOverlayBandStateAnimating(state: AnimatedOverlayBandState) {
  return (
    Math.abs(state.targetOpacity - state.currentOpacity) > 0.002 ||
    Math.abs(state.targetY - state.currentY) > 0.2
  );
}
