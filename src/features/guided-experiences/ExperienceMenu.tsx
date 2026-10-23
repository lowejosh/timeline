import { ChevronRight, Compass, Search } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GUIDED_EXPERIENCES, type GuidedExperience } from "./experiences";

export function ExperienceMenu({
  onSelect,
}: {
  onSelect: (experience: GuidedExperience) => void;
}) {
  const [open, setOpen] = useState(false);
  const launching = useRef(false);
  const [query, setQuery] = useState("");
  const matches = GUIDED_EXPERIENCES.filter((experience) =>
    `${experience.title} ${experience.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        launching.current = false;
        setQuery("");
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          className="order-3 rounded-full"
          size="icon"
          variant="glass"
          aria-label="Guided experiences"
          title="Guided experiences"
        >
          <Compass className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 max-w-[calc(100vw-24px)] bg-popover p-1.5"
        onCloseAutoFocus={(event) => {
          if (launching.current) event.preventDefault();
        }}
      >
        <p className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
          Guides
        </p>
        {GUIDED_EXPERIENCES.length > 5 && (
          <label className="mb-1 flex items-center gap-2 border-b border-border px-2 pb-2 text-muted-foreground">
            <Search className="size-3.5" />
            <input
              aria-label="Search guides"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guides"
              className="min-w-0 w-full bg-transparent text-xs outline-none"
            />
          </label>
        )}
        <div className="max-h-[min(360px,60dvh)] overflow-y-auto overscroll-contain timeline-scrollbar">
          {matches.map((experience) => (
            <button
              key={experience.id}
              type="button"
              className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => {
                launching.current = true;
                setOpen(false);
                onSelect(experience);
              }}
            >
              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                {experience.title}
              </span>
              <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                {experience.stops.length} chapters
              </span>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
          {matches.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              No guides found.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
