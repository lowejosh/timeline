import { useEffect } from "react";

function createSafeAreaProbe(propertyName: "bottom" | "top") {
  const probe = document.createElement("div");

  probe.setAttribute("aria-hidden", "true");
  probe.style.pointerEvents = "none";
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style[propertyName] = "0";
  probe.style.paddingBottom =
    propertyName === "bottom" ? "env(safe-area-inset-bottom, 0px)" : "0px";
  probe.style.paddingTop =
    propertyName === "top" ? "env(safe-area-inset-top, 0px)" : "0px";
  document.body.appendChild(probe);

  return probe;
}

function readSafeAreaInset(probe: HTMLElement, propertyName: "bottom" | "top") {
  const computed = window.getComputedStyle(probe);
  const value =
    propertyName === "bottom" ? computed.paddingBottom : computed.paddingTop;
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

export function useStandaloneViewportHeight() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const bottomInsetProbe = createSafeAreaProbe("bottom");
    const topInsetProbe = createSafeAreaProbe("top");
    const updateStandaloneViewportHeight = () => {
      const visualViewportHeight = window.visualViewport?.height ?? 0;
      const bottomInset = readSafeAreaInset(bottomInsetProbe, "bottom");
      const topInset = readSafeAreaInset(topInsetProbe, "top");
      const viewportHeight = Math.max(
        window.innerHeight,
        visualViewportHeight,
      );

      root.style.setProperty("--app-safe-area-bottom-px", `${bottomInset}px`);
      root.style.setProperty("--app-safe-area-top-px", `${topInset}px`);
      root.style.setProperty(
        "--app-standalone-viewport-height",
        `${viewportHeight}px`,
      );
    };

    updateStandaloneViewportHeight();
    window.addEventListener("pageshow", updateStandaloneViewportHeight);
    window.addEventListener("resize", updateStandaloneViewportHeight);
    window.addEventListener(
      "orientationchange",
      updateStandaloneViewportHeight,
    );
    window.visualViewport?.addEventListener(
      "resize",
      updateStandaloneViewportHeight,
    );

    return () => {
      window.removeEventListener("pageshow", updateStandaloneViewportHeight);
      window.removeEventListener("resize", updateStandaloneViewportHeight);
      window.removeEventListener(
        "orientationchange",
        updateStandaloneViewportHeight,
      );
      window.visualViewport?.removeEventListener(
        "resize",
        updateStandaloneViewportHeight,
      );
      bottomInsetProbe.remove();
      topInsetProbe.remove();
      root.style.removeProperty("--app-safe-area-bottom-px");
      root.style.removeProperty("--app-safe-area-top-px");
      root.style.removeProperty("--app-standalone-viewport-height");
    };
  }, []);
}
