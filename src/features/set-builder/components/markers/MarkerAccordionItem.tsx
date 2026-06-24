import { ChevronDown, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import type {
  TimelineRawMarker,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";
import { cn } from "@/lib/utils";
import { DEFAULT_MARKER_COLOR } from "../../SetBuilder.constants";
import { updateMarkerInDocument } from "../../utils/markerList";
import { formatTimelinePoint } from "../../utils/formatTimelinePoint";
import { ImageAttachmentField } from "../fields/ImageAttachmentField";
import { SourceAttachmentField } from "../fields/SourceAttachmentField";
import { TimePointField } from "../fields/TimePointField";

type MarkerAccordionItemProps = {
  document: TimelineRawSetDocument;
  initiallyOpen?: boolean;
  marker: TimelineRawMarker;
  onDelete: (markerId: string) => void;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
  onMarkerChange: (markerId: string, marker: TimelineRawMarker) => void;
};

export function MarkerAccordionItem({
  document,
  initiallyOpen = false,
  marker,
  onDelete,
  onDocumentChange,
  onMarkerChange,
}: MarkerAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <div className="overflow-hidden rounded-md border border-border/70 bg-surface/25">
        <div className="flex min-h-12 items-center gap-2 border-b border-border/60 bg-surface/35 px-3 max-sm:min-h-11 max-sm:px-2">
          <CollapsibleTrigger asChild>
            <button
              aria-label={isOpen ? "Collapse marker" : "Expand marker"}
              className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface/70 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              type="button"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  !isOpen && "-rotate-90",
                )}
              />
            </button>
          </CollapsibleTrigger>
          <div className="min-w-0 flex-1">
            <p className="m-0 flex min-w-0 items-baseline gap-2 text-sm font-semibold text-primary">
              <span className="truncate">{marker.label || "Untitled marker"}</span>
              <span className="shrink-0 text-[0.72rem] font-semibold text-muted-foreground">
                {formatTimelinePoint(marker.year)}
              </span>
            </p>
            {marker.regionalScopeLabel ? (
              <p className="m-0 truncate text-[0.72rem] text-muted-foreground">
                {marker.regionalScopeLabel}
              </p>
            ) : null}
          </div>
          <Button
            onClick={() => onDelete(marker.id)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        <CollapsibleContent>
          <div className="grid gap-5 p-4 max-sm:gap-4 max-sm:p-3">
            <Field htmlFor={`${marker.id}-label`} label="Label" required>
              <Input
                className="h-10 rounded-md bg-background/70"
                id={`${marker.id}-label`}
                onChange={(event) =>
                  onMarkerChange(marker.id, {
                    ...marker,
                    label: event.target.value,
                  })
                }
                value={marker.label}
              />
            </Field>

            <Field htmlFor={`${marker.id}-subtitle`} label="Subtitle">
              <Input
                className="h-10 rounded-md bg-background/70"
                id={`${marker.id}-subtitle`}
                onChange={(event) =>
                  onMarkerChange(marker.id, {
                    ...marker,
                    regionalScopeLabel: event.target.value || undefined,
                  })
                }
                placeholder="Example: Eastern Mediterranean"
                value={marker.regionalScopeLabel ?? ""}
              />
            </Field>

            <TimePointField
              approximate={marker.approximate}
              exactTime={marker.exactTime}
              id={`${marker.id}-year`}
              label="Date"
              onChange={(next) =>
                onMarkerChange(marker.id, {
                  ...marker,
                  approximate: next.approximate,
                  exactTime: next.exactTime,
                  year: next.value,
                })
              }
              required
              value={marker.year}
            />

            <Field htmlFor={`${marker.id}-color`} label="Color">
              <ColorPicker
                id={`${marker.id}-color`}
                onChange={(color) =>
                  onMarkerChange(marker.id, {
                    ...marker,
                    color,
                  })
                }
                value={marker.color ?? DEFAULT_MARKER_COLOR}
              />
            </Field>

            <Field htmlFor={`${marker.id}-description`} label="Description">
              <Textarea
                className="bg-background/70"
                id={`${marker.id}-description`}
                onChange={(event) =>
                  onMarkerChange(marker.id, {
                    ...marker,
                    description: event.target.value,
                  })
                }
                value={marker.description ?? ""}
              />
            </Field>

            <SourceAttachmentField
              document={document}
              onChange={({ document: nextDocument, sourceIds }) => {
                onDocumentChange(
                  updateMarkerInDocument(nextDocument, marker.id, () => ({
                    ...marker,
                    sourceIds,
                  })),
                );
              }}
              ownerId={marker.id}
              sourceIds={marker.sourceIds ?? []}
            />

            <ImageAttachmentField
              id={marker.id}
              image={marker.image}
              onImageChange={(image) =>
                onMarkerChange(marker.id, {
                  ...marker,
                  image,
                })
              }
            />

            <div className="flex justify-end border-t border-border/60 pt-4">
              <Button
                onClick={() => setIsOpen(false)}
                size="pill"
                type="button"
                variant="subtle"
              >
                Done
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
