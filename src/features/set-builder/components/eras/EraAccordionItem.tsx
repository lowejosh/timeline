import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { TimePointField } from "../fields/TimePointField";
import { EraSourceField } from "./EraSourceField";

type EraAccordionItemProps = {
  depth: number;
  document: TimelineRawSetDocument;
  era: TimelineRawEraNode;
  onAddChild: (parentId: string) => void;
  onDelete: (eraId: string) => void;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
  onEraChange: (eraId: string, era: TimelineRawEraNode) => void;
};

export function EraAccordionItem({
  depth,
  document,
  era,
  onAddChild,
  onDelete,
  onDocumentChange,
  onEraChange,
}: EraAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const childEras = era.children ?? [];

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
                aria-label={isOpen ? "Collapse era" : "Expand era"}
                className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              <p className="m-0 truncate text-sm font-semibold text-foreground">
                {era.name || "Untitled era"}
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
            <div className="grid gap-5 p-4">
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

              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <Field htmlFor={`${era.id}-alternate-name`} label="Alternate name">
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
                <Field
                  description="Stored as regionalScopeLabel for now."
                  htmlFor={`${era.id}-subtitle`}
                  label="Subtitle"
                >
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

              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
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

              <EraSourceField
                document={document}
                era={era}
                onDocumentChange={onDocumentChange}
                onEraChange={(nextEra) => onEraChange(era.id, nextEra)}
              />

              <label className="inline-flex w-fit items-center gap-2 text-[0.76rem] font-semibold text-muted-foreground">
                <Checkbox
                  checked={Boolean(era.isFamilyRoot)}
                  onChange={(event) =>
                    onEraChange(era.id, {
                      ...era,
                      isFamilyRoot: event.target.checked || undefined,
                    })
                  }
                />
                Treat as family root
              </label>

              <button
                className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-0 py-1 text-[0.76rem] font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={() => onAddChild(era.id)}
                type="button"
              >
                <Plus className="size-3.5" />
                Add sub-era
              </button>
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
