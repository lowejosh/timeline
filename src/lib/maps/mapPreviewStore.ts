type MapPreviewSubscriber = () => void;

const subscribers = new Set<MapPreviewSubscriber>();
let currentYear: number | null = null;
let pendingYear: number | null = null;
let updateFrame = 0;

function notifySubscribers() {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

function commitMapPreviewYear(year: number | null) {
  const nextYear = year === null ? null : Math.round(year);

  if (currentYear === nextYear) {
    return;
  }

  currentYear = nextYear;
  notifySubscribers();
}

function flushPendingMapPreviewYear() {
  updateFrame = 0;
  commitMapPreviewYear(pendingYear);
}

export function publishMapPreviewYear(year: number | null) {
  pendingYear = year;

  if (year === null) {
    if (updateFrame) {
      window.cancelAnimationFrame(updateFrame);
      updateFrame = 0;
    }

    commitMapPreviewYear(null);
    return;
  }

  if (typeof window === "undefined") {
    commitMapPreviewYear(year);
    return;
  }

  if (!updateFrame) {
    updateFrame = window.requestAnimationFrame(flushPendingMapPreviewYear);
  }
}

export function subscribeMapPreviewYear(subscriber: MapPreviewSubscriber) {
  subscribers.add(subscriber);

  return () => {
    subscribers.delete(subscriber);
  };
}

export function getMapPreviewYearSnapshot() {
  return currentYear;
}
