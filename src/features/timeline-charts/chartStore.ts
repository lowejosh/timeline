import { create } from "zustand";
import { CHARTS, type ChartId } from "./chartCatalog";

const STORAGE_KEY = "timeline-charts";
function readCharts(): ChartId[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const ids: unknown = stored ? JSON.parse(stored) : [localStorage.getItem("timeline-chart")];
    return Array.isArray(ids) ? [...new Set(ids)].filter((id): id is ChartId => CHARTS.some(chart => chart.id === id)).slice(0, 2) : [];
  } catch { return []; }
}

export const useChartStore = create<{
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  activeChartIds: ChartId[];
  fitVisible: boolean;
  showUncertainty: boolean;
  toggleChart: (id: ChartId) => void;
  setFitVisible: (value: boolean) => void;
  setShowUncertainty: (value: boolean) => void;
}>((set, get) => ({
  isMenuOpen: false,
  setMenuOpen: (isMenuOpen) => set({ isMenuOpen }),
  activeChartIds: readCharts(),
  fitVisible: false,
  showUncertainty: false,
  toggleChart: (id) => {
    const current = get().activeChartIds;
    const selected = current.includes(id);
    if (!selected && current.length >= 2) return;
    const activeChartIds = selected ? current.filter(value => value !== id) : [...current, id];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(activeChartIds)); }
    catch { /* Selection still works when storage is unavailable. */ }
    set({ activeChartIds });
  },
  setFitVisible: (fitVisible) => set({ fitVisible }),
  setShowUncertainty: (showUncertainty) => set({ showUncertainty }),
}));
