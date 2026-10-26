# Historical map options — 25 October 2026

The app currently uses André Ourednik's historical-basemaps for human history and
GPlates reconstructed coastlines for earlier dates. These solve different problems:
political/cultural boundaries versus continental geometry.

## Immediate rendering correction

`MapPreview.data.ts` previously sampled every Nth coordinate until each ring had
about 170 points. This discarded existing detail and cut across corners; the
2010 source contains 46,726 points and its longest ring has 2,857 points. The
renderer now retains all source vertices. Rounded coordinates still preserve
0.01 map units. Paths are built once per loaded slice and cached as Path2D objects.
This improves fidelity to the source; it cannot add missing historical detail.

## Sources worth evaluating

| Source | Coverage and benefit | Limits for this app |
| --- | --- | --- |
| [Current historical-basemaps](https://github.com/aourednik/historical-basemaps) | Broad world-history snapshots, easy GeoJSON integration | Intentionally world/continent scale; irregular dates; source describes itself as work in progress |
| [CShapes 2.0](https://beta.icr.ethz.ch/data/cshapes/) | Global state/dependency borders and capitals, 1886–2019; dated border changes; GeoJSON | Recent history only; dataset licence is CC BY-NC-SA 4.0 |
| [OpenHistoricalMap](https://www.openhistoricalmap.org/about) | Time-tagged local geography including streets, settlements, railways, buildings and boundaries; APIs/downloads | Coverage varies across dates and regions; its [coverage dashboard discussion](https://forum.openhistoricalmap.org/t/ohm-coverage-correctness-dashboard/717) documents geometry and chronology gaps; evaluate as a detail layer with a fallback |
| [Euratlas Periodis](https://www.euratlas.net/history/europe/) | European political geography, 21 snapshots from 1–2000 CE; smaller polities and gazetteers | Regional and centennial, not a global continuous replacement; website maps have noncommercial attribution terms and integration format/licensing needs checking |
| [PALEOMAP PaleoDEMs](https://zenodo.org/records/5460860) | Deep oceans, shallow seas, elevation/terrain over 540–0 Ma at roughly 5 Myr steps; 0.1° rasters available | Reconstructed terrain, not historical political boundaries; raster packaging and rendering needed; higher pixel resolution does not establish higher historical certainty |
| [AtlasPI](https://atlaspi.it/) | Historical entity API with snapshots and GeoJSON, linked by the current basemap project | New candidate needing independent geometry/provenance inspection; marketing and entity/source counts do not establish improved map accuracy |

Recommended next evaluation: compare CShapes and the existing maps at identical
recent dates; try OpenHistoricalMap on a few well-covered cities; separately
prototype a shaded PaleoDEM texture for deep time. No wholesale source swap has
been made. There is no demonstrated replacement here that improves all dates and
regions at once.
