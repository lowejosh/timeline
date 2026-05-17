import type { HistoricalBasemapSlice } from "@/lib/maps/historicalBasemapManifest";
import type { GPlatesCoastlineSlice } from "@/lib/maps/gplatesCoastlineManifest";

export type GeoJsonPosition = [number, number, ...number[]];
export type GeoJsonPolygon = GeoJsonPosition[][];
export type GeoJsonMultiPolygon = GeoJsonPolygon[];

export type GeoJsonGeometry =
  | {
      type: "Polygon";
      coordinates: GeoJsonPolygon;
    }
  | {
      type: "MultiPolygon";
      coordinates: GeoJsonMultiPolygon;
    }
  | {
      type: string;
    };

export type MapGeoJsonFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry | null;
  properties?: {
    ABBREVN?: string;
    BORDERPRECISION?: number | string;
    NAME?: string;
    PARTOF?: string;
    SUBJECTO?: string;
    wikipedia?: string;
  };
};

export type MapGeoJson = {
  type: "FeatureCollection";
  features: MapGeoJsonFeature[];
};

export type RenderedMapFeature = {
  color: string;
  d: string;
  details: string[];
  hoverable: boolean;
  id: string;
  label: string;
  opacity: number;
  strokeOpacity: number;
};

export type HoveredMapFeature = {
  details: string[];
  label: string;
  x: number;
  y: number;
};

export type MapViewport = {
  offsetX: number;
  offsetY: number;
  zoom: number;
};

export type RenderedMapSlice = {
  features: RenderedMapFeature[];
  id: string;
  sourceFeatureCount: number;
};

export type MapSlice =
  | {
      kind: "historical";
      slice: HistoricalBasemapSlice;
    }
  | {
      kind: "gplates";
      slice: GPlatesCoastlineSlice;
    };

export type MapWindowBounds = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type ResizeHandle = "n" | "e" | "s" | "w" | "ne" | "nw" | "se" | "sw";

export type MapWindowDragState = {
  bounds: MapWindowBounds;
  mode: "move" | ResizeHandle;
  pointerId: number;
  startX: number;
  startY: number;
};
