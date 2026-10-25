import { afterEach, expect, it } from "vitest";
import { useChartStore } from "./chartStore";

afterEach(() => useChartStore.setState({ activeChartIds: [], fitVisible: false, showUncertainty: false, isMenuOpen: false }));

it("keeps selection order for the two axes and rejects a third chart", () => {
  useChartStore.setState({ activeChartIds: [] });
  const { toggleChart } = useChartStore.getState();
  toggleChart("co2");
  toggleChart("temperature");
  toggleChart("population");
  expect(useChartStore.getState().activeChartIds).toEqual(["co2", "temperature"]);
  toggleChart("co2");
  toggleChart("population");
  expect(useChartStore.getState().activeChartIds).toEqual(["temperature", "population"]);
  toggleChart("temperature");
  toggleChart("population");
  expect(useChartStore.getState().activeChartIds).toEqual([]);
});
