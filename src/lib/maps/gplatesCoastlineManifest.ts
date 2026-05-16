export type GPlatesCoastlineSlice = {
  ageMa: number;
  filename: string;
  model: "ZAHIROVIC2022";
};

export const GPLATES_COASTLINE_SLICES: GPlatesCoastlineSlice[] = [
  { ageMa: 0, filename: "zahirovic2022_coastlines_0Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 1, filename: "zahirovic2022_coastlines_1Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 5, filename: "zahirovic2022_coastlines_5Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 10, filename: "zahirovic2022_coastlines_10Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 20, filename: "zahirovic2022_coastlines_20Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 50, filename: "zahirovic2022_coastlines_50Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 100, filename: "zahirovic2022_coastlines_100Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 140, filename: "zahirovic2022_coastlines_140Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 200, filename: "zahirovic2022_coastlines_200Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 250, filename: "zahirovic2022_coastlines_250Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 300, filename: "zahirovic2022_coastlines_300Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 350, filename: "zahirovic2022_coastlines_350Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 400, filename: "zahirovic2022_coastlines_400Ma.geojson", model: "ZAHIROVIC2022" },
];

export const GPLATES_MAX_AGE_MA = 410;

export function getNearestGPlatesCoastlineSlice(ageMa: number) {
  if (!Number.isFinite(ageMa) || ageMa < 0 || ageMa > GPLATES_MAX_AGE_MA) {
    return null;
  }

  let nearest = GPLATES_COASTLINE_SLICES[0] ?? null;
  let nearestDistance = nearest
    ? Math.abs(ageMa - nearest.ageMa)
    : Number.POSITIVE_INFINITY;

  for (const slice of GPLATES_COASTLINE_SLICES) {
    const distance = Math.abs(ageMa - slice.ageMa);

    if (distance < nearestDistance) {
      nearest = slice;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function getGPlatesCoastlineSliceAtOrBefore(ageMa: number) {
  if (!Number.isFinite(ageMa) || ageMa < 0 || ageMa > GPLATES_MAX_AGE_MA) {
    return null;
  }

  let selected: GPlatesCoastlineSlice | null = null;

  for (const slice of GPLATES_COASTLINE_SLICES) {
    if (slice.ageMa < ageMa) {
      continue;
    }

    selected = slice;
    break;
  }

  return selected;
}
