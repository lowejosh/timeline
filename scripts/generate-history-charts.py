"""Refresh the land-use, energy, ice-age and marine biodiversity snapshots.

Use --input-dir to regenerate from the original downloaded files offline.
"""
import argparse
import csv
import datetime
import hashlib
import io
import json
import math
import re
import tempfile
from collections import Counter
from pathlib import Path
import urllib.request

SOURCES = {
    'land.csv': 'https://ourworldindata.org/grapher/total-agricultural-area-over-the-long-term.csv?tab=table',
    'energy.csv': 'https://ourworldindata.org/grapher/energy-mix.csv?metric=total&source=total&csvType=full',
    'lr04.txt': 'https://lorraine-lisiecki.com/LR04stack.txt',
}
BIODIVERSITY_SOURCES = {
    'paleoDB.RData': 'https://raw.githubusercontent.com/divDyn/ddPhanero/e59e1f0ecbf937ba153162cbc90a3692c5e88b01/data/PaleoDB/2019-05-31_paleoDB.RData',
    'dd-phanero.Rmd': 'https://raw.githubusercontent.com/divDyn/ddPhanero/e59e1f0ecbf937ba153162cbc90a3692c5e88b01/doc/1.0.1/dd_phanero.Rmd',
    'stratkeys.RData': 'https://raw.githubusercontent.com/divDyn/r-package/0c453483caa6743b67a8f31ec20763bd145cec09/data/stratkeys.RData',
    'tens.RData': 'https://raw.githubusercontent.com/divDyn/r-package/0c453483caa6743b67a8f31ec20763bd145cec09/data/tens.RData',
}


def calendar_bp(age):
    year = round(1950 - age)
    return year - 1 if year <= 0 else year


def read_source(name, input_dir, sources=SOURCES):
    if input_dir:
        return (input_dir / name).read_bytes()
    request = urllib.request.Request(sources[name], headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def write_snapshot(name, points, source, hashes, **metadata):
    points.sort(key=lambda point: point[0])
    assert len(points) >= 2 and all(math.isfinite(value) for point in points for value in point), name
    assert all(a[0] < b[0] for a, b in zip(points, points[1:])), name
    result = dict(retrieved=datetime.date.today().isoformat(), sourceUrl=source, sourceSha256=hashes, points=points, **metadata)
    output = Path(__file__).resolve().parents[1] / 'public/data/charts' / (name + '.json')
    output.write_text(json.dumps(result, separators=(',', ':')) + '\n')
    print(f'{name}: {len(points)} values, {points[0][0]} to {points[-1][0]}')


def rarefied_richness(counts, quota=1000):
    """Exact expected richness under occurrence-based sampling without replacement."""
    total = sum(counts)
    if total < quota:
        return None
    log_denominator = math.lgamma(total + 1) - math.lgamma(total - quota + 1)
    result = 0.0
    for count, frequency in Counter(counts).items():
        if total - count < quota:
            probability = 1.0
        else:
            log_absent = math.lgamma(total - count + 1) - math.lgamma(total - count - quota + 1) - log_denominator
            probability = -math.expm1(min(0.0, log_absent))
        result += frequency * probability
    return result


def biodiversity(input_dir):
    try:
        import pyreadr
    except ImportError as error:
        raise SystemExit('Biodiversity regeneration requires pyreadr and pandas: pip install pyreadr pandas') from error
    raw = {name: read_source(name, input_dir, BIODIVERSITY_SOURCES) for name in BIODIVERSITY_SOURCES}
    with tempfile.TemporaryDirectory() as directory:
        for name in ['paleoDB.RData', 'stratkeys.RData', 'tens.RData']:
            Path(directory, name).write_bytes(raw[name])
        data = pyreadr.read_r(str(Path(directory, 'paleoDB.RData')))['dat']
        keys = pyreadr.read_r(str(Path(directory, 'stratkeys.RData')))['stratkeys']
        bins = pyreadr.read_r(str(Path(directory, 'tens.RData')))['tens']

    # Follow the authors' explicit taxonomic, environmental, lithification and
    # time-bin filters. Reuse their named sets instead of silently broadening scope.
    vignette = raw['dd-phanero.Rmd'].decode('latin-1')
    def named_set(name):
        body = re.search(r'\b' + name + r'\s*<-\s*c\((.*?)\)', vignette, re.S).group(1)
        return [json.loads(value) for value in re.findall(r'"(?:[^"\\]|\\.)*"', body)]

    marine = (data['phylum'].isin(named_set('marineNoPlant')) | data['class'].isin(named_set('needClass')) |
              data['order'].isin(named_set('needMammalOrd') + named_set('needReptOrd')) |
              data['family'].isin(named_set('needFam') + named_set('needTurtleFam')))
    keep = (data['accepted_rank'].isin(['genus', 'species']) & data['genus'].notna() & (data['genus'] != '') &
            marine & ~data['environment'].isin(named_set('omitEnv')) & (data['lithification1'] != 'unlithified'))
    data = data.loc[keep].copy()
    lookup = dict(zip(keys['interval'], keys['ten']))
    early = data['early_interval'].map(lookup)
    late = data['late_interval'].map(lookup)
    empty_late = data['late_interval'].isna() | (data['late_interval'] == '')
    data['bin'] = early.where(empty_late | (early == late))
    data = data.dropna(subset=['bin'])
    data['taxon'] = data['class'].astype('object').fillna('') + ' ' + data['genus'].astype('object')
    data = data.drop_duplicates(['bin', 'collection_no', 'taxon'])
    details = []
    segments = []
    previous = None
    for bin_id, group in data.groupby('bin', observed=True, sort=True):
        times = bins.loc[bins['ten'] == bin_id]
        if times.empty:
            continue
        counts = group.groupby('taxon', observed=True).size().tolist()
        value = rarefied_richness(counts)
        if value is None:
            continue
        interval = times.iloc[0]
        point = [calendar_bp(float(interval['mid']) * 1_000_000), round(value, 5)]
        if previous is None or bin_id != previous + 1:
            segments.append(dict(id=f'rarefaction-{int(bin_id)}', label='Occurrence rarefaction, quota 1000',
                                 sourceUrl=BIODIVERSITY_SOURCES['paleoDB.RData'], style='dashed', points=[]))
        segments[-1]['points'].append(point)
        details.append(dict(bin=int(bin_id), midMa=float(interval['mid']), bottomMa=float(interval['bottom']),
                            topMa=float(interval['top']), occurrences=sum(counts), observedGenera=len(counts), richness=round(value, 5)))
        previous = bin_id
    points = [point for segment in segments for point in segment['points']]
    write_snapshot('biodiversity', points, BIODIVERSITY_SOURCES['paleoDB.RData'],
                   {name: hashlib.sha256(content).hexdigest() for name, content in raw.items()},
                   segments=segments, bins=details, rarefactionQuota=1000,
                   methodology='Marine genus richness per 1000 genus-collection occurrences. Exact classical rarefaction of the archived May 2019 PBDB snapshot, using divDyn taxonomic/environmental filters and named ~10-Myr bins. Class+genus identities; deduplicated within collections. Under-quota bins are omitted and break the line. This project computes this standardized curve; it is not the authors\' SQS curve or total living species richness. Geographic, preservation and bin-duration biases remain.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', type=Path)
    parser.add_argument('--skip-biodiversity', action='store_true', help='Refresh only the three text/CSV datasets; no R-data reader required.')
    args = parser.parse_args()
    raw = {name: read_source(name, args.input_dir) for name in SOURCES}
    for filename, name in [('land.csv', 'agricultural-land'), ('energy.csv', 'energy')]:
        points = []
        for row in csv.DictReader(io.StringIO(raw[filename].decode('utf-8-sig'))):
            if row['Entity'] != 'World':
                continue
            year = int(row['Year'])
            if year >= datetime.date.today().year:
                continue
            value = float(list(row.values())[3])
            points.append([year if year else -1, value])
        note = ('HYDE 3.5 agricultural area, hectares. 2023–2025 extrapolated from FAO inputs.' if name == 'agricultural-land'
                else 'Global total energy supply in TWh. Traditional biomass excluded. Smil before 1965; Energy Institute / EIA thereafter. Current total-supply methodology, not the legacy substitution method.')
        write_snapshot(name, points, SOURCES[filename], {filename: hashlib.sha256(raw[filename]).hexdigest()}, methodology=note)

    points = []
    for line in raw['lr04.txt'].decode().splitlines():
        parts = line.split()
        if len(parts) != 3:
            continue
        try:
            age, value, se = map(float, parts)
        except ValueError:
            continue
        points.append([calendar_bp(age * 1000), value, round(value - se, 5), round(value + se, 5)])
    write_snapshot('ice-age', points, SOURCES['lr04.txt'], {'lr04.txt': hashlib.sha256(raw['lr04.txt']).hexdigest()},
                   methodology='LR04 benthic δ18O stack, per mil VPDB, 57 marine sites. Higher values reflect greater ice volume and/or colder deep water. Bounds are ±1 supplied standard error, not a full reconstruction interval. Fixed 1950 BP epoch; original sampling retained.')
    if not args.skip_biodiversity:
        biodiversity(args.input_dir)


if __name__ == '__main__':
    main()
