# Timeline charts

Press C or use the chart icon beside Layers. Up to two metrics can be enabled;
selection order assigns the left and right Y-axes. Each axis has a vertical,
color-matched metric name and unit. Unchecking a chart releases its slot. The
selection is remembered in local storage, including migration from the original
single-chart preference. Fit and uncertainty controls are session-only.

The graphs use the existing time axis and reserve no space for panels or lanes.
Lines paint above historical bands and below the time axis and event markers.
Their Y positions are independent of overlay scrolling. The default Y range keeps
each metric's standard range and expands continuously when visible values exceed
it. A source entering the viewport does not select its entire nominal range.
Fit Y-axis uses only the visible curve, including interpolated edge values, with
continuous padding rather than rounded scale steps.
During navigation, each displayed Y range stays fixed. Once the viewport has
settled for 180 ms it eases to the new visible range over 350 ms. Another gesture
interrupts the ease at its currently displayed range. This also covers keyboard,
overview and programmatic navigation. Reduced-motion preferences keep the hold
and apply the new range without animation. Both lines and ribbons are clipped in
X and Y before drawing, including values outside a temporarily frozen scale.
Guides and cosmic-calendar mode suppress these Earth graphs.

## Records and line styles

- Dashed: PhanDA geological reconstructions.
- Dotted: the CO2 historical/ice-core compilation before 1958.
- Solid: recent atmospheric observations and the modern temperature series.

Dense curves render continuously when there are fewer than eight horizontal
pixels per plotted vertex, avoiding noisy dash patterns at wide zoom levels.
Source identities and links remain available in the menu. Paths and uncertainty
ribbons are clipped to the visible X range before drawing; distant bracketing
points never reach Canvas. A reusable viewport projection avoids normalizing the
same viewport for each chart point.

Each source is rendered independently. No path or uncertainty ribbon connects
separate records, fills a source gap, or extrapolates beyond the last point.
Hover or tap near a curve to inspect its metric, value and the date of the nearest
actual datum. Reconstructed and absolute-temperature estimates use an approx.
symbol. Historical label interactions retain priority. The closest line wins at
crossings. In the menu, each item expands to source names and links, including
line-style keys for the patched climate records.

## Deep-time temperature and CO2

Both use the published PhanDA output from Judd et al. (2024), *A
485-million-year history of Earth's surface temperature*, Science,
doi:10.1126/science.adk3705.

- Authors' data: https://github.com/EJJudd/PhanDA
- Original CSV: https://raw.githubusercontent.com/EJJudd/PhanDA/main/5_Outputs/PhanDA_GMSTandCO2_percentiles.csv
- The full original CSV, with all 85 geological intervals and all supplied
  percentiles, is preserved at `public/data/charts/phanda.csv`.
- Lines use interval-midpoint ages, medians, and 5th–95th percentile bounds.
  Those bounds are a 90% range, not a 95% range. The age conversion uses the
  fixed 1950 epoch; source age resolution remains geological.
- The oldest plotted midpoint is about 482 Ma; its interval extends to about
  487 Ma. The authors describe the record as a 485-million-year reconstruction.
- The youngest temperature point is the Holocene average, whose midpoint is
  5,850 years BP (3901 BCE), not a measurement of today's temperature.
- For CO2, geological points overlapping the much finer ice-core/observed record
  are omitted from the displayed composite. The youngest retained geological
  point is about 1.287 Ma; the interval before the ice-core record begins remains
  blank. The original 85-interval CO2 output is retained in the raw CSV.

Modern temperature uses HadCRUT5 version 5.2.0.0 annual global anomalies plus the
published approximate 14°C global 1961–1990 reference (Jones et al., 1999, as
reported by Met Office). This makes the axis absolute °C throughout; it does not
force the modern curve to match PhanDA. The gap between the Holocene midpoint
and the first annual value in 1850 remains blank. The 14°C absolute reference
adds systematic uncertainty: displayed modern bounds are shifted HadCRUT5 95%
intervals and do **not** include uncertainty in that absolute reference.

- Absolute reference: https://www.metoffice.gov.uk/hadobs/indicators/
- Annual analysis: https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.2.0.0/download.html
- Method: https://doi.org/10.1029/2019JD032361

## Other source snapshots

The JSON files in `public/data/charts` are loaded on demand and cached in memory.
They retain source URLs, retrieval dates, original source resolution and explicit
segment metadata. No projections or incomplete current-year temperature values
are included.

- Recent CO2: NOAA Global Monitoring Laboratory and EPA, compiled by Our World
  in Data. 803,719 BCE–2025 CE; 1,874 values.
  https://ourworldindata.org/grapher/co2-long-term-concentration
- Population: HYDE, Gapminder and UN WPP, compiled by Our World in Data.
  10,000 BCE–2023 CE; 261 values.
  https://ourworldindata.org/grapher/population
- Life expectancy at birth: UN World Population Prospects 2024 via Our World in
  Data. 1950–2023 CE; 74 values.
  https://ourworldindata.org/grapher/life-expectancy-unwpp
- Sea level: Spratt & Lisiecki (2016), five-record long stack archived by NOAA,
  dataset DOI 10.25921/rd66-5820. 799 values at 1,000-year intervals. BP uses
  1950 CE, not the current year. Original values and 95% bounds are retained;
  the final estimated value is not artificially shifted to zero.
  https://www.ncei.noaa.gov/access/paleo-search/study/19982
  https://doi.org/10.5194/cp-12-1079-2016

OWID processing is credited under CC BY, with original provider terms linked
from its data pages. HadCRUT terms are linked from the Met Office page. Cite the
original authors and NOAA archive for sea level and Judd et al. for PhanDA.

## Refresh

```sh
python3 scripts/generate-timeline-charts.py
```

Use `--input-dir /path/to/downloads` for offline regeneration from originals,
including `phanda.csv`. The script converts calendar BP dates without year zero,
keeps source records separate, and shifts modern temperature to approximate
absolute °C using the documented reference. Review coverage labels after updates.

## Additional history records

- **Ice-age indicator:** all 2,115 original LR04 observations, 5.32 million years
  BP–1950 CE. Benthic δ18O in per mil VPDB combines ice-volume and deep-water
  temperature effects; it is not a direct ice-volume estimate. Bounds preserve
  the supplied ±1 standard error, not a 95% interval or total reconstruction
  uncertainty. Fixed 1950 epoch. https://lorraine-lisiecki.com/stack.html
  https://doi.org/10.1029/2004PA001071
- **Agricultural land area:** all 128 World observations, 10,000 BCE–2025 CE,
  from HYDE 3.5 via OWID. Hectares of cropland and grazing land; early values are
  reconstructions. HYDE's FAO inputs for 2023–2025 are extrapolated.
  https://ourworldindata.org/grapher/total-agricultural-area-over-the-long-term
  https://doi.org/10.24416/UU01-F45D44
- **Primary energy use:** all 78 World observations, 1800–2025 CE, in TWh of
  total energy supply. Traditional biomass is excluded. Smil supplies pre-1965
  estimates; Energy Institute/EIA supply subsequent statistics. Uses the current
  total-supply methodology throughout, not the old substitution-method dataset.
  https://ourworldindata.org/grapher/energy-mix?metric=total&source=total
- **Marine biodiversity:** expected genus richness per 1,000 genus-collection
  occurrences, calculated by this project with exact classical rarefaction.
  Uses the archived 2019 PBDB snapshot and the explicit taxonomic,
  environmental, lithification and named time-bin filters from Kocsis et al.'s
  divDyn example. Class+genus identifies taxa; repeated occurrences of a genus
  in one collection count once. The 48 retained bins are plotted at their
  midpoints, approximately 522.5–5.8 Ma. The last bin spans 11.6–0.01 Ma;
  its midpoint value is not a present-day estimate. The earliest bin has fewer
  than 1,000 occurrences and is omitted. Missing bins break the line.
  This is not the authors' SQS curve or total species richness. Rarefaction
  standardizes occurrence counts but does not eliminate geographic,
  preservation or bin-duration biases. No confidence interval is invented.
  Source revisions and SHA-256 hashes are recorded for regeneration; per-bin
  observed richness, occurrence counts and ages are retained in the snapshot.
  https://github.com/divDyn/ddPhanero
  https://doi.org/10.1111/2041-210X.13161

For taxon counts `n_i`, total occurrences `N` and quota `q = 1000`, expected
richness is `sum(1 - C(N - n_i, q) / C(N, q))`. This deterministic calculation
avoids Monte Carlo noise. The original fossil record has roughly 1.4 million
occurrences; only the compact processed series is shipped to browsers.

To regenerate these four snapshots, install `pyreadr` and `pandas` in your Python
environment, then run:

```sh
python3 scripts/generate-history-charts.py
python3 scripts/test_history_charts.py
```

`--input-dir` reads the original downloaded files offline. `--skip-biodiversity`
refreshes just the three CSV/text datasets without Python package dependencies.
The biodiversity sources are pinned to specific repository revisions. Neither
chart navigation nor the application build needs Python or these packages.
