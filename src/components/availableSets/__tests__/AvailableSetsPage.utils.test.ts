import { describe, expect, it } from "vitest";
import { computeSetTimeRanges } from "../AvailableSetsPage.utils";
import { PHYSICS_SET_ID } from "../../../lib/catalog/sets/physics";

describe("AvailableSetsPage time ranges", () => {
  it("uses era coverage for the history of physics set", () => {
    expect(computeSetTimeRanges([PHYSICS_SET_ID]).get(PHYSICS_SET_ID)).toBe(
      "2,000 BCE → 2,024 CE",
    );
  });
});
