import { SetBuilderFormPanel } from "./SetBuilderFormPanel";
import { SetBuilderPreviewPane } from "./SetBuilderPreviewPane";
import { SetBuilderToolRail } from "./SetBuilderToolRail";
import type { SetBuilderTool } from "../SetBuilder.types";
import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";

type SetBuilderWorkspaceProps = {
  document: TimelineRawSetDocument;
  isEditing: boolean;
  selectedTool: SetBuilderTool;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
  onSelectTool: (tool: SetBuilderTool) => void;
};

export function SetBuilderWorkspace({
  document,
  isEditing,
  onDocumentChange,
  onSelectTool,
  selectedTool,
}: SetBuilderWorkspaceProps) {
  return (
    <div className="grid h-full min-h-0 grid-cols-[4.5rem_minmax(0,1fr)_minmax(18rem,42%)] overflow-hidden rounded-md border border-border/60 bg-surface/10 max-lg:grid-cols-[4.25rem_minmax(0,1fr)]">
      <SetBuilderToolRail
        onSelectTool={onSelectTool}
        selectedTool={selectedTool}
      />
      <SetBuilderFormPanel
        document={document}
        isEditing={isEditing}
        onDocumentChange={onDocumentChange}
        onSelectTool={onSelectTool}
        selectedTool={selectedTool}
      />
      <div className="h-full min-h-0 overflow-hidden max-lg:hidden">
        <SetBuilderPreviewPane
          document={document}
          onDocumentChange={onDocumentChange}
        />
      </div>
    </div>
  );
}
