import { describe, expect, it } from "vitest";
import { bce, ce } from "@/lib/core/timelineDateBuilders";
import { createWorldToScreen, getViewportForRange, worldToScreen } from "@/lib/core/viewport";
import { getTimelineYearDelta } from "@/lib/core/timelineYears";
import { CHARTS, type ChartData, type ChartPoint } from "./chartCatalog";
import { chartWindow, clipChartPoints, clipChartLine, clipChartRibbon, fitChartDomain, nearestChartPoint, projectChart, chartReadoutAt } from "./chartGeometry";
import { chartLineDash } from "./drawChart";

import co2Snapshot from "../../../public/data/charts/co2.json";
import populationSnapshot from "../../../public/data/charts/population.json";
import lifeSnapshot from "../../../public/data/charts/life-expectancy.json";
import temperatureSnapshot from "../../../public/data/charts/temperature.json";
import seaSnapshot from "../../../public/data/charts/sea-level.json";
import landSnapshot from "../../../public/data/charts/agricultural-land.json";
import energySnapshot from "../../../public/data/charts/energy.json";
import iceSnapshot from "../../../public/data/charts/ice-age.json";
import biodiversitySnapshot from "../../../public/data/charts/biodiversity.json";
const snapshots = { co2: co2Snapshot, population: populationSnapshot, "life-expectancy": lifeSnapshot, temperature: temperatureSnapshot, "sea-level": seaSnapshot, "agricultural-land": landSnapshot, energy: energySnapshot, "ice-age": iceSnapshot, biodiversity: biodiversitySnapshot };

const points: ChartPoint[] = [[100, 10], [200, 30], [300, 20], [400, 50]];

describe("chart samples", () => {
  it("clips frozen-axis lines at Y boundaries without connecting excursions across the plot", () => {
    const paths = clipChartLine([{ x: 0, value: 50 }, { x: 100, value: 150 }, { x: 200, value: 50 }], [0, 100]);
    expect(paths).toEqual([
      [{ x: 0, value: 50 }, { x: 50, value: 100 }],
      [{ x: 150, value: 100 }, { x: 200, value: 50 }],
    ]);
    const huge = clipChartLine([{ x: 0, value: -1e15 }, { x: 1000, value: 1e15 }], [0, 100]);
    expect(huge.flat().every(point => point.value >= 0 && point.value <= 100)).toBe(true);
  });

  it("clips uncertainty ribbons to a frozen scale before Canvas sees the vertices", () => {
    const polygon = clipChartRibbon([{ x: 0, value: 0, low: -1e15, high: 1e15 }, { x: 1000, value: 0, low: -1e15, high: 1e15 }], [0, 100]);
    expect(polygon.length).toBe(4);
    expect(polygon.every(point => point.value >= 0 && point.value <= 100 && point.x >= 0 && point.x <= 1000)).toBe(true);
  });
  it("keeps the bracketing samples when zooming between observations", () => {
    expect(chartWindow(points, 220, 250)).toEqual([[200, 30], [300, 20]]);
    expect(chartWindow(points, 50, 100)).toEqual([[100, 10]]);
  });

  it("does not extrapolate beyond the record or bridge a missing record", () => {
    expect(chartWindow(points, -1000, 0)).toEqual([]);
    expect(chartWindow(points, 401, 500)).toEqual([]);
    expect(nearestChartPoint(points, 99)).toBeNull();
    expect(nearestChartPoint(points, 401)).toBeNull();
  });

  it("reports an actual dated sample rather than an invented interpolated observation", () => {
    expect(nearestChartPoint(points, 260)).toEqual([300, 20]);
    expect(nearestChartPoint(points, 400)).toEqual([400, 50]);
  });

  it("keeps constant series readable and includes requested uncertainty", () => {
    const flat = fitChartDomain([[100, 280], [200, 280]], [150, 450]);
    expect(flat[0]).toBeLessThan(280);
    expect(flat[1]).toBeGreaterThan(280);
    const uncertainty = fitChartDomain([[100, 20, -40, 80]], [0, 100], true);
    expect(uncertainty[0]).toBeLessThanOrEqual(-40);
    expect(uncertainty[1]).toBeGreaterThanOrEqual(80);
    expect(fitChartDomain([[100, 4_000_000], [200, 8_000_000_000]], [0, 10_000_000_000])[0]).toBe(0);
  });
});

describe("bundled scientific snapshots", () => {
  for (const chart of CHARTS) {
    it(`${chart.id} has ordered, finite, sourced observations and no forecasts`, () => {
      const data = snapshots[chart.id] as unknown as ChartData;
      expect(data.points.length).toBeGreaterThanOrEqual(chart.id === "biodiversity" ? 48 : 50);
      expect(data.sourceUrl).toMatch(/^https:\/\//);
      expect(chart.sources.length).toBeGreaterThan(0);
      for (const [i, point] of data.points.entries()) {
        expect(point.every(Number.isFinite)).toBe(true);
        expect(point[0]).not.toBe(0);
        expect(point[0]).toBeLessThanOrEqual(2025);
        if (i > 0) expect(point[0]).toBeGreaterThan(data.points[i - 1][0]);
        if (point[2] !== undefined && point[3] !== undefined) {
          expect(point[2]).toBeLessThanOrEqual(point[1]);
          expect(point[3]).toBeGreaterThanOrEqual(point[1]);
        }
      }
    });
  }

  it("anchors sea-level BP to 1950 CE, including the missing calendar year zero", () => {
    const data = snapshots["sea-level"] as unknown as ChartData;
    const last = data.points.slice(-3);
    expect(last.map(point => point[0])).toEqual([-51, 950, 1950]);
    expect(ce(1950) - ce(950)).toBe(1000);
    expect(getTimelineYearDelta(ce(950), bce(51))).toBe(1000);
  });

  it("retains the full LR04 record and its supplied one-standard-error bounds", () => {
    expect(iceSnapshot.points).toHaveLength(2115);
    expect(iceSnapshot.points.at(-1)).toEqual([1950, 3.23, 3.2, 3.26]);
    expect(iceSnapshot.points[0][0]).toBe(-5318051);
  });

  it("keeps the energy and agriculture definitions and endpoints explicit", () => {
    expect(energySnapshot.points[0]).toEqual([1800, 97]);
    expect(energySnapshot.methodology).toContain("Traditional biomass excluded");
    expect(landSnapshot.points[0]).toEqual([-10000, 0]);
    expect(landSnapshot.points.at(-1)).toEqual([2025, 4796820500]);
  });

  it("keeps rarefied biodiversity within its quota and observed richness", () => {
    expect(biodiversitySnapshot.rarefactionQuota).toBe(1000);
    for (const bin of biodiversitySnapshot.bins) {
      expect(bin.occurrences).toBeGreaterThanOrEqual(1000);
      expect(bin.richness).toBeLessThanOrEqual(Math.min(1000, bin.observedGenera));
    }
    expect(biodiversitySnapshot.points.at(-1)![0]).toBeLessThan(-5_000_000);
    expect(biodiversitySnapshot.sourceSha256["paleoDB.RData"]).toMatch(/^[a-f0-9]{64}$/);
  });
});


describe("source segments", () => {
  it("does not draw or inspect the gap between geological and annual temperatures", () => {
    const data = temperatureSnapshot as unknown as ChartData;
    const chart = CHARTS.find(chart => chart.id === "temperature")!;
    const viewport = getViewportForRange(1000, 1500, 1000, 0);
    const projection = projectChart(chart, data, viewport, 1100, 50, 100, 600, false, false);
    expect(projection.drawable).toBe(false);
    expect(chartReadoutAt(projection, data, 1200, 500, 400)).toBeNull();
  });

  it("uses modern and geological ranges without putting anomalies on an absolute axis", () => {
    const data = temperatureSnapshot as unknown as ChartData;
    const chart = CHARTS.find(chart => chart.id === "temperature")!;
    const modern = projectChart(chart, data, getViewportForRange(1900, 2025, 1000, 0), 1100, 50, 100, 600, false, false);
    expect(modern.domain).toEqual([12, 17]);
    expect(modern.segments.map(segment => segment.id)).toEqual(["hadcrut-absolute"]);
    expect(data.segments![1].points[0][1]).toBeCloseTo(14 - 0.42677823, 4);
    const deep = projectChart(chart, data, getViewportForRange(-300_000_000, -100_000_000, 1000, 0), 1100, 50, 100, 600, false, false);
    expect(deep.domain[1]).toBeGreaterThan(30);
    expect(deep.segments[0].plot.every(point => point.value >= deep.domain[0] && point.value <= deep.domain[1])).toBe(true);
    expect(deep.segments[0].style).toBe("dashed");
  });

  it("does not change CO₂ scale when a geological fragment enters the viewport", () => {
    const data = co2Snapshot as unknown as ChartData;
    const chart = CHARTS.find(chart => chart.id === "co2")!;
    const boundary = data.segments![0].points.at(-1)![0];
    const before = projectChart(chart, data, getViewportForRange(boundary + 100, 2025, 1000, 0), 1100, 50, 100, 600, false, false);
    const after = projectChart(chart, data, getViewportForRange(boundary - 100, 2025, 1000, 0), 1100, 50, 100, 600, false, false);
    expect(before.domain).toEqual([150, 450]);
    expect(after.domain).toEqual(before.domain);
  });

  it("fits interpolated edge values, not distant offscreen observations", () => {
    const data: ChartData = { retrieved: "", sourceUrl: "", points: [[1000, 0], [2000, 1000]] };
    const chart = CHARTS.find(chart => chart.id === "co2")!;
    const project = (start: number) => projectChart(chart, data, getViewportForRange(start, 1510, 1000, 0), 1100, 50, 100, 600, true, false);
    const a = project(1500);
    const b = project(1500.01);
    expect(a.domain[0]).toBeGreaterThan(490);
    expect(a.domain[1]).toBeLessThan(520);
    expect(Math.abs(a.domain[0] - b.domain[0])).toBeLessThan(0.02);
  });

  it("clips huge offscreen paths, including uncertainty, before rendering", () => {
    const plot = clipChartPoints([[1000, 0, -10, 10], [2000, 100, 90, 110]], year => (year - 1500) * 1e15, 50, 1050);
    expect(plot.map(point => point.x)).toEqual([50, 1050]);
    expect(plot[0].value).toBeCloseTo(50);
    expect(plot[0].low).toBeCloseTo(40);
    expect(plot[1].high).toBeCloseTo(60);
  });

  it("keeps a chart drawable when the visible range is smaller than one numeric year increment", () => {
    const chart = CHARTS.find(chart => chart.id === "co2")!;
    const data: ChartData = { retrieved: "", sourceUrl: "", points: [[2000, 280], [2020, 400]] };
    const viewport = { centerYear: 2010, centerYearWhole: 2010, centerYearFraction: 1e-15, zoom: 80 };
    const projection = projectChart(chart, data, viewport, 1100, 50, 100, 600, false, false);
    expect(projection.drawable).toBe(true);
    expect(projection.segments[0].plot.every(point => point.x >= 50 && point.x <= 1050)).toBe(true);
  });

  it("preserves both viewport scale modes with the reusable projector", () => {
    for (const scaleMode of ["linear", "logarithmic"] as const) {
      const viewport = { centerYear: -10000, zoom: 20, scaleMode };
      const project = createWorldToScreen(viewport, 1000);
      for (const year of [-1e8, -20000, 1, 2025]) expect(project(year)).toBe(worldToScreen(year, viewport, 1000));
    }
  });

  it("simplifies dense dash patterns while retaining sparse source styling", () => {
    const dense = Array.from({ length: 1000 }, (_, x) => ({ x, value: 100 }));
    expect(chartLineDash("dotted", dense)).toEqual([]);
    expect(chartLineDash("dashed", [dense[0], dense[999]])).toEqual([10, 7]);
  });

  it("preserves separate, chronologically ordered records with explicit styles", () => {
    for (const data of [co2Snapshot, temperatureSnapshot] as unknown as ChartData[]) {
      expect(data.points[0][0]).toBeLessThan(-400_000_000);
      expect(data.segments!.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < data.segments!.length; i++) {
        const before = data.segments![i - 1].points;
        const after = data.segments![i].points;
        expect(before[before.length - 1][0]).toBeLessThan(after[0][0]);
      }
    }
    expect((co2Snapshot as unknown as ChartData).segments!.map(segment => segment.style)).toEqual(["dashed", "dotted", "solid"]);
  });
});
