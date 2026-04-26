export const REORDER_SETTLE_MS = 220;
export const REORDER_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export function moveItem<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);

  next.splice(toIndex, 0, moved);

  return next;
}

export function areOrdersEqual<T>(left: readonly T[], right: readonly T[]) {
  return (
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  );
}
