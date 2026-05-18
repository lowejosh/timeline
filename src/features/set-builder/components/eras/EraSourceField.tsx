import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { slugifyTimelineSetId } from "@/lib/catalog/setDocumentValidation";
import type {
  TimelineRawEraNode,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";
import { updateEraNodeInDocument } from "../../utils/eraTree";

type EraSourceFieldProps = {
  document: TimelineRawSetDocument;
  era: TimelineRawEraNode;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
  onEraChange: (era: TimelineRawEraNode) => void;
};

type SourceDraft = {
  citation: string;
  organization: string;
  title: string;
  url: string;
};

const EMPTY_SOURCE_DRAFT: SourceDraft = {
  citation: "",
  organization: "",
  title: "",
  url: "",
};

function createUniqueSourceId(
  document: TimelineRawSetDocument,
  title: string,
) {
  const baseId = `${document.metadata.id}-${slugifyTimelineSetId(title || "source")}`;
  let candidate = baseId;
  let index = 2;

  while (document.sources[candidate]) {
    candidate = `${baseId}-${index}`;
    index += 1;
  }

  return candidate;
}

export function EraSourceField({
  document,
  era,
  onDocumentChange,
  onEraChange,
}: EraSourceFieldProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<SourceDraft>(EMPTY_SOURCE_DRAFT);
  const sourceIds = era.sourceIds ?? [];

  const updateDraft = (key: keyof SourceDraft, value: string) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const removeSource = (sourceId: string) => {
    onEraChange({
      ...era,
      sourceIds: sourceIds.filter((id) => id !== sourceId),
    });
  };

  const addSource = () => {
    const title = draft.title.trim();

    if (!title) {
      return;
    }

    const sourceId = createUniqueSourceId(document, title);

    const documentWithSource = {
      ...document,
      sources: {
        ...document.sources,
        [sourceId]: {
          shortTitle: title,
          title,
          organization: draft.organization.trim() || "Custom source",
          citation: draft.citation.trim() || title,
          url: draft.url.trim() || undefined,
        },
      },
    };

    onDocumentChange(
      updateEraNodeInDocument(documentWithSource, era.id, () => ({
        ...era,
        sourceIds: [...sourceIds, sourceId],
      })),
    );
    setDraft(EMPTY_SOURCE_DRAFT);
    setIsAdding(false);
  };

  return (
    <div className="grid gap-2">
      <span className="text-[0.76rem] font-semibold text-foreground">
        Sources
      </span>

      {sourceIds.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {sourceIds.map((sourceId) => {
            const source = document.sources[sourceId];

            return (
              <span
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border/70 bg-muted px-2.5 text-[0.7rem] font-semibold text-muted-foreground"
                key={sourceId}
              >
                {source?.shortTitle ?? sourceId}
                <button
                  aria-label={`Remove ${source?.shortTitle ?? sourceId}`}
                  className="grid size-4 cursor-pointer place-items-center rounded-full transition-colors hover:bg-background/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onClick={() => removeSource(sourceId)}
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}

      <Collapsible onOpenChange={setIsAdding} open={isAdding}>
        <CollapsibleTrigger asChild>
          <button
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-0 py-1 text-[0.76rem] font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            type="button"
          >
            <Plus className="size-3.5" />
            Add source
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 grid gap-3 rounded-md border border-border/70 bg-surface/25 p-3">
            <Field htmlFor={`${era.id}-source-title`} label="Title" required>
              <Input
                className="h-9 rounded-md bg-background/70"
                id={`${era.id}-source-title`}
                onChange={(event) => updateDraft("title", event.target.value)}
                value={draft.title}
              />
            </Field>
            <Field
              htmlFor={`${era.id}-source-organization`}
              label="Organization"
            >
              <Input
                className="h-9 rounded-md bg-background/70"
                id={`${era.id}-source-organization`}
                onChange={(event) =>
                  updateDraft("organization", event.target.value)
                }
                value={draft.organization}
              />
            </Field>
            <Field htmlFor={`${era.id}-source-url`} label="URL">
              <Input
                className="h-9 rounded-md bg-background/70"
                id={`${era.id}-source-url`}
                onChange={(event) => updateDraft("url", event.target.value)}
                value={draft.url}
              />
            </Field>
            <Field htmlFor={`${era.id}-source-citation`} label="Citation">
              <Textarea
                className="min-h-20 bg-background/70"
                id={`${era.id}-source-citation`}
                onChange={(event) =>
                  updateDraft("citation", event.target.value)
                }
                value={draft.citation}
              />
            </Field>
            <div className="flex justify-end">
              <Button
                disabled={!draft.title.trim()}
                onClick={addSource}
                size="pill"
                type="button"
                variant="subtle"
              >
                Add
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
