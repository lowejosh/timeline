import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";
import {
  SET_BUILDER_TOOL_LABELS,
  SET_BUILDER_TOOL_SEQUENCE,
  type SetBuilderTool,
} from "../SetBuilder.types";
import { SetBuilderErasForm } from "./eras/SetBuilderErasForm";
import { SetBuilderMetadataForm } from "./SetBuilderMetadataForm";

type SetBuilderFormPanelProps = {
  document: TimelineRawSetDocument;
  isEditing: boolean;
  selectedTool: SetBuilderTool;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
  onSelectTool: (tool: SetBuilderTool) => void;
};

export function SetBuilderFormPanel({
  document,
  isEditing,
  onDocumentChange,
  onSelectTool,
  selectedTool,
}: SetBuilderFormPanelProps) {
  const selectedToolIndex = SET_BUILDER_TOOL_SEQUENCE.indexOf(selectedTool);
  const nextTool = SET_BUILDER_TOOL_SEQUENCE[selectedToolIndex + 1] ?? null;

  const content =
    selectedTool === "metadata" ? (
      <SetBuilderMetadataForm
        document={document}
        lockSetId={isEditing}
        onDocumentChange={onDocumentChange}
      />
    ) : selectedTool === "eras" ? (
      <SetBuilderErasForm
        document={document}
        onDocumentChange={onDocumentChange}
      />
    ) : (
      <div className="grid h-full place-items-center px-6 py-8 text-center">
        <div className="grid gap-2">
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Editing tool
          </span>
          <p className="m-0 text-lg font-semibold text-foreground">
            {SET_BUILDER_TOOL_LABELS[selectedTool]} selected
          </p>
        </div>
      </div>
    );

  return (
    <section className="flex h-full min-h-[28rem] flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">{content}</div>
      {nextTool ? (
        <footer className="flex shrink-0 justify-end border-t border-border/70 px-6 py-4">
          <Button
            onClick={() => onSelectTool(nextTool)}
            size="pill"
            type="button"
            variant="subtle"
          >
            Next
            <ArrowRight className="size-3.5" />
          </Button>
        </footer>
      ) : null}
    </section>
  );
}
