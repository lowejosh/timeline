import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { THEME } from "@/lib/ui/theme";
import "./TimelineDisclaimer.styles.css";

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

  const ICON_TRANSITION = `transform 240ms ${THEME.easing.spring}, opacity 180ms ${THEME.easing.ease}, top 240ms ${THEME.easing.spring}, width 240ms ${THEME.easing.spring}, height 240ms ${THEME.easing.spring}`;

  const iconPartBase: CSSProperties = {
    position: "absolute",
    left: "50%",
    background: "currentColor",
    borderRadius: "999px",
    transition: ICON_TRANSITION,
  };

  const iconDotStyle: CSSProperties = {
    ...iconPartBase,
    top: "0.02rem",
    width: "0.16rem",
    height: "0.16rem",
    transform: isOpen ? "translateX(-50%) scale(0.4)" : "translateX(-50%)",
    opacity: isOpen ? 0 : 1,
  };

  const iconStemStyle: CSSProperties = {
    ...iconPartBase,
    top: isOpen ? "50%" : "0.28rem",
    width: "0.14rem",
    height: isOpen ? "0.72rem" : "0.54rem",
    transform: isOpen
      ? "translate(-50%, -50%) rotate(45deg)"
      : "translateX(-50%)",
  };

  const iconSlashStyle: CSSProperties = {
    ...iconPartBase,
    top: "50%",
    width: "0.14rem",
    height: "0.72rem",
    opacity: isOpen ? 1 : 0,
    transform: isOpen
      ? "translate(-50%, -50%) rotate(-45deg) scaleY(1)"
      : "translate(-50%, -50%) rotate(-45deg) scaleY(0.32)",
  };

  return (
    <div
      className="absolute top-3 right-3 z-[4] max-sm:top-[10px] max-sm:right-[10px]"
      ref={rootRef}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide framing note" : "Show framing note"}
        className="inline-flex items-center justify-center w-8 h-8 p-0 border rounded-full text-[var(--ink)] backdrop-blur-[14px] cursor-pointer bg-[var(--glass-base)] border-[var(--brown-14)] [box-shadow:0_8px_18px_var(--shadow-8)] [transition:background-color_180ms_ease,box-shadow_180ms_ease,border-color_180ms_ease,transform_180ms_ease] hover:bg-[var(--glass-hover)] hover:border-[var(--brown-20)] hover:[box-shadow:0_10px_22px_var(--shadow-10)] hover:-translate-y-px data-[open=true]:bg-[var(--glass-active)] data-[open=true]:border-[var(--brown-18)] data-[open=true]:[box-shadow:0_10px_22px_var(--shadow-10)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--focus)]"
        data-open={isOpen ? "true" : "false"}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span
          aria-hidden="true"
          className="relative inline-block w-[0.95rem] h-[0.95rem] text-current"
        >
          <span style={iconDotStyle} />
          <span style={iconStemStyle} />
          <span style={iconSlashStyle} />
        </span>
      </button>

      <section
        aria-hidden={!isOpen}
        aria-label="Timeline framing note"
        className="disclaimer-panel absolute top-[calc(100%+10px)] right-0 w-[min(22rem,calc(100vw-24px))] py-[0.78rem] px-[0.84rem] border rounded-2xl backdrop-blur-[14px] max-sm:w-[min(20rem,calc(100vw-20px))]"
        data-open={isOpen ? "true" : "false"}
        id={panelId}
        style={{
          borderColor: THEME.color.brown[12],
          background: `linear-gradient(180deg, ${THEME.color.glass.panelHeavyFrom} 0%, ${THEME.color.glass.panelHeavyTo} 100%)`,
          boxShadow: `0 14px 34px ${THEME.color.shadow[10]}, 0 4px 14px ${THEME.color.shadow[5]}`,
        }}
      >
        <div className="flex items-center gap-[0.4rem] mb-[0.48rem]">
          <h2 className="m-0 text-[var(--ink)] text-[0.92rem] leading-[1.05] font-semibold font-display">
            Framing note
          </h2>
        </div>

        <div
          className="grid gap-[0.46rem] text-[0.73rem] leading-[1.42] font-sans [&_p]:m-0"
          style={{ color: THEME.color.inkBody }}
        >
          <p>
            Unfortunately there is no standardized single source of truth to
            divide all of history, and also not really possible to fit
            EVERYTHING on here.
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
