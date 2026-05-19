import { Plus } from "lucide-react";
import { useState } from "react";

import type {
  TimelineRawOverlay,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";
import {
  addBandChildToDocument,
  addBandToDocument,
  createBand,
  removeBandFromDocument,
  updateBandInDocument,
} from "../../utils/bandTree";
import { BandAccordionItem } from "./BandAccordionItem";

type SetBuilderBandsFormProps = {
  document: TimelineRawSetDocument;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
};

export function SetBuilderBandsForm({
  document,
  onDocumentChange,
}: SetBuilderBandsFormProps) {
  const [openBandId, setOpenBandId] = useState<string | null>(null);
  const bands = document.overlays;

  const addBand = () => {
    const nextBand = createBand(document);

    setOpenBandId(nextBand.id);
    onDocumentChange(addBandToDocument(document, nextBand));
  };

  const addSubBand = (parentId: string) => {
    const nextBand = createBand(document);

    setOpenBandId(nextBand.id);
    onDocumentChange(addBandChildToDocument(document, parentId, nextBand));
  };

  const updateBand = (bandId: string, nextBand: TimelineRawOverlay) => {
    onDocumentChange(updateBandInDocument(document, bandId, () => nextBand));
  };

  const deleteBand = (bandId: string) => {
    onDocumentChange(removeBandFromDocument(document, bandId));
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid w-full gap-4">
        {bands.length > 0 ? (
          <div className="grid gap-3">
            {bands.map((band) => (
              <BandAccordionItem
                band={band}
                depth={0}
                document={document}
                initiallyOpen={band.id === openBandId}
                key={band.id}
                onAddChild={addSubBand}
                onBandChange={updateBand}
                onDelete={deleteBand}
                onDocumentChange={onDocumentChange}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-border/70 bg-surface/20 px-6 text-center">
            <p className="m-0 max-w-sm text-sm leading-relaxed text-muted-foreground">
              No context bands yet. Add a band to show a span or background
              context in this set.
            </p>
          </div>
        )}

        <button
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-0 py-1 text-[0.8rem] font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={addBand}
          type="button"
        >
          <Plus className="size-3.5" />
          Add band
        </button>
      </div>
    </div>
  );
}
