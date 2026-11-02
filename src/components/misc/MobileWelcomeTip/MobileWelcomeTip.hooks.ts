import { useCallback, useEffect, useMemo, useState } from "react";

const DISMISSED_STORAGE_KEY = "timeline:mobile-welcome:dismissed:v1";
// Respect people who explicitly opted out of the old install suggestion.
const DO_NOT_SHOW_STORAGE_KEY = "timeline:pwa-install-nudge:disabled:v1";
const MOBILE_QUERY = "(max-width: 720px), (pointer: coarse)";
const AUTO_SHOW_DELAY_MS = 900;

function readStoredFlag(key: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeStoredFlag(key: string) {
  try {
    window.localStorage.setItem(key, "true");
  } catch {
    // Storage can fail in private browsing; the prompt still closes in memory.
  }
}

function isRunningStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIosLike() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithTouchPoints = window.navigator as Navigator & {
    maxTouchPoints?: number;
  };
  const platform = window.navigator.platform.toLowerCase();
  const userAgent = window.navigator.userAgent.toLowerCase();

  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (platform === "macintel" && (navigatorWithTouchPoints.maxTouchPoints ?? 0) > 1)
  );
}

export function useMobileWelcomeTip(enabled: boolean) {
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() =>
    readStoredFlag(DISMISSED_STORAGE_KEY) || readStoredFlag(DO_NOT_SHOW_STORAGE_KEY),
  );
  const platform = useMemo(() => (isIosLike() ? "ios" : "generic"), []);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const updateEnvironment = () => {
      setIsMobile(mobileQuery.matches);
      setIsStandalone(isRunningStandalone());
    };
    // Keep the browser's install promotion from competing with the welcome tip.
    const preventInstallPromotion = (event: Event) => event.preventDefault();

    updateEnvironment();
    mobileQuery.addEventListener("change", updateEnvironment);
    standaloneQuery.addEventListener("change", updateEnvironment);
    window.addEventListener("appinstalled", updateEnvironment);
    window.addEventListener("beforeinstallprompt", preventInstallPromotion);
    return () => {
      mobileQuery.removeEventListener("change", updateEnvironment);
      standaloneQuery.removeEventListener("change", updateEnvironment);
      window.removeEventListener("appinstalled", updateEnvironment);
      window.removeEventListener("beforeinstallprompt", preventInstallPromotion);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !isMobile || isDismissed || isReady) return;
    const timer = window.setTimeout(() => setIsReady(true), AUTO_SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, isMobile, isDismissed, isReady]);

  const dismiss = useCallback(() => {
    writeStoredFlag(DISMISSED_STORAGE_KEY);
    setIsDismissed(true);
  }, []);

  return {
    dismiss,
    isOpen: enabled && isMobile && isReady && !isDismissed,
    isStandalone,
    platform,
  } as const;
}
