import { useEffect, useRef } from "react";
import type { Era } from "../lib/domain/eras";
import type { TimelineViewport } from "../lib/core/viewport";
import {
  getEraChildOpacityTarget,
} from "../lib/rendering/childLayers";
import {
  syncAnimatedEraChildState,
  type AnimatedEraChildState,
} from "../lib/rendering/animation/eraChild";
import { smoothstep01 } from "../lib/core/easing";
import {
  ERA_CHILD_TRANSITION_DURATION_MS,
  PAD,
} from "../lib/rendering/canvas/constants";

export type { AnimatedEraChildState };

export function useEraChildAnimation(
  activeEraId: string,
  siblingEras: Era[],
  viewport: TimelineViewport,
  width: number,
  isAnimating: boolean,
  isViewportInteractionActive: boolean,
  invalidateCanvas: (reason?: string) => void,
): React.RefObject<Map<string, AnimatedEraChildState>> {
  const animationRef = useRef<Map<string, AnimatedEraChildState>>(new Map());
  const frameRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    const animationStates = animationRef.current;
    const activeIds = new Set<string>();
    const now = performance.now();

    const visit = (eras: Era[]) => {
      for (const era of eras) {
        if (era.children?.length) {
          activeIds.add(era.id);
          const nextTarget = getEraChildOpacityTarget(
            era,
            activeEraId,
            viewport,
            width,
            PAD,
            isAnimating,
            animationStates.get(era.id)?.target ?? 0,
          );
          const nextState = syncAnimatedEraChildState({
            existing: animationStates.get(era.id),
            nextTarget,
            now,
            duration: ERA_CHILD_TRANSITION_DURATION_MS,
            hasInitialized: initializedRef.current,
          });
          animationStates.set(era.id, nextState);

          if (nextState.target > 0 || nextState.current > 0.001) {
            visit(era.children);
          }
        }
      }
    };

    visit(siblingEras);

    for (const [eraId, state] of [...animationStates.entries()]) {
      if (!activeIds.has(eraId) && isViewportInteractionActive) {
        animationStates.delete(eraId);
      } else if (!activeIds.has(eraId) && state.target !== 0) {
        animationStates.set(eraId, {
          ...state,
          from: state.current,
          target: 0,
          startTime: now,
          duration: ERA_CHILD_TRANSITION_DURATION_MS,
        });
      }
    }

    initializedRef.current = true;

    const hasPendingAnimation = [...animationStates.values()].some(
      (state) => Math.abs(state.target - state.current) > 0.001,
    );

    if (!hasPendingAnimation) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
      return;
    }

    const stepAnimation = (frameTime: number) => {
      let hasActiveAnimation = false;
      let didChange = false;

      for (const [eraId, state] of [...animationStates.entries()]) {
        const delta = state.target - state.current;
        let nextState = state;

        if (Math.abs(delta) <= 0.001) {
          nextState = { ...state, current: state.target };
        } else {
          const rawT = Math.min(
            Math.max((frameTime - state.startTime) / state.duration, 0),
            1,
          );
          const t = smoothstep01(rawT);
          const nextCurrent = state.from + (state.target - state.from) * t;
          nextState = {
            ...state,
            current: rawT < 1 ? nextCurrent : state.target,
          };
          if (rawT < 1) hasActiveAnimation = true;
        }

        if (Math.abs(nextState.current - state.current) > 0.0005) {
          didChange = true;
        }

        if (
          !activeIds.has(eraId) &&
          nextState.target <= 0.001 &&
          nextState.current <= 0.001
        ) {
          animationStates.delete(eraId);
        } else {
          animationStates.set(eraId, nextState);
        }
      }

      if (didChange) invalidateCanvas("era-child-animation");

      if (hasActiveAnimation) {
        frameRef.current = requestAnimationFrame(stepAnimation);
      } else {
        frameRef.current = 0;
      }
    };

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [
    activeEraId,
    invalidateCanvas,
    isAnimating,
    isViewportInteractionActive,
    siblingEras,
    viewport,
    width,
  ]);

  return animationRef;
}
