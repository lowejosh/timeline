import { Plus } from "lucide-react";

import type {
  TimelineRawMarker,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";
import {
  addMarkerToDocument,
  createMarker,
  removeMarkerFromDocument,
  updateMarkerInDocument,
} from "../../utils/markerList";
import { MarkerAccordionItem } from "./MarkerAccordionItem";

type SetBuilderMarkersFormProps = {
  document: TimelineRawSetDocument;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
};

export function SetBuilderMarkersForm({
  document,
  onDocumentChange,
}: SetBuilderMarkersFormProps) {
  const markers = document.markers;

  const addMarker = () => {
    onDocumentChange(addMarkerToDocument(document, createMarker(document)));
  };

  const updateMarker = (markerId: string, nextMarker: TimelineRawMarker) => {
    onDocumentChange(
      updateMarkerInDocument(document, markerId, () => nextMarker),
    );
  };

  const deleteMarker = (markerId: string) => {
    onDocumentChange(removeMarkerFromDocument(document, markerId));
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid w-full gap-4">
        {markers.length > 0 ? (
          <div className="grid gap-3">
            {markers.map((marker) => (
              <MarkerAccordionItem
                document={document}
                key={marker.id}
                marker={marker}
                onDelete={deleteMarker}
                onDocumentChange={onDocumentChange}
                onMarkerChange={updateMarker}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-border/70 bg-surface/20 px-6 text-center">
            <p className="m-0 max-w-sm text-sm leading-relaxed text-muted-foreground">
              No markers yet. Add a marker to place a dated event on this set.
            </p>
          </div>
        )}

        <button
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-0 py-1 text-[0.8rem] font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={addMarker}
          type="button"
        >
          <Plus className="size-3.5" />
          Add marker
        </button>
      </div>
    </div>
  );
}
