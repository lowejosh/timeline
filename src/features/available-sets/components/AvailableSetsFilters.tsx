import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AvailableSetsFiltersProps = {
  activeTags: ReadonlySet<string>;
  availableTags: string[];
  onClearTags: () => void;
  onQueryChange: (query: string) => void;
  onToggleTag: (tag: string) => void;
  query: string;
};

export function AvailableSetsFilters({
  activeTags,
  availableTags,
  onClearTags,
  onQueryChange,
  onToggleTag,
  query,
}: AvailableSetsFiltersProps) {
  return (
    <div className="flex flex-col items-start gap-2 max-sm:w-full">
      <div className="relative w-[min(18rem,100%)] max-sm:w-full">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
        />
        <Input
          aria-label="Search available sets"
          className="pl-9 text-xs"
          onChange={(event) => {
            onQueryChange(event.currentTarget.value);
          }}
          placeholder="Search available"
          type="search"
          value={query}
        />
      </div>

      {availableTags.length > 0 ? (
        <div
          aria-label="Filter available sets by tag"
          className="flex flex-wrap gap-1.5"
          role="group"
        >
          <Button
            aria-pressed={activeTags.size === 0}
            data-active={activeTags.size === 0 ? "true" : "false"}
            onClick={onClearTags}
            size="pill"
            type="button"
            variant={activeTags.size === 0 ? "outline" : "ghost"}
          >
            All
          </Button>
          {availableTags.map((tag) => {
            const isActiveTag = activeTags.has(tag.toLowerCase());

            return (
              <Button
                aria-pressed={isActiveTag}
                data-active={isActiveTag ? "true" : "false"}
                key={tag}
                onClick={() => {
                  onToggleTag(tag);
                }}
                size="pill"
                type="button"
                variant={isActiveTag ? "outline" : "ghost"}
              >
                {tag}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
