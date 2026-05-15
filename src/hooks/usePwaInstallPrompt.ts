import { useCallback, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
};

const DISMISSED_STORAGE_KEY = "timeline:pwa-install-nudge:dismissed:v1";
const DO_NOT_SHOW_STORAGE_KEY = "timeline:pwa-install-nudge:disabled:v1";
const MOBILE_INSTALL_QUERY = "(max-width: 720px), (pointer: coarse)";
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

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [showInstallSteps, setShowInstallSteps] = useState(false);

  const platform = useMemo(() => (isIosLike() ? "ios" : "generic"), []);
  const canPromptInstall = deferredPrompt !== null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mobileQuery = window.matchMedia(MOBILE_INSTALL_QUERY);
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const updateEnvironment = () => {
      setIsMobile(mobileQuery.matches);
      setIsStandalone(isRunningStandalone());
    };

    updateEnvironment();
    mobileQuery.addEventListener("change", updateEnvironment);
    standaloneQuery.addEventListener("change", updateEnvironment);

    return () => {
      mobileQuery.removeEventListener("change", updateEnvironment);
      standaloneQuery.removeEventListener("change", updateEnvironment);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      writeStoredFlag(DISMISSED_STORAGE_KEY);
      setDeferredPrompt(null);
      setIsOpen(false);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (
      hasAutoOpened ||
      !isMobile ||
      isStandalone ||
      readStoredFlag(DISMISSED_STORAGE_KEY) ||
      readStoredFlag(DO_NOT_SHOW_STORAGE_KEY)
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setHasAutoOpened(true);
      setIsOpen(true);
    }, AUTO_SHOW_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasAutoOpened, isMobile, isStandalone]);

  const dismiss = useCallback((options?: { doNotShowAgain?: boolean }) => {
    writeStoredFlag(DISMISSED_STORAGE_KEY);

    if (options?.doNotShowAgain) {
      writeStoredFlag(DO_NOT_SHOW_STORAGE_KEY);
    }

    setIsOpen(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      setShowInstallSteps(true);
      return;
    }

    await deferredPrompt.prompt();

    try {
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        writeStoredFlag(DISMISSED_STORAGE_KEY);
        setIsOpen(false);
      }
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return {
    canPromptInstall,
    dismiss,
    install,
    isOpen: isOpen && isMobile && !isStandalone,
    platform,
    showInstallSteps,
  } as const;
}
