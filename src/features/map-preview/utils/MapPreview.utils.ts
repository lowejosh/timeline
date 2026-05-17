export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function scheduleMapIdleTask(callback: () => void) {
  if (typeof window === "undefined") {
    callback();
    return () => {};
  }

  if ("requestIdleCallback" in window && "cancelIdleCallback" in window) {
    const idleId = window.requestIdleCallback(callback, { timeout: 240 });

    return () => {
      window.cancelIdleCallback(idleId);
    };
  }

  const timeoutId = globalThis.setTimeout(callback, 16);

  return () => {
    globalThis.clearTimeout(timeoutId);
  };
}

export function waitForMapIdle() {
  return new Promise<void>((resolve) => {
    scheduleMapIdleTask(resolve);
  });
}
