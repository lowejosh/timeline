import { Save, Trash2 } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { normalizeTimelineSetDocument } from "@/lib/catalog/setSchema";
import { createEmptyTimelineSetDocument } from "@/lib/catalog/setDocumentValidation";
import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";
import {
  compileTimelineCatalog,
  STATIC_TIMELINE_CATALOG,
} from "@/lib/catalog/timelineCatalog";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import { useCustomSetCatalogStore } from "@/stores/customSetCatalog.store";
import { useTimelineLayerStore } from "@/stores/timelineLayer.store";
import { useAppRouteNavigation } from "@/app/routePaths";
import type { SetBuilderTool } from "./SetBuilder.types";
import { SetBuilderWorkspace } from "./components/SetBuilderWorkspace";

function cloneDocument(document: TimelineRawSetDocument): TimelineRawSetDocument {
  return JSON.parse(JSON.stringify(document)) as TimelineRawSetDocument;
}

function getDraftId(editingSetId: string | null) {
  return editingSetId ? `edit:${editingSetId}` : "create-set";
}

type SetBuilderPageProps = {
  editingSetId: string | null;
};

export function SetBuilderPage({ editingSetId }: SetBuilderPageProps) {
  const titleId = useId();
  const routeNavigation = useAppRouteNavigation();
  const documents = useCustomSetCatalogStore((state) => state.documents);
  const drafts = useCustomSetCatalogStore((state) => state.drafts);
  const deleteCustomSet = useCustomSetCatalogStore((state) => state.deleteCustomSet);
  const deleteDraft = useCustomSetCatalogStore((state) => state.deleteDraft);
  const publishDocument = useCustomSetCatalogStore((state) => state.publishDocument);
  const saveDraft = useCustomSetCatalogStore((state) => state.saveDraft);
  const applySetLibrary = useTimelineLayerStore((state) => state.applySetLibrary);
  const enabledSetIds = useTimelineLayerStore((state) => state.enabledSetIds);
  const orderedSetIds = useTimelineLayerStore((state) => state.orderedSetIds);
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] =
    useState<SetBuilderTool>("metadata");
  const isEditing = editingSetId !== null;
  const canDelete = isEditing && documents.some(
    (candidate) => candidate.metadata.id === editingSetId,
  );

  useEffect(() => {
    const next = cloneDocument(sourceDocument);

    setDocument(next);
    setSaveError(null);
  }, [sourceDocument]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveDraft(getDraftId(editingSetId), document);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [document, editingSetId, saveDraft]);

  const handleBack = () => {
    routeNavigation.openSets();
  };

  const handleSave = () => {
    const didPublish = publishDocument(document);

    if (!didPublish) {
      setSaveError("Fix the set validation issues before saving.");
      return;
    }

    try {
      const nextDocuments = [
        ...documents.filter(
          (candidate) => candidate.metadata.id !== document.metadata.id,
        ),
        document,
      ];
      const nextCatalog = compileTimelineCatalog([
        ...STATIC_TIMELINE_CATALOG.sets,
        ...nextDocuments.map(normalizeTimelineSetDocument),
      ]);
      const setId = document.metadata.id as TimelineSetId;
      const nextEnabledSetIds = new Set(enabledSetIds);
      const nextOrderedSetIds = orderedSetIds.includes(setId)
        ? orderedSetIds
        : [...orderedSetIds, setId];

      nextEnabledSetIds.add(setId);
      applySetLibrary(nextEnabledSetIds, nextOrderedSetIds, nextCatalog);
      deleteDraft(getDraftId(editingSetId));
      setSaveError(null);
      routeNavigation.openSets();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save this set.",
      );
    }
  };

  const handleDelete = () => {
    if (!editingSetId) {
      return;
    }

    deleteCustomSet(editingSetId);
    routeNavigation.openSets();
  };

  return (
    <PageShell
      actions={
        <>
          {saveError ? (
            <span className="text-xs font-semibold text-destructive">
              {saveError}
            </span>
          ) : null}
          {canDelete ? (
            <Button onClick={handleDelete} size="pill" type="button" variant="subtle">
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          ) : null}
          <Button onClick={handleSave} size="pill" type="button" variant="subtle">
            <Save className="size-3.5" />
            Save
          </Button>
        </>
      }
      backLabel="Back to available sets"
      onBack={handleBack}
      title={
        isEditing
          ? `Editing ${document.metadata.label || "custom set"}`
          : "Create custom set"
      }
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
