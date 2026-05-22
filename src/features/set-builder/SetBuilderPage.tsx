import { Save, Trash2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { SetBuilderAiPromptButton } from "./components/SetBuilderAiPromptButton";
import { SetBuilderWorkspace } from "./components/SetBuilderWorkspace";

function cloneDocument(
  document: TimelineRawSetDocument,
): TimelineRawSetDocument {
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
  const deleteCustomSet = useCustomSetCatalogStore(
    (state) => state.deleteCustomSet,
  );
  const deleteDraft = useCustomSetCatalogStore((state) => state.deleteDraft);
  const publishDocument = useCustomSetCatalogStore(
    (state) => state.publishDocument,
  );
  const saveDraft = useCustomSetCatalogStore((state) => state.saveDraft);
  const applySetLibrary = useTimelineLayerStore(
    (state) => state.applySetLibrary,
  );
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<SetBuilderTool>("metadata");
  const isEditing = editingSetId !== null;
  const canDelete =
    isEditing &&
    documents.some((candidate) => candidate.metadata.id === editingSetId);

  // Track the last document we passed to saveDraft so we can detect when
  // sourceDocument changes only because of our own draft save (and skip the
  // redundant reset that would otherwise create an infinite clone loop).
  const lastDraftedDocRef = useRef<TimelineRawSetDocument | null>(null);

  useEffect(() => {
    // Skip when sourceDocument changed because we just saved this document.
    // Without this guard, saveDraft → sourceDocument → setDocument(clone) →
    // document changes → saveDraft → … loops indefinitely, and can also race
    // against in-progress user input and overwrite recent edits.
    if (sourceDocument === lastDraftedDocRef.current) {
      return;
    }
    setDocument(cloneDocument(sourceDocument));
    setSaveError(null);
  }, [sourceDocument]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      lastDraftedDocRef.current = document;
      saveDraft(getDraftId(editingSetId), document);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [document, editingSetId, saveDraft]);

  const handleBack = () => {
    routeNavigation.goBackOrOpenSets();
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
    setIsDeleteDialogOpen(false);
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
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              size="pill"
              type="button"
              variant="subtle"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          ) : null}
          <Button
            onClick={handleSave}
            size="pill"
            type="button"
            variant="subtle"
          >
            <Save className="size-3.5" />
            Save
          </Button>
          <SetBuilderAiPromptButton document={document} />
        </>
      }
      backLabel="Back"
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
      <ConfirmDialog
        confirmLabel="Delete set"
        description={`Delete "${document.metadata.label || "this custom set"}"? This removes the local custom set and its draft. This cannot be undone.`}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete custom set"
      />
    </PageShell>
  );
}
