export type HistoricalBasemapSlice = {
  year: number;
  filename: string;
};

export const HISTORICAL_BASEMAP_SLICES: HistoricalBasemapSlice[] = [
  { year: -123_000, filename: "world_bc123000.geojson" },
  { year: -10_000, filename: "world_bc10000.geojson" },
  { year: -8_000, filename: "world_bc8000.geojson" },
  { year: -5_000, filename: "world_bc5000.geojson" },
  { year: -4_000, filename: "world_bc4000.geojson" },
  { year: -3_000, filename: "world_bc3000.geojson" },
  { year: -2_000, filename: "world_bc2000.geojson" },
  { year: -1_500, filename: "world_bc1500.geojson" },
  { year: -1_000, filename: "world_bc1000.geojson" },
  { year: -700, filename: "world_bc700.geojson" },
  { year: -500, filename: "world_bc500.geojson" },
  { year: -400, filename: "world_bc400.geojson" },
  { year: -323, filename: "world_bc323.geojson" },
  { year: -300, filename: "world_bc300.geojson" },
  { year: -200, filename: "world_bc200.geojson" },
  { year: -100, filename: "world_bc100.geojson" },
  { year: -1, filename: "world_bc1.geojson" },
  { year: 100, filename: "world_100.geojson" },
  { year: 200, filename: "world_200.geojson" },
  { year: 300, filename: "world_300.geojson" },
  { year: 400, filename: "world_400.geojson" },
  { year: 500, filename: "world_500.geojson" },
  { year: 600, filename: "world_600.geojson" },
  { year: 700, filename: "world_700.geojson" },
  { year: 800, filename: "world_800.geojson" },
  { year: 900, filename: "world_900.geojson" },
  { year: 1_000, filename: "world_1000.geojson" },
  { year: 1_100, filename: "world_1100.geojson" },
  { year: 1_200, filename: "world_1200.geojson" },
  { year: 1_279, filename: "world_1279.geojson" },
  { year: 1_300, filename: "world_1300.geojson" },
  { year: 1_400, filename: "world_1400.geojson" },
  { year: 1_492, filename: "world_1492.geojson" },
  { year: 1_500, filename: "world_1500.geojson" },
  { year: 1_530, filename: "world_1530.geojson" },
  { year: 1_600, filename: "world_1600.geojson" },
  { year: 1_650, filename: "world_1650.geojson" },
  { year: 1_700, filename: "world_1700.geojson" },
  { year: 1_715, filename: "world_1715.geojson" },
  { year: 1_783, filename: "world_1783.geojson" },
  { year: 1_800, filename: "world_1800.geojson" },
  { year: 1_815, filename: "world_1815.geojson" },
  { year: 1_880, filename: "world_1880.geojson" },
  { year: 1_900, filename: "world_1900.geojson" },
  { year: 1_914, filename: "world_1914.geojson" },
  { year: 1_920, filename: "world_1920.geojson" },
  { year: 1_930, filename: "world_1930.geojson" },
  { year: 1_938, filename: "world_1938.geojson" },
  { year: 1_945, filename: "world_1945.geojson" },
  { year: 1_960, filename: "world_1960.geojson" },
  { year: 1_994, filename: "world_1994.geojson" },
  { year: 2_000, filename: "world_2000.geojson" },
  { year: 2_010, filename: "world_2010.geojson" },
];

export function getNearestHistoricalBasemapSlice(year: number) {
  if (!Number.isFinite(year)) {
    return null;
  }

  let nearest = HISTORICAL_BASEMAP_SLICES[0] ?? null;
  let nearestDistance = nearest
    ? Math.abs(year - nearest.year)
    : Number.POSITIVE_INFINITY;

  for (const slice of HISTORICAL_BASEMAP_SLICES) {
    const distance = Math.abs(year - slice.year);

    if (distance < nearestDistance) {
      nearest = slice;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function getHistoricalBasemapSliceAtOrBefore(year: number) {
  if (!Number.isFinite(year)) {
    return null;
  }

  let selected: HistoricalBasemapSlice | null = null;

  for (const slice of HISTORICAL_BASEMAP_SLICES) {
    if (slice.year > year) {
      break;
    }

    selected = slice;
  }

  return selected;
}
