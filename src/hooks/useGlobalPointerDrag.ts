import { useEffect } from "react";

type UseGlobalPointerDragArgs = {
  active: boolean;
  cursor?: string;
  onPointerEnd: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
};

export function useGlobalPointerDrag({
  active,
  cursor = "grabbing",
  onPointerEnd,
  onPointerMove,
}: UseGlobalPointerDragArgs) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    const previousTouchAction = document.body.style.touchAction;
    const previousUserSelect = document.body.style.userSelect;
    const previousWebkitUserSelect = document.body.style.webkitUserSelect;

    document.body.style.cursor = cursor;
    document.body.style.touchAction = "none";
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    window.addEventListener("pointermove", onPointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.touchAction = previousTouchAction;
      document.body.style.userSelect = previousUserSelect;
      document.body.style.webkitUserSelect = previousWebkitUserSelect;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [active, cursor, onPointerEnd, onPointerMove]);
}
