import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field } from "@/components/ui/field";
import { Input, NumberInput } from "@/components/ui/input";
import type { TimelineTooltipImage } from "@/lib/core/timelineTypes";

type ImageAttachmentFieldProps = {
  id: string;
  image?: TimelineTooltipImage;
  onImageChange: (image: TimelineTooltipImage | undefined) => void;
};

type ImageDraft = {
  alt: string;
  credit: string;
  height: number;
  src: string;
  width: number;
};

const EMPTY_IMAGE_DRAFT: ImageDraft = {
  alt: "",
  credit: "",
  height: 800,
  src: "",
  width: 1200,
};

function getDraftFromImage(image?: TimelineTooltipImage): ImageDraft {
  return image
    ? {
        alt: image.alt,
        credit: image.credit ?? "",
        height: image.height,
        src: image.src,
        width: image.width,
      }
    : EMPTY_IMAGE_DRAFT;
}

export function ImageAttachmentField({
  id,
  image,
  onImageChange,
}: ImageAttachmentFieldProps) {
  const [isEditing, setIsEditing] = useState(Boolean(image));
  const [draft, setDraft] = useState<ImageDraft>(() => getDraftFromImage(image));

  useEffect(() => {
    setDraft(getDraftFromImage(image));
  }, [image]);

  const updateDraft = <TKey extends keyof ImageDraft>(
    key: TKey,
    value: ImageDraft[TKey],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveImage = () => {
    const src = draft.src.trim();

    if (!src) {
      return;
    }

    onImageChange({
      alt: draft.alt.trim() || "Timeline image",
      credit: draft.credit.trim() || undefined,
      height: Math.max(1, Math.trunc(draft.height)),
      src,
      width: Math.max(1, Math.trunc(draft.width)),
    });
    setIsEditing(false);
  };

  const removeImage = () => {
    onImageChange(undefined);
    setDraft(EMPTY_IMAGE_DRAFT);
    setIsEditing(false);
  };

  return (
    <div className="grid gap-2">
      <span className="text-[0.76rem] font-semibold text-primary">Image</span>

      {image ? (
        <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-border/70 bg-muted px-3 py-2">
          <span className="min-w-0 truncate text-[0.72rem] font-semibold text-muted-foreground">
            {image.alt || image.src}
          </span>
          <button
            aria-label="Remove image"
            className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={removeImage}
            type="button"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      <Collapsible onOpenChange={setIsEditing} open={isEditing}>
        <CollapsibleTrigger asChild>
          <button
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-0 py-1 text-[0.76rem] font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            type="button"
          >
            <ImagePlus className="size-3.5" />
            {image ? "Edit image" : "Add image"}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 grid gap-3 rounded-md border border-border/70 bg-surface/25 p-3">
            <Field htmlFor={`${id}-image-src`} label="Image URL" required>
              <Input
                className="h-9 rounded-md bg-background/70"
                id={`${id}-image-src`}
                onChange={(event) => updateDraft("src", event.target.value)}
                value={draft.src}
              />
            </Field>
            <Field htmlFor={`${id}-image-alt`} label="Alt text">
              <Input
                className="h-9 rounded-md bg-background/70"
                id={`${id}-image-alt`}
                onChange={(event) => updateDraft("alt", event.target.value)}
                value={draft.alt}
              />
            </Field>
            <Field htmlFor={`${id}-image-credit`} label="Credit">
              <Input
                className="h-9 rounded-md bg-background/70"
                id={`${id}-image-credit`}
                onChange={(event) => updateDraft("credit", event.target.value)}
                value={draft.credit}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field htmlFor={`${id}-image-width`} label="Width">
                <NumberInput
                  className="h-9 rounded-md bg-background/70"
                  id={`${id}-image-width`}
                  min={1}
                  onValueChange={(value) => updateDraft("width", value)}
                  value={draft.width}
                />
              </Field>
              <Field htmlFor={`${id}-image-height`} label="Height">
                <NumberInput
                  className="h-9 rounded-md bg-background/70"
                  id={`${id}-image-height`}
                  min={1}
                  onValueChange={(value) => updateDraft("height", value)}
                  value={draft.height}
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button
                disabled={!draft.src.trim()}
                onClick={saveImage}
                size="pill"
                type="button"
                variant="subtle"
              >
                Save image
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
