import { useEffect, useRef } from "react";
import type { ResolvedTimelineOverlayBand } from "@/lib/rendering/overlayTracks";
import {
  getOverlayLaneY,
  getTimelineLayout,
} from "@/lib/rendering/canvas/overlayLayout";
import {
  OVERLAY_BAND_FADE_IN_SMOOTHING_MS,
  OVERLAY_BAND_FADE_OUT_SMOOTHING_MS,
  OVERLAY_BAND_POSITION_SMOOTHING_MS,
  OVERLAY_BAND_REFLOW_START_OPACITY,
} from "@/lib/rendering/canvas/constants";
import {
  type AnimatedOverlayBandState,
  isOverlayBandStateAnimating,
} from "@/lib/rendering/animation/overlayBand";

function advanceOverlayBandAnimation(
  animationStates: Map<string, AnimatedOverlayBandState>,
  dt: number,
) {
  const positionFactor =
    1 - Math.exp(-dt / OVERLAY_BAND_POSITION_SMOOTHING_MS);
  const hasVisibleExitingOverlays = [...animationStates.values()].some(
    (state) =>
      state.targetOpacity < state.currentOpacity - 0.001 &&
      state.currentOpacity > OVERLAY_BAND_REFLOW_START_OPACITY,
  );
  let hasActiveAnimation = false;
  let didChange = false;

  for (const [overlayId, state] of [...animationStates.entries()]) {
    const fadeSmoothingMs =
      state.targetOpacity < state.currentOpacity
        ? OVERLAY_BAND_FADE_OUT_SMOOTHING_MS
        : OVERLAY_BAND_FADE_IN_SMOOTHING_MS;
    const opacityFactor = 1 - Math.exp(-dt / fadeSmoothingMs);
    const nextOpacity =
      state.currentOpacity +
      (state.targetOpacity - state.currentOpacity) * opacityFactor;
    const nextY = hasVisibleExitingOverlays
      ? state.currentY
      : state.currentY + (state.targetY - state.currentY) * positionFactor;
    const settled = Math.abs(state.targetOpacity - nextOpacity) < 0.002;
    const settledY = hasVisibleExitingOverlays
      ? Math.abs(state.targetY - state.currentY) < 0.2
      : Math.abs(state.targetY - nextY) < 0.2;

    if (!settled || !settledY) hasActiveAnimation = true;
    if (Math.abs(nextOpacity - state.currentOpacity) > 0.0005)
      didChange = true;
    if (Math.abs(nextY - state.currentY) > 0.05) didChange = true;

    if (state.targetOpacity <= 0.001 && nextOpacity <= 0.003) {
      animationStates.delete(overlayId);
      continue;
    }

    animationStates.set(overlayId, {
      ...state,
      currentOpacity: settled ? state.targetOpacity : nextOpacity,
      currentY: settledY ? state.targetY : nextY,
    });
  }

  return { didChange, hasActiveAnimation };
}

export function useOverlayBandAnimation(
  resolvedOverlayBands: ResolvedTimelineOverlayBand[],
  overlayLaneCount: number,
  height: number,
  overlayScrollOffset: number,
  reserveAxisDateRow: boolean,
  overviewReservedHeight: number,
  overlayVisibilityTransitionKey: string,
  invalidateCanvas: (reason?: string) => void,
): React.RefObject<Map<string, AnimatedOverlayBandState>> {
  const animationRef = useRef<Map<string, AnimatedOverlayBandState>>(new Map());
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const initializedRef = useRef(false);
  const previousTransitionKeyRef = useRef(overlayVisibilityTransitionKey);

  useEffect(() => {
    const animationStates = animationRef.current;
    const activeIds = new Set<string>();
    const now = performance.now();
    const lastTime = lastTimeRef.current || now;
    const dt = Math.max(now - lastTime, 0);
    const baseLayout = getTimelineLayout(
      height,
      overlayLaneCount,
      overlayScrollOffset,
      { reserveAxisDateRow, overviewReservedHeight },
    );
    const shouldAnimateVisibilityChange =
      initializedRef.current &&
      overlayVisibilityTransitionKey !== previousTransitionKeyRef.current;
    const hasInFlightAnimation = [...animationStates.values()].some(
      isOverlayBandStateAnimating,
    );
    const shouldPreserveAnimatedState =
      shouldAnimateVisibilityChange || hasInFlightAnimation;

    if (hasInFlightAnimation && dt > 0) {
      const { didChange } = advanceOverlayBandAnimation(animationStates, dt);

      if (didChange) invalidateCanvas("overlay-band-animation-sync");
    }

    lastTimeRef.current = now;
    previousTransitionKeyRef.current = overlayVisibilityTransitionKey;

    const targetYById = new Map(
      resolvedOverlayBands.map((overlay) => [
        overlay.band.id,
        getOverlayLaneY(baseLayout, overlay.laneIndex),
      ]),
    );

    for (const overlay of resolvedOverlayBands) {
      activeIds.add(overlay.band.id);
      const targetY = targetYById.get(overlay.band.id) ?? 0;
      const existing = animationStates.get(overlay.band.id);

      if (existing) {
        animationStates.set(overlay.band.id, {
          ...existing,
          overlay,
          currentOpacity: shouldPreserveAnimatedState
            ? existing.currentOpacity
            : 1,
          targetOpacity: 1,
          currentY: shouldPreserveAnimatedState ? existing.currentY : targetY,
          targetY,
        });
        continue;
      }

      animationStates.set(overlay.band.id, {
        overlay,
        currentOpacity:
          shouldAnimateVisibilityChange && initializedRef.current ? 0 : 1,
        targetOpacity: 1,
        currentY: targetY,
        targetY,
      });
    }

    for (const [overlayId, state] of [...animationStates.entries()]) {
      if (!activeIds.has(overlayId)) {
        const shouldKeepAnimatingExit =
          state.targetOpacity < 0.999 || isOverlayBandStateAnimating(state);

        if (!shouldAnimateVisibilityChange && !shouldKeepAnimatingExit) {
          animationStates.delete(overlayId);
          continue;
        }

        animationStates.set(overlayId, { ...state, targetOpacity: 0 });
      }
    }

    initializedRef.current = true;

    if (!shouldPreserveAnimatedState) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      invalidateCanvas("overlay-band-static-sync");

      return () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
      };
    }

    const hasPendingAnimation = [...animationStates.values()].some(
      isOverlayBandStateAnimating,
    );

    if (!hasPendingAnimation) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      invalidateCanvas("overlay-band-animation");

      return () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = 0;
        }
      };
    }

    const stepAnimation = (now: number) => {
      const lastTime = lastTimeRef.current || now;
      const dt = Math.max(now - lastTime, 0);
      lastTimeRef.current = now;
      const { didChange, hasActiveAnimation } = advanceOverlayBandAnimation(
        animationStates,
        dt,
      );

      if (didChange) invalidateCanvas("overlay-band-animation");

      if (hasActiveAnimation) {
        frameRef.current = requestAnimationFrame(stepAnimation);
      } else {
        frameRef.current = 0;
      }
    };

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [
    height,
    invalidateCanvas,
    overlayLaneCount,
    overlayScrollOffset,
    reserveAxisDateRow,
    overviewReservedHeight,
    overlayVisibilityTransitionKey,
    resolvedOverlayBands,
  ]);

  return animationRef;
}
