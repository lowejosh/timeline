export type ChartId = "co2" | "temperature" | "sea-level" | "population" | "life-expectancy" | "agricultural-land" | "energy" | "ice-age" | "biodiversity";
export type ChartPoint = [year: number, value: number, low?: number, high?: number];
export type ChartSegment = {
  id: string;
  label: string;
  sourceUrl: string;
  style: "solid" | "dashed" | "dotted";
  domain?: [number, number];
  uncertainty?: string;
  points: ChartPoint[];
};
export type ChartData = { retrieved: string; sourceUrl: string; points: ChartPoint[]; segments?: ChartSegment[] };
export type ChartDefinition = {
  id: ChartId;
  label: string;
  unit: string;
  color: string;
  coverage: string;
  record: string;
  credit: string;
  description: string;
  domain: [number, number];
  sources: { title: string; url: string; lineStyle?: "solid" | "dashed" | "dotted" }[];
};

export const CHARTS: readonly ChartDefinition[] = [
  {
    id: "co2", label: "Atmospheric CO₂", unit: "ppm", color: "#00649a",
    coverage: "c. 485 million years ago–2025 CE", record: "Reconstruction, ice cores & observations", credit: "PhanDA / NOAA / EPA · OWID",
    description: "PhanDA supplies older geological interval averages, with 5th–95th percentile bounds. Ice-core and observed data replace overlapping geological estimates. Separate sources are never joined across missing periods. Atmospheric concentration, in parts per million. Earlier samples come from ice cores; recent values come from atmospheric monitoring. Compiled by Our World in Data. Historical sampling is irregular; connecting lines show trends between samples, not annual measurements.",
    domain: [150, 450],
    sources: [
      { title: "PhanDA · reconstruction", url: "https://github.com/EJJudd/PhanDA", lineStyle: "dashed" },
      { title: "Our World in Data", url: "https://ourworldindata.org/grapher/co2-long-term-concentration" },
      { title: "NOAA · atmospheric CO₂", url: "https://gml.noaa.gov/ccgg/trends/gl_data.html", lineStyle: "solid" },
      { title: "EPA · greenhouse gas concentrations", url: "https://www.epa.gov/climate-indicators/climate-change-indicators-atmospheric-concentrations-greenhouse-gases", lineStyle: "dotted" },
    ],
  },
  {
    id: "temperature", label: "Global temperature", unit: "°C", color: "#b24100",
    coverage: "c. 485 million years ago–2025 CE", record: "Reconstruction & observations", credit: "PhanDA / HadCRUT5",
    description: "PhanDA absolute global mean surface temperature: 85 geological interval averages, plotted at their midpoints. Its youngest point is a Holocene average, not an annual modern observation. The separate 1850–2025 segment is HadCRUT5 plus the published approximate 14°C 1961–1990 reference. No connector fills the intervening gap. PhanDA bounds are 5th–95th percentiles; modern bounds are shifted HadCRUT5 95% intervals and exclude absolute-reference uncertainty.",
    domain: [12, 17],
    sources: [
      { title: "PhanDA · reconstruction", url: "https://github.com/EJJudd/PhanDA", lineStyle: "dashed" },
      { title: "Met Office · approximate 14°C reference", url: "https://www.metoffice.gov.uk/hadobs/indicators/" },
      { title: "Met Office / UEA · HadCRUT5", url: "https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.2.0.0/download.html", lineStyle: "solid" },
      { title: "Morice et al. (2021)", url: "https://doi.org/10.1029/2019JD032361" },
    ],
  },
  {
    id: "sea-level", label: "Global sea level", unit: "m", color: "#007a68",
    coverage: "About 798,000 years BP–1950 CE", record: "Reconstruction", credit: "Spratt & Lisiecki · NOAA",
    description: "Sea level in metres relative to modern sea level, reconstructed from five sediment-core records (the long stack). Spratt & Lisiecki (2016), archived by NOAA; dataset DOI 10.25921/rd66-5820. Samples are 1,000 years apart. BP uses the fixed epoch 1950 CE. The optional ribbon shows the supplied 95% interval. This is not a modern tide-gauge record.",
    domain: [-150, 50],
    sources: [
      { title: "NOAA · sea-level reconstruction", url: "https://www.ncei.noaa.gov/access/paleo-search/study/19982" },
      { title: "Spratt & Lisiecki (2016)", url: "https://doi.org/10.5194/cp-12-1079-2016" },
    ],
  },
  {
    id: "population", label: "World population", unit: "people", color: "#803a99",
    coverage: "10,000 BCE–2023 CE", record: "Historical estimates", credit: "HYDE / Gapminder / UN · OWID",
    description: "Estimated world population, compiled by Our World in Data from HYDE, Gapminder and UN World Population Prospects (2024). Early values are sparse historical estimates, not censuses. Connecting lines between samples are for orientation; they cannot resolve individual ancient events. No projections are included.",
    domain: [0, 10_000_000_000],
    sources: [
      { title: "Our World in Data · population", url: "https://ourworldindata.org/grapher/population" },
      { title: "HYDE", url: "https://essd.copernicus.org/articles/9/927/2017/" },
      { title: "UN · World Population Prospects 2024", url: "https://population.un.org/wpp/" },
    ],
  },
  {
    id: "life-expectancy", label: "Life expectancy", unit: "years", color: "#474747",
    coverage: "1950–2023 CE", record: "Demographic estimates", credit: "UN WPP 2024 · OWID",
    description: "World life expectancy at birth, in years, from UN World Population Prospects 2024 via Our World in Data. This period measure reflects mortality rates in each year, not the eventual lifespan of people born that year. No projections are included.",
    domain: [0, 90],
    sources: [
      { title: "Our World in Data · life expectancy", url: "https://ourworldindata.org/grapher/life-expectancy-unwpp" },
      { title: "UN · World Population Prospects 2024", url: "https://population.un.org/wpp/" },
    ],
  },
  {
    id: "ice-age", label: "Ice-age indicator", unit: "δ¹⁸O ‰", color: "#584180",
    coverage: "5.32 million years BP–1950 CE", record: "Marine isotope reconstruction", credit: "Lisiecki & Raymo · LR04",
    description: "LR04 benthic oxygen-isotope stack from 57 marine sites. Higher δ18O indicates greater ice volume and/or colder deep oceans; this is not an ice-volume or air-temperature measurement. The ribbon is ±1 supplied standard error. BP uses the fixed 1950 epoch.",
    domain: [2, 5.5],
    sources: [
      { title: "Lisiecki & Raymo · LR04 data", url: "https://lorraine-lisiecki.com/stack.html" },
      { title: "Lisiecki & Raymo (2005)", url: "https://doi.org/10.1029/2004PA001071" },
      { title: "NOAA · LR04 archive", url: "https://www.ncei.noaa.gov/access/paleo-search/study/5847" },
    ],
  },
  {
    id: "agricultural-land", label: "Agricultural land area", unit: "ha", color: "#637300",
    coverage: "10,000 BCE–2025 CE", record: "Land-use reconstruction", credit: "HYDE 3.5 · OWID",
    description: "Global cropland and grazing land area in hectares, reconstructed by HYDE 3.5. Early values are modelled, not direct surveys. HYDE extrapolates its 2023–2025 FAO inputs. Original time steps are retained.",
    domain: [0, 5_000_000_000],
    sources: [
      { title: "Our World in Data · agricultural area", url: "https://ourworldindata.org/grapher/total-agricultural-area-over-the-long-term" },
      { title: "HYDE 3.5", url: "https://doi.org/10.24416/UU01-F45D44" },
    ],
  },
  {
    id: "energy", label: "Primary energy use", unit: "TWh", color: "#965a12",
    coverage: "1800–2025 CE · excludes traditional biomass", record: "Historical estimates & energy statistics", credit: "Smil / Energy Institute / EIA · OWID",
    description: "Global total energy supply in terawatt-hours, excluding traditional biomass. Smil historical estimates before 1965; Energy Institute and EIA statistics thereafter. Uses the current total-supply methodology, not legacy substitution-method figures.",
    domain: [0, 180_000],
    sources: [
      { title: "Our World in Data · total energy supply", url: "https://ourworldindata.org/grapher/energy-mix?metric=total&source=total" },
      { title: "Energy Institute · statistical review", url: "https://www.energyinst.org/statistical-review" },
      { title: "Smil · Energy Transitions", url: "https://vaclavsmil.com/book/energy-transitions-global-and-national-perspectives-second-expanded-and-updated-edition/" },
    ],
  },
  {
    id: "biodiversity", label: "Marine biodiversity", unit: "genera / 1k records", color: "#9b285a",
    coverage: "523–5.8 million years BP · rarefied", record: "Sampling-standardized fossil richness", credit: "PBDB / Kocsis et al. · classical rarefaction",
    description: "Expected marine genus richness in a sample of 1000 genus-collection occurrences. Computed from the archived 2019 PBDB dataset with divDyn taxonomic, environmental and time-bin filters. Classical rarefaction standardizes sample counts; geographic and preservation biases remain. Points summarize geological intervals plotted at their midpoints, not total living species counts. Bins with fewer than 1000 occurrences are omitted. This is this project's processed curve, not the authors' SQS curve.",
    domain: [0, 750],
    sources: [
      { title: "Kocsis et al. · archived fossil data & filters", url: "https://github.com/divDyn/ddPhanero", lineStyle: "dashed" },
      { title: "Kocsis et al. (2019) · sampling methods", url: "https://doi.org/10.1111/2041-210X.13161" },
      { title: "Paleobiology Database", url: "https://paleobiodb.org" },
    ],
  },
];

export function getChart(id: ChartId | null) {
  return CHARTS.find(chart => chart.id === id) ?? null;
}

export function formatChartValue(value: number, chart: ChartDefinition) {
  if (["population", "agricultural-land", "energy"].includes(chart.id)) {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  }
  return new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(value);
}
