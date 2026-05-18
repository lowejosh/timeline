import { CalendarRange, Info, Layers3, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  SET_BUILDER_TOOL_LABELS,
  SET_BUILDER_TOOL_SEQUENCE,
  type SetBuilderTool,
} from "../SetBuilder.types";

type SetBuilderToolRailProps = {
  selectedTool: SetBuilderTool;
  onSelectTool: (tool: SetBuilderTool) => void;
};

const TOOL_ICONS = {
  metadata: Info,
  eras: CalendarRange,
  markers: MapPin,
  bands: Layers3,
} satisfies Record<SetBuilderTool, typeof Info>;

type SetBuilderToolButtonProps = {
  exiting: boolean;
  icon: typeof Info;
  selected: boolean;
  tool: SetBuilderTool;
  onClick: () => void;
};

function SetBuilderToolButton({
  exiting,
  icon: Icon,
  onClick,
  selected,
  tool,
}: SetBuilderToolButtonProps) {
  const label = SET_BUILDER_TOOL_LABELS[tool];

  return (
    <Tooltip
      className="w-full"
      content={label}
      placement="right"
      showOnFocus={false}
    >
      <button
        aria-label={label}
        aria-pressed={selected}
        className={cn(
          "group relative flex h-16 w-full cursor-pointer items-center justify-center overflow-hidden border-0 border-b border-border/60 bg-transparent p-0 text-muted-foreground transition-[background-color,color] duration-200 ease-out hover:bg-surface/45 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          "before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:-translate-x-full before:rounded-r-full before:bg-primary before:opacity-0 before:transition-[opacity,transform,height,inset] before:duration-250 before:ease-out hover:before:translate-x-0 hover:before:opacity-60",
          exiting &&
            "bg-surface/20 before:translate-x-0 before:opacity-0",
          selected &&
            "bg-surface/70 text-foreground hover:bg-surface/75 before:inset-y-0 before:translate-x-0 before:opacity-100",
        )}
        data-selected={selected ? "true" : "false"}
        onClick={onClick}
        type="button"
      >
        <Icon className="relative z-[1] size-4 transition-[transform,stroke-width] duration-200 ease-out group-hover:scale-110 group-hover:stroke-[2.2]" />
      </button>
    </Tooltip>
  );
}

export function SetBuilderToolRail({
  onSelectTool,
  selectedTool,
}: SetBuilderToolRailProps) {
  const previousSelectedToolRef = useRef(selectedTool);
  const [exitingTool, setExitingTool] = useState<SetBuilderTool | null>(null);

  useEffect(() => {
    const previousTool = previousSelectedToolRef.current;

    if (previousTool === selectedTool) {
      return;
    }

    setExitingTool(previousTool);
    previousSelectedToolRef.current = selectedTool;

    const timeout = window.setTimeout(() => {
      setExitingTool(null);
    }, 260);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [selectedTool]);

  return (
    <nav
      aria-label="Custom set editing tools"
      className="grid h-full content-start overflow-hidden border-r border-border/70 bg-card/40"
    >
      {SET_BUILDER_TOOL_SEQUENCE.map((id) => (
        <SetBuilderToolButton
          exiting={exitingTool === id && selectedTool !== id}
          icon={TOOL_ICONS[id]}
          key={id}
          onClick={() => onSelectTool(id)}
          selected={selectedTool === id}
          tool={id}
        />
      ))}
    </nav>
  );
}
