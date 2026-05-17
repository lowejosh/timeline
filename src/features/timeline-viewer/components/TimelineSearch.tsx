import { Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { ShortcutChord } from "@/components/ui/shortcut-key";
import {
  buildTimelineSearchIndex,
  type TimelineSearchItem,
  searchTimelineIndex,
  type TimelineSearchResult,
} from "@/lib/app/timelineSearch";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import { cn } from "@/lib/utils";

type TimelineSearchProps = {
  className?: string;
  enabledGroupIds: ReadonlySet<string>;
  enabledSetIds: ReadonlySet<TimelineSetId>;
  isOpen: boolean;
  modifierLabel: string;
  onOpenChange: (nextOpen: boolean) => void;
  onSelectResult: (result: TimelineSearchResult) => void;
  showShortcutHint?: boolean;
  variant?: "desktop" | "mobile";
};

function getResultKindLabel(kind: TimelineSearchResult["kind"]) {
  return kind === "marker" ? "Marker" : "Band";
}

function isSearchItemEnabled(
  item: TimelineSearchItem,
  enabledSetIds: ReadonlySet<TimelineSetId>,
  enabledGroupIds: ReadonlySet<string>,
) {
  if (item.setId && !enabledSetIds.has(item.setId)) {
    return false;
  }

  if (item.groupId && !enabledGroupIds.has(item.groupId)) {
    return false;
  }

  return true;
}

export function TimelineSearch({
  className,
  enabledGroupIds,
  enabledSetIds,
  isOpen,
  modifierLabel,
  onOpenChange,
  onSelectResult,
  showShortcutHint = true,
  variant = "desktop",
}: TimelineSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const dialogTitleId = useId();
  const resultsId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchIndex = useMemo(() => buildTimelineSearchIndex(), []);
  const enabledSearchIndex = useMemo(
    () =>
      searchIndex.filter((item) =>
        isSearchItemEnabled(item, enabledSetIds, enabledGroupIds),
      ),
    [enabledGroupIds, enabledSetIds, searchIndex],
  );
  const results = useMemo(
    () => searchTimelineIndex(enabledSearchIndex, query),
    [enabledSearchIndex, query],
  );
  const hasQuery = query.trim().length > 0;
  const hasResultsPanel = isOpen && hasQuery;
  const focusSearchInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);
  const setInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      inputRef.current = element;

      if (element && isOpen) {
        element.focus({ preventScroll: true });
      }
    },
    [isOpen],
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setActiveIndex(0);
      return;
    }

    const frame = requestAnimationFrame(focusSearchInput);
    const timer = window.setTimeout(focusSearchInput, 40);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [focusSearchInput, isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const activeResult = results[activeIndex];

    if (!hasResultsPanel || !activeResult) {
      return;
    }

    resultButtonRefs.current.get(activeResult.id)?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex, hasResultsPanel, results]);

  const selectResult = (result: TimelineSearchResult) => {
    onSelectResult(result);
    onOpenChange(false);
  };

  const focusResult = (index: number) => {
    const result = results[index];

    if (!result) {
      return;
    }

    setActiveIndex(index);
    requestAnimationFrame(() => {
      resultButtonRefs.current.get(result.id)?.focus();
    });
  };

  const moveActiveResult = (delta: number, focus = false) => {
    if (results.length === 0) {
      return;
    }

    const nextIndex = (activeIndex + delta + results.length) % results.length;

    if (focus) {
      focusResult(nextIndex);
    } else {
      setActiveIndex(nextIndex);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
      return;
    }

    if (event.key === "Tab" && hasResultsPanel && results.length > 0) {
      event.preventDefault();
      focusResult(event.shiftKey ? results.length - 1 : activeIndex);
      return;
    }

    if (results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveResult(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveResult(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectResult(results[activeIndex] ?? results[0]);
    }
  };

  const handleResultKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveResult(1, true);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveResult(-1, true);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();

      if (event.shiftKey) {
        if (index === 0) {
          inputRef.current?.focus();
        } else {
          focusResult(index - 1);
        }
      } else {
        focusResult((index + 1) % results.length);
      }
    }
  };

  const renderResults = (listClassName: string) =>
    results.length > 0 ? (
      <ul className={cn("m-0 list-none overflow-y-auto p-1.5 [scrollbar-width:thin]", listClassName)}>
        {results.map((result, index) => (
          <li
            aria-selected={index === activeIndex}
            id={`timeline-search-result-${result.id}`}
            key={result.id}
            role="option"
          >
            <button
              className={cn(
                "focus-ring-none grid w-full grid-cols-[1fr_auto] gap-3 rounded-md border-0 bg-transparent px-2.5 py-2 text-left transition-colors duration-150",
                index === activeIndex
                  ? "bg-surface/75 text-foreground shadow-[inset_0_0_0_1px_rgba(77,61,47,0.08)]"
                  : "hover:bg-surface/55",
              )}
              onClick={() => {
                selectResult(result);
              }}
              onMouseEnter={() => {
                setActiveIndex(index);
              }}
              onKeyDown={(event) => {
                handleResultKeyDown(event, index);
              }}
              ref={(element) => {
                if (element) {
                  resultButtonRefs.current.set(result.id, element);
                } else {
                  resultButtonRefs.current.delete(result.id);
                }
              }}
              tabIndex={index === activeIndex ? 0 : -1}
              type="button"
            >
              <span className="grid min-w-0 gap-0.5">
                <span className="truncate text-[0.82rem] font-semibold leading-tight text-foreground">
                  {result.label}
                </span>
                <span className="truncate text-[0.65rem] font-semibold leading-tight text-muted-foreground">
                  {[result.setLabel, result.groupLabel]
                    .filter(Boolean)
                    .join(" / ")}
                </span>
              </span>
              <span className="grid justify-items-end gap-0.5">
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {getResultKindLabel(result.kind)}
                </span>
                <span className="text-[0.65rem] font-semibold leading-tight text-muted-foreground">
                  {result.rangeLabel}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <div className="px-3 py-4 text-[0.78rem] font-semibold text-muted-foreground">
        No timeline matches
      </div>
    );

  if (variant === "mobile") {
    return (
      <>
        <div className={cn("sm:hidden", className)}>
          <Button
            aria-expanded={isOpen}
            aria-label="Search timeline"
            className="rounded-full"
            onClick={() => {
              onOpenChange(true);
            }}
            size="icon"
            type="button"
            variant="glass"
          >
            <Search className="size-4" />
          </Button>
        </div>
        {isOpen ? (
          <div
            aria-labelledby={dialogTitleId}
            aria-modal="true"
            className="fixed inset-0 z-[60] grid grid-rows-[auto_1fr] bg-popover/95 text-popover-foreground backdrop-blur-md"
            role="dialog"
          >
            <h2 className="sr-only" id={dialogTitleId}>
              Search timeline
            </h2>
            <div className="flex items-center gap-2 border-b border-border/70 px-3 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
              <div className="flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-full border border-border/80 bg-surface/70 shadow-glass">
                <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
                <input
                  aria-activedescendant={
                    results[activeIndex]
                      ? `timeline-search-result-${results[activeIndex].id}`
                      : undefined
                  }
                  aria-autocomplete="list"
                  aria-controls={resultsId}
                  aria-expanded={hasResultsPanel}
                  aria-label="Search timeline markers and bands"
                  className="min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-[16px] font-semibold text-foreground outline-none placeholder:text-muted-foreground/70"
                  onChange={(event) => {
                    setQuery(event.currentTarget.value);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search timeline"
                  ref={setInputRef}
                  role="combobox"
                  value={query}
                />
              </div>
              <Button
                aria-label="Close search"
                className="rounded-full"
                onClick={() => {
                  onOpenChange(false);
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div
              className="min-h-0 overflow-hidden px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-2"
              id={resultsId}
              role="listbox"
            >
              {hasQuery ? (
                renderResults("max-h-full")
              ) : (
                <div className="px-3 py-5 text-[0.82rem] font-semibold text-muted-foreground">
                  Search visible timeline layers
                </div>
              )}
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className={cn(className)}>
      <div
        className={cn(
          "relative flex items-center justify-end transition-[width] duration-300 ease-out",
          isOpen ? "w-[min(34rem,calc(100vw-13rem))]" : "w-[6.4rem]",
          !isOpen && !showShortcutHint && "w-8",
        )}
      >
        <div
          className={cn(
            "timeline-search-bar flex h-8 w-full min-w-0 items-center overflow-hidden rounded-full border border-border/80 bg-glass text-foreground shadow-glass backdrop-blur-md",
            isOpen
              ? "bg-glass-hover opacity-100 shadow-glass-hover"
              : "opacity-100 hover:bg-glass-hover hover:shadow-glass-hover",
          )}
        >
          {isOpen ? (
            <>
              <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
              <input
                aria-activedescendant={
                  results[activeIndex]
                    ? `timeline-search-result-${results[activeIndex].id}`
                    : undefined
                }
                aria-autocomplete="list"
                aria-controls={resultsId}
                aria-expanded={hasResultsPanel}
                aria-label="Search timeline markers and bands"
                className="min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/70"
                onChange={(event) => {
                  setQuery(event.currentTarget.value);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search markers and bands"
                ref={setInputRef}
                role="combobox"
                value={query}
              />
              <Button
                aria-label="Close search"
                className="mr-0.5 rounded-full"
                onClick={() => {
                  onOpenChange(false);
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <Button
              aria-label="Search timeline"
              className="h-8 w-full rounded-full border-0 bg-transparent px-2.5 shadow-none hover:bg-transparent"
              onClick={() => {
                onOpenChange(true);
              }}
              size="pill"
              type="button"
              variant="ghost"
            >
              <Search className="size-4" />
              {showShortcutHint ? (
                <ShortcutChord
                  className="text-muted-foreground"
                  keys={[modifierLabel, "K"]}
                  size="sm"
                />
              ) : null}
            </Button>
          )}
        </div>

        {hasResultsPanel ? (
          <div
            className="timeline-search-results absolute right-0 top-10 grid max-h-[min(28rem,calc(100svh-124px))] w-full overflow-hidden rounded-lg border border-border/80 bg-card/95 text-card-foreground shadow-panel backdrop-blur-md"
            id={resultsId}
            role="listbox"
          >
            {renderResults("max-h-[inherit]")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
