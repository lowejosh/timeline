let worldLandPath2D: Path2D | null = null;
let fetchPromise: Promise<void> | null = null;

export function getWorldLandPath2D(): Path2D | null {
  return worldLandPath2D;
}

/**
 * Starts loading the world land path if not already loaded.
 * Calls `onLoad` when ready (immediately if already cached).
 */
export function ensureWorldLandLoaded(onLoad: () => void): void {
  if (worldLandPath2D) {
    onLoad();
    return;
  }

  if (!fetchPromise) {
    fetchPromise = fetch(`${import.meta.env.BASE_URL}world-land.path`)
      .then((r) => r.text())
      .then((str) => {
        worldLandPath2D = new Path2D(str);
      })
      .catch(() => {
        // Silent fail — land underlay is decorative
      });
  }

  void fetchPromise.then(onLoad);
}
