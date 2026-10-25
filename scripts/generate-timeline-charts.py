"""Refresh compact, world-only chart snapshots from documented public datasets.

Usage: python3 scripts/generate-timeline-charts.py [--input-dir /path/to/downloads]
Without --input-dir, downloads the source files. No forecasts are included.
"""
import argparse
import csv
import datetime
import io
import json
import math
from pathlib import Path
import urllib.request

SOURCES = {
    'co2': 'https://ourworldindata.org/grapher/co2-long-term-concentration.csv',
    'population': 'https://ourworldindata.org/grapher/population.csv',
    'life': 'https://ourworldindata.org/grapher/life-expectancy-unwpp.csv',
    'temperature': 'https://www.metoffice.gov.uk/hadobs/hadcrut5/data/HadCRUT.5.2.0.0/analysis/diagnostics/HadCRUT.5.2.0.0.analysis.summary_series.global.annual.csv',
    'phanda': 'https://raw.githubusercontent.com/EJJudd/PhanDA/main/5_Outputs/PhanDA_GMSTandCO2_percentiles.csv',
    'sea': 'https://www.ncei.noaa.gov/pub/data/paleo/contributions_by_author/spratt2016/spratt2016-noaa.txt',
}
FILENAMES = {'sea': 'sea.txt'}
OUTPUT_NAMES = {'sea': 'sea-level', 'life': 'life-expectancy'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', type=Path)
    args = parser.parse_args()
    output_dir = Path(__file__).resolve().parents[1] / 'public/data/charts'
    output_dir.mkdir(parents=True, exist_ok=True)
    phanda = None
    for key, url in SOURCES.items():
        filename = FILENAMES.get(key, key + '.csv')
        if args.input_dir:
            content = (args.input_dir / filename).read_text(encoding='utf-8-sig')
        else:
            with urllib.request.urlopen(url, timeout=60) as response:
                content = response.read().decode('utf-8-sig')
        if key == 'phanda':
            phanda = list(csv.DictReader(io.StringIO(content)))
            (output_dir / 'phanda.csv').write_text(content)
            continue
        points = []
        if key == 'sea':
            lines = [line for line in content.splitlines() if line and not line.startswith('#')]
            for row in csv.DictReader(lines, delimiter='\t'):
                # NOAA calendar kiloyears BP use the fixed epoch 1950 CE.
                # Convert astronomical years to signed BCE/CE without year zero.
                year = 1950 - float(row['age_calkaBP']) * 1000
                if year <= 0:
                    year -= 1
                value = float(row['SeaLev_longPC1'])
                if math.isfinite(value):
                    points.append([int(year), value, float(row['SeaLev_longPC1_err_lo']), float(row['SeaLev_longPC1_err_up'])])
        elif key == 'temperature':
            for row in csv.reader(io.StringIO(content)):
                if row[0] == 'Time':
                    continue
                # Annual series only; discard an incomplete current year.
                year = int(row[0])
                if year >= datetime.date.today().year:
                    continue
                points.append([year, *[round(float(value), 5) for value in row[1:4]]])
        else:
            for row in csv.reader(io.StringIO(content)):
                if row[0] == 'World':
                    year = int(row[2])
                    # Historical compilations may use zero for the era boundary.
                    points.append([year if year else -1, round(float(row[3]), 5)])
        points.sort(key=lambda point: point[0])
        assert len(points) >= 2 and all(math.isfinite(v) for p in points for v in p)
        assert all(a[0] < b[0] for a, b in zip(points, points[1:])), key
        result = {'retrieved': datetime.date.today().isoformat(), 'sourceUrl': url, 'points': points}
        path = output_dir / (OUTPUT_NAMES.get(key, key) + '.json')
        path.write_text(json.dumps(result, separators=(',', ':')) + '\n')
        print(f'{path.name}: {len(points)} samples, {points[0][0]} to {points[-1][0]}')

    # Each source remains a separate segment: never draw a connector between
    # geological averages and annual observations, or across missing coverage.
    assert phanda
    def paleo_points(prefix):
        points = []
        for row in phanda:
            # Fixed 1950 epoch for geological Ma; stage midpoints, not annual data.
            year = round(1950 - float(row['AverageAge']) * 1_000_000)
            if year <= 0:
                year -= 1
            points.append([year, *[round(float(row[prefix + suffix]), 5) for suffix in ['_50', '_05', '_95']]])
        return sorted(points)

    def segment(id, label, url, style, domain, points, uncertainty=None):
        return dict(id=id, label=label, sourceUrl=url, style=style, domain=domain, points=points, uncertainty=uncertainty)

    co2_path = output_dir / 'co2.json'
    co2 = json.loads(co2_path.read_text())
    historical = [point for point in co2['points'] if point[0] < 1958]
    observations = [point for point in co2['points'] if point[0] >= 1958]
    deep = [point for point in paleo_points('CO2') if point[0] < historical[0][0]]
    co2['segments'] = [
        segment('phanda-co2', 'PhanDA reconstruction', SOURCES['phanda'], 'dashed', [0, 5000], deep, '5th–95th percentiles'),
        segment('historical-co2', 'Ice cores / historical compilation', SOURCES['co2'], 'dotted', [150, 450], historical),
        segment('observed-co2', 'Atmospheric observations', SOURCES['co2'], 'solid', [150, 450], observations),
    ]
    co2['points'] = sorted(deep + co2['points'])
    co2_path.write_text(json.dumps(co2, separators=(',', ':')) + '\n')

    temp_path = output_dir / 'temperature.json'
    temperature = json.loads(temp_path.read_text())
    # Jones et al. (1999), as published by Met Office: global 1961–1990 mean
    # approx. 14 C. This is an approximate absolute series; no alignment to
    # PhanDA is forced. Shift HadCRUT's interval without claiming to include
    # the additional systematic uncertainty in that absolute baseline.
    modern = [[p[0], *[round(v + 14, 5) for v in p[1:]]] for p in temperature['points']]
    deep = paleo_points('GMST')
    temperature['segments'] = [
        segment('phanda-temperature', 'PhanDA reconstruction', SOURCES['phanda'], 'dashed', [5, 45], deep, '5th–95th percentiles'),
        segment('hadcrut-absolute', 'HadCRUT5 + 14°C reference (approx.)', SOURCES['temperature'], 'solid', [12, 17], modern, 'Shifted HadCRUT5 95% interval; baseline uncertainty excluded'),
    ]
    temperature['points'] = sorted(deep + modern)
    temperature['absoluteReferenceCelsius'] = 14
    temperature['absoluteReferenceUrl'] = 'https://www.metoffice.gov.uk/hadobs/indicators/'
    temp_path.write_text(json.dumps(temperature, separators=(',', ':')) + '\n')
    print(f"PhanDA: {len(phanda)} geological intervals; CO2 and absolute temperature retain separate source segments")


if __name__ == '__main__':
    main()
