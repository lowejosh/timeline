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
  TimelineRawEraNode,
  TimelineRawSetDocument,
} from "@/lib/catalog/setSchema";
import { cn } from "@/lib/utils";
import { formatTimelinePoint } from "../../utils/formatTimelinePoint";
import { updateEraNodeInDocument } from "../../utils/eraTree";
import { ImageAttachmentField } from "../fields/ImageAttachmentField";
import { SourceAttachmentField } from "../fields/SourceAttachmentField";
import { TimePointField } from "../fields/TimePointField";

type EraAccordionItemProps = {
  depth: number;
  document: TimelineRawSetDocument;
  era: TimelineRawEraNode;
  initiallyOpen?: boolean;
  onAddChild: (parentId: string) => void;
  onDelete: (eraId: string) => void;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
  onEraChange: (eraId: string, era: TimelineRawEraNode) => void;
};

export function EraAccordionItem({
  depth,
  document,
  era,
  initiallyOpen = false,
  onAddChild,
  onDelete,
  onDocumentChange,
  onEraChange,
}: EraAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const childEras = era.children ?? [];
  const rangeLabel = `${formatTimelinePoint(era.startYear)} - ${formatTimelinePoint(
    era.endYear,
  )}`;

  return (
    <div
      className={cn(
        "grid gap-3",
        depth > 0 && "border-l border-border/70 pl-4 max-sm:pl-3",
      )}
    >
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <div className="overflow-hidden rounded-md border border-border/70 bg-surface/25">
          <div className="flex min-h-12 items-center gap-2 border-b border-border/60 bg-surface/35 px-3 max-sm:min-h-11 max-sm:px-2">
            <CollapsibleTrigger asChild>
              <button
                aria-label={isOpen ? "Collapse era" : "Expand era"}
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
                <span className="truncate">{era.name || "Untitled era"}</span>
                <span className="shrink-0 text-[0.72rem] font-semibold text-muted-foreground">
                  {rangeLabel}
                </span>
              </p>
              {era.regionalScopeLabel ? (
                <p className="m-0 truncate text-[0.72rem] text-muted-foreground">
                  {era.regionalScopeLabel}
                </p>
              ) : null}
            </div>
            <Button
              onClick={() => onDelete(era.id)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          <CollapsibleContent>
            <div className="grid gap-5 p-4 max-sm:gap-4 max-sm:p-3">
              <Field htmlFor={`${era.id}-name`} label="Name" required>
                <Input
                  className="h-10 rounded-md bg-background/70"
                  id={`${era.id}-name`}
                  onChange={(event) =>
                    onEraChange(era.id, {
                      ...era,
                      name: event.target.value,
                    })
                  }
                  value={era.name}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 max-sm:gap-3">
                <Field
                  htmlFor={`${era.id}-alternate-name`}
                  label="Alternate name"
                >
                  <Input
                    className="h-10 rounded-md bg-background/70"
                    id={`${era.id}-alternate-name`}
                    onChange={(event) =>
                      onEraChange(era.id, {
                        ...era,
                        alternateName: event.target.value || undefined,
                      })
                    }
                    value={era.alternateName ?? ""}
                  />
                </Field>
                <Field htmlFor={`${era.id}-subtitle`} label="Subtitle">
                  <Input
                    className="h-10 rounded-md bg-background/70"
                    id={`${era.id}-subtitle`}
                    onChange={(event) =>
                      onEraChange(era.id, {
                        ...era,
                        regionalScopeLabel: event.target.value || undefined,
                      })
                    }
                    placeholder="Example: Eastern Mediterranean"
                    value={era.regionalScopeLabel ?? ""}
                  />
                </Field>
              </div>

              <div className="flex items-stretch gap-4 max-sm:flex-col max-sm:gap-3">
                <div className="flex min-w-0 flex-1">
                  <TimePointField
                    approximate={era.approximateStart}
                    exactTime={era.exactStartTime}
                    id={`${era.id}-start`}
                    label="Start"
                    onChange={(next) =>
                      onEraChange(era.id, {
                        ...era,
                        approximateStart: next.approximate,
                        exactStartTime: next.exactTime,
                        startYear: next.value,
                      })
                    }
                    required
                    value={era.startYear}
                  />
                </div>
                <div className="flex min-w-0 flex-1">
                  <TimePointField
                    approximate={era.approximateEnd}
                    exactTime={era.exactEndTime}
                    id={`${era.id}-end`}
                    label="End"
                    onChange={(next) =>
                      onEraChange(era.id, {
                        ...era,
                        approximateEnd: next.approximate,
                        exactEndTime: next.exactTime,
                        endYear: next.value,
                      })
                    }
                    required
                    value={era.endYear}
                  />
                </div>
              </div>

              <Field htmlFor={`${era.id}-color`} label="Color">
                <ColorPicker
                  id={`${era.id}-color`}
                  onChange={(color) =>
                    onEraChange(era.id, {
                      ...era,
                      color,
                    })
                  }
                  value={era.color ?? "#4f8a8b"}
                />
              </Field>

              <Field htmlFor={`${era.id}-description`} label="Description">
                <Textarea
                  className="bg-background/70"
                  id={`${era.id}-description`}
                  onChange={(event) =>
                    onEraChange(era.id, {
                      ...era,
                      description: event.target.value,
                    })
                  }
                  value={era.description ?? ""}
                />
              </Field>

              <SourceAttachmentField
                document={document}
                onChange={({ document: nextDocument, sourceIds }) => {
                  onDocumentChange(
                    updateEraNodeInDocument(nextDocument, era.id, () => ({
                      ...era,
                      sourceIds,
                    })),
                  );
                }}
                ownerId={era.id}
                sourceIds={era.sourceIds ?? []}
              />

              <ImageAttachmentField
                id={era.id}
                image={era.image}
                onImageChange={(image) =>
                  onEraChange(era.id, {
                    ...era,
                    image,
                  })
                }
              />

              <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                <button
                  className="inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-0 text-[0.76rem] font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onClick={() => onAddChild(era.id)}
                  type="button"
                >
                  <Plus className="size-3.5" />
                  Add sub-era
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

      {childEras.length > 0 ? (
        <div className="grid gap-3">
            {childEras.map((child) => (
              <EraAccordionItem
                depth={depth + 1}
                document={document}
                era={child}
                initiallyOpen={initiallyOpen}
                key={child.id}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onDocumentChange={onDocumentChange}
              onEraChange={onEraChange}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
