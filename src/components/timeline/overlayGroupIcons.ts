export type OverlayGroupIconId =
  | "cultures"
  | "civilizations"
  | "human-evolution"
  | "deep-time-life";

export type OverlayGroupIconLayout = {
  iconId: OverlayGroupIconId;
  centerX: number;
  centerY: number;
  drawSize: number;
  reservedWidth: number;
};

type ResolveOverlayGroupIconLayoutOptions = {
  groupId?: string;
  bandLeft: number;
  bandTop: number;
  bandWidth: number;
  bandHeight: number;
  leftPadding?: number;
  iconSize?: number;
  gap?: number;
};

const DEFAULT_LEFT_PADDING = 5;
const DEFAULT_ICON_SIZE = 8;
const DEFAULT_ICON_GAP = 4;
const MIN_ICON_DRAW_SIZE = 7;
const MIN_CONTENT_SLACK = 6;

export function resolveOverlayGroupIconId(
  groupId?: string,
): OverlayGroupIconId | null {
  switch (groupId) {
    case "cultures":
    case "civilizations":
    case "human-evolution":
    case "deep-time-life":
      return groupId;
    default:
      return null;
  }
}

export function resolveOverlayGroupIconLayout({
  groupId,
  bandLeft,
  bandTop,
  bandWidth,
  bandHeight,
  leftPadding = DEFAULT_LEFT_PADDING,
  iconSize = DEFAULT_ICON_SIZE,
  gap = DEFAULT_ICON_GAP,
}: ResolveOverlayGroupIconLayoutOptions): OverlayGroupIconLayout | null {
  const iconId = resolveOverlayGroupIconId(groupId);

  if (!iconId || bandWidth <= 0 || bandHeight <= 0) {
    return null;
  }

  const drawSize = Math.max(
    MIN_ICON_DRAW_SIZE,
    Math.min(iconSize, Math.max(bandHeight - 6, MIN_ICON_DRAW_SIZE)),
  );
  const reservedWidth = drawSize + gap;
  const minimumBandWidth = leftPadding * 2 + reservedWidth + MIN_CONTENT_SLACK;

  if (bandWidth < minimumBandWidth) {
    return null;
  }

  return {
    iconId,
    centerX: bandLeft + leftPadding + drawSize / 2,
    centerY: bandTop + bandHeight / 2,
    drawSize,
    reservedWidth,
  };
}

function drawDeepTimeLifeIcon(
  context: CanvasRenderingContext2D,
  _half: number,
) {
  context.beginPath();
  context.moveTo(-0.25, 0.75);
  context.quadraticCurveTo(-3.55, -0.55, -1.45, -3.15);
  context.quadraticCurveTo(0.95, -1.55, 0.55, 1.35);
  context.quadraticCurveTo(0.1, 1.02, -0.25, 0.75);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(1.15, 1.08);
  context.quadraticCurveTo(3.7, 0.35, 3.25, -1.15);
  context.quadraticCurveTo(1.45, -1.75, 0.7, 0.38);
  context.quadraticCurveTo(0.88, 0.88, 1.15, 1.08);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(-1.1, 3.05);
  context.quadraticCurveTo(-0.35, 2.55, 0.1, 1.45);
  context.quadraticCurveTo(0.55, 0.55, 0.72, 0.18);
  context.moveTo(0.15, 1.52);
  context.quadraticCurveTo(1.45, 1.1, 2.5, 0.28);
  context.stroke();
}

function drawHumanEvolutionIcon(
  context: CanvasRenderingContext2D,
  half: number,
) {
  const baseY = half - 0.8;
  const branchY = -0.5;
  const tipY = -half + 1.1;
  const tipX = half - 1.2;

  context.beginPath();
  context.moveTo(0, baseY);
  context.lineTo(0, branchY);
  context.lineTo(-tipX, tipY);
  context.moveTo(0, branchY);
  context.lineTo(tipX, tipY);
  context.stroke();

  for (const [x, y] of [
    [0, baseY],
    [0, branchY],
    [-tipX, tipY],
    [tipX, tipY],
  ] as const) {
    context.beginPath();
    context.arc(x, y, 1, 0, Math.PI * 2);
    context.fill();
  }
}

function drawCulturesIcon(context: CanvasRenderingContext2D, half: number) {
  const baseY = half - 0.9;
  const leftPeakX = -2.2;
  const rightPeakX = 2.1;
  const peakY = -half + 1.5;

  context.beginPath();
  context.moveTo(-half + 0.6, baseY);
  context.lineTo(leftPeakX, peakY);
  context.lineTo(-0.6, baseY);
  context.moveTo(-1.2, baseY);
  context.lineTo(rightPeakX, peakY + 0.8);
  context.lineTo(half - 0.6, baseY);
  context.moveTo(-half + 0.3, baseY);
  context.lineTo(half - 0.3, baseY);
  context.stroke();
}

function drawCivilizationsIcon(
  context: CanvasRenderingContext2D,
  half: number,
) {
  const roofY = -half + 1;
  const entablatureY = -1.4;
  const baseY = half - 0.9;

  context.beginPath();
  context.moveTo(-half + 0.6, entablatureY);
  context.lineTo(0, roofY);
  context.lineTo(half - 0.6, entablatureY);
  context.moveTo(-half + 1.3, entablatureY);
  context.lineTo(half - 1.3, entablatureY);
  context.moveTo(-half + 1, baseY);
  context.lineTo(half - 1, baseY);

  for (const x of [-2.2, 0, 2.2]) {
    context.moveTo(x, entablatureY + 0.5);
    context.lineTo(x, baseY - 0.3);
  }

  context.stroke();
}

export function drawOverlayGroupIcon({
  context,
  layout,
  strokeStyle,
  alpha,
}: {
  context: CanvasRenderingContext2D;
  layout: OverlayGroupIconLayout;
  strokeStyle: string;
  alpha: number;
}) {
  if (alpha <= 0.01) {
    return;
  }

  const half = layout.drawSize / 2;

  context.save();
  context.translate(layout.centerX, layout.centerY);
  context.strokeStyle = strokeStyle;
  context.fillStyle = strokeStyle;
  context.globalAlpha = alpha;
  context.lineWidth = 1;
  context.lineCap = "round";
  context.lineJoin = "round";

  switch (layout.iconId) {
    case "deep-time-life":
      drawDeepTimeLifeIcon(context, half);
      break;
    case "human-evolution":
      drawHumanEvolutionIcon(context, half);
      break;
    case "cultures":
      drawCulturesIcon(context, half);
      break;
    case "civilizations":
      drawCivilizationsIcon(context, half);
      break;
  }

  context.restore();
}
