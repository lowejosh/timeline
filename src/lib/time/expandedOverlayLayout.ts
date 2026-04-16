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
  bottom: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function intervalsOverlap(
  leftA: number,
  rightA: number,
  leftB: number,
  rightB: number,
) {
  return leftA < rightB && rightA > leftB;
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function overlapsVertically(
  top: number,
  height: number,
  obstacleTop: number,
  obstacleBottom: number,
  laneGap: number,
) {
  return !(
    top + height + laneGap <= obstacleTop ||
    top >= obstacleBottom + laneGap
  );
}

function compareExpandedOverlayLayoutItems(
  left: ExpandedOverlayLayoutItem,
  right: ExpandedOverlayLayoutItem,
) {
  return (
    right.baseY - left.baseY ||
    right.renderWidth - left.renderWidth ||
    left.renderX - right.renderX ||
    left.laneIndex - right.laneIndex ||
    left.id.localeCompare(right.id)
  );
}

function resolvePackedExpandedOverlayYById(
  items: ExpandedOverlayLayoutItem[],
  parent: ExpandedOverlayLayoutItem,
  panelHeight: number,
  bottomY: number,
  bandHeight: number,
  laneGap: number,
) {
  const packedYById = new Map<string, number>();
  const parentY = parent.baseY - panelHeight;

  packedYById.set(parent.id, parentY);

  const placedObstacles: ExpandedOverlayObstacle[] = [
    {
      left: parent.renderX,
      right: parent.renderX + parent.renderWidth,
      top: parentY,
      bottom: parent.baseY + bandHeight,
    },
  ];
  const sortedItems = items
    .filter((item) => item.id !== parent.id)
    .sort(compareExpandedOverlayLayoutItems);

  for (const item of sortedItems) {
    let resolvedY = bottomY;

    for (const obstacle of [...placedObstacles].sort(
      (left, right) => right.top - left.top || left.left - right.left,
    )) {
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

      if (
        !overlapsVertically(
          resolvedY,
          bandHeight,
          obstacle.top,
          obstacle.bottom,
          laneGap,
        )
      ) {
        continue;
      }

      resolvedY = obstacle.top - bandHeight - laneGap;
    }

    packedYById.set(item.id, resolvedY);
    placedObstacles.push({
      left: item.renderX,
      right: item.renderX + item.renderWidth,
      top: resolvedY,
      bottom: resolvedY + bandHeight,
    });
  }

  return packedYById;
}

export function resolveExpandedOverlayLayout(
  items: ExpandedOverlayLayoutItem[],
  expandedParentId: string | null,
  panelHeight: number,
  expansionProgress: number,
  bottomY: number,
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

  const clampedProgress = clamp01(expansionProgress);
  const packedExpandedYById = resolvePackedExpandedOverlayYById(
    items,
    parent,
    panelHeight,
    bottomY,
    bandHeight,
    laneGap,
  );

  for (const item of items) {
    const packedY = packedExpandedYById.get(item.id) ?? item.baseY;
    yById.set(item.id, lerp(item.baseY, packedY, clampedProgress));
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