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

export type ExpandedOverlayLayoutExpansion = {
  parentId: string;
  panelHeight: number;
  expansionProgress: number;
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

function resolveExpandedOverlayObstacleHeight(
  bandHeight: number,
  panelHeight: number,
) {
  return bandHeight + Math.max(panelHeight, 0);
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
  expansionsById: Map<string, ExpandedOverlayLayoutExpansion>,
  globalProgress: number,
  bottomY: number,
  bandHeight: number,
  laneGap: number,
) {
  const packedYById = new Map<string, number>();
  const placedObstacles: ExpandedOverlayObstacle[] = [];
  const sortedItems = [...items].sort(compareExpandedOverlayLayoutItems);

  for (const item of sortedItems) {
    const expansion = expansionsById.get(item.id);
    const currentPanelHeight = expansion
      ? Math.max(expansion.panelHeight, 0) * clamp01(expansion.expansionProgress)
      : 0;
    const obstacleHeight = resolveExpandedOverlayObstacleHeight(
      bandHeight,
      currentPanelHeight,
    );
    let resolvedY = expansion
      ? item.baseY - currentPanelHeight
      : lerp(item.baseY, bottomY, globalProgress);

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
          obstacleHeight,
          obstacle.top,
          obstacle.bottom,
          laneGap,
        )
      ) {
        continue;
      }

      resolvedY = obstacle.top - obstacleHeight - laneGap;
    }

    packedYById.set(item.id, resolvedY);
    placedObstacles.push({
      left: item.renderX,
      right: item.renderX + item.renderWidth,
      top: resolvedY,
      bottom: resolvedY + obstacleHeight,
    });
  }

  return packedYById;
}

export function resolveExpandedOverlayLayout(
  items: ExpandedOverlayLayoutItem[],
  expansions: ExpandedOverlayLayoutExpansion[],
  bottomY: number,
  bandHeight: number,
  laneGap: number,
): ExpandedOverlayLayoutResult {
  const yById = new Map<string, number>();

  for (const item of items) {
    yById.set(item.id, item.baseY);
  }

  const expansionsById = new Map(
    expansions
      .filter(
        (expansion) =>
          expansion.parentId &&
          expansion.panelHeight > 0.01 &&
          expansion.expansionProgress > 0.001,
      )
      .map((expansion) => [expansion.parentId, expansion] as const),
  );

  if (expansionsById.size === 0) {
    return { yById };
  }

  const globalProgress = Math.max(
    ...[...expansionsById.values()].map((expansion) =>
      clamp01(expansion.expansionProgress),
    ),
  );
  const packedExpandedYById = resolvePackedExpandedOverlayYById(
    items,
    expansionsById,
    globalProgress,
    bottomY,
    bandHeight,
    laneGap,
  );

  for (const item of items) {
    yById.set(item.id, packedExpandedYById.get(item.id) ?? item.baseY);
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