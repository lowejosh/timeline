import { useId, useState } from "react";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TimelineSettingsProps = {
  className?: string;
  isCosmicCalendarMode: boolean;
  onToggleCosmicCalendarMode: () => void;
};

export function TimelineSettings({
  className,
  isCosmicCalendarMode,
  onToggleCosmicCalendarMode,
}: TimelineSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const cosmicCalendarLabelId = useId();
  const cosmicCalendarDescriptionId = useId();

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <div
        className={cn(
          className ??
            "absolute right-[52px] top-3 z-[4] max-sm:right-[50px] max-sm:top-[10px]",
        )}
      >
        <PopoverTrigger asChild>
          <Button
            aria-label={isOpen ? "Hide settings" : "Show settings"}
            className="group rounded-full"
            size="icon"
            type="button"
            variant="glass"
          >
            <Settings className="size-4 transition-transform duration-300 group-data-[state=open]:rotate-45" />
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent
        align="end"
        aria-labelledby={titleId}
        className="w-[min(18rem,calc(100vw-24px))] max-sm:w-[min(17rem,calc(100vw-20px))]"
        sideOffset={10}
      >
        <div className="mb-2 flex items-center gap-2">
          <h2
            className="m-0 font-display text-[0.92rem] font-semibold leading-none text-foreground"
            id={titleId}
          >
            Settings
          </h2>
        </div>

        <div className="flex items-center justify-between gap-3 py-1">
          <div className="flex flex-col gap-1 font-sans text-[0.78rem] leading-snug text-foreground">
            <span id={cosmicCalendarLabelId}>Cosmic Calendar</span>
            <span
              className="font-sans text-[0.68rem] leading-snug text-muted-foreground"
              id={cosmicCalendarDescriptionId}
            >
              Compress all of time into a single calendar year.
            </span>
          </div>
          <Switch
            aria-describedby={cosmicCalendarDescriptionId}
            aria-labelledby={cosmicCalendarLabelId}
            checked={isCosmicCalendarMode}
            onClick={onToggleCosmicCalendarMode}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
