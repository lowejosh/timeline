import { useCallback, useEffect, useRef, useState } from "react";
import {
  getViewportForRange,
  normalizeViewport,
  panByPixels,
  zoomAtPosition,
  type TimelineViewport,
} from "../lib/time/viewport";

type AnimationTarget = {
  centerYear: number;
  zoom: number;
  startTime: number;
  duration: number;
  from: TimelineViewport;
};

type MomentumState = {
  velocity: number;
  lastTime: number;
};

const ANIMATION_DURATION = 350;
const MOMENTUM_FRICTION = 0.94;
const MOMENTUM_MIN_VELOCITY = 0.5;

export function useAnimatedViewport(initial: TimelineViewport, width: number) {
  const [viewport, setViewport] = useState(initial);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<AnimationTarget | null>(null);
  const momentumRef = useRef<MomentumState | null>(null);
  const rafRef = useRef<number>(0);
  const tickRef = useRef<() => void>(() => {});
  const dragVelocityRef = useRef<{ samples: { dx: number; t: number }[] }>({
    samples: [],
  });

  const tick = useCallback(() => {
    let needsRaf = false;
    const now = performance.now();

    // Handle animation (zoom lerp / navigate-to-era)
    const anim = animationRef.current;
    if (anim) {
      const elapsed = now - anim.startTime;
      const rawT = Math.min(elapsed / anim.duration, 1);
      // ease-out cubic
      const t = 1 - (1 - rawT) ** 3;

      const centerYear =
        anim.from.centerYear + (anim.centerYear - anim.from.centerYear) * t;
      const zoom = anim.from.zoom + (anim.zoom - anim.from.zoom) * t;

      setViewport(normalizeViewport({ centerYear, zoom }, Math.max(width, 1)));

      if (rawT >= 1) {
        animationRef.current = null;
        setIsAnimating(false);
      } else {
        needsRaf = true;
      }
    }

    // Handle momentum
    const momentum = momentumRef.current;
    if (momentum && !anim) {
      const dt = now - momentum.lastTime;
      momentum.lastTime = now;
      momentum.velocity *= MOMENTUM_FRICTION;

      if (Math.abs(momentum.velocity) < MOMENTUM_MIN_VELOCITY) {
        momentumRef.current = null;
      } else {
        const pixels = momentum.velocity * (dt / 16);
        setViewport((current) =>
          panByPixels(current, pixels, Math.max(width, 1)),
        );
        needsRaf = true;
      }
    }

    if (needsRaf) {
      rafRef.current = requestAnimationFrame(() => tickRef.current?.());
    }
  }, [width]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const startRaf = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const updateViewport = useCallback(
    (updater: (current: TimelineViewport) => TimelineViewport) => {
      // Direct updates cancel animations and momentum
      animationRef.current = null;
      momentumRef.current = null;
      setViewport((current) => updater(current));
    },
    [],
  );

  const animateToRange = useCallback(
    (startYear: number, endYear: number, paddingRatio?: number) => {
      const target = getViewportForRange(
        startYear,
        endYear,
        Math.max(width, 1),
        paddingRatio,
      );
      setIsAnimating(true);
      setViewport((current) => {
        animationRef.current = {
          centerYear: target.centerYear,
          zoom: target.zoom,
          startTime: performance.now(),
          duration: ANIMATION_DURATION,
          from: { ...current },
        };
        startRaf();
        return current;
      });
    },
    [width, startRaf],
  );

  const animateZoom = useCallback(
    (zoomDelta: number, anchorX: number) => {
      animationRef.current = null;
      momentumRef.current = null;
      setViewport((current) =>
        zoomAtPosition(
          current,
          current.zoom + zoomDelta,
          anchorX,
          Math.max(width, 1),
        ),
      );
    },
    [width],
  );

  // Drag velocity tracking
  const recordDragSample = useCallback((dx: number) => {
    const now = performance.now();
    const samples = dragVelocityRef.current.samples;
    samples.push({ dx, t: now });
    // Keep only last 80ms of samples
    const cutoff = now - 80;
    dragVelocityRef.current.samples = samples.filter((s) => s.t >= cutoff);
  }, []);

  const releaseMomentum = useCallback(() => {
    const samples = dragVelocityRef.current.samples;
    if (samples.length < 2) {
      dragVelocityRef.current.samples = [];
      return;
    }

    const oldest = samples[0];
    const newest = samples[samples.length - 1];
    const dt = newest.t - oldest.t;

    if (dt < 8) {
      dragVelocityRef.current.samples = [];
      return;
    }

    const totalDx = samples.reduce((sum, s) => sum + s.dx, 0);
    const velocity = (totalDx / dt) * 16; // normalize to ~60fps frame

    dragVelocityRef.current.samples = [];

    if (Math.abs(velocity) > MOMENTUM_MIN_VELOCITY) {
      momentumRef.current = { velocity, lastTime: performance.now() };
      startRaf();
    }
  }, [startRaf]);

  return {
    viewport,
    isAnimating,
    updateViewport,
    animateToRange,
    animateZoom,
    recordDragSample,
    releaseMomentum,
  };
}
