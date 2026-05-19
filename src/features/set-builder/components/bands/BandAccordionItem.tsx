import { ChevronDown, Plus, Trash2 } from "lucide-react";
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
  TimelineRawOverlay,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";
import { cn } from "@/lib/utils";
import { updateBandInDocument } from "../../utils/bandTree";
import { formatTimelinePoint } from "../../utils/formatTimelinePoint";
import { ImageAttachmentField } from "../fields/ImageAttachmentField";
import { SourceAttachmentField } from "../fields/SourceAttachmentField";
import { TimePointField } from "../fields/TimePointField";

type BandAccordionItemProps = {
  band: TimelineRawOverlay;
  depth: number;
  document: TimelineRawSetDocument;
  initiallyOpen?: boolean;
  onAddChild: (parentId: string) => void;
  onBandChange: (bandId: string, band: TimelineRawOverlay) => void;
  onDelete: (bandId: string) => void;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
};

export function BandAccordionItem({
  band,
  depth,
  document,
  initiallyOpen = false,
  onAddChild,
  onBandChange,
  onDelete,
  onDocumentChange,
}: BandAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const childBands = band.children ?? [];
  const rangeLabel = `${formatTimelinePoint(band.startYear)} - ${formatTimelinePoint(
    band.endYear,
  )}`;

  return (
    <div
      className={cn(
        "grid gap-3",
        depth > 0 && "border-l border-border/70 pl-4",
      )}
    >
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <div className="overflow-hidden rounded-md border border-border/70 bg-surface/25">
          <div className="flex min-h-12 items-center gap-2 border-b border-border/60 bg-surface/35 px-3">
            <CollapsibleTrigger asChild>
              <button
                aria-label={isOpen ? "Collapse band" : "Expand band"}
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
                <span className="truncate">{band.label || "Untitled band"}</span>
                <span className="shrink-0 text-[0.72rem] font-semibold text-muted-foreground">
                  {rangeLabel}
                </span>
              </p>
              {band.regionalScopeLabel ? (
                <p className="m-0 truncate text-[0.72rem] text-muted-foreground">
                  {band.regionalScopeLabel}
                </p>
              ) : null}
            </div>
            <Button
              onClick={() => onDelete(band.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          <CollapsibleContent>
            <div className="grid gap-5 p-4">
              <Field htmlFor={`${band.id}-label`} label="Label" required>
                <Input
                  className="h-10 rounded-md bg-background/70"
                  id={`${band.id}-label`}
                  onChange={(event) =>
                    onBandChange(band.id, {
                      ...band,
                      label: event.target.value,
                    })
                  }
                  value={band.label}
                />
              </Field>

              <Field htmlFor={`${band.id}-subtitle`} label="Subtitle">
                <Input
                  className="h-10 rounded-md bg-background/70"
                  id={`${band.id}-subtitle`}
                  onChange={(event) =>
                    onBandChange(band.id, {
                      ...band,
                      regionalScopeLabel: event.target.value || undefined,
                    })
                  }
                  placeholder="Example: Eastern Mediterranean"
                  value={band.regionalScopeLabel ?? ""}
                />
              </Field>

              <div className="flex items-stretch gap-4 max-sm:flex-col">
                <div className="flex min-w-0 flex-1">
                  <TimePointField
                    approximate={band.approximateStart}
                    exactTime={band.exactStartTime}
                    id={`${band.id}-start`}
                    label="Start"
                    onChange={(next) =>
                      onBandChange(band.id, {
                        ...band,
                        approximateStart: next.approximate,
                        exactStartTime: next.exactTime,
                        startYear: next.value,
                      })
                    }
                    required
                    value={band.startYear}
                  />
                </div>
                <div className="flex min-w-0 flex-1">
                  <TimePointField
                    approximate={band.approximateEnd}
                    exactTime={band.exactEndTime}
                    id={`${band.id}-end`}
                    label="End"
                    onChange={(next) =>
                      onBandChange(band.id, {
                        ...band,
                        approximateEnd: next.approximate,
                        exactEndTime: next.exactTime,
                        endYear: next.value,
                      })
                    }
                    required
                    value={band.endYear}
                  />
                </div>
              </div>

              <Field htmlFor={`${band.id}-color`} label="Color" required>
                <ColorPicker
                  id={`${band.id}-color`}
                  onChange={(color) =>
                    onBandChange(band.id, {
                      ...band,
                      color,
                    })
                  }
                  value={band.color}
                />
              </Field>

              <Field htmlFor={`${band.id}-description`} label="Description">
                <Textarea
                  className="bg-background/70"
                  id={`${band.id}-description`}
                  onChange={(event) =>
                    onBandChange(band.id, {
                      ...band,
                      description: event.target.value,
                    })
                  }
                  value={band.description ?? ""}
                />
              </Field>

              <SourceAttachmentField
                document={document}
                onChange={({ document: nextDocument, sourceIds }) => {
                  onDocumentChange(
                    updateBandInDocument(nextDocument, band.id, () => ({
                      ...band,
                      sourceIds,
                    })),
                  );
                }}
                ownerId={band.id}
                sourceIds={band.sourceIds ?? []}
              />

              <ImageAttachmentField
                id={band.id}
                image={band.image}
                onImageChange={(image) =>
                  onBandChange(band.id, {
                    ...band,
                    image,
                  })
                }
              />

              <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                <button
                  className="inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-0 text-[0.76rem] font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onClick={() => onAddChild(band.id)}
                  type="button"
                >
                  <Plus className="size-3.5" />
                  Add sub-band
                </button>
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

      {childBands.length > 0 ? (
        <div className="grid gap-3">
          {childBands.map((child) => (
            <BandAccordionItem
              band={child}
              depth={depth + 1}
              document={document}
              initiallyOpen={initiallyOpen}
              key={child.id}
              onAddChild={onAddChild}
              onBandChange={onBandChange}
              onDelete={onDelete}
              onDocumentChange={onDocumentChange}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
