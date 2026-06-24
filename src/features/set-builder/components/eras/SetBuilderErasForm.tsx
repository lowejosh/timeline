import { Plus } from "lucide-react";
import { useState } from "react";

import type {
  TimelineRawEraNode,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";
import {
  addEraChildToDocument,
  createEraNode,
  removeEraFromDocument,
  updateEraNodeInDocument,
} from "../../utils/eraTree";
import { EraAccordionItem } from "./EraAccordionItem";

type SetBuilderErasFormProps = {
  document: TimelineRawSetDocument;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
};

export function SetBuilderErasForm({
  document,
  onDocumentChange,
}: SetBuilderErasFormProps) {
  const [openEraId, setOpenEraId] = useState<string | null>(null);
  const family = document.families[0];
  const root = family?.root;
  const eras = root?.children ?? [];

  const addEra = (parentId = root?.id) => {
    if (!family || !parentId) {
      return;
    }

    const nextEra = createEraNode(document);

    setOpenEraId(nextEra.id);
    onDocumentChange(addEraChildToDocument(document, family.id, parentId, nextEra));
  };

  const updateEra = (eraId: string, nextEra: TimelineRawEraNode) => {
    onDocumentChange(updateEraNodeInDocument(document, eraId, () => nextEra));
  };

  const deleteEra = (eraId: string) => {
    onDocumentChange(removeEraFromDocument(document, eraId));
  };

  return (
    <div className="h-full overflow-y-auto p-6 max-sm:h-auto max-sm:overflow-visible max-sm:p-3">
      <div className="grid w-full gap-4 max-sm:gap-3">
        {eras.length > 0 ? (
          <div className="grid gap-3">
            {eras.map((era) => (
              <EraAccordionItem
                depth={0}
                document={document}
                era={era}
                initiallyOpen={era.id === openEraId}
                key={era.id}
                onAddChild={addEra}
                onDelete={deleteEra}
                onDocumentChange={onDocumentChange}
                onEraChange={updateEra}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-border/70 bg-surface/20 px-6 text-center">
            <p className="m-0 max-w-sm text-sm leading-relaxed text-muted-foreground">
              No eras yet. Add an era to start building this set's timeline.
            </p>
          </div>
        )}

        <button
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-0 py-1 text-[0.8rem] font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => addEra()}
          type="button"
        >
          <Plus className="size-3.5" />
          Add era
        </button>
      </div>
    </div>
  );
}
