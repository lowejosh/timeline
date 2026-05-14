import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TimelineLayerShortcutTarget } from "@/lib/app/timelineKeyboard";

type TimelineKeyboardHelpProps = {
  isOpen: boolean;
  layerShortcuts: readonly TimelineLayerShortcutTarget[];
  modifierLabel: string;
  onClose: () => void;
};

type ShortcutHelpRow = {
  label: string;
  keys: string[];
  note?: string;
};

function Keycap({ value }: { value: string }) {
  return (
    <kbd className="inline-flex min-h-6 min-w-6 items-center justify-center rounded border border-border bg-surface/80 px-1.5 font-mono text-[0.68rem] font-semibold leading-none text-foreground shadow-[inset_0_-1px_0_rgba(77,61,47,0.1)]">
      {value}
    </kbd>
  );
}

function ShortcutRow({ row }: { row: ShortcutHelpRow }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-border/50 py-2 first:border-t-0">
      <span className="min-w-0 text-[0.78rem] font-semibold leading-tight text-foreground">
        {row.label}
        {row.note ? (
          <span className="ml-1 font-normal text-muted-foreground">
            {row.note}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {row.keys.map((key) => (
          <Keycap key={key} value={key} />
        ))}
      </span>
    </li>
  );
}

export function TimelineKeyboardHelp({
  isOpen,
  layerShortcuts,
  modifierLabel,
  onClose,
}: TimelineKeyboardHelpProps) {
  if (!isOpen) {
    return null;
  }

  const navigationRows: ShortcutHelpRow[] = [
    { label: "Show Keyboard Shortcuts", keys: [modifierLabel, "/"] },
    { label: "Toggle Layers", keys: ["L"] },
    { label: "Search", keys: [modifierLabel, "K"], note: "(soon)" },
    { label: "Zoom In", keys: ["+"] },
    { label: "Zoom Out", keys: ["-"] },
    { label: "Pan Left / Right", keys: ["←", "→"] },
    { label: "Fast Pan", keys: ["Shift", "←/→"] },
    { label: "Home: 5000 BCE to Present", keys: ["Home"] },
    { label: "Full Timeline", keys: ["0"] },
    { label: "Close", keys: ["Esc"] },
  ];

  return (
    <div
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      className="absolute inset-0 z-[60] flex items-start justify-center bg-[rgba(44,31,20,0.16)] px-3 pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="Close keyboard shortcuts"
        className="absolute inset-0 border-0 bg-transparent p-0"
        onClick={onClose}
        type="button"
      />
      <section className="relative grid max-h-[min(78svh,620px)] w-[min(34rem,calc(100vw-24px))] grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-panel">
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <h2 className="m-0 font-display text-base font-semibold leading-none text-foreground">
            Keyboard Shortcuts
          </h2>
          <Button
            aria-label="Close keyboard shortcuts"
            className="rounded-full"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </header>
        <div className="min-h-0 overflow-y-auto px-4 py-3 [scrollbar-width:thin]">
          <section>
            <h3 className="m-0 pb-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Timeline
            </h3>
            <ul className="m-0 list-none p-0">
              {navigationRows.map((row) => (
                <ShortcutRow key={row.label} row={row} />
              ))}
            </ul>
          </section>

          {layerShortcuts.length > 0 ? (
            <section className="mt-4">
              <h3 className="m-0 pb-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Layers
              </h3>
              <ul className="m-0 list-none p-0">
                {layerShortcuts.map((shortcut) => (
                  <ShortcutRow
                    key={shortcut.id}
                    row={{
                      label: shortcut.label,
                      keys: [shortcut.key],
                      note: shortcut.kind === "set" ? "(open + travel)" : "(show + travel)",
                    }}
                  />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

