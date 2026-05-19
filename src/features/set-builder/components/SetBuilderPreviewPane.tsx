import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";
import { TimelineCanvasPreview } from "@/features/timeline-viewer/canvas/preview/TimelineCanvasPreview";
import { useSetBuilderPreviewModel } from "./preview/useSetBuilderPreviewModel";

type SetBuilderPreviewPaneProps = {
  document: TimelineRawSetDocument;
};

export function SetBuilderPreviewPane({ document }: SetBuilderPreviewPaneProps) {
  const model = useSetBuilderPreviewModel(document);

  if (model.error) {
    return (
      <section className="grid h-full min-h-0 w-full place-items-center border-l border-border/70 px-6 py-8 text-center">
        <div className="grid gap-2">
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Preview unavailable
          </span>
          <p className="m-0 text-sm text-muted-foreground">{model.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full min-h-0 w-full border-l border-border/70">
      <TimelineCanvasPreview
        activeEra={model.rootEra}
        initialRange={model.range}
        markers={model.markers}
        overlayBands={model.overlayBands}
        siblingEras={model.eras}
      />
    </section>
  );
}
