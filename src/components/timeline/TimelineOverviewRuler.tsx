import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { type Era } from "../../lib/data/eras";
import {
  getOverviewRulerYearsPerPixel,
  mapOverviewRulerXToYear,
  resolveOverviewRulerBandRect,
  resolveOverviewRulerSpotlight,
  type OverviewRulerDomain,
} from "../../lib/time/overviewRuler";
import {
  normalizeViewport,
  panByPixels,
  splitTimelineYear,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  type TimelineViewport,
} from "../../lib/time/viewport";
import "./TimelineOverviewRuler.css";

type TimelineOverviewRulerProps = {
  width: number;
  height: number;
  eras: Era[];
  pad: number;
  domain: OverviewRulerDomain;
  spotlightStartYear: number;
  spotlightEndYear: number;
  spotlightMinDisplayWidth?: number;
  viewport: TimelineViewport;
  mainInnerWidth: number;
  isFollowingDrag?: boolean;
  isSettling?: boolean;
  onViewportChange: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

type DragState = {
  pointerId: number;
  startClientX: number;
  startCenterYear: number;
  startViewport: TimelineViewport;
};

const KEYBOARD_PAN_PIXELS = 120;
const MIN_RENDERABLE_BAND_WIDTH = 0.5;
const SPOTLIGHT_SHADE_EDGE_OVERLAP = 0.5;

function withViewportCenterYear(
  viewport: TimelineViewport,
  centerYear: number,
  width: number,
) {
  const preciseCenter = splitTimelineYear(centerYear);

  return normalizeViewport(
    {
      ...viewport,
      centerYear,
      centerYearWhole: preciseCenter.wholeYear,
      centerYearFraction: preciseCenter.fraction,
    },
    width,
  );
}

export function TimelineOverviewRuler({
  width,
  height,
  eras,
  pad,
  domain,
  spotlightStartYear,
  spotlightEndYear,
  spotlightMinDisplayWidth,
  viewport,
  mainInnerWidth,
  isFollowingDrag = false,
  isSettling = false,
  onViewportChange,
  onDragStart,
  onDragEnd,
}: TimelineOverviewRulerProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const spotlight = useMemo(
    () =>
      resolveOverviewRulerSpotlight(
        spotlightStartYear,
        spotlightEndYear,
        domain,
        width,
        pad,
        spotlightMinDisplayWidth,
      ),
    [domain, pad, spotlightEndYear, spotlightMinDisplayWidth, spotlightStartYear, width],
  );
  const yearsPerPixel = useMemo(
    () => getOverviewRulerYearsPerPixel(domain, width, pad),
    [domain, pad, width],
  );
  const bandRects = useMemo(
    () =>
      eras.map((era) => ({
        era,
        rect: resolveOverviewRulerBandRect(
          era.startYear,
          era.endYear,
          domain,
          width,
          pad,
          MIN_RENDERABLE_BAND_WIDTH,
        ),
      })),
    [domain, eras, pad, width],
  );

  const recenterToYear = (targetYear: number) => {
    onViewportChange((current) =>
      withViewportCenterYear(current, targetYear, mainInnerWidth),
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const surface = surfaceRef.current;

    if (!surface) {
      return;
    }

    const rect = surface.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const targetYear = mapOverviewRulerXToYear(localX, domain, width, pad);
    const isInsideDisplayWindow =
      localX >= spotlight.displayLeft && localX <= spotlight.displayRight;
    const startViewport = isInsideDisplayWindow
      ? viewport
      : withViewportCenterYear(viewport, targetYear, mainInnerWidth);

    if (!isInsideDisplayWindow) {
      onViewportChange(() => startViewport);
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startCenterYear: startViewport.centerYear,
      startViewport,
    };
    setIsDragging(true);
    onDragStart?.();
    surface.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaYears = (event.clientX - dragState.startClientX) * yearsPerPixel;

    onViewportChange(() =>
      withViewportCenterYear(
        dragState.startViewport,
        dragState.startCenterYear + deltaYears,
        mainInnerWidth,
      ),
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const surface = surfaceRef.current;

    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      setIsDragging(false);
      onDragEnd?.();
    }

    if (surface?.hasPointerCapture(event.pointerId)) {
      surface.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onViewportChange((current) =>
        panByPixels(current, KEYBOARD_PAN_PIXELS, mainInnerWidth),
      );
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onViewportChange((current) =>
        panByPixels(current, -KEYBOARD_PAN_PIXELS, mainInnerWidth),
      );
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      recenterToYear(TIMELINE_MIN_YEAR);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      recenterToYear(TIMELINE_MAX_YEAR);
    }
  };

  const leftShadeWidth = Math.max(
    spotlight.displayLeft - pad - SPOTLIGHT_SHADE_EDGE_OVERLAP,
    0,
  );
  const rightShadeLeft = Math.min(
    Math.max(spotlight.displayRight + SPOTLIGHT_SHADE_EDGE_OVERLAP, pad),
    width - pad,
  );
  const rightShadeWidth = Math.max(width - pad - rightShadeLeft, 0);

  return (
    <div className="timeline-overview-ruler" style={{ height }}>
      <div
        aria-label="Timeline overview ruler. Click or drag anywhere to recenter and scrub the timeline window."
        className="timeline-overview-ruler__surface"
        data-dragging={isDragging ? "true" : "false"}
        data-following={isFollowingDrag ? "true" : "false"}
        data-settling={isSettling ? "true" : "false"}
        onKeyDown={handleKeyDown}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={surfaceRef}
        tabIndex={0}
      >
        <div
          className="timeline-overview-ruler__strip"
          style={{ left: pad, right: pad }}
        />
        {bandRects.map(({ era, rect }) => (
          rect ? (
          <div
            className="timeline-overview-ruler__band"
            key={era.id}
            style={{
              backgroundColor: era.color,
              left: rect.left,
              width: rect.width,
            }}
          />
          ) : null
        ))}
        <div
          className="timeline-overview-ruler__shade timeline-overview-ruler__shade--left"
          style={{ left: pad, width: leftShadeWidth }}
        />
        <div
          className="timeline-overview-ruler__shade timeline-overview-ruler__shade--right"
          style={{ left: rightShadeLeft, width: rightShadeWidth }}
        />
        <div
          className="timeline-overview-ruler__window"
          style={{
            left: spotlight.displayLeft,
            width: spotlight.displayWidth,
          }}
        />
      </div>
    </div>
  );
}
