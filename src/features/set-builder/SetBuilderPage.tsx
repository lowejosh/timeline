import { Save, Trash2 } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { createEmptyTimelineSetDocument } from "@/lib/catalog/setDocumentValidation";
import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";
import { useCustomSetCatalogStore } from "@/stores/customSetCatalog.store";
import { useTimelineNavigationStore } from "@/stores/timelineNavigation.store";
import type { SetBuilderTool } from "./SetBuilder.types";
import { SetBuilderWorkspace } from "./components/SetBuilderWorkspace";

function cloneDocument(document: TimelineRawSetDocument): TimelineRawSetDocument {
  return JSON.parse(JSON.stringify(document)) as TimelineRawSetDocument;
}

function getDraftId(editingSetId: string | null) {
  return editingSetId ? `edit:${editingSetId}` : "create-set";
}

export function SetBuilderPage() {
  const titleId = useId();
  const editingSetId = useTimelineNavigationStore(
    (state) => state.editingCustomSetId,
  );
  const setActiveView = useTimelineNavigationStore((state) => state.setActiveView);
  const documents = useCustomSetCatalogStore((state) => state.documents);
  const drafts = useCustomSetCatalogStore((state) => state.drafts);
  const deleteCustomSet = useCustomSetCatalogStore((state) => state.deleteCustomSet);
  const saveDraft = useCustomSetCatalogStore((state) => state.saveDraft);
  const sourceDocument = useMemo(() => {
    const draft = drafts[getDraftId(editingSetId)];

    if (draft) {
      return draft;
    }

    return (
      documents.find((document) => document.metadata.id === editingSetId) ??
      createEmptyTimelineSetDocument("Custom Set")
    );
  }, [documents, drafts, editingSetId]);
  const [document, setDocument] = useState<TimelineRawSetDocument>(() =>
    cloneDocument(sourceDocument),
  );
  const [selectedTool, setSelectedTool] =
    useState<SetBuilderTool>("metadata");
  const isEditing = editingSetId !== null;
  const canDelete = isEditing && documents.some(
    (candidate) => candidate.metadata.id === editingSetId,
  );

  useEffect(() => {
    const next = cloneDocument(sourceDocument);

    setDocument(next);
  }, [sourceDocument]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveDraft(getDraftId(editingSetId), document);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [document, editingSetId, saveDraft]);

  const handleBack = () => {
    setActiveView("available-sets");
  };

  const handleSaveDraft = () => {
    saveDraft(getDraftId(editingSetId), document);
  };

  const handleDelete = () => {
    if (!editingSetId) {
      return;
    }

    deleteCustomSet(editingSetId);
    setActiveView("available-sets");
  };

  return (
    <PageShell
      actions={
        <>
          {canDelete ? (
            <Button onClick={handleDelete} size="pill" type="button" variant="subtle">
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          ) : null}
          <Button onClick={handleSaveDraft} size="pill" type="button" variant="subtle">
            <Save className="size-3.5" />
            Save
          </Button>
        </>
      }
      backLabel="Back to available sets"
      onBack={handleBack}
      title={isEditing ? "Edit custom set" : "Create custom set"}
      titleId={titleId}
    >
      <SetBuilderWorkspace
        document={document}
        isEditing={isEditing}
        onDocumentChange={setDocument}
        onSelectTool={setSelectedTool}
        selectedTool={selectedTool}
      />
    </PageShell>
  );
}
