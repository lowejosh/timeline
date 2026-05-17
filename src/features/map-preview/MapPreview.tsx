import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import { X } from "lucide-react";

import { formatTimelineYear } from "@/lib/rendering/bands";
import {
  getMapPreviewYearSnapshot,
  subscribeMapPreviewYear,
} from "@/lib/maps/mapPreviewStore";
import {
  MAP_WINDOW_HEADER_HEIGHT,
  MAP_WINDOW_MIN_HEIGHT,
} from "./MapPreview.const";
import { MapPreviewCanvas } from "./components/MapPreviewCanvas";
import {
  clamp,
  getDefaultMapWindowBounds,
  normalizeMapWindowBounds,
  readStoredMapWindowBounds,
  resizeMapWindowBounds,
  writeStoredMapWindowBounds,
} from "./MapPreview.utils";
import {
  getLoadingLabel,
  getMapSlice,
  getSliceKey,
  getSliceLabel,
  getSourceLabel,
  getSourceUrl,
  loadMapSlice,
} from "./MapPreview.data";
import type {
  HoveredMapFeature,
  MapWindowDragState,
  RenderedMapSlice,
  ResizeHandle,
} from "./MapPreview.types";

type MapPreviewProps = {
  onClose: () => void;
  stageHeight: number;
  stageWidth: number;
};

export const MapPreview = memo(function MapPreview({
  onClose,
  stageHeight,
  stageWidth,
}: MapPreviewProps) {
  const year = useSyncExternalStore(
    subscribeMapPreviewYear,
    getMapPreviewYearSnapshot,
    getMapPreviewYearSnapshot,
  );
  const mapSlice = useMemo(() => getMapSlice(year), [year]);
  const [renderedSlice, setRenderedSlice] = useState<RenderedMapSlice | null>(
    null,
  );
  const [failedFilename, setFailedFilename] = useState<string | null>(null);
  const [hoveredFeature, setHoveredFeature] =
    useState<HoveredMapFeature | null>(null);
  const [pendingSliceKey, setPendingSliceKey] = useState<string | null>(null);
  const dragStateRef = useRef<MapWindowDragState | null>(null);
  const [windowBounds, setWindowBounds] = useState(() =>
    normalizeMapWindowBounds(
      readStoredMapWindowBounds() ?? getDefaultMapWindowBounds(stageWidth),
      stageWidth,
      stageHeight,
    ),
  );

  useEffect(() => {
    if (!mapSlice) {
      setRenderedSlice(null);
      setPendingSliceKey(null);
      return;
    }

    let cancelled = false;
    setFailedFilename(null);
    const requestedSliceKey = getSliceKey(mapSlice);
    setPendingSliceKey(
      renderedSlice?.id === requestedSliceKey ? null : requestedSliceKey,
    );

    loadMapSlice(mapSlice)
      .then((nextSlice) => {
        if (!cancelled) {
          setRenderedSlice(nextSlice);
          setPendingSliceKey(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPendingSliceKey(null);
          setFailedFilename(mapSlice.slice.filename);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mapSlice, renderedSlice?.id]);

  useEffect(() => {
    setWindowBounds((current) =>
      normalizeMapWindowBounds(current, stageWidth, stageHeight),
    );
  }, [stageHeight, stageWidth]);

  useEffect(() => {
    writeStoredMapWindowBounds(windowBounds);
  }, [windowBounds]);

  const beginWindowDrag = (
    event: PointerEvent<HTMLElement>,
    mode: MapWindowDragState["mode"],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      bounds: windowBounds,
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  };
  const updateWindowDrag = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    setWindowBounds(
      normalizeMapWindowBounds(
        dragState.mode === "move"
          ? {
              ...dragState.bounds,
              left: dragState.bounds.left + deltaX,
              top: dragState.bounds.top + deltaY,
            }
          : resizeMapWindowBounds(
              dragState.bounds,
              dragState.mode,
              deltaX,
              deltaY,
            ),
        stageWidth,
        stageHeight,
      ),
    );
  };
  const endWindowDrag = (event: PointerEvent<HTMLElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragStateRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const renderedFeatures = renderedSlice?.features ?? [];
  const sliceLabel = getSliceLabel(mapSlice);
  const sourceLabel = getSourceLabel(mapSlice);
  const sourceUrl = getSourceUrl(mapSlice);
  const loadingLabel = getLoadingLabel(mapSlice);
  const focusYearLabel = year === null ? "" : formatTimelineYear(year, 1);
  const hasData = renderedSlice !== null && renderedFeatures.length > 0;
  const isLoadingNextSlice = pendingSliceKey !== null;
  const canvasHeight = Math.max(
    MAP_WINDOW_MIN_HEIGHT - MAP_WINDOW_HEADER_HEIGHT,
    windowBounds.height - MAP_WINDOW_HEADER_HEIGHT,
  );
  const resizeHandles: Array<{
    className: string;
    handle: ResizeHandle;
    label: string;
  }> = [
    {
      className: "left-3 right-3 top-0 h-2 cursor-ns-resize",
      handle: "n",
      label: "Resize map preview from top",
    },
    {
      className: "bottom-0 left-3 right-3 h-2 cursor-ns-resize",
      handle: "s",
      label: "Resize map preview from bottom",
    },
    {
      className: "bottom-3 left-0 top-3 w-2 cursor-ew-resize",
      handle: "w",
      label: "Resize map preview from left",
    },
    {
      className: "bottom-3 right-0 top-3 w-2 cursor-ew-resize",
      handle: "e",
      label: "Resize map preview from right",
    },
    {
      className: "left-0 top-0 h-4 w-4 cursor-nwse-resize",
      handle: "nw",
      label: "Resize map preview from top-left",
    },
    {
      className: "right-0 top-0 h-4 w-4 cursor-nesw-resize",
      handle: "ne",
      label: "Resize map preview from top-right",
    },
    {
      className: "bottom-0 left-0 h-4 w-4 cursor-nesw-resize",
      handle: "sw",
      label: "Resize map preview from bottom-left",
    },
    {
      className: "bottom-0 right-0 h-5 w-5 cursor-nwse-resize",
      handle: "se",
      label: "Resize map preview from bottom-right",
    },
  ];

  if (year === null) {
    return null;
  }

  return (
    <aside
      aria-label="Map preview"
      className="pointer-events-auto absolute z-[3] overflow-hidden rounded-md border border-border/55 bg-background/10 text-card-foreground shadow-[0_8px_22px_rgba(15,23,42,0.12)] [contain:layout_paint_style]"
      data-map-preview="true"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onTouchCancel={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      onTouchMove={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onTouchStart={(event) => event.stopPropagation()}
      style={{
        height: windowBounds.height,
        left: windowBounds.left,
        top: windowBounds.top,
        width: windowBounds.width,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 z-[2] flex h-[38px] cursor-move select-none items-center gap-2 border-b border-border/55 bg-background/70 px-3 text-card-foreground"
        onPointerCancel={endWindowDrag}
        onPointerDown={(event) => beginWindowDrag(event, "move")}
        onPointerMove={updateWindowDrag}
        onPointerUp={endWindowDrag}
      >
        <div className="flex min-w-0 flex-1 flex-col leading-none">
          <span className="truncate text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Map Preview
          </span>
          <span className="mt-1 flex min-w-0 items-baseline gap-2">
            <span className="shrink-0 text-[0.7rem] font-semibold text-foreground">
              {focusYearLabel}
            </span>
            {sliceLabel ? (
              <span className="truncate text-[0.66rem] text-muted-foreground">
                {sliceLabel}
              </span>
            ) : null}
          </span>
        </div>
        <button
          aria-label="Close map preview"
          className="ml-2 grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden"
        style={{ top: MAP_WINDOW_HEADER_HEIGHT }}
      >
        <MapPreviewCanvas
          height={canvasHeight}
          hoveredFeatureLabel={hoveredFeature?.label ?? null}
          onHoverFeature={setHoveredFeature}
          slice={renderedSlice}
          width={windowBounds.width}
        />
      </div>

      {hoveredFeature ? (
        <div
          className="pointer-events-none absolute z-[4] max-w-[15rem] rounded-md border border-border bg-popover px-2.5 py-2 text-popover-foreground shadow-lg"
          style={{
            left: clamp(hoveredFeature.x + 12, 8, windowBounds.width - 232),
            top: clamp(
              hoveredFeature.y + MAP_WINDOW_HEADER_HEIGHT + 12,
              MAP_WINDOW_HEADER_HEIGHT + 8,
              windowBounds.height - 108,
            ),
          }}
        >
          <div className="truncate text-[0.74rem] font-semibold leading-tight">
            {hoveredFeature.label}
          </div>
          {hoveredFeature.details.length > 0 ? (
            <div className="mt-1.5 space-y-0.5 text-[0.64rem] leading-snug text-muted-foreground">
              {hoveredFeature.details.map((detail) => (
                <div className="truncate" key={detail}>
                  {detail}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {isLoadingNextSlice && hasData ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-background/18"
          style={{ top: MAP_WINDOW_HEADER_HEIGHT }}
        />
      ) : null}

      {!hasData || isLoadingNextSlice ? (
        <div className="absolute inset-x-0 bottom-0 z-[1] flex items-center gap-2 border-t border-border/45 bg-background/75 px-3 py-2 text-[0.66rem] font-medium text-muted-foreground">
          {!failedFilename ? (
            <span className="size-3 shrink-0 animate-spin rounded-full border border-current border-t-transparent" />
          ) : null}
          <span className="truncate">
            {failedFilename
              ? "Map unavailable"
              : hasData
                ? loadingLabel
                : loadingLabel || "loading map"}
          </span>
        </div>
      ) : null}

      {sourceUrl ? (
        <a
          className="absolute bottom-2 right-3 z-[2] cursor-pointer text-[0.56rem] font-medium uppercase tracking-[0.12em] text-muted-foreground/70 underline-offset-2 transition-colors hover:text-foreground hover:underline"
          href={sourceUrl}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          rel="noreferrer"
          target="_blank"
        >
          {sourceLabel}
        </a>
      ) : null}
      {resizeHandles.map((resizeHandle) => (
        <div
          aria-label={resizeHandle.label}
          className={`absolute z-[3] touch-none ${resizeHandle.className}`}
          key={resizeHandle.handle}
          onPointerCancel={endWindowDrag}
          onPointerDown={(event) => beginWindowDrag(event, resizeHandle.handle)}
          onPointerMove={updateWindowDrag}
          onPointerUp={endWindowDrag}
          role="separator"
        />
      ))}
      <div className="pointer-events-none absolute bottom-1 right-1 z-[2] h-2.5 w-2.5 border-b border-r border-muted-foreground/45" />
    </aside>
  );
});
