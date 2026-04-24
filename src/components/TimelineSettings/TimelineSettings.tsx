import { useEffect, useId, useRef, useState } from "react";
import { THEME } from "@/lib/ui/theme";
import "./TimelineSettings.styles.css";

type TimelineSettingsProps = {
  isCosmicCalendarMode: boolean;
  onToggleCosmicCalendarMode: () => void;
};

export function TimelineSettings({
  isCosmicCalendarMode,
  onToggleCosmicCalendarMode,
}: TimelineSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const document = rootRef.current?.ownerDocument ?? window.document;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className="absolute top-3 right-[52px] z-[4] max-sm:top-[10px] max-sm:right-[50px]"
      data-open={isOpen ? "true" : "false"}
      ref={rootRef}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide settings" : "Show settings"}
        className="group inline-flex items-center justify-center w-8 h-8 p-0 border rounded-full text-[var(--ink)] backdrop-blur-[14px] cursor-pointer bg-[var(--glass-base)] border-[var(--brown-14)] [box-shadow:0_8px_18px_var(--shadow-8)] [transition:background-color_180ms_ease,box-shadow_180ms_ease,border-color_180ms_ease,transform_180ms_ease] hover:bg-[var(--glass-hover)] hover:border-[var(--brown-20)] hover:[box-shadow:0_10px_22px_var(--shadow-10)] hover:-translate-y-px data-[open=true]:bg-[var(--glass-active)] data-[open=true]:border-[var(--brown-18)] data-[open=true]:[box-shadow:0_10px_22px_var(--shadow-10)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--focus)]"
        data-open={isOpen ? "true" : "false"}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-[0.88rem] h-[0.88rem] text-current [transition:transform_400ms_cubic-bezier(0.22,1,0.36,1)] group-data-[open=true]:rotate-[60deg]"
        >
          <svg
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
            height="14"
            viewBox="0 0 14 14"
            width="14"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.86 5.96L12.41 5.55 12.41 8.45 10.86 8.04A4 4 0 0 1 9.83 9.83L10.96 10.96 8.45 12.41 8.04 10.86A4 4 0 0 1 5.96 10.86L5.55 12.41 3.04 10.96 4.17 9.83A4 4 0 0 1 3.14 8.04L1.59 8.45 1.59 5.55 3.14 5.96A4 4 0 0 1 4.17 4.17L3.04 3.04 5.55 1.59 5.96 3.14A4 4 0 0 1 8.04 3.14L8.45 1.59 10.96 3.04 9.83 4.17A4 4 0 0 1 10.86 5.96ZM9.2 7A2.2 2.2 0 1 0 4.8 7A2.2 2.2 0 1 0 9.2 7Z" />
          </svg>
        </span>
      </button>

      <section
        aria-hidden={!isOpen}
        aria-label="Timeline settings"
        className="settings-panel absolute top-[calc(100%+10px)] right-0 w-[min(18rem,calc(100vw-24px))] py-[0.78rem] px-[0.84rem] border rounded-2xl backdrop-blur-[14px] max-sm:w-[min(17rem,calc(100vw-20px))]"
        data-open={isOpen ? "true" : "false"}
        id={panelId}
        style={{
          borderColor: THEME.color.brown[12],
          background: `linear-gradient(180deg, ${THEME.color.glass.panelHeavyFrom} 0%, ${THEME.color.glass.panelHeavyTo} 100%)`,
          boxShadow: `0 14px 34px ${THEME.color.shadow[10]}, 0 4px 14px ${THEME.color.shadow[5]}`,
        }}
      >
        <div className="flex items-center gap-[0.4rem] mb-[0.52rem]">
          <h2 className="m-0 text-[var(--ink)] text-[0.92rem] leading-[1.05] font-semibold font-display">
            Settings
          </h2>
        </div>

        <div className="settings-item flex items-center justify-between gap-[0.75rem] py-[0.34rem]">
          <label className="flex flex-col gap-[0.18rem] text-[var(--ink)] text-[0.78rem] leading-[1.3] font-sans">
            Cosmic Calendar
            <span
              className="text-[0.68rem] leading-[1.3] font-sans"
              style={{ color: "rgba(32, 25, 19, 0.56)" }}
            >
              Compress all of time into a single calendar year.
            </span>
          </label>
          <button
            aria-checked={isCosmicCalendarMode}
            className="settings-switch relative flex-shrink-0 w-8 h-[1.12rem] border-0 rounded-full p-0 cursor-pointer"
            onClick={onToggleCosmicCalendarMode}
            role="switch"
            style={{
              background: isCosmicCalendarMode
                ? THEME.color.accent
                : THEME.color.brown[18],
            }}
            type="button"
          />
        </div>
      </section>
    </div>
  );
}
