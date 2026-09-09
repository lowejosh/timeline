import { formatGuideDate } from "./formatGuideDate";
import { GuideGallery } from "./GuideGallery";
import { ArrowLeft, ArrowRight, ChevronDown, Compass, ExternalLink, List, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";
import type { ExperienceStop, GuidedExperience } from "./experiences";
import { resolveStopIndex } from "./experiences";
import { ExperienceTimeline } from "./ExperienceTimeline";
import "./guided-experience.css";

function ChapterSources({ stop }: { stop: ExperienceStop }) {
  return <Collapsible className="journey-sources">
    <CollapsibleTrigger className="journey-source-trigger">
      Sources <span>{stop.sources.length}</span><ChevronDown size={12} />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <ol>{stop.sources.map(source => <li key={source.url}>
        <a href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={11} /></a>
        <span>{source.organization}</span>
      </li>)}</ol>
    </CollapsibleContent>
  </Collapsible>;
}

export function GuidedExperienceView({ experience, catalog, onClose }: {
  experience: GuidedExperience; catalog: TimelineCatalogSnapshot; onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const close = () => {
    if (exitTimer.current !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { onClose(); return; }
    setExiting(true);
    exitTimer.current = setTimeout(onClose, 190);
  };
  useEffect(() => () => { if (exitTimer.current !== null) clearTimeout(exitTimer.current); }, []);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [compactReading, setCompactReading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const chapterButtonRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const readingId = useId();
  const stop = experience.stops[index];
  const isLast = index === experience.stops.length - 1;
  const progressStart = Math.max(0, Math.min(index - 2, experience.stops.length - 5));
  const visibleProgressStops = experience.stops.slice(progressStart, progressStart + 5);
  const goTo = (next: number) => {
    if (exiting) return;
    setIndex(resolveStopIndex(experience, next));
    setChaptersOpen(false);
  };

  useLayoutEffect(() => {
    if (readerRef.current) readerRef.current.scrollTop = 0;
  }, [index]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.querySelector<HTMLButtonElement>('[aria-label="Guided experiences"]')?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!chaptersOpen) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !chaptersRef.current?.contains(event.target)) setChaptersOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [chaptersOpen]);

  return <dialog ref={dialogRef} className="journey" data-exiting={exiting} aria-labelledby={headingId}
    onCancel={event => { event.preventDefault(); if (chaptersOpen) { setChaptersOpen(false); chapterButtonRef.current?.focus(); } else close(); }}
    onKeyDown={event => {
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [data-timeline-tooltip], .guide-gallery")) return;
      if (!chaptersOpen && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault(); event.stopPropagation(); goTo(index + (event.key === "ArrowRight" ? 1 : -1));
      }
    }}>
    <header className="journey-header" data-timeline-controls>
      <Button variant="ghost" className="journey-exit" onClick={close} autoFocus><ArrowLeft size={15} /><span>Timeline</span></Button>
      <h1 id={headingId}><Compass size={15} />{experience.title}</h1>
      <div ref={chaptersRef} className="journey-chapters">
        <Button ref={chapterButtonRef} variant="ghost" className="journey-chapters-button" aria-expanded={chaptersOpen} aria-controls={`${headingId}-chapters`} onClick={() => setChaptersOpen(open => !open)}>
          <List size={16} /><span>Chapters</span>
        </Button>
        {chaptersOpen && <nav id={`${headingId}-chapters`} className="journey-chapter-menu timeline-scrollbar" aria-label="Chapters">
          {experience.stops.map((chapter, i) => <button key={chapter.id} type="button" aria-current={i === index ? "step" : undefined} onClick={() => { goTo(i); chapterButtonRef.current?.focus(); }}>
            <span className="journey-chapter-number">{String(i + 1).padStart(2, "0")}</span>
            <span><strong>{chapter.title}</strong><small>{formatGuideDate(chapter.dateLabel)}</small></span>
          </button>)}
        </nav>}
      </div>
    </header>

    <div className="journey-body" data-reading-collapsed={compactReading}>
      <section ref={readerRef} className="journey-reader" aria-label="Current chapter">
        <div className="journey-reader-topline">
          <span className="journey-date">{formatGuideDate(stop.dateLabel)}</span>
          <button className="journey-reading-toggle" type="button" aria-controls={readingId} aria-expanded={!compactReading} onClick={() => setCompactReading(value => !value)} title={compactReading ? "Show description" : "Collapse description"}>
            <ChevronDown size={14} /><span>{compactReading ? "Read" : "Hide"}</span>
          </button>
        </div>
        <div className="journey-story" aria-live="polite" aria-atomic="true">
          <div className="journey-story-copy">
            <h2>{stop.title}</h2>
            <div id={readingId} className="journey-reading-detail" hidden={compactReading}>
              <p className="journey-region">{stop.region}</p>
              <p className="journey-description">{stop.description}</p>
              <ChapterSources stop={stop} />
            </div>
          </div>
          {!compactReading && <GuideGallery experience={experience} stop={stop} index={index} />}
        </div>
      </section>
      <ExperienceTimeline experience={experience} stop={stop} catalog={catalog} />
    </div>

    <footer className="journey-footer" aria-label="Chapter navigation">
      <Button variant="ghost" className="journey-back" disabled={index === 0} onClick={() => goTo(index - 1)}><ArrowLeft size={15} /><span>Previous</span></Button>
      <nav className="journey-progress" aria-label="Jump to chapter">
        {visibleProgressStops.map((chapter, offset) => { const i = progressStart + offset; return <button key={chapter.id} type="button" aria-label={`${i + 1}. ${chapter.title}`} title={chapter.title} aria-current={i === index ? "step" : undefined} data-complete={i < index} onClick={() => goTo(i)}><span /></button>; })}
        <span className="journey-count">{String(index + 1).padStart(2, "0")} / {String(experience.stops.length).padStart(2, "0")}</span>
      </nav>
      <Button className="journey-next" onClick={() => isLast ? close() : goTo(index + 1)}>{isLast ? "Finish" : "Next"}{isLast ? <X size={14} /> : <ArrowRight size={15} />}</Button>
    </footer>
  </dialog>;
}
