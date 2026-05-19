import { Check, Clipboard, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { PageIconButton } from "@/components/ui/page-icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";
import { createTimelineSetGenerationPrompt } from "../utils/createTimelineSetGenerationPrompt";

type SetBuilderAiPromptButtonProps = {
  document: TimelineRawSetDocument;
};

export function SetBuilderAiPromptButton({
  document,
}: SetBuilderAiPromptButtonProps) {
  const prompt = useMemo(
    () => createTimelineSetGenerationPrompt(document),
    [document],
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!navigator.clipboard) {
      return;
    }

    void navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <Popover
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCopied(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <PageIconButton label="Generate with AI" type="button">
          <Sparkles className="size-3.5" />
        </PageIconButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="grid w-[min(34rem,calc(100vw-2rem))] gap-3 p-3"
      >
        <div className="grid gap-1">
          <p className="m-0 text-sm font-semibold text-primary">
            I'm not doing it for you
          </p>
          <p className="m-0 text-xs leading-relaxed text-muted-foreground">
            Copy this into an AI agent, with a topic of your choice, and see
            what it comes up with (You may need to double check it's
            hallucinations). Then dump it into the raw and save.
          </p>
        </div>

        <Textarea
          aria-label="AI generation prompt"
          className="h-72 resize-none rounded-md bg-background/75 px-3 py-3 font-mono text-[0.72rem] leading-relaxed selection:bg-primary/25"
          readOnly
          value={prompt}
        />

        <div className="flex justify-end">
          <Button
            onClick={handleCopy}
            size="pill"
            type="button"
            variant="subtle"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Clipboard className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy prompt"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
