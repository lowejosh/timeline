import { useEffect, useRef } from "react";
import {
  EXPANDED_OVERLAY_ANIMATION_SMOOTHING_MS,
  MIN_EXPANDED_OVERLAY_PARENT_WIDTH,
} from "@/lib/rendering/canvas/constants";
import { areStringArraysEqual } from "@/lib/rendering/canvas/perf";
import type { ResolvedTimelineOverlayBand } from "@/lib/rendering/overlayTracks";

export function useExpandedOverlayAnimation(
  expandedOverlayIds: string[],
  invalidateCanvas: (reason?: string) => void,
): {
  progressByIdRef: React.RefObject<Map<string, number>>;
  renderedIdsRef: React.RefObject<string[]>;
} {
  const progressByIdRef = useRef<Map<string, number>>(new Map());
  const renderedIdsRef = useRef<string[]>([]);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (expandedOverlayIds.length > 0) {
      renderedIdsRef.current = [
        ...new Set([...renderedIdsRef.current, ...expandedOverlayIds]),
      ];
    }

    const stepAnimation = (now: number) => {
      const lastTime = lastTimeRef.current || now;
      const dt = Math.max(now - lastTime, 0);
      lastTimeRef.current = now;
      const factor =
        1 - Math.exp(-dt / EXPANDED_OVERLAY_ANIMATION_SMOOTHING_MS);
      const progressById = progressByIdRef.current;
      const orderedIds = [
        ...new Set([
          ...renderedIdsRef.current,
          ...expandedOverlayIds,
          ...progressById.keys(),
        ]),
      ];
      let hasActiveAnimation = false;

      for (const expandedOverlayId of orderedIds) {
        const target = expandedOverlayIds.includes(expandedOverlayId) ? 1 : 0;
        const current = progressById.get(expandedOverlayId) ?? 0;
        let next = current + (target - current) * factor;

        if (Math.abs(target - next) <= 0.002) next = target;

        if (target > 0.001 || next > 0.003) {
          progressById.set(expandedOverlayId, next);
        } else {
          progressById.delete(expandedOverlayId);
        }

        if (Math.abs(target - next) > 0.002) hasActiveAnimation = true;
      }

      renderedIdsRef.current = orderedIds.filter(
        (id) =>
          expandedOverlayIds.includes(id) ||
          (progressById.get(id) ?? 0) > 0.003,
      );

      invalidateCanvas("expanded-overlay-animation");

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
  }, [expandedOverlayIds, invalidateCanvas]);

  return { progressByIdRef, renderedIdsRef };
}

export function deriveExpandedOverlayIds(
  current: string[],
  resolvedOverlayBands: ResolvedTimelineOverlayBand[],
): string[] {
  const next = current.filter((expandedOverlayId) => {
    const expandedParent = resolvedOverlayBands.find(
      ({ band }) =>
        band.id === expandedOverlayId && (band.children?.length ?? 0) > 0,
    );

    return (
      !!expandedParent &&
      expandedParent.renderWidth >= MIN_EXPANDED_OVERLAY_PARENT_WIDTH
    );
  });

  return areStringArraysEqual(current, next) ? current : next;
}
