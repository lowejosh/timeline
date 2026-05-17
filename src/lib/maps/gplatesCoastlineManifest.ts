export type GPlatesCoastlineSlice = {
  ageMa: number;
  filename: string;
  model: "ZAHIROVIC2022" | "MULLER2022" | "CAO2024";
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
  { ageMa: 410, filename: "zahirovic2022_coastlines_410Ma.geojson", model: "ZAHIROVIC2022" },
  { ageMa: 450, filename: "muller2022_coastlines_450Ma.geojson", model: "MULLER2022" },
  { ageMa: 500, filename: "muller2022_coastlines_500Ma.geojson", model: "MULLER2022" },
  { ageMa: 550, filename: "muller2022_coastlines_550Ma.geojson", model: "MULLER2022" },
  { ageMa: 600, filename: "muller2022_coastlines_600Ma.geojson", model: "MULLER2022" },
  { ageMa: 650, filename: "muller2022_coastlines_650Ma.geojson", model: "MULLER2022" },
  { ageMa: 700, filename: "muller2022_coastlines_700Ma.geojson", model: "MULLER2022" },
  { ageMa: 750, filename: "muller2022_coastlines_750Ma.geojson", model: "MULLER2022" },
  { ageMa: 800, filename: "muller2022_coastlines_800Ma.geojson", model: "MULLER2022" },
  { ageMa: 850, filename: "muller2022_coastlines_850Ma.geojson", model: "MULLER2022" },
  { ageMa: 900, filename: "muller2022_coastlines_900Ma.geojson", model: "MULLER2022" },
  { ageMa: 950, filename: "muller2022_coastlines_950Ma.geojson", model: "MULLER2022" },
  { ageMa: 1000, filename: "muller2022_coastlines_1000Ma.geojson", model: "MULLER2022" },
  { ageMa: 1100, filename: "cao2024_coastlines_1100Ma.geojson", model: "CAO2024" },
  { ageMa: 1200, filename: "cao2024_coastlines_1200Ma.geojson", model: "CAO2024" },
  { ageMa: 1300, filename: "cao2024_coastlines_1300Ma.geojson", model: "CAO2024" },
  { ageMa: 1400, filename: "cao2024_coastlines_1400Ma.geojson", model: "CAO2024" },
  { ageMa: 1500, filename: "cao2024_coastlines_1500Ma.geojson", model: "CAO2024" },
  { ageMa: 1600, filename: "cao2024_coastlines_1600Ma.geojson", model: "CAO2024" },
  { ageMa: 1700, filename: "cao2024_coastlines_1700Ma.geojson", model: "CAO2024" },
  { ageMa: 1800, filename: "cao2024_coastlines_1800Ma.geojson", model: "CAO2024" },
];

export const GPLATES_MAX_AGE_MA = 1800;

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
