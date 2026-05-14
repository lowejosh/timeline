import type {
  TimelineSidebarChildState,
  TimelineSidebarSetState,
} from "./sidebarModel";
import type { TimelineSetId } from "@/lib/core/timelineTypes";

export type TimelineLayerShortcutTarget =
  | {
      id: string;
      kind: "set";
      key: string;
      normalizedKey: string;
      label: string;
      setId: TimelineSetId;
    }
  | {
      id: string;
      kind: "child";
      key: string;
      normalizedKey: string;
      label: string;
      parentSetId: TimelineSetId;
      groupIds: string[];
    };

const LAYER_SHORTCUT_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "G",
  "I",
  "J",
  "M",
  "N",
  "P",
  "Q",
  "R",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
];

export function getSetLayerShortcutId(setId: TimelineSetId) {
  return `set:${setId}`;
}

export function getChildLayerShortcutId(child: TimelineSidebarChildState) {
  return `group:${child.groupIds.join("+")}`;
}

export function getPrimaryShortcutModifierLabel() {
  if (typeof navigator === "undefined") {
    return "Ctrl";
  }

  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "Cmd" : "Ctrl";
}

export function isPrimaryShortcutModifier(event: KeyboardEvent) {
  return event.metaKey || event.ctrlKey;
}

export function allocateTimelineLayerShortcuts(
  sets: readonly TimelineSidebarSetState[],
): TimelineLayerShortcutTarget[] {
  const shortcuts: TimelineLayerShortcutTarget[] = [];
  let keyIndex = 0;

  const takeKey = () => {
    const key = LAYER_SHORTCUT_KEYS[keyIndex];
    keyIndex += 1;
    return key;
  };

  for (const set of sets) {
    const key = takeKey();

    if (!key) {
      break;
    }

    shortcuts.push({
      id: getSetLayerShortcutId(set.id),
      kind: "set",
      key,
      normalizedKey: key.toLowerCase(),
      label: set.label,
      setId: set.id,
    });

    for (const child of set.children) {
      const childKey = takeKey();

      if (!childKey) {
        return shortcuts;
      }

      shortcuts.push({
        id: getChildLayerShortcutId(child),
        kind: "child",
        key: childKey,
        normalizedKey: childKey.toLowerCase(),
        label: child.label,
        parentSetId: set.id,
        groupIds: child.groupIds,
      });
    }
  }

  return shortcuts;
}
