import { useEffect, useId, useRef, useState } from "react";
import "./TimelineDisclaimer.css";

export function TimelineDisclaimer() {
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
      className="timeline-disclaimer"
      data-open={isOpen ? "true" : "false"}
      ref={rootRef}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide framing note" : "Show framing note"}
        className="timeline-disclaimer__toggle"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span aria-hidden="true" className="timeline-disclaimer__icon">
          <span className="timeline-disclaimer__icon-dot" />
          <span className="timeline-disclaimer__icon-stem" />
          <span className="timeline-disclaimer__icon-slash" />
        </span>
      </button>

      <section
        aria-hidden={!isOpen}
        aria-label="Timeline framing note"
        className="timeline-disclaimer__panel"
        data-open={isOpen ? "true" : "false"}
        id={panelId}
      >
        <div className="timeline-disclaimer__panel-header">
          <h2 className="timeline-disclaimer__title">Framing note</h2>
        </div>

        <div className="timeline-disclaimer__body">
          <p>
            Unfortunately there is no single clean, standardized single source
            of truth to divide all of history, and also not really possible to
            fit EVERYTHING on here.
          </p>
          <p>
            So the default information/eras are mostly biased around what I
            thought was interesting and impactful. Not a fully balanced or
            comprehensive view of history.
          </p>
        </div>
      </section>
    </div>
  );
}
