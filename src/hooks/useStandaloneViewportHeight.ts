import { useEffect } from "react";

function readPixelCustomProperty(root: HTMLElement, propertyName: string) {
  const value = window
    .getComputedStyle(root)
    .getPropertyValue(propertyName)
    .trim();
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function useStandaloneViewportHeight() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const updateStandaloneViewportHeight = () => {
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const bottomInset = readPixelCustomProperty(root, "--safe-area-bottom");

      root.style.setProperty(
        "--app-standalone-viewport-height",
        `${viewportHeight + bottomInset}px`,
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
      root.style.removeProperty("--app-standalone-viewport-height");
    };
  }, []);
}
