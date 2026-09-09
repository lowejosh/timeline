export type MapNavigation = { x: number; y: number; zoom: number };
export const DEFAULT_MAP_NAVIGATION: MapNavigation = { x: 0, y: 0, zoom: 1 };

export function zoomGuideMap(current: MapNavigation, factor: number, x: number, y: number): MapNavigation {
  const zoom = Math.max(Number.EPSILON, Math.min(8, current.zoom * factor));
  const ratio = zoom / current.zoom;
  return { zoom, x: x - (x - current.x) * ratio, y: y - (y - current.y) * ratio };
}

export function getGuideMapFrame(index: number) {
  const west = index >= 6 ? 170 : index >= 5 ? 184 : 208;
  return { west, north: index >= 5 ? 44 : 51, scale: 600 / (222 - west) };
}

export function constrainGuideMap(nav: MapNavigation, index: number): MapNavigation {
  const { west, north, scale } = getGuideMapFrame(index);
  const zoom = Math.max(600 / (360 * scale), nav.zoom);
  const unit = scale * zoom;
  const constrain = (offset: number, origin: number, size: number, viewport: number) => {
    const low = -origin * unit, high = (size - origin) * unit;
    return high - low <= viewport ? (viewport - low - high) / 2
      : Math.max(viewport - high, Math.min(-low, offset));
  };
  return { ...nav, zoom, x: constrain(nav.x, west, 360, 600), y: constrain(nav.y, north, 180, 300) };
}
