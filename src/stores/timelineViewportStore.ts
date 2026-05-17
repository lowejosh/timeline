import { create } from "zustand";

import {
  getHomeViewport,
  getViewportForRange,
  normalizeViewport,
  panByPixels,
  zoomAtPosition,
  type TimelineScaleMode,
  type TimelineViewport,
} from "@/lib/core/viewport";

type AnimationTarget = {
  centerYear: number;
  zoom: number;
  scaleMode?: TimelineScaleMode;
  startTime: number;
  duration: number;
  from: TimelineViewport;
};

type MomentumState = {
  velocity: number;
  lastTime: number;
};

type DragVelocityState = {
  samples: { dx: number; t: number }[];
};

type TimelineViewportState = {
  isAnimating: boolean;
  viewport: TimelineViewport;
  width: number;
};

type TimelineViewportActions = {
  animateToRange: (
    startYear: number,
    endYear: number,
    paddingRatio?: number,
  ) => void;
  animateToViewport: (target: TimelineViewport) => void;
  animateZoom: (zoomDelta: number, anchorX: number) => void;
  cancelTransientMotion: () => void;
  recordDragSample: (dx: number) => void;
  releaseMomentum: () => void;
  setViewportWidth: (width: number) => void;
  updateViewport: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  updateViewportDirect: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
};

export type TimelineViewportStore = TimelineViewportState &
  TimelineViewportActions;

const ANIMATION_DURATION = 350;
const MOMENTUM_FRICTION = 0.94;
const MOMENTUM_MIN_VELOCITY = 0.5;
const INITIAL_VIEWPORT_WIDTH = 1440;

let animationTarget: AnimationTarget | null = null;
let momentumState: MomentumState | null = null;
let rafId = 0;
const dragVelocityState: DragVelocityState = { samples: [] };

function now() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function areViewportsEqual(left: TimelineViewport, right: TimelineViewport) {
  return (
    left.centerYear === right.centerYear &&
    left.centerYearWhole === right.centerYearWhole &&
    left.centerYearFraction === right.centerYearFraction &&
    left.zoom === right.zoom &&
    left.scaleMode === right.scaleMode
  );
}

function cancelAnimationFrameSafe(frameId: number) {
  if (frameId && typeof cancelAnimationFrame !== "undefined") {
    cancelAnimationFrame(frameId);
  }
}

function requestAnimationFrameSafe(callback: () => void) {
  if (typeof requestAnimationFrame === "undefined") {
    return 0;
  }

  return requestAnimationFrame(callback);
}

function normalizeForWidth(viewport: TimelineViewport, width: number) {
  return normalizeViewport(viewport, Math.max(width, 1));
}

function clearTransientMotion() {
  animationTarget = null;
  momentumState = null;
}

export const useTimelineViewportStore = create<TimelineViewportStore>(
  (set, get) => {
    const scheduleTick = () => {
      cancelAnimationFrameSafe(rafId);
      rafId = requestAnimationFrameSafe(tick);
    };

    const setViewport = (next: TimelineViewport) => {
      set((state) =>
        areViewportsEqual(state.viewport, next) ? state : { viewport: next },
      );
    };

    const tick = () => {
      rafId = 0;
      let needsRaf = false;
      const currentTime = now();
      const width = Math.max(get().width, 1);
      const anim = animationTarget;

      if (anim) {
        const elapsed = currentTime - anim.startTime;
        const rawT = Math.min(elapsed / anim.duration, 1);
        const t = 1 - (1 - rawT) ** 3;
        const centerYear =
          anim.from.centerYear + (anim.centerYear - anim.from.centerYear) * t;
        const zoom = anim.from.zoom + (anim.zoom - anim.from.zoom) * t;
        const next = normalizeForWidth(
          {
            centerYear,
            zoom,
            scaleMode: anim.scaleMode ?? anim.from.scaleMode,
          },
          width,
        );

        setViewport(next);

        if (rawT >= 1) {
          animationTarget = null;
          set({ isAnimating: false });
        } else {
          needsRaf = true;
        }
      }

      const momentum = momentumState;

      if (momentum && !anim) {
        const dt = currentTime - momentum.lastTime;
        momentum.lastTime = currentTime;
        momentum.velocity *= MOMENTUM_FRICTION;

        if (Math.abs(momentum.velocity) < MOMENTUM_MIN_VELOCITY) {
          momentumState = null;
        } else {
          const pixels = momentum.velocity * (dt / 16);
          const next = normalizeForWidth(
            panByPixels(get().viewport, pixels, width),
            width,
          );

          setViewport(next);
          needsRaf = true;
        }
      }

      if (needsRaf) {
        rafId = requestAnimationFrameSafe(tick);
      }
    };

    return {
      isAnimating: false,
      viewport: getHomeViewport(INITIAL_VIEWPORT_WIDTH),
      width: INITIAL_VIEWPORT_WIDTH,

      animateToRange: (startYear, endYear, paddingRatio) => {
        const { viewport, width } = get();
        const target = getViewportForRange(
          startYear,
          endYear,
          Math.max(width, 1),
          paddingRatio,
          viewport.scaleMode,
        );

        animationTarget = {
          centerYear: target.centerYear,
          zoom: target.zoom,
          scaleMode: target.scaleMode,
          startTime: now(),
          duration: ANIMATION_DURATION,
          from: { ...viewport },
        };
        momentumState = null;
        set({ isAnimating: true });
        scheduleTick();
      },

      animateToViewport: (target) => {
        const { viewport, width } = get();
        const normalizedTarget = normalizeForWidth(target, width);

        animationTarget = {
          centerYear: normalizedTarget.centerYear,
          zoom: normalizedTarget.zoom,
          scaleMode: normalizedTarget.scaleMode,
          startTime: now(),
          duration: ANIMATION_DURATION,
          from: { ...viewport },
        };
        momentumState = null;
        set({ isAnimating: true });
        scheduleTick();
      },

      animateZoom: (zoomDelta, anchorX) => {
        const { viewport, width } = get();

        clearTransientMotion();
        set({
          isAnimating: false,
          viewport: normalizeForWidth(
            zoomAtPosition(
              viewport,
              viewport.zoom + zoomDelta,
              anchorX,
              Math.max(width, 1),
            ),
            width,
          ),
        });
      },

      cancelTransientMotion: () => {
        clearTransientMotion();
        cancelAnimationFrameSafe(rafId);
        rafId = 0;
        set({ isAnimating: false });
      },

      recordDragSample: (dx) => {
        const currentTime = now();
        const samples = dragVelocityState.samples;
        samples.push({ dx, t: currentTime });
        dragVelocityState.samples = samples.filter(
          (sample) => sample.t >= currentTime - 80,
        );
      },

      releaseMomentum: () => {
        const samples = dragVelocityState.samples;

        if (samples.length < 2) {
          dragVelocityState.samples = [];
          return;
        }

        const oldest = samples[0];
        const newest = samples[samples.length - 1];
        const dt = newest.t - oldest.t;

        if (dt < 8) {
          dragVelocityState.samples = [];
          return;
        }

        const totalDx = samples.reduce((sum, sample) => sum + sample.dx, 0);
        const velocity = (totalDx / dt) * 16;
        dragVelocityState.samples = [];

        if (Math.abs(velocity) > MOMENTUM_MIN_VELOCITY) {
          momentumState = { velocity, lastTime: now() };
          scheduleTick();
        }
      },

      setViewportWidth: (width) => {
        const safeWidth = Math.max(width, 1);
        const current = get();

        if (current.width === safeWidth) {
          return;
        }

        clearTransientMotion();
        set({
          isAnimating: false,
          viewport: normalizeForWidth(current.viewport, safeWidth),
          width: safeWidth,
        });
      },

      updateViewport: (updater) => {
        const { viewport, width } = get();
        const next = normalizeForWidth(updater(viewport), width);

        clearTransientMotion();
        set((state) =>
          areViewportsEqual(state.viewport, next)
            ? { isAnimating: false }
            : { isAnimating: false, viewport: next },
        );
      },

      updateViewportDirect: (updater) => {
        const { viewport, width } = get();
        const next = normalizeForWidth(updater(viewport), width);

        set((state) =>
          areViewportsEqual(state.viewport, next) ? state : { viewport: next },
        );
      },
    };
  },
);
