import { useCallback, useEffect, useRef, type RefObject } from "react";

import { VIEWPORT_INTERACTION_SETTLE_MS } from "@/lib/rendering/canvas/constants";

export function useViewportInteractionState(
  recordInteractionEvent: (eventName: string) => void,
  drawCanvasRef: RefObject<((invalidateReasons?: string[]) => void) | null>,
) {
  const isActiveRef = useRef(false);
  const settleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
      }
    };
  }, []);

  const markViewportInteraction = useCallback(
    (eventName: string) => {
      isActiveRef.current = true;

      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
      }

      settleTimeoutRef.current = window.setTimeout(() => {
        settleTimeoutRef.current = null;
        isActiveRef.current = false;
        drawCanvasRef.current?.(["viewport-interaction-settle"]);
      }, VIEWPORT_INTERACTION_SETTLE_MS);

      recordInteractionEvent(eventName);
    },
    [drawCanvasRef, recordInteractionEvent],
  );

  return {
    isViewportInteractionActiveRef: isActiveRef,
    markViewportInteraction,
  };
}
