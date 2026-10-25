"""Check the exact rarefaction calculation against known sampling outcomes."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('history_charts', Path(__file__).with_name('generate-history-charts.py'))
charts = importlib.util.module_from_spec(spec)
spec.loader.exec_module(charts)


class RarefactionTests(unittest.TestCase):
    def test_two_genera_three_records_draw_two(self):
        # Draws {A,A}, {A,B}, {A,B} contain 1, 2 and 2 genera.
        self.assertAlmostEqual(charts.rarefied_richness([2, 1], 2), 5 / 3)

    def test_unique_records_and_full_census(self):
        self.assertAlmostEqual(charts.rarefied_richness([1] * 100, 10), 10)
        self.assertAlmostEqual(charts.rarefied_richness([5, 3, 2], 10), 3)
        self.assertAlmostEqual(charts.rarefied_richness([10000], 1000), 1)

    def test_insufficient_sampling_is_missing(self):
        self.assertIsNone(charts.rarefied_richness([5, 3, 2], 1000))

    def test_bp_calendar_conversion(self):
        self.assertEqual(charts.calendar_bp(0), 1950)
        self.assertEqual(charts.calendar_bp(2000), -51)


if __name__ == '__main__':
    unittest.main()
