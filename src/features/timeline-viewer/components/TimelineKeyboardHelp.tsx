import { Keyboard, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { ShortcutChord } from "@/components/ui/shortcut-key";
import type { TimelineLayerShortcutTarget } from "@/lib/app/timelineKeyboard";
import { cn } from "@/lib/utils";

type TimelineKeyboardHelpProps = {
  isOpen: boolean;
  layerShortcuts: readonly TimelineLayerShortcutTarget[];
  modifierLabel: string;
  onClose: () => void;
};

type TimelineKeyboardHelpButtonProps = {
  className?: string;
  isOpen: boolean;
  modifierLabel: string;
  onClick: () => void;
};

type ShortcutHelpRow = {
  label: string;
  keys: string[];
  note?: string;
};

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
      <ShortcutChord keys={row.keys} />
    </li>
  );
}

export function TimelineKeyboardHelpButton({
  className,
  isOpen,
  modifierLabel,
  onClick,
}: TimelineKeyboardHelpButtonProps) {
  return (
    <div
      className={cn(
        className ?? "absolute right-[148px] top-3 z-[4] max-sm:hidden",
      )}
    >
      <Button
        aria-expanded={isOpen}
        aria-label={
          isOpen ? "Hide keyboard shortcuts" : "Show keyboard shortcuts"
        }
        className="group rounded-full px-2.5"
        data-state={isOpen ? "open" : "closed"}
        onClick={onClick}
        size="pill"
        type="button"
        variant="glass"
      >
        <Keyboard className="size-4 transition-transform duration-200 group-data-[state=open]:-rotate-6" />
        <ShortcutChord
          className="text-muted-foreground"
          keys={[modifierLabel, "/"]}
          size="sm"
        />
      </Button>
    </div>
  );
}

export function TimelineKeyboardHelp({
  isOpen,
  layerShortcuts,
  modifierLabel,
  onClose,
}: TimelineKeyboardHelpProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    requestAnimationFrame(() => scrollRef.current?.focus());
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const navigationRows: ShortcutHelpRow[] = [
    { label: "Show Keyboard Shortcuts", keys: [modifierLabel, "/"] },
    { label: "Show Settings", keys: [modifierLabel, ","] },
    { label: "Toggle Layers", keys: ["L"] },
    { label: "Toggle Map", keys: ["M"] },
    { label: "Search", keys: [modifierLabel, "K"] },
    { label: "Zoom In", keys: ["+", "↑"] },
    { label: "Zoom Out", keys: ["-", "↓"] },
    { label: "Fast Zoom", keys: ["Shift", "+/-"] },
    { label: "Pan Left / Right", keys: ["←", "→"] },
    { label: "Fast Pan", keys: ["Shift", "←/→"] },
    { label: "Home", keys: ["H", "Home"] },
    { label: "Full Timeline", keys: ["O"] },
    { label: "Close", keys: ["Esc"] },
  ];

  return (
    <div
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      className="absolute inset-0 z-[60] flex animate-[shortcut-overlay-in_180ms_ease-out] items-start justify-center bg-[rgba(44,31,20,0.16)] px-3 pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="Close keyboard shortcuts"
        className="absolute inset-0 border-0 bg-transparent p-0"
        onClick={onClose}
        type="button"
      />
      <section className="relative grid max-h-[min(78svh,620px)] w-[min(34rem,calc(100vw-24px))] animate-[shortcut-dialog-in_220ms_cubic-bezier(0.22,1,0.36,1)] grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-panel">
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <h2
            className="m-0 font-display text-base font-semibold leading-none text-foreground"
            id="timeline-keyboard-help-title"
          >
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
        <div
          aria-labelledby="timeline-keyboard-help-title"
          className="min-h-0 overflow-y-auto px-4 py-3 outline-none [scrollbar-width:thin]"
          ref={scrollRef}
          role="document"
          tabIndex={0}
        >
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
