import { X } from "lucide-react";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type TagInputProps = {
  id: string;
  value: readonly string[];
  className?: string;
  placeholder?: string;
  onValueChange: (value: string[]) => void;
};

function normalizeTag(value: string) {
  return value.trim().replace(/^#+/, "");
}

function splitTags(value: string) {
  return value
    .split(/[\s,]+/)
    .map(normalizeTag)
    .filter(Boolean);
}

function mergeTags(currentTags: readonly string[], nextTags: readonly string[]) {
  const seen = new Set(currentTags.map((tag) => tag.toLocaleLowerCase()));
  const merged = [...currentTags];

  nextTags.forEach((tag) => {
    const key = tag.toLocaleLowerCase();

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(tag);
  });

  return merged;
}

export function TagInput({
  className,
  id,
  onValueChange,
  placeholder = "Add tag",
  value,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const tags = useMemo(() => [...value], [value]);

  const commitTags = (rawValue = inputValue) => {
    const nextTags = splitTags(rawValue);

    if (nextTags.length === 0) {
      setInputValue("");
      return;
    }

    onValueChange(mergeTags(tags, nextTags));
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onValueChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " " || event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitTags();
      return;
    }

    if (
      event.key === "Backspace" &&
      inputValue.length === 0 &&
      tags.length > 0
    ) {
      event.preventDefault();
      removeTag(tags[tags.length - 1]);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedValue = event.clipboardData.getData("text");

    if (!/[\s,]/.test(pastedValue)) {
      return;
    }

    event.preventDefault();
    commitTags(pastedValue);
  };

  return (
    <div
      className={cn(
        "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface/60 px-2.5 py-2 transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      {tags.map((tag) => (
        <span
          className="inline-flex h-6 items-center gap-1 rounded-full border border-border/70 bg-muted px-2 text-[0.68rem] font-semibold leading-none text-muted-foreground"
          key={tag}
        >
          {tag}
          <button
            aria-label={`Remove ${tag}`}
            className="grid size-4 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => removeTag(tag)}
            type="button"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        autoComplete="off"
        className="min-w-24 flex-1 border-0 bg-transparent px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        id={id}
        onBlur={() => commitTags()}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={tags.length > 0 ? "" : placeholder}
        value={inputValue}
      />
    </div>
  );
}
