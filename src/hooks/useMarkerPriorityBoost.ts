import { useEffect, useRef } from "react";
import { MARKER_PRIORITY_BOOST_SMOOTHING_MS } from "../lib/rendering/canvas/constants";
import type { MarkerPriorityBoostState } from "../lib/rendering/animation/markerPriorityBoost";

export function useMarkerPriorityBoost(
  highlightedMarkerId: string | null,
  invalidateCanvas: (reason?: string) => void,
): React.RefObject<Map<string, MarkerPriorityBoostState>> {
  const boostRef = useRef<Map<string, MarkerPriorityBoostState>>(new Map());
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const boostStates = boostRef.current;

    for (const [markerId, state] of [...boostStates.entries()]) {
      boostStates.set(markerId, {
        ...state,
        target: markerId === highlightedMarkerId ? 1 : 0,
      });
    }

    if (highlightedMarkerId && !boostStates.has(highlightedMarkerId)) {
      boostStates.set(highlightedMarkerId, {
        current: 0,
        target: 1,
      });
    }

    const stepAnimation = (now: number) => {
      const lastTime = lastTimeRef.current || now;
      const dt = Math.max(now - lastTime, 0);
      lastTimeRef.current = now;
      const factor = 1 - Math.exp(-dt / MARKER_PRIORITY_BOOST_SMOOTHING_MS);
      let hasActiveAnimation = false;

      for (const [markerId, state] of [...boostStates.entries()]) {
        let nextCurrent =
          state.current + (state.target - state.current) * factor;

        if (Math.abs(state.target - nextCurrent) > 0.002) {
          hasActiveAnimation = true;
        } else {
          nextCurrent = state.target;
        }

        if (state.target <= 0.001 && nextCurrent <= 0.003) {
          boostStates.delete(markerId);
        } else {
          boostStates.set(markerId, {
            ...state,
            current: nextCurrent,
          });
        }
      }

      invalidateCanvas("marker-boost-animation");

      if (hasActiveAnimation) {
        frameRef.current = requestAnimationFrame(stepAnimation);
      } else {
        frameRef.current = 0;
      }
    };

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [highlightedMarkerId, invalidateCanvas]);

  return boostRef;
}
