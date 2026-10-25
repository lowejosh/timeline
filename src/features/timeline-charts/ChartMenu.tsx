import { ChartNoAxesCombined, ChevronDown } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShortcutKey } from "@/components/ui/shortcut-key";
import { cn } from "@/lib/utils";
import { CHARTS } from "./chartCatalog";
import { useChartStore } from "./chartStore";

export function ChartMenu({ onOpenChange, showShortcuts = true }: {
  onOpenChange?: (open: boolean) => void;
  showShortcuts?: boolean;
}) {
  const titleId = useId();
  const ids = useChartStore(state => state.activeChartIds);
  const toggleChart = useChartStore(state => state.toggleChart);
  const fit = useChartStore(state => state.fitVisible);
  const setFit = useChartStore(state => state.setFitVisible);
  const uncertainty = useChartStore(state => state.showUncertainty);
  const setUncertainty = useChartStore(state => state.setShowUncertainty);
  const open = useChartStore(state => state.isMenuOpen);
  const setOpen = useChartStore(state => state.setMenuOpen);

  return (
    <Popover open={open} onOpenChange={next => { setOpen(next); onOpenChange?.(next); }}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Charts"
          aria-keyshortcuts="C"
          className={cn("h-auto rounded-full px-3 py-2 text-xs", (open || ids.length > 0) && "border-border bg-glass-selected")}
          size="pill"
          variant="glass"
        >
          <ChartNoAxesCombined aria-hidden className="size-4 shrink-0" />
          {showShortcuts ? <ShortcutKey aria-hidden className="border-border/70 bg-surface/70 text-muted-foreground" size="sm">C</ShortcutKey> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-labelledby={titleId} align="start" className="max-h-[min(620px,calc(100dvh-80px))] w-[min(300px,calc(100vw-24px))] overflow-y-auto p-0">
        <header className="flex items-baseline justify-between px-3 pb-2 pt-3">
          <h2 id={titleId} className="font-display text-base font-semibold">Charts</h2>
          <span aria-label={`${ids.length} of 2 charts selected`} className="text-[10px] text-muted-foreground">{ids.length}/2</span>
        </header>
        <div role="group" aria-label="Timeline charts">
          {CHARTS.map(chart => (
            <Collapsible className={cn("border-t border-border/50", ids.includes(chart.id) && "bg-primary/5")} key={chart.id}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <Checkbox aria-label={chart.label} checked={ids.includes(chart.id)} disabled={!ids.includes(chart.id) && ids.length >= 2} onChange={() => toggleChart(chart.id)} />
                  <span className={cn("min-w-0", !ids.includes(chart.id) && ids.length >= 2 && "opacity-50")}>
                    <span className="block text-xs font-semibold" style={{ color: chart.color }}>
                      {chart.label}<span className="ml-2 font-normal text-muted-foreground">{chart.unit}</span>
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">{chart.coverage}</span>
                  </span>
                </label>
                <CollapsibleTrigger aria-label={`${chart.label} sources`} className="group flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-primary/5 hover:text-foreground">
                  <ChevronDown aria-hidden className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="motion-reduce:animate-none">
                <ul className="m-0 grid list-none gap-1 border-t border-border/40 px-3 py-2 pl-10">
                  {chart.sources.map(source => <li key={source.url}>
                    <a className="block py-1 text-[11px] leading-snug text-foreground/90 hover:underline" href={source.url} target="_blank" rel="noreferrer">{source.lineStyle ? <span aria-hidden className="mr-2 inline-block w-4 border-t align-middle" style={{ borderColor: chart.color, borderTopStyle: source.lineStyle }} /> : null}{source.title}</a>
                  </li>)}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        {ids.length ? <div className="grid gap-3 border-t border-border px-3 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs"><Checkbox checked={fit} onChange={event => setFit(event.target.checked)} />Fit Y-axis</label>
          {ids.some(id => ["temperature", "co2", "sea-level", "ice-age"].includes(id)) ? <label className="flex cursor-pointer items-center gap-2 text-xs"><Checkbox checked={uncertainty} onChange={event => setUncertainty(event.target.checked)} />Uncertainty</label> : null}
        </div> : null}
      </PopoverContent>
    </Popover>
  );
}
