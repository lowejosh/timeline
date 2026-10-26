# Magnetic polarity ribbon

Settings → Magnetic reversals enables a two-pixel ribbon centred on the
main time axis. It is off by default, persists in the existing UI storage, and is
hidden in Cosmic Calendar mode. Darker intervals have today's polarity; pale
intervals have reversed polarity. Hover/tap gives the polarity, age range and source.
The Settings link provides a keyboard-accessible source independently of canvas hover.

The bundled table is the complete GTS2020 boundary array distributed by
[PmagPy's `pmag.get_ts("gts20")`](https://github.com/PmagPy/PmagPy/blob/master/pmagpy/pmag.py):
189 boundaries, 188 alternating intervals, from the present to 82.875 Ma. The
latest reversal in this calibration is 0.773 Ma. The endpoint is a coverage limit,
not an extrapolation into the older Cretaceous superchron. Brief excursions are
not added to this chron/subchron table.

Use `python3 scripts/generate-magnetic-polarity.py [downloaded-pmag.py]` to
regenerate the JSON. The importer parses literal data without executing upstream
Python and records a SHA-256 fingerprint; a changed source requires review.

All interval boundaries retain their source precision. Rendering clips to the
viewport before drawing. At low resolution, each pixel blends polarity by the
actual interval widths; reversals are never widened to a minimum screen size.
Only covered dates receive a ribbon. Its palette follows the timeline theme and
it reserves no extra band space.
