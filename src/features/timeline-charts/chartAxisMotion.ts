type Domain = [number, number];
type AxisState = {
  domain: Domain;
  target: Domain;
  from: Domain | null;
  startedAt: number;
  lastMovedAt: number;
  viewportKey: string;
};

export const CHART_AXIS_SETTLE_MS = 180;
export const CHART_AXIS_EASE_MS = 350;
const equal = (a: Domain, b: Domain) => a[0] === b[0] && a[1] === b[1];

/** Independent Y scales freeze during navigation, then ease after it settles. */
export class ChartAxisMotion {
  private axes = new Map<string, AxisState>();

  retain(ids: readonly string[]) {
    for (const id of this.axes.keys()) if (!ids.includes(id)) this.axes.delete(id);
  }

  getDomain(id: string) { return this.axes.get(id)?.domain; }

  update(id: string, target: Domain, viewportKey: string, moving: boolean, now: number, reducedMotion = false) {
    let axis = this.axes.get(id);
    if (!axis) {
      axis = { domain: target, target, from: null, startedAt: now, lastMovedAt: -Infinity, viewportKey };
      this.axes.set(id, axis);
      return { domain: axis.domain, needsFrame: false };
    }
    if (moving || axis.viewportKey !== viewportKey) {
      axis.viewportKey = viewportKey;
      axis.lastMovedAt = now;
      axis.from = null;
      axis.target = target;
      return { domain: axis.domain, needsFrame: true };
    }
    if (now - axis.lastMovedAt < CHART_AXIS_SETTLE_MS) return { domain: axis.domain, needsFrame: true };
    if (!equal(axis.target, target)) {
      axis.target = target;
      axis.from = null;
    }
    if (equal(axis.domain, target)) return { domain: axis.domain, needsFrame: false };
    if (reducedMotion) {
      axis.domain = target;
      axis.from = null;
      return { domain: axis.domain, needsFrame: false };
    }
    if (!axis.from) {
      axis.from = axis.domain;
      axis.startedAt = now;
    }
    const t = Math.min(1, Math.max(0, (now - axis.startedAt) / CHART_AXIS_EASE_MS));
    const ease = t * t * (3 - 2 * t);
    axis.domain = t === 1 ? target : [
      axis.from[0] + (target[0] - axis.from[0]) * ease,
      axis.from[1] + (target[1] - axis.from[1]) * ease,
    ];
    if (t === 1) axis.from = null;
    return { domain: axis.domain, needsFrame: t < 1 };
  }
}
