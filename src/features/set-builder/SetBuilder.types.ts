export type SetBuilderTool = "metadata" | "eras" | "markers" | "bands";

export const SET_BUILDER_TOOL_SEQUENCE = [
  "metadata",
  "eras",
  "markers",
  "bands",
] as const satisfies readonly SetBuilderTool[];

export const SET_BUILDER_TOOL_LABELS = {
  metadata: "Metadata",
  eras: "Eras",
  markers: "Markers",
  bands: "Bands",
} satisfies Record<SetBuilderTool, string>;
