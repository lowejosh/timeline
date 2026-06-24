import { ChevronLeft } from "lucide-react";
import type { Ref, ReactNode } from "react";

import { PageIconButton } from "@/components/ui/page-icon-button";
import { cn } from "@/lib/utils";

type PageShellProps = {
  actions?: ReactNode;
  backLabel: string;
  children?: ReactNode;
  className?: string;
  description?: string;
  footer?: ReactNode;
  onBack: () => void;
  scrollRef?: Ref<HTMLDivElement>;
  sidebar?: ReactNode;
  title: string;
  titleId: string;
};

export function PageShell({
  actions,
  backLabel,
  children,
  className,
  description,
  footer,
  onBack,
  scrollRef,
  sidebar,
  title,
  titleId,
}: PageShellProps) {
  return (
    <div className="flex h-full w-full items-start justify-start overflow-hidden p-[calc(env(safe-area-inset-top,0px)+1.2rem)_calc(env(safe-area-inset-right,0px)+1.4rem)_calc(env(safe-area-inset-bottom,0px)+1.2rem)_calc(env(safe-area-inset-left,0px)+1.4rem)] text-primary overscroll-contain max-sm:p-0">
      <section
        aria-labelledby={titleId}
        className={cn(
          "mx-auto grid h-full max-h-full w-[min(92rem,100%)] overflow-hidden rounded-lg border border-border bg-card text-primary shadow-panel max-sm:w-full max-sm:rounded-none max-sm:border-0 max-sm:shadow-none",
          footer
            ? "grid-rows-[auto_minmax(0,1fr)_auto]"
            : "grid-rows-[auto_minmax(0,1fr)]",
          className,
        )}
      >
        <header className="flex min-w-0 items-center gap-3 border-b border-border/70 px-4 py-3 max-sm:gap-2 max-sm:px-3 max-sm:py-2 max-sm:pt-[calc(env(safe-area-inset-top,0px)+0.55rem)]">
          <PageIconButton
            label={backLabel}
            onClick={onBack}
            type="button"
          >
            <ChevronLeft className="size-4" />
          </PageIconButton>
          <div className="grid min-w-0 flex-1 gap-1">
            <h1
              className="m-0 truncate font-display text-base font-semibold leading-none text-primary max-sm:text-sm"
              id={titleId}
            >
              {title}
            </h1>
            {description ? (
              <p className="m-0 text-[0.69rem] leading-snug text-muted-foreground max-sm:hidden">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2 max-sm:gap-1.5">
              {actions}
            </div>
          ) : null}
        </header>
        <div
          className={cn(
            "grid h-full min-h-0 gap-4 overflow-auto p-4 max-sm:gap-3 max-sm:p-3",
            sidebar
              ? "grid-cols-[minmax(0,1fr)_22rem] max-lg:grid-cols-1"
              : "grid-cols-1",
          )}
          ref={scrollRef}
        >
          {children ? (
            <main className="h-full min-h-0 min-w-0">{children}</main>
          ) : null}
          {sidebar ? <aside className="min-w-0">{sidebar}</aside> : null}
        </div>
        {footer ? (
          <footer className="border-t border-border/70 bg-card/95 px-4 py-3 backdrop-blur-xl max-sm:px-3 max-sm:pb-[calc(env(safe-area-inset-bottom,0px)+0.65rem)]">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
