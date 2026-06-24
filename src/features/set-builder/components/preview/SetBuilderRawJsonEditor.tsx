import { Check, Clipboard, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTimelineSetDocumentIssues } from "@/lib/catalog/setDocumentValidation";
import type { TimelineRawSetDocument } from "@/lib/catalog/setSchema";

type RawJsonStatus = {
  document: TimelineRawSetDocument | null;
  message: string | null;
  tone: "good" | "error";
};

type SetBuilderRawJsonEditorProps = {
  document: TimelineRawSetDocument;
  onDirtyChange?: (isDirty: boolean) => void;
  onDocumentChange: (document: TimelineRawSetDocument) => void;
};

function formatRawDocument(document: TimelineRawSetDocument) {
  return JSON.stringify(document, null, 2);
}

function isRawSetDocument(value: unknown): value is TimelineRawSetDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TimelineRawSetDocument>;

  return (
    candidate.version === 1 &&
    Boolean(candidate.metadata) &&
    typeof candidate.metadata === "object" &&
    Boolean(candidate.sources) &&
    typeof candidate.sources === "object" &&
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.families) &&
    Array.isArray(candidate.markers) &&
    Array.isArray(candidate.overlays)
  );
}

function parseRawJson(text: string): RawJsonStatus {
  try {
    const parsed = JSON.parse(text) as unknown;

    if (!isRawSetDocument(parsed)) {
      return {
        document: null,
        message:
          "Configuration must be a version 1 timeline set document with metadata, sources, categories, families, markers, and overlays.",
        tone: "error",
      };
    }

    const issues = getTimelineSetDocumentIssues(parsed);
    const firstError = issues.find((issue) => issue.severity === "error");

    if (firstError) {
      return {
        document: null,
        message: firstError.message,
        tone: "error",
      };
    }

    return {
      document: parsed,
      message: "Configuration is valid.",
      tone: "good",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Configuration is invalid.";

    return {
      document: null,
      message: message.replace(/\bJSON\b/g, "Configuration"),
      tone: "error",
    };
  }
}

export function SetBuilderRawJsonEditor({
  document,
  onDirtyChange,
  onDocumentChange,
}: SetBuilderRawJsonEditorProps) {
  const canonicalJson = useMemo(() => formatRawDocument(document), [document]);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState(canonicalJson);
  const [status, setStatus] = useState<RawJsonStatus>(() =>
    parseRawJson(canonicalJson),
  );
  const [copied, setCopied] = useState(false);
  const isDirty = text !== canonicalJson;
  const lineNumbers = useMemo(
    () =>
      Array.from(
        { length: Math.max(text.split("\n").length, 1) },
        (_, index) => index + 1,
      ),
    [text],
  );

  useEffect(() => {
    if (!isDirty) {
      setText(canonicalJson);
    }
  }, [canonicalJson, isDirty]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStatus(parseRawJson(text));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(
    () => () => {
      onDirtyChange?.(false);
    },
    [onDirtyChange],
  );

  const handleDiscard = () => {
    setText(canonicalJson);
    setStatus(parseRawJson(canonicalJson));
  };

  const handleSave = () => {
    const nextStatus = parseRawJson(text);

    setStatus(nextStatus);

    if (!nextStatus.document) {
      return;
    }

    onDocumentChange(nextStatus.document);
    setText(formatRawDocument(nextStatus.document));
  };

  const handleCopy = () => {
    if (!navigator.clipboard) {
      return;
    }

    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  };

  const handleSelectAll = () => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background/30">
      <div className="min-h-0 flex-1 p-3">
        <div className="relative h-full min-h-0 overflow-hidden rounded-md border border-border bg-background/75 transition-[border-color,box-shadow] focus-within:ring-1 focus-within:ring-ring">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-11 overflow-hidden border-r border-border/60 bg-surface/30 py-3 font-mono text-[0.68rem] leading-relaxed text-muted-foreground/55"
            ref={gutterRef}
          >
            <div className="grid justify-items-end gap-0 px-2">
              {lineNumbers.map((lineNumber) => (
                <span key={lineNumber}>{lineNumber}</span>
              ))}
            </div>
          </div>
          <Textarea
            aria-label="Raw set configuration"
            className="h-full min-h-0 resize-none rounded-none border-0 bg-transparent py-3 pl-14 pr-4 font-mono text-[0.78rem] leading-relaxed selection:bg-primary/25 focus:ring-0"
            onChange={(event) => {
              setCopied(false);
              setText(event.target.value);
            }}
            onScroll={(event) => {
              if (gutterRef.current) {
                gutterRef.current.scrollTop = event.currentTarget.scrollTop;
              }
            }}
            ref={textareaRef}
            spellCheck={false}
            value={text}
            wrap="off"
          />
        </div>
      </div>

      <footer className="flex shrink-0 items-center gap-2 border-t border-border/70 bg-card/95 px-3 py-3 max-sm:flex-wrap max-sm:py-2">
        <div className="min-w-0 flex-1">
          {status.tone === "error" ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="inline-flex h-7 cursor-pointer items-center rounded-full border border-destructive/30 bg-destructive/10 px-2.5 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-destructive transition-colors hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  type="button"
                >
                  Invalid
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72">
                <div className="grid gap-1">
                  <p className="m-0 text-sm font-semibold text-primary">
                    Invalid raw config
                  </p>
                  <p className="m-0 text-xs leading-relaxed text-muted-foreground">
                    {status.message}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <span className="inline-flex h-7 items-center rounded-full border border-border/70 bg-surface/40 px-2.5 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Valid
            </span>
          )}
        </div>
        <Button
          className="max-sm:px-2.5"
          onClick={handleSelectAll}
          size="pill"
          type="button"
          variant="subtle"
        >
          Select all
        </Button>
        <Button
          className="max-sm:px-2.5"
          onClick={handleCopy}
          size="pill"
          type="button"
          variant="subtle"
        >
          {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button
          className="max-sm:px-2.5"
          disabled={!isDirty}
          onClick={handleDiscard}
          size="pill"
          type="button"
          variant="subtle"
        >
          <RotateCcw className="size-3.5" />
          Discard
        </Button>
        <Button
          className="max-sm:px-2.5"
          disabled={!status.document || !isDirty}
          onClick={handleSave}
          size="pill"
          type="button"
          variant="subtle"
        >
          <Check className="size-3.5" />
          Apply
        </Button>
      </footer>
    </div>
  );
}
