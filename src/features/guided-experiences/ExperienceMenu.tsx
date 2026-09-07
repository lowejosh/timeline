import { ArrowUpRight, Compass } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GUIDED_EXPERIENCES, type GuidedExperience } from "./experiences";

export function ExperienceMenu({ onSelect }: { onSelect: (experience: GuidedExperience) => void }) {
  const [open, setOpen] = useState(false);
  const launching = useRef(false);
  return <Popover open={open} onOpenChange={next => { launching.current = false; setOpen(next); }}>
    <PopoverTrigger asChild>
      <Button className="order-3 rounded-full" size="icon" variant="glass" aria-label="Guided experiences" title="Guided experiences"><Compass className="size-4" /></Button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-72 max-w-[calc(100vw-24px)] bg-popover p-2" onCloseAutoFocus={event => { if (launching.current) event.preventDefault(); }}>
      <p className="px-3 pb-2 pt-2 text-[0.65rem] font-semibold tracking-wide text-muted-foreground">Guided experiences</p>
      {GUIDED_EXPERIENCES.map(experience => <button key={experience.id} type="button" className="group w-full cursor-pointer rounded-md px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" onClick={() => { launching.current = true; setOpen(false); onSelect(experience); }}>
        <span className="flex items-center justify-between font-display text-2xl">{experience.title}<ArrowUpRight className="size-4 text-muted-foreground" /></span>
        <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{experience.description}</span>
        <span className="mt-3 block text-[0.65rem] text-muted-foreground">{experience.stops.length} chapters</span>
      </button>)}
    </PopoverContent>
  </Popover>;
}
