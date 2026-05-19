import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";
import { TimelineCanvasPreview } from "@/features/timeline-viewer/canvas/preview/TimelineCanvasPreview";
import { cn } from "@/lib/utils";
import { SetBuilderRawJsonEditor } from "./preview/SetBuilderRawJsonEditor";
import { useSetBuilderPreviewModel } from "./preview/useSetBuilderPreviewModel";

type SetBuilderPreviewPaneProps = {
  document: TimelineRawSetDocument;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
};

type PreviewMode = "canvas" | "raw";

const PREVIEW_MODES = [
  { label: "Preview", value: "canvas" },
  { label: "Raw", value: "raw" },
] as const satisfies readonly { label: string; value: PreviewMode }[];

export function SetBuilderPreviewPane({
  document,
  onDocumentChange,
}: SetBuilderPreviewPaneProps) {
  const model = useSetBuilderPreviewModel(document);
  const [mode, setMode] = useState<PreviewMode>("canvas");
  const [isRawDirty, setIsRawDirty] = useState(false);
  const [isUnsavedWarningOpen, setIsUnsavedWarningOpen] = useState(false);

  const selectMode = (nextMode: PreviewMode) => {
    if (mode === "raw" && nextMode !== "raw" && isRawDirty) {
      setIsUnsavedWarningOpen(true);
      return;
    }

    setIsUnsavedWarningOpen(false);
    setMode(nextMode);
  };

  const content = (() => {
    if (mode === "raw") {
      return (
        <SetBuilderRawJsonEditor
          document={document}
          onDirtyChange={setIsRawDirty}
          onDocumentChange={onDocumentChange}
        />
      );
    }

    if (model.error) {
      return (
        <div className="grid h-full min-h-0 w-full place-items-center px-6 py-8 text-center">
          <div className="grid gap-2">
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Preview unavailable
            </span>
            <p className="m-0 text-sm text-muted-foreground">{model.error}</p>
          </div>
        </div>
      );
    }

    return (
      <TimelineCanvasPreview
        eras={model.eras}
        initialRange={model.range}
        markers={model.markers}
        overlayBands={model.overlayBands}
      />
    );
  })();

  return (
    <section className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] border-l border-border/70">
      <header className="flex min-w-0 items-center gap-3 border-b border-border/70 bg-card/80 px-3 py-2">
        <div className="grid gap-2">
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Builder output
          </span>
        </div>
        <Popover
          onOpenChange={setIsUnsavedWarningOpen}
          open={isUnsavedWarningOpen}
        >
          <PopoverAnchor asChild>
            <div
              aria-label="Builder output mode"
              className="relative ml-auto grid h-8 shrink-0 grid-cols-2 overflow-hidden rounded-full border border-border/70 bg-background/45 p-0.5 shadow-inner"
              role="group"
            >
              <span
                className={cn(
                  "pointer-events-none absolute bottom-0.5 left-0.5 top-0.5 w-[calc(50%-0.125rem)] rounded-full border border-border/60 bg-card shadow-sm transition-transform duration-300 ease-out",
                  mode === "raw" && "translate-x-full",
                )}
              />
              {PREVIEW_MODES.map((item) => {
                const isSelected = mode === item.value;

                return (
                  <Button
                    aria-pressed={isSelected}
                    className={cn(
                      "relative z-10 h-7 rounded-full border-transparent bg-transparent px-4 text-[0.68rem] transition-colors duration-200 hover:bg-transparent",
                      isSelected
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                    key={item.value}
                    onClick={() => selectMode(item.value)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </PopoverAnchor>
          <PopoverContent align="end" className="w-64 p-3">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <p className="m-0 text-sm font-semibold text-primary">
                  Unsaved changes
                </p>
                <p className="m-0 text-xs leading-relaxed text-muted-foreground">
                  Apply or discard your raw edits before switching views.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setIsUnsavedWarningOpen(false)}
                  size="pill"
                  type="button"
                  variant="ghost"
                >
                  Stay
                </Button>
                <Button
                  onClick={() => {
                    setIsRawDirty(false);
                    setIsUnsavedWarningOpen(false);
                    setMode("canvas");
                  }}
                  size="pill"
                  type="button"
                  variant="subtle"
                >
                  Discard
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </header>
      <div className="min-h-0">{content}</div>
    </section>
  );
}
