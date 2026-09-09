import { formatGuideDate } from "./formatGuideDate";
import { DEFAULT_MAP_NAVIGATION, zoomGuideMap, constrainGuideMap, getGuideMapFrame, type MapNavigation } from "./mapNavigation";
import { useEffect, useRef, useState, useCallback, type Dispatch, type SetStateAction, type PointerEvent } from "react";
import { Maximize2, X, Plus, Minus, RotateCcw } from "lucide-react";
import type { ExperienceStop, GuidedExperience } from "./experiences";
import { getChapterImages } from "./guideMedia";

let landRequest: Promise<string> | undefined;
const places = [
  { name: "Tyre", lon: 35.2, lat: 33.27, chapter: 0 },
  { name: "Byblos", lon: 35.65, lat: 34.12, chapter: 0 },
  { name: "Carthage", lon: 10.32, lat: 36.85, chapter: 5 },
  { name: "Cyprus", lon: 33.6, lat: 35.1, chapter: 6 },
  { name: "Sardinia", lon: 8.5, lat: 39.9, chapter: 6 },
  { name: "Gadir", lon: -6.29, lat: 36.53, chapter: 6 },
  { name: "Sicily", lon: 14, lat: 37.6, chapter: 13 },
  { name: "Rome", lon: 12.5, lat: 41.9, chapter: 14 },
];

function ChapterMap({ index, navigation, setNavigation }: { index: number; navigation: MapNavigation; setNavigation: Dispatch<SetStateAction<MapNavigation>> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const localPoint = (clientX: number, clientY: number) => {
    const matrix = svgRef.current?.getScreenCTM();
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : new DOMPoint(300, 150);
  };
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const point = localPoint(event.clientX, event.clientY);
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 300 : 1;
      setNavigation(current => zoomGuideMap(current, Math.exp(-Math.max(-200, Math.min(200, event.deltaY * unit)) * 0.003), point.x, point.y));
    };
    svg.addEventListener("wheel", wheel, { passive: false });
    return () => svg.removeEventListener("wheel", wheel);
  }, [setNavigation]);
  const move = (event: PointerEvent<SVGSVGElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const point = localPoint(event.clientX, event.clientY);
    const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1];
    if (other) {
      const before = Math.hypot(previous.x - other.x, previous.y - other.y);
      const after = Math.hypot(point.x - other.x, point.y - other.y);
      const oldX = (previous.x + other.x) / 2, oldY = (previous.y + other.y) / 2;
      setNavigation(current => {
        const next = zoomGuideMap(current, before > 1 ? after / before : 1, oldX, oldY);
        return { ...next, x: next.x + (point.x - previous.x) / 2, y: next.y + (point.y - previous.y) / 2 };
      });
    } else setNavigation(current => ({ ...current, x: current.x + point.x - previous.x, y: current.y + point.y - previous.y }));
    pointers.current.set(event.pointerId, point);
  };
  const end = (event: PointerEvent<SVGSVGElement>) => { pointers.current.delete(event.pointerId); };
  const [land, setLand] = useState("");
  useEffect(() => {
    let alive = true;
    landRequest ??= fetch(`${import.meta.env.BASE_URL}world-land.path`).then(response => {
      if (!response.ok) throw new Error("Map unavailable");
      return response.text();
    }).catch(error => { landRequest = undefined; throw error; });
    landRequest.then(path => { if (alive) setLand(path); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const { west, north, scale } = getGuideMapFrame(index);
  return <figure className="guide-map">
    <svg ref={svgRef} tabIndex={0}
      onPointerDown={event => {
        if (event.button !== 0) return;
        event.preventDefault();
        pointers.current.set(event.pointerId, localPoint(event.clientX, event.clientY));
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus({ preventScroll: true });
      }} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
      onKeyDown={event => {
        if (["+", "=", "-", "0", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
          event.preventDefault(); event.stopPropagation();
          if (event.key === "0") setNavigation(DEFAULT_MAP_NAVIGATION);
          else if (["+", "=", "-"].includes(event.key)) setNavigation(current => zoomGuideMap(current, event.key === "-" ? 0.8 : 1.25, 300, 150));
          else setNavigation(current => ({ ...current, x: current.x + (event.key === "ArrowLeft" ? 30 : event.key === "ArrowRight" ? -30 : 0), y: current.y + (event.key === "ArrowUp" ? 30 : event.key === "ArrowDown" ? -30 : 0) }));
        }
      }} viewBox="0 0 600 300" role="img" aria-label="Places introduced in the Phoenicia guide" preserveAspectRatio="xMidYMid meet">
      <rect width="600" height="300" fill="var(--background)" />
      <g transform={`translate(${navigation.x} ${navigation.y}) scale(${navigation.zoom})`}>
      <g className="guide-map-camera" style={{ transform: `matrix(${scale},0,0,${scale},${-west * scale},${-north * scale})` }}>
        <path d={land} fill="var(--muted)" stroke="var(--border)" strokeWidth="0.06" />
        {places.map(place => {
          const visible = index >= place.chapter;
          const x = place.lon + 180, y = 90 - place.lat;
          return <g key={place.name} className="guide-map-place" style={{ opacity: visible ? 1 : 0 }}>
            <circle cx={x} cy={y} r={3 / (scale * navigation.zoom)} fill="var(--journey-accent)" />
            <text x={x + 5 / scale} y={y - 5 / scale} fontSize={11 / (scale * navigation.zoom)} fill="var(--foreground)" paintOrder="stroke" stroke="var(--background)" strokeWidth={3 / (scale * navigation.zoom)}>{place.name}</text>
          </g>;
        })}
      </g>
      </g>
    </svg>
    <div className="guide-map-controls" aria-label="Map controls">
      <button type="button" aria-label="Zoom in map" onClick={() => setNavigation(current => zoomGuideMap(current, 1.4, 300, 150))}><Plus size={14} /></button>
      <button type="button" aria-label="Zoom out map" onClick={() => setNavigation(current => zoomGuideMap(current, 1 / 1.4, 300, 150))}><Minus size={14} /></button>
      <button type="button" aria-label="Reset map position" title="Reset map position" onClick={() => setNavigation(DEFAULT_MAP_NAVIGATION)}><RotateCcw size={14} /></button>
    </div>
    <figcaption><a href="https://www.metmuseum.org/essays/the-phoenicians-1500-300-b-c" target="_blank" rel="noreferrer">The Met</a> / <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a></figcaption>
  </figure>;
}

export function GuideGallery({ experience, stop, index }: { experience: GuidedExperience; stop: ExperienceStop; index: number }) {
  const images = getChapterImages(stop.id);
  const [navigation, setNavigation] = useState(DEFAULT_MAP_NAVIGATION);
  const updateNavigation = useCallback<Dispatch<SetStateAction<MapNavigation>>>(update => {
    setNavigation(current => constrainGuideMap(typeof update === "function" ? update(current) : update, index));
  }, [index]);
  useEffect(() => { setNavigation(DEFAULT_MAP_NAVIGATION); }, [stop.id]);
  const [selection, setSelection] = useState<{ chapter: string; id: string }>({ chapter: stop.id, id: "map" });
  const selected = selection.chapter === stop.id ? selection.id : "map";
  const image = images.find(item => item.id === selected);
  const [failed, setFailed] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const urls = new Set(experience.stops.slice(Math.max(0, index - 1), index + 3).flatMap(chapter => getChapterImages(chapter.id).map(item => item.src)));
    const timer = window.setTimeout(() => {
      for (const src of urls) { const preload = new Image(); preload.src = src; void preload.decode().catch(() => {}); }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [experience, index]);
  const media = image ? <figure>
    {failed.includes(image.src) ? <p className="guide-image-fallback">Image unavailable. <a href={image.source} target="_blank" rel="noreferrer">View museum record</a></p> : <img src={image.src} alt={image.title} decoding="async" onError={() => setFailed(current => [...current, image.src])} />}
    <figcaption><strong>{image.title}</strong><span>{formatGuideDate(image.date)}</span><p>{image.caption}</p><a href={image.source} target="_blank" rel="noreferrer">{image.credit}</a></figcaption>
  </figure> : <ChapterMap index={index} navigation={navigation} setNavigation={updateNavigation} />;
  return <aside className="guide-gallery" aria-label="Chapter gallery">
    <div className="guide-gallery-tabs">
      {[{ id: "map", title: "Map" }, ...images].map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => setSelection({ chapter: stop.id, id: item.id })}>{item.id === "map" ? "Map" : item.id === "jug" ? "Inscription" : item.id === "ivory" ? "Ivory" : "Seal"}</button>)}
      <button type="button" className="guide-gallery-expand" aria-label="Enlarge gallery" onClick={() => dialog.current?.showModal()}><Maximize2 size={14} /></button>
    </div>
    {media}
    <dialog ref={dialog} className="guide-gallery-dialog" aria-label="Enlarged chapter image" onCancel={event => { event.stopPropagation(); }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <button type="button" aria-label="Close enlarged image" onClick={() => dialog.current?.close()} autoFocus><X size={18} /></button>
      {media}
    </dialog>
  </aside>;
}
