export type AnimatedEraChildState = {
  current: number;
  from: number;
  target: number;
  startTime: number;
  duration: number;
};

type SyncAnimatedEraChildStateOptions = {
  existing?: AnimatedEraChildState;
  nextTarget: number;
  now: number;
  duration: number;
  hasInitialized: boolean;
};

const ERA_CHILD_ANIMATION_EPSILON = 0.001;

export function syncAnimatedEraChildState({
  existing,
  nextTarget,
  now,
  duration,
  hasInitialized,
}: SyncAnimatedEraChildStateOptions): AnimatedEraChildState {
  if (!existing) {
    const initialValue = hasInitialized ? 0 : nextTarget;

    return {
      current: initialValue,
      from: initialValue,
      target: nextTarget,
      startTime: now,
      duration,
    };
  }

  if (existing.target !== nextTarget) {
    return {
      ...existing,
      from: existing.current,
      target: nextTarget,
      startTime: now,
      duration,
    };
  }


  if (Math.abs(existing.current - nextTarget) > ERA_CHILD_ANIMATION_EPSILON) {
    return existing;
  }

  return existing;
}