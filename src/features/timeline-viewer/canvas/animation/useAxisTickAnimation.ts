import { useEffect, useRef } from "react";
import type { AxisTickRenderState } from "@/lib/rendering/axisTickStates";
import { makeAxisTickKey } from "@/lib/rendering/canvas/axisLabels";
import {
  AXIS_TICK_ANIMATION_SMOOTHING_MS,
  AXIS_TICK_LABEL_FADE_IN_SMOOTHING_MS,
  AXIS_TICK_LABEL_FADE_OUT_SMOOTHING_MS,
} from "@/lib/rendering/canvas/constants";
import type { AnimatedAxisTickState } from "@/lib/rendering/animation/axisTickState";

export function useAxisTickAnimation(
  axisTickTargets: AxisTickRenderState[],
  invalidateCanvas: (reason?: string) => void,
): React.RefObject<Map<string, AnimatedAxisTickState>> {
  const animationRef = useRef<Map<string, AnimatedAxisTickState>>(new Map());
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    const animationStates = animationRef.current;
    const activeKeys = new Set<string>();

    for (const target of axisTickTargets) {
      const key = makeAxisTickKey(target);
      activeKeys.add(key);
      const existing = animationStates.get(key);

      if (existing) {
        animationStates.set(key, {
          ...existing,
          year: target.year,
          wholeYear: target.wholeYear,
          yearFraction: target.yearFraction,
          step: target.step,
          hierarchyDepth: target.hierarchyDepth,
          pixelsPerStep: target.pixelsPerStep,
          growthProgress: target.growthProgress,
          labelStep: target.labelStep,
          generationIndex: target.generationIndex,
          generationProgress: target.generationProgress,
          targetVisibleProgress: target.visibleProgress,
          targetMajorProgress: target.majorProgress,
          targetLabelOpacity: target.labelOpacity,
          targetGenerationAlpha: target.generationAlpha,
        });
        continue;
      }

      const useImmediateValues = !initializedRef.current;
      animationStates.set(key, {
        ...target,
        key,
        visibleProgress: useImmediateValues ? target.visibleProgress : 0,
        majorProgress: useImmediateValues ? target.majorProgress : 0,
        labelOpacity: useImmediateValues ? target.labelOpacity : 0,
        generationAlpha: useImmediateValues ? target.generationAlpha : 0,
        targetVisibleProgress: target.visibleProgress,
        targetMajorProgress: target.majorProgress,
        targetLabelOpacity: target.labelOpacity,
        targetGenerationAlpha: target.generationAlpha,
      });
    }

    for (const [key, state] of [...animationStates.entries()]) {
      if (!activeKeys.has(key)) {
        animationStates.set(key, {
          ...state,
          targetVisibleProgress: 0,
          targetMajorProgress: 0,
          targetLabelOpacity: 0,
          targetGenerationAlpha: 0,
        });
      }
    }

    initializedRef.current = true;

    const hasPendingAnimation = [...animationStates.values()].some(
      (state) =>
        Math.abs(state.targetVisibleProgress - state.visibleProgress) > 0.002 ||
        Math.abs(state.targetMajorProgress - state.majorProgress) > 0.002 ||
        Math.abs(state.targetLabelOpacity - state.labelOpacity) > 0.002 ||
        Math.abs(state.targetGenerationAlpha - state.generationAlpha) > 0.002,
    );

    if (!hasPendingAnimation) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      invalidateCanvas("axis-tick-animation");

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
      const factor = 1 - Math.exp(-dt / AXIS_TICK_ANIMATION_SMOOTHING_MS);
      let hasActiveAnimation = false;
      let didChange = false;

      for (const [key, state] of [...animationStates.entries()]) {
        const nextVisibleProgress =
          state.visibleProgress +
          (state.targetVisibleProgress - state.visibleProgress) * factor;
        const nextMajorProgress =
          state.majorProgress +
          (state.targetMajorProgress - state.majorProgress) * factor;
        const labelFactor =
          state.targetLabelOpacity > state.labelOpacity
            ? 1 - Math.exp(-dt / AXIS_TICK_LABEL_FADE_IN_SMOOTHING_MS)
            : 1 - Math.exp(-dt / AXIS_TICK_LABEL_FADE_OUT_SMOOTHING_MS);
        const nextLabelOpacity =
          state.labelOpacity +
          (state.targetLabelOpacity - state.labelOpacity) * labelFactor;
        const nextGenerationAlpha =
          state.generationAlpha +
          (state.targetGenerationAlpha - state.generationAlpha) * factor;

        const settledVisible =
          Math.abs(state.targetVisibleProgress - nextVisibleProgress) < 0.002;
        const settledMajor =
          Math.abs(state.targetMajorProgress - nextMajorProgress) < 0.002;
        const settledLabel =
          Math.abs(state.targetLabelOpacity - nextLabelOpacity) < 0.002;
        const settledGenerationAlpha =
          Math.abs(state.targetGenerationAlpha - nextGenerationAlpha) < 0.002;

        if (
          !settledVisible ||
          !settledMajor ||
          !settledLabel ||
          !settledGenerationAlpha
        ) {
          hasActiveAnimation = true;
        }

        if (
          Math.abs(nextVisibleProgress - state.visibleProgress) > 0.0005 ||
          Math.abs(nextMajorProgress - state.majorProgress) > 0.0005 ||
          Math.abs(nextLabelOpacity - state.labelOpacity) > 0.0005 ||
          Math.abs(nextGenerationAlpha - state.generationAlpha) > 0.0005
        ) {
          didChange = true;
        }

        if (
          state.targetVisibleProgress <= 0.001 &&
          state.targetMajorProgress <= 0.001 &&
          state.targetLabelOpacity <= 0.001 &&
          state.targetGenerationAlpha <= 0.001 &&
          nextVisibleProgress <= 0.003 &&
          nextMajorProgress <= 0.003 &&
          nextLabelOpacity <= 0.003 &&
          nextGenerationAlpha <= 0.003
        ) {
          animationStates.delete(key);
        } else {
          animationStates.set(key, {
            ...state,
            visibleProgress: settledVisible
              ? state.targetVisibleProgress
              : nextVisibleProgress,
            majorProgress: settledMajor
              ? state.targetMajorProgress
              : nextMajorProgress,
            labelOpacity: settledLabel
              ? state.targetLabelOpacity
              : nextLabelOpacity,
            generationAlpha: settledGenerationAlpha
              ? state.targetGenerationAlpha
              : nextGenerationAlpha,
          });
        }
      }

      if (didChange) invalidateCanvas("axis-tick-animation");

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
  }, [axisTickTargets, invalidateCanvas]);

  return animationRef;
}
