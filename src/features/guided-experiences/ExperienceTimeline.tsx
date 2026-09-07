import { Crosshair } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TimelineCanvas } from "@/features/timeline-viewer/canvas";
import { useAnimatedViewport } from "@/hooks/useAnimatedViewport";
import { useElementSize } from "@/hooks/useElementSize";
import { TIMELINE_CANVAS_PAD, TIMELINE_CANVAS_PAD_PORTRAIT_MOBILE } from "@/lib/rendering/layout/padding";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";
import type { TimelineViewport } from "@/lib/core/viewport";
import type { ExperienceStop, GuidedExperience } from "./experiences";
import { getExperienceViewport, resolveExperienceContent } from "./experienceModel";

const noop = () => {};

function ExperienceCanvas({ experience, stop, catalog, width, height, frameRequest, onExplore }: {
  experience: GuidedExperience; stop: ExperienceStop; catalog: TimelineCatalogSnapshot;
  width: number; height: number; frameRequest: number; onExplore: () => void;
}) {
  const pad = width <= 640 ? TIMELINE_CANVAS_PAD_PORTRAIT_MOBILE : TIMELINE_CANVAS_PAD;
  const innerWidth = Math.max(width - pad * 2, 1);
  const content = useMemo(() => resolveExperienceContent(experience, catalog), [experience, catalog]);
  const [initial] = useState(() => getExperienceViewport(stop, innerWidth));
  const camera = useAnimatedViewport(initial, innerWidth);
  const { animateToViewport, updateViewport, cancelTransientMotion } = camera;
  const [revealYear, setRevealYear] = useState(stop.year);
  const revealRef = useRef(stop.year);
  const firstFrame = useRef(true);
  const [focusKey, setFocusKey] = useState(0);

  useEffect(() => {
    const target = getExperienceViewport(stop, innerWidth);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (firstFrame.current || reduce) updateViewport(() => target);
    else animateToViewport(target);
    firstFrame.current = false;
    setFocusKey(key => key + 1);
  }, [stop, innerWidth, frameRequest, animateToViewport, updateViewport]);

  useEffect(() => {
    const from = revealRef.current;
    const started = performance.now();
    let frame = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (now: number) => {
      const progress = reduce ? 1 : Math.min((now - started) / 350, 1);
      const next = from + (stop.year - from) * (1 - (1 - progress) ** 3);
      revealRef.current = next;
      setRevealYear(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stop.year]);

  const gestureStart = useCallback(() => { cancelTransientMotion(); onExplore(); }, [cancelTransientMotion, onExplore]);
  const move = (updater: (viewport: TimelineViewport) => TimelineViewport) => { onExplore(); updateViewport(updater); };
  const focus = useMemo(() => ({
    subjectIds: experience.subjectIds,
    contextIds: experience.contextIds,
    revealYear,
    currentYear: stop.year,
    bandId: stop.focusBandId,
    stopKey: String(focusKey),
  }), [experience, revealYear, stop, focusKey]);
  const markers = useMemo(() => content.markers.filter(marker => marker.year <= Math.min(revealYear, stop.year)), [content, revealYear, stop.year]);

  return <TimelineCanvas
    width={width} height={height} pad={pad}
    viewport={camera.viewport} isAnimating={camera.isAnimating}
    activeEra={content.era} activeChain={[]} siblingEras={content.era.children ?? []} parentEra={null}
    markers={markers} overlayBands={content.overlays} enabledGroupIds={content.enabledGroupIds}
    overlayVisibilityTransitionKey={`experience:${experience.id}`}
    guidedFocus={focus} isCosmicCalendarMode={false} isMapPreviewEnabled={false}
    onViewportChange={move} onContinuousViewportChange={camera.updateViewportDirect}
    onViewportGestureStart={gestureStart} onViewportGestureEnd={noop}
    onAnimateZoom={(delta, anchor) => { onExplore(); camera.animateZoom(delta, anchor); }}
    onAnimateToRange={(start, end) => { onExplore(); camera.animateToRange(start, end); }}
    onDrillIntoEra={era => { onExplore(); camera.animateToRange(era.startYear, era.endYear); }}
    onNavigateUp={() => { onExplore(); camera.animateToRange(content.era.startYear, content.era.endYear); }}
    onMapPreviewClose={noop} onRecordDragSample={camera.recordDragSample} onReleaseMomentum={camera.releaseMomentum}
  />;
}

export function ExperienceTimeline({ experience, stop, catalog }: {
  experience: GuidedExperience; stop: ExperienceStop; catalog: TimelineCatalogSnapshot;
}) {
  const [surfaceRef, size] = useElementSize<HTMLDivElement>();
  const [frameRequest, setFrameRequest] = useState(0);
  const [exploring, setExploring] = useState(false);
  const onExplore = useCallback(() => setExploring(true), []);
  useEffect(() => { setExploring(false); }, [stop.id]);
  return <section className="journey-timeline" aria-label={`${experience.title} timeline`}>
    <div className="journey-timeline-toolbar">
      <span className="journey-band-key"><i />{experience.title}</span>
      <button type="button" className="journey-recenter" onClick={() => { setExploring(false); setFrameRequest(value => value + 1); }}>
        <Crosshair size={13} />{exploring ? "Return to chapter" : "Recenter"}
      </button>
    </div>
    <div ref={surfaceRef} className="journey-canvas">
      {size.width > 0 && size.height > 0 && <ExperienceCanvas
        experience={experience} stop={stop} catalog={catalog}
        width={size.width} height={size.height} frameRequest={frameRequest} onExplore={onExplore}
      />}
    </div>
  </section>;
}
