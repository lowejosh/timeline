import * as rx from "@/pages/AvailableSetsView/AvailableSetsView.selectors";
import { SetBuilderPage } from "@/features/set-builder";
import { THEME } from "@/lib/ui/theme";
import { cn } from "@/lib/utils";

export function SetBuilderView() {
  const activeView = rx.useActiveView();

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden backdrop-blur-2xl transition-[transform,opacity] duration-300 ease-out will-change-[transform,opacity]",
        activeView === "create-set"
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-full opacity-0",
      )}
      style={{
        background: `linear-gradient(180deg, ${THEME.color.glass.setsFrom} 0%, ${THEME.color.glass.setsTo} 100%)`,
      }}
    >
      <SetBuilderPage />
    </div>
  );
}
