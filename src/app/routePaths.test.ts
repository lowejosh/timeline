import { describe, expect, it } from "vitest";
import { getRouteView } from "./routePaths";

describe("static-host directory URLs", () => {
  it("recognizes pages with the trailing slash added by a static host", () => {
    expect(getRouteView("/timeline/")).toBe("timeline");
    expect(getRouteView("/sets/")).toBe("available-sets");
    expect(getRouteView("/sets/new/")).toBe("create-set");
    expect(getRouteView("/sets/custom-set/edit/")).toBe("create-set");
  });
});
