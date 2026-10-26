"""Extract the GTS2020 boundary table from PmagPy without executing its code.

Usage: python3 scripts/generate-magnetic-polarity.py [downloaded-pmag.py]
"""
import ast
import hashlib
import json
from pathlib import Path
import sys
from urllib.request import urlopen

SOURCE = "https://raw.githubusercontent.com/PmagPy/PmagPy/master/pmagpy/pmag.py"
TARGET = Path(__file__).resolve().parents[1] / "src/features/magnetic-polarity/gts2020.json"


def main():
    source = Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else urlopen(SOURCE, timeout=30).read()
    digest = hashlib.sha256(source).hexdigest()
    if TARGET.exists():
        previous = json.loads(TARGET.read_text())
        if previous.get("sourceSha256", digest) != digest:
            raise ValueError("PmagPy source changed; review the new table before updating the source fingerprint.")
    module = ast.parse(source)
    function = next(node for node in module.body if isinstance(node, ast.FunctionDef) and node.name == "get_ts")
    branch = next(node for node in function.body if isinstance(node, ast.If)
                  and isinstance(node.test, ast.Compare)
                  and isinstance(node.test.comparators[0], ast.Constant)
                  and node.test.comparators[0].value == "gts20")
    assignment = next(node for node in branch.body if isinstance(node, ast.Assign)
                      and any(isinstance(target, ast.Name) and target.id == "TS" for target in node.targets))
    boundaries = ast.literal_eval(assignment.value)
    assert len(boundaries) == 189 and boundaries[:2] == [0, 0.773] and boundaries[-1] == 82.875
    assert all(a < b for a, b in zip(boundaries, boundaries[1:]))
    TARGET.write_text(json.dumps({
        "source": 'PmagPy pmag.get_ts("gts20")',
        "sourceUrl": "https://github.com/PmagPy/PmagPy/blob/master/pmagpy/pmag.py",
        "sourceSha256": digest,
        "retrieved": "2026-10-25",
        "ageUnit": "million years before present",
        "firstIntervalPolarity": "normal",
        "boundariesMa": boundaries,
    }, separators=(",", ":")) + "\n")
    print(f"Wrote {len(boundaries) - 1} intervals to {TARGET}")


if __name__ == "__main__":
    main()
