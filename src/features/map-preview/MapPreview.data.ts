import { formatTimelineYear } from "@/lib/rendering/bands";
import {
  getTimelineYearFromYearsAgo,
  getYearsAgoFromPresent,
} from "@/lib/core/timelineYears";
import {
  getHistoricalBasemapSliceAtOrBefore,
  HISTORICAL_BASEMAP_SLICES,
} from "@/lib/maps/historicalBasemapManifest";
import { getGPlatesCoastlineSliceAtOrBefore } from "@/lib/maps/gplatesCoastlineManifest";
import {
  GPLATES_SOURCE_URL,
  HISTORICAL_BASEMAP_SOURCE_URL,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_POINTS_PER_RING,
  MAX_RENDERED_SLICE_CACHE_SIZE,
} from "./MapPreview.const";
import { waitForMapIdle } from "./utils/MapPreview.utils";
import type {
  GeoJsonGeometry,
  GeoJsonPolygon,
  GeoJsonPosition,
  MapGeoJson,
  MapGeoJsonFeature,
  MapSlice,
  RenderedMapFeature,
  RenderedMapSlice,
} from "./MapPreview.types";

const historicalStartYear = HISTORICAL_BASEMAP_SLICES[0]?.year ?? -123_000;
const mapSliceRegistry = new Map<string, MapSlice>();
const mapSliceCache = new Map<string, Promise<RenderedMapSlice>>();

export function getSliceKey(mapSlice: MapSlice) {
  return `${mapSlice.kind}:${mapSlice.slice.filename}`;
}

function getStableMapSlice(mapSlice: MapSlice | null) {
  if (!mapSlice) {
    return null;
  }

  const key = getSliceKey(mapSlice);
  const existing = mapSliceRegistry.get(key);

  if (existing) {
    return existing;
  }

  mapSliceRegistry.set(key, mapSlice);
  return mapSlice;
}

export function getMapSlice(year: number | null): MapSlice | null {
  if (year === null) {
    return null;
  }

  if (year >= historicalStartYear) {
    const slice = getHistoricalBasemapSliceAtOrBefore(year);

    return getStableMapSlice(slice ? { kind: "historical", slice } : null);
  }

  const ageMa = getYearsAgoFromPresent(year) / 1_000_000;
  const slice = getGPlatesCoastlineSliceAtOrBefore(ageMa);

  return getStableMapSlice(slice ? { kind: "gplates", slice } : null);
}

export function getMapSliceYear(mapSlice: MapSlice | null) {
  if (!mapSlice) {
    return null;
  }

  return mapSlice.kind === "historical"
    ? mapSlice.slice.year
    : getTimelineYearFromYearsAgo(mapSlice.slice.ageMa * 1_000_000);
}

export function getMapSliceYearForPreviewYear(year: number | null) {
  return getMapSliceYear(getMapSlice(year));
}

export function getMapSliceLabelForPreviewYear(year: number | null) {
  return getSliceLabel(getMapSlice(year));
}

function getSliceUrl(mapSlice: MapSlice) {
  const directory =
    mapSlice.kind === "historical"
      ? "historical-basemaps"
      : "gplates-coastlines";

  return `${import.meta.env.BASE_URL}${directory}/${mapSlice.slice.filename}`;
}

export function loadMapSlice(mapSlice: MapSlice) {
  const key = getSliceKey(mapSlice);
  const cached = mapSliceCache.get(key);

  if (cached) {
    mapSliceCache.delete(key);
    mapSliceCache.set(key, cached);
    return cached;
  }

  const url = getSliceUrl(mapSlice);
  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Unable to load map slice ${mapSlice.slice.filename}`);
      }

      const text = await response.text();
      await waitForMapIdle();

      return JSON.parse(text) as MapGeoJson;
    })
    .then(async (data) => {
      await waitForMapIdle();

      return {
        features: createRenderedFeatures(data, mapSlice.kind),
        id: key,
        sourceFeatureCount: data.features.length,
      };
    });

  mapSliceCache.set(key, request);
  trimMapSliceCache();
  void request.catch(() => {
    if (mapSliceCache.get(key) === request) {
      mapSliceCache.delete(key);
    }
  });

  return request;
}

function trimMapSliceCache() {
  while (mapSliceCache.size > MAX_RENDERED_SLICE_CACHE_SIZE) {
    const oldestUrl = mapSliceCache.keys().next().value;

    if (!oldestUrl) {
      return;
    }

    mapSliceCache.delete(oldestUrl);
  }
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function colorForFeature(feature: MapGeoJsonFeature) {
  const key =
    feature.properties?.SUBJECTO?.trim() ||
    feature.properties?.PARTOF?.trim() ||
    feature.properties?.NAME?.trim() ||
    "historical-region";
  const hue = hashString(key) % 360;

  return `hsl(${hue} 48% 62%)`;
}

function labelForFeature(feature: MapGeoJsonFeature, fallback: string) {
  return feature.properties?.NAME?.trim() || fallback;
}

function getUniqueFeatureDetailValues(...values: Array<string | undefined>) {
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .filter((value, index, array) => array.indexOf(value) === index);
}

function getPrecisionPercentage(feature: MapGeoJsonFeature) {
  const precision = Number(feature.properties?.BORDERPRECISION ?? 2);

  if (!Number.isFinite(precision)) {
    return null;
  }

  return Math.round((Math.min(Math.max(precision, 1), 3) / 3) * 100);
}

function detailsForFeature(feature: MapGeoJsonFeature) {
  const name = feature.properties?.NAME?.trim();
  const details = getUniqueFeatureDetailValues(
    feature.properties?.SUBJECTO?.trim(),
    feature.properties?.PARTOF?.trim(),
  )
    .filter((value) => value !== name)
    .map((value) => {
      if (value === feature.properties?.SUBJECTO?.trim()) {
        return `Subject: ${value}`;
      }

      return `Part of: ${value}`;
    });

  return details;
}

function precisionStrokeOpacity(feature: MapGeoJsonFeature) {
  const precision = Number(feature.properties?.BORDERPRECISION ?? 2);

  return precision <= 1 ? 0.08 : 0.16;
}

function projectPosition(position: GeoJsonPosition) {
  const [longitude, latitude] = position;
  const x = ((longitude + 180) / 360) * MAP_WIDTH;
  const y = ((90 - latitude) / 180) * MAP_HEIGHT;

  return [x, y] as const;
}

function ringToPath(ring: GeoJsonPosition[]) {
  if (ring.length < 3) {
    return "";
  }

  const stride = Math.max(1, Math.ceil(ring.length / MAX_POINTS_PER_RING));
  let path = "";

  for (let index = 0; index < ring.length; index += stride) {
    const [x, y] = projectPosition(ring[index]);
    path += `${path ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  const [firstX, firstY] = projectPosition(ring[0]);
  return `${path}L${firstX.toFixed(2)} ${firstY.toFixed(2)}Z`;
}

function polygonToPath(polygon: GeoJsonPolygon) {
  return polygon.map(ringToPath).filter(Boolean).join("");
}

function geometryToPath(geometry: GeoJsonGeometry | null) {
  if (!geometry) {
    return "";
  }

  if (geometry.type === "Polygon" && "coordinates" in geometry) {
    return polygonToPath(geometry.coordinates);
  }

  if (geometry.type === "MultiPolygon" && "coordinates" in geometry) {
    return geometry.coordinates.map(polygonToPath).filter(Boolean).join("");
  }

  return "";
}

function createRenderedFeatures(data: MapGeoJson, kind: MapSlice["kind"]) {
  return data.features
    .map((feature, index): RenderedMapFeature | null => {
      const d = geometryToPath(feature.geometry);

      if (!d) {
        return null;
      }

      if (kind === "gplates") {
        return {
          id: `gplates-coastline-${index}`,
          d,
          color: "hsl(154 67% 50%)",
          details: [],
          hoverable: false,
          label: "Reconstructed coastline",
          opacity: 0.64,
          strokeOpacity: 0.28,
        };
      }

      return {
        id: `${feature.properties?.NAME ?? "feature"}-${index}`,
        d,
        color: colorForFeature(feature),
        details: detailsForFeature(feature),
        hoverable: true,
        label: labelForFeature(feature, "Historical region"),
        opacity: 1,
        strokeOpacity: precisionStrokeOpacity(feature),
      };
    })
    .filter((feature): feature is RenderedMapFeature => feature !== null);
}

function formatAgeMa(ageMa: number) {
  return ageMa < 1
    ? `${Math.round(ageMa * 1_000)} ka`
    : `${Number.isInteger(ageMa) ? ageMa : ageMa.toFixed(1)} Ma`;
}

export function getSliceLabel(mapSlice: MapSlice | null) {
  if (!mapSlice) {
    return "";
  }

  return mapSlice.kind === "historical"
    ? `map ${formatTimelineYear(mapSlice.slice.year, 1)}`
    : `coastlines ${formatAgeMa(mapSlice.slice.ageMa)}`;
}

export function getSourceLabel(mapSlice: MapSlice | null) {
  if (!mapSlice) {
    return "";
  }

  return mapSlice.kind === "historical"
    ? "historical-basemaps"
    : `GPlates ${mapSlice.slice.model}`;
}

export function getSourceUrl(mapSlice: MapSlice | null) {
  if (!mapSlice) {
    return "";
  }

  return mapSlice.kind === "historical"
    ? HISTORICAL_BASEMAP_SOURCE_URL
    : GPLATES_SOURCE_URL;
}

export function getLoadingLabel(mapSlice: MapSlice | null) {
  if (!mapSlice) {
    return "";
  }

  // Todo maybe make this more fun ??? lol
  // return mapSlice.kind === "historical" ? "Loading map..." : "Loading coastlines...";
  return "Loading...";
}
