export type ExpandedOverlayPanelBounds = {
  panelTop: number;
  panelBottom: number;
  unionTop: number;
  unionHeight: number;
};

export type ExpandedOverlayLayoutItem = {
  id: string;
  laneIndex: number;
  renderX: number;
  renderWidth: number;
  baseY: number;
};

export type ExpandedOverlayLayoutResult = {
  yById: Map<string, number>;
};

type ExpandedOverlayObstacle = {
  left: number;
  right: number;
  top: number;
};

function intervalsOverlap(
  leftA: number,
  rightA: number,
  leftB: number,
  rightB: number,
) {
  return leftA < rightB && rightA > leftB;
}

export function resolveExpandedOverlayLayout(
  items: ExpandedOverlayLayoutItem[],
  expandedParentId: string | null,
  panelHeight: number,
  bandHeight: number,
  laneGap: number,
): ExpandedOverlayLayoutResult {
  const yById = new Map<string, number>();

  for (const item of items) {
    yById.set(item.id, item.baseY);
  }

  if (!expandedParentId || panelHeight <= 0.01) {
    return { yById };
  }

  const parent = items.find((item) => item.id === expandedParentId);

  if (!parent) {
    return { yById };
  }

  const placedObstacles: ExpandedOverlayObstacle[] = [];
  const sortedItems = [...items].sort(
    (left, right) =>
      right.baseY - left.baseY ||
      left.laneIndex - right.laneIndex ||
      left.id.localeCompare(right.id),
  );

  for (const item of sortedItems) {
    let shift = item.id === parent.id ? panelHeight : 0;

    if (item.baseY < parent.baseY) {
      for (const obstacle of placedObstacles) {
        if (
          !intervalsOverlap(
            item.renderX,
            item.renderX + item.renderWidth,
            obstacle.left,
            obstacle.right,
          )
        ) {
          continue;
        }

        shift = Math.max(
          shift,
          item.baseY + bandHeight + laneGap - obstacle.top,
        );
      }
    }

    const resolvedY = item.baseY - Math.max(shift, 0);
    yById.set(item.id, resolvedY);
    placedObstacles.push({
      left: item.renderX,
      right: item.renderX + item.renderWidth,
      top: resolvedY,
    });
  }

  return { yById };
}

export function getExpandedOverlayPanelBounds(
  parentBandY: number,
  panelHeight: number,
  bandHeight: number,
): ExpandedOverlayPanelBounds {
  const panelTop = parentBandY + bandHeight;
  const panelBottom = panelTop + panelHeight;

  return {
    panelTop,
    panelBottom,
    unionTop: parentBandY,
    unionHeight: panelHeight + bandHeight,
  };
}