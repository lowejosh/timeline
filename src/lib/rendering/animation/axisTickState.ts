import type { AxisTickRenderState } from "../axisTickStates";

export type AnimatedAxisTickState = AxisTickRenderState & {
  key: string;
  targetVisibleProgress: number;
  targetMajorProgress: number;
  targetLabelOpacity: number;
  targetGenerationAlpha: number;
};
