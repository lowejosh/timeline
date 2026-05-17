Sample reconstructed coastline GeoJSON slices from the GPlates Web Service.

Source: https://gws.gplates.org/reconstruct/coastlines/
Documentation: https://gwsdoc.gplates.org/reconstruction/reconstruct-coastlines/
Models:
- ZAHIROVIC2022 for 0-410 Ma
- MULLER2022 for deep-time preview slices from 450-1000 Ma
- CAO2024 for deeper-time preview slices from 1100-1800 Ma

These files are vendored as a small MVP sample for the timeline map overlay. The deep-time
MULLER2022 and CAO2024 slices are denser than the first pass but still intentionally sampled
so the overlay can be tested further back without pulling in a large reconstruction bundle yet.
