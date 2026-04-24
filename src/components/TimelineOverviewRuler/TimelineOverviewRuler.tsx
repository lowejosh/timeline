import {
  Fragment,
  type CSSProperties,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { compareEraPriorityAscending, type Era } from "../../lib/catalog/eras";
import {
  getOverviewRulerYearsPerPixel,
  mapOverviewRulerXToYear,
  resolveOverviewRulerBandRect,
  resolveOverviewRulerSpotlight,
  type OverviewRulerDomain,
} from "../../lib/rendering/overviewRuler";
import {
  normalizeViewport,
  panByPixels,
  splitTimelineYear,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  type TimelineViewport,
} from "../../lib/core/viewport";
import { THEME } from "../../lib/ui/theme";

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
    [
      domain,
      pad,
      spotlightEndYear,
      spotlightMinDisplayWidth,
      spotlightStartYear,
      width,
    ],
  );
  const yearsPerPixel = useMemo(
    () => getOverviewRulerYearsPerPixel(domain, width, pad),
    [domain, pad, width],
  );
  const bandRects = useMemo(
    () =>
      [...eras].sort(compareEraPriorityAscending).map((era) => ({
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

  const spotlightTransition: CSSProperties = isFollowingDrag
    ? {
        transition: `left 110ms ${THEME.easing.settle}, width 110ms ${THEME.easing.settle}`,
      }
    : isSettling
      ? {
          transition: `left 180ms ${THEME.easing.spring}, width 180ms ${THEME.easing.spring}`,
        }
      : {};

  return (
    <div className="relative z-0 w-full bg-transparent" style={{ height }}>
      <div
        aria-label="Timeline overview ruler. Click or drag anywhere to recenter and scrub the timeline window."
        className="relative w-full h-full overflow-hidden border-0 bg-transparent cursor-pointer touch-none data-[dragging=true]:cursor-grabbing focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--focus)]"
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
          className="absolute top-0 bottom-0"
          style={{
            left: pad,
            right: pad,
            background: `linear-gradient(180deg, ${THEME.color.surface} 0%, ${THEME.color.overviewStrip.to} 100%)`,
          }}
        />
        {bandRects.map(({ era, rect }) =>
          rect ? (
            <Fragment key={era.id}>
              {/* Backdrop reset — mirrors canvas: fill background at full opacity first,
                so higher-priority eras replace lower-priority colors rather than blending over them. */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, ${THEME.color.overviewStrip.from} 0%, ${THEME.color.overviewStrip.to} 100%)`,
                  left: rect.left,
                  width: rect.width,
                }}
              />
              <div
                className="absolute top-0 bottom-0 opacity-30 pointer-events-none"
                style={{
                  backgroundColor: era.color,
                  left: rect.left,
                  width: rect.width,
                }}
              />
            </Fragment>
          ) : null,
        )}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: pad,
            width: leftShadeWidth,
            background: THEME.color.deepShadow[42],
            ...spotlightTransition,
          }}
        />
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: rightShadeLeft,
            width: rightShadeWidth,
            background: THEME.color.deepShadow[42],
            ...spotlightTransition,
          }}
        />
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: spotlight.displayLeft,
            width: spotlight.displayWidth,
            ...spotlightTransition,
          }}
        />
      </div>
    </div>
  );
}
