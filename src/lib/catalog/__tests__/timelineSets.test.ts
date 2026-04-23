import { describe, expect, it } from "vitest";
import {
  getDefaultEnabledTimelineSetIds,
  getSetIdForEraFamily,
  resolveDecorationSetId,
} from "../timelineSets";
import { PHYSICS_MILESTONES_GROUP_ID, PHYSICS_SET_ID } from "../sets/physics";

describe("timeline set registry", () => {
  it("keeps the history of physics set disabled by default", () => {
    expect(getDefaultEnabledTimelineSetIds().has(PHYSICS_SET_ID)).toBe(false);
  });

  it("assigns physics decorations to the physics set via group ownership", () => {
    expect(
      resolveDecorationSetId({
        id: "physics-planck-quanta",
        groupId: PHYSICS_MILESTONES_GROUP_ID,
      }),
    ).toBe(PHYSICS_SET_ID);
  });

  it("assigns the physics era family to the physics set", () => {
    expect(getSetIdForEraFamily("physics-history")).toBe(PHYSICS_SET_ID);
  });
});
