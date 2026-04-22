import { useEffect, useId, useRef, useState } from "react";
import "./TimelineSettings.css";

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
      className="timeline-settings"
      data-open={isOpen ? "true" : "false"}
      ref={rootRef}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide settings" : "Show settings"}
        className="timeline-settings__toggle"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span aria-hidden="true" className="timeline-settings__icon">
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
        className="timeline-settings__panel"
        data-open={isOpen ? "true" : "false"}
        id={panelId}
      >
        <div className="timeline-settings__panel-header">
          <h2 className="timeline-settings__title">Settings</h2>
        </div>

        <div className="timeline-settings__item">
          <label className="timeline-settings__item-label">
            Cosmic Calendar
            <span className="timeline-settings__item-description">
              Compress all of time into a single calendar year.
            </span>
          </label>
          <button
            aria-checked={isCosmicCalendarMode}
            className="timeline-settings__toggle-switch"
            onClick={onToggleCosmicCalendarMode}
            role="switch"
            type="button"
          />
        </div>
      </section>
    </div>
  );
}
