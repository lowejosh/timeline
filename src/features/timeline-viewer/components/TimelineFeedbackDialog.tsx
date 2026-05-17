import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwvygzzr";

type DialogState = "idle" | "submitting" | "sent" | "error";

type TimelineFeedbackDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function TimelineFeedbackDialog({
  isOpen,
  onClose,
}: TimelineFeedbackDialogProps) {
  const [message, setMessage] = useState("");
  const [dialogState, setDialogState] = useState<DialogState>("idle");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMessage("");
    setDialogState("idle");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || dialogState === "submitting") return;
    setDialogState("submitting");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setDialogState("sent");
      setTimeout(onClose, 900);
    } catch {
      setDialogState("error");
    }
  };

  return (
    <div
      aria-label="Send feedback"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex animate-[shortcut-overlay-in_180ms_ease-out] items-start justify-center bg-[rgba(44,31,20,0.16)] px-3 pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="Close feedback dialog"
        className="absolute inset-0 border-0 bg-transparent p-0"
        onClick={onClose}
        type="button"
      />
      <section className="relative w-[min(28rem,calc(100vw-24px))] animate-[shortcut-dialog-in_220ms_cubic-bezier(0.22,1,0.36,1)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-panel">
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <h2 className="m-0 font-display text-base font-semibold leading-none text-foreground">
            Send Feedback
          </h2>
          <Button
            aria-label="Close"
            className="rounded-full"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </header>

        <form className="px-4 py-4" onSubmit={handleSubmit}>
          <label
            className="mb-1.5 block text-[0.78rem] font-semibold text-foreground"
            htmlFor="feedback-message"
          >
            Message
          </label>
          <textarea
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-[0.8rem] leading-snug text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
            id="feedback-message"
            onChange={(e) => setMessage(e.target.value)}
            ref={textareaRef}
            rows={4}
            value={message}
          />
          {dialogState === "error" ? (
            <p className="mt-1.5 text-[0.72rem] text-destructive">
              Something went wrong. Try again or email{" "}
              <a className="underline" href="mailto:jolojoloapps@gmail.com">
                jolojoloapps@gmail.com
              </a>{" "}
              directly.
            </p>
          ) : null}
          <div className="mt-3 flex justify-end">
            <Button
              disabled={
                !message.trim() ||
                dialogState === "submitting" ||
                dialogState === "sent"
              }
              size="sm"
              type="submit"
            >
              {dialogState === "submitting"
                ? "Sending…"
                : dialogState === "sent"
                  ? "Sent"
                  : "Send"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
