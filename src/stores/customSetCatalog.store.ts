import { create } from "zustand";

import {
  normalizeTimelineSetDocument,
  type TimelineRawSetDocument,
  type TimelineSetDefinition,
} from "@/lib/catalog/setSchema";
import {
  compileTimelineCatalog,
  STATIC_TIMELINE_CATALOG,
} from "@/lib/catalog/timelineCatalog";
import { getTimelineSetDocumentIssues } from "@/lib/catalog/setDocumentValidation";
import type { TimelineSetId } from "@/lib/core/timelineTypes";

const CUSTOM_SET_STORAGE_KEY = "timeline:custom-sets:v1";

export type CustomSetValidationStatus = {
  setId: string;
  valid: boolean;
  issues: string[];
};

type CustomSetPersistenceEnvelope = {
  version: 1;
  documents: TimelineRawSetDocument[];
  drafts: Record<string, TimelineRawSetDocument>;
  lastSavedAt?: string;
};

type CustomSetCatalogState = {
  documents: TimelineRawSetDocument[];
  drafts: Record<string, TimelineRawSetDocument>;
  normalizedSets: TimelineSetDefinition[];
  validationStatuses: CustomSetValidationStatus[];
  lastSavedAt: string | null;
};

type CustomSetCatalogActions = {
  deleteCustomSet: (setId: TimelineSetId) => void;
  deleteDraft: (draftId: string) => void;
  publishDocument: (document: TimelineRawSetDocument) => boolean;
  saveDraft: (draftId: string, document: TimelineRawSetDocument) => void;
};

export type CustomSetCatalogStore = CustomSetCatalogState &
  CustomSetCatalogActions;

function isRawSetDocument(value: unknown): value is TimelineRawSetDocument {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value as Partial<TimelineRawSetDocument>).version === 1,
  );
}

function readEnvelope(): CustomSetPersistenceEnvelope {
  if (typeof window === "undefined") {
    return { version: 1, documents: [], drafts: {} };
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_SET_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (!parsed || typeof parsed !== "object") {
      return { version: 1, documents: [], drafts: {} };
    }

    const value = parsed as Partial<CustomSetPersistenceEnvelope>;
    const drafts = value.drafts && typeof value.drafts === "object"
      ? Object.fromEntries(
          Object.entries(value.drafts).filter((entry): entry is [
            string,
            TimelineRawSetDocument,
          ] => isRawSetDocument(entry[1])),
        )
      : {};

    return {
      version: 1,
      documents: Array.isArray(value.documents)
        ? value.documents.filter(isRawSetDocument)
        : [],
      drafts,
      lastSavedAt: typeof value.lastSavedAt === "string" ? value.lastSavedAt : undefined,
    };
  } catch {
    return { version: 1, documents: [], drafts: {} };
  }
}

function writeEnvelope(envelope: CustomSetPersistenceEnvelope) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CUSTOM_SET_STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // The in-memory state remains usable if storage quota or privacy settings fail.
  }
}

function deriveState(
  documents: readonly TimelineRawSetDocument[],
  drafts: Record<string, TimelineRawSetDocument>,
  lastSavedAt: string | null,
): CustomSetCatalogState {
  const normalizedSets: TimelineSetDefinition[] = [];
  const validationStatuses: CustomSetValidationStatus[] = [];
  const acceptedDocuments: TimelineRawSetDocument[] = [];

  for (const document of documents) {
    const setId = document.metadata?.id ?? "unknown";
    const baseCatalog = compileTimelineCatalog([
      ...STATIC_TIMELINE_CATALOG.sets,
      ...normalizedSets,
    ]);
    const issues = getTimelineSetDocumentIssues(document, baseCatalog);
    const errors = issues.filter((issue) => issue.severity === "error");

    if (errors.length > 0) {
      validationStatuses.push({
        setId,
        valid: false,
        issues: errors.map((issue) => issue.message),
      });
      continue;
    }

    try {
      normalizedSets.push(normalizeTimelineSetDocument(document));
      acceptedDocuments.push(document);
      validationStatuses.push({ setId, valid: true, issues: [] });
    } catch (error) {
      validationStatuses.push({
        setId,
        valid: false,
        issues: [
          error instanceof Error ? error.message : "Invalid custom set document.",
        ],
      });
    }
  }

  return {
    documents: acceptedDocuments,
    drafts,
    normalizedSets,
    validationStatuses,
    lastSavedAt,
  };
}

function persistNext(
  documents: TimelineRawSetDocument[],
  drafts: Record<string, TimelineRawSetDocument>,
) {
  const lastSavedAt = new Date().toISOString();

  writeEnvelope({
    version: 1,
    documents,
    drafts,
    lastSavedAt,
  });

  return deriveState(documents, drafts, lastSavedAt);
}

function createInitialState() {
  const envelope = readEnvelope();

  return deriveState(
    envelope.documents,
    envelope.drafts,
    envelope.lastSavedAt ?? null,
  );
}

export const useCustomSetCatalogStore = create<CustomSetCatalogStore>(
  (set, get) => ({
    ...createInitialState(),

    deleteCustomSet: (setId) => {
      const current = get();
      const documents = current.documents.filter(
        (document) => document.metadata.id !== setId,
      );
      const { [`edit:${setId}`]: _removedDraft, ...drafts } = current.drafts;

      void _removedDraft;
      set(persistNext(documents, drafts));
    },

    deleteDraft: (draftId) => {
      const current = get();
      const { [draftId]: _removed, ...drafts } = current.drafts;

      void _removed;
      set(persistNext(current.documents, drafts));
    },

    publishDocument: (document) => {
      const current = get();
      const otherDocuments = current.documents.filter(
        (candidate) => candidate.metadata.id !== document.metadata.id,
      );
      const baseCatalog = compileTimelineCatalog([
        ...STATIC_TIMELINE_CATALOG.sets,
        ...otherDocuments.map(normalizeTimelineSetDocument),
      ]);
      const hasErrors = getTimelineSetDocumentIssues(document, baseCatalog).some(
        (issue) => issue.severity === "error",
      );

      if (hasErrors) {
        return false;
      }

      set(persistNext([...otherDocuments, document], current.drafts));
      return true;
    },

    saveDraft: (draftId, document) => {
      const current = get();

      set(
        persistNext(current.documents, {
          ...current.drafts,
          [draftId]: document,
        }),
      );
    },
  }),
);
