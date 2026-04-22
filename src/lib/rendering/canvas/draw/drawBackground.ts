import type { CanvasDrawContext } from "./drawContext";
import { parseColor, toCssColor, withAlpha } from "../colors";
import { PARENT_ERA_TINT_ALPHA } from "../constants";

export function drawBackground(cx: CanvasDrawContext): void {
  const { context, sceneParentEra, pad, innerWidth, sceneHeight } = cx;
  const parentTintColor = sceneParentEra
    ? parseColor(sceneParentEra.color)
    : null;

  if (parentTintColor && parentTintColor.a > 0.001) {
    context.fillStyle = toCssColor(
      withAlpha(parentTintColor, PARENT_ERA_TINT_ALPHA),
    );
    context.fillRect(pad, 0, innerWidth, sceneHeight);
  }
}
