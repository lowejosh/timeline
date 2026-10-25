import { useEffect, useState } from "react";
import { bce, ce } from "@/lib/core/timelineDateBuilders";
import type { ChartData, ChartId, ChartPoint } from "./chartCatalog";

const cache = new Map<ChartId, ChartData>();
export function useChartData(id: ChartId | null) {
  const [result, setResult] = useState<{ id: ChartId | null; data: ChartData | null; error: boolean }>({ id: null, data: null, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id || cache.has(id)) return;
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/charts/${id}.json`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Chart data unavailable");
        return response.json() as Promise<ChartData>;
      })
      .then(raw => {
        if (controller.signal.aborted) return;
        const convert = ([year, ...values]: ChartPoint): ChartPoint => [year < 0 ? bce(-year) : ce(year), ...values];
        const data = {
          ...raw,
          points: raw.points.map(convert),
          segments: raw.segments?.map(segment => ({ ...segment, points: segment.points.map(convert) })),
        };
        cache.set(id, data);
        setResult({ id, data, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ id, data: null, error: true });
      });
    return () => controller.abort();
  }, [id, attempt]);
  return {
    data: id ? cache.get(id) ?? (result.id === id ? result.data : null) : null,
    error: result.id === id && result.error,
    retry: () => { setResult({ id: null, data: null, error: false }); setAttempt(value => value + 1); },
  };
}
