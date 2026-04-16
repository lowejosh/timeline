import { describe, expect, it } from "vitest";
import { ERA_SOURCES } from "./eraSources";
import { ROOT_ERA, getSeededEraColor, type Era } from "./eras";

function walkEraTree(era: Era, visit: (era: Era, parent?: Era) => void, parent?: Era) {
  visit(era, parent);
  for (const child of era.children ?? []) {
    walkEraTree(child, visit, era);
  }
}

describe("era data", () => {
  it("keeps children within their parent range and sibling eras non-overlapping", () => {
    walkEraTree(ROOT_ERA, (era, parent) => {
      if (parent) {
        expect(era.startYear).toBeGreaterThanOrEqual(parent.startYear);
        expect(era.endYear).toBeLessThanOrEqual(parent.endYear);
      }

      if (!era.children || era.children.length === 0) {
        return;
      }

      const orderedChildren = [...era.children].sort(
        (left, right) => left.startYear - right.startYear,
      );

      expect(era.children.map((child) => child.id)).toEqual(
        orderedChildren.map((child) => child.id),
      );

      for (let index = 1; index < orderedChildren.length; index += 1) {
        const previous = orderedChildren[index - 1];
        const current = orderedChildren[index];

        expect(previous.endYear).toBeLessThanOrEqual(current.startYear);
      }
    });
  });

  it("only references known sources", () => {
    walkEraTree(ROOT_ERA, (era) => {
      for (const reference of era.sourceRefs ?? []) {
        expect(ERA_SOURCES[reference.sourceId]).toBeDefined();
      }
    });
  });

  it("gives every described era at least one clickable source", () => {
    walkEraTree(ROOT_ERA, (era) => {
      if (!era.description) {
        return;
      }

      const hasLinkedSource = (era.sourceRefs ?? []).some(
        (reference) => {
          const source = ERA_SOURCES[reference.sourceId];

          return "url" in source && Boolean(source.url);
        },
      );

      expect(hasLinkedSource).toBe(true);
    });
  });

  it("includes a sourced prehistory path down to the Neolithic", () => {
    const humanHistory = ROOT_ERA.children?.find((era) => era.id === "human-history");
    const neolithic = humanHistory?.children?.find((era) => era.id === "neolithic");
    const ppnb = neolithic?.children?.find(
      (era) => era.id === "pre-pottery-neolithic-b",
    );

    expect(humanHistory?.sourceRefs?.length).toBeGreaterThan(0);
    expect(neolithic?.name).toBe("Neolithic");
    expect(ppnb?.name).toBe("Pre-Pottery Neolithic B");
  });

  it("flags near eastern archaeological phases as regional and approximate without changing hierarchy", () => {
    const humanHistory = ROOT_ERA.children?.find((era) => era.id === "human-history");
    const epipaleolithic = humanHistory?.children?.find(
      (era) => era.id === "epipaleolithic",
    );
    const neolithic = humanHistory?.children?.find((era) => era.id === "neolithic");
    const bronzeAge = humanHistory?.children?.find((era) => era.id === "bronze-age");
    const lateIronAge = humanHistory?.children
      ?.find((era) => era.id === "iron-age")
      ?.children?.find((era) => era.id === "late-iron-age");

    expect(epipaleolithic?.regionalScopeLabel).toBe("Ancient Near East");
    expect(epipaleolithic?.approximateStart).toBe(true);
    expect(epipaleolithic?.approximateEnd).toBe(true);
    expect(neolithic?.regionalScopeLabel).toBe("Ancient Near East");
    expect(bronzeAge?.regionalScopeLabel).toBe("Ancient Near East");
    expect(bronzeAge?.approximateStart).toBe(true);
    expect(bronzeAge?.approximateEnd).toBe(true);
    expect(lateIronAge?.regionalScopeLabel).toBe("Ancient Near East");
    expect(lateIronAge?.approximateStart).toBe(true);
    expect(lateIronAge?.approximateEnd).toBeUndefined();
  });

  it("uses seeded colors by default and respects explicit geological overrides", () => {
    const humanHistory = ROOT_ERA.children?.find((era) => era.id === "human-history");
    const cambrian = ROOT_ERA.children?.find((era) => era.id === "cambrian");

    expect(humanHistory?.color).toBe(getSeededEraColor("human-history"));
    expect(cambrian?.color).toBe("rgb(127, 160, 86)");
    expect(cambrian?.color).not.toBe(getSeededEraColor("cambrian"));
  });

  it("keeps geological eras directly under the root timeline", () => {
    const rootChildIds = ROOT_ERA.children?.map((era) => era.id) ?? [];

    expect(rootChildIds).not.toContain("earth-life-prehistory");
    expect(rootChildIds).toContain("hadean");
    expect(rootChildIds).toContain("cambrian");
    expect(rootChildIds).toContain("jurassic");
    expect(rootChildIds).toContain("quaternary");
  });

  it("flattens post-archean geological subdivisions directly under the root timeline", () => {
    const hadean = ROOT_ERA.children?.find((era) => era.id === "hadean");
    const archean = ROOT_ERA.children?.find((era) => era.id === "archean");
    const rootChildIds = ROOT_ERA.children?.map((era) => era.id) ?? [];
    const quaternary = ROOT_ERA.children?.find((era) => era.id === "quaternary");

    expect(hadean?.children).toBeUndefined();
    expect(archean?.children).toBeUndefined();
    expect(rootChildIds).toEqual(expect.arrayContaining([
      "siderian",
      "rhyacian",
      "orosirian",
      "statherian",
      "calymmian",
      "ectasian",
      "stenian",
      "tonian",
      "cryogenian",
      "ediacaran",
      "cambrian",
      "ordovician",
      "silurian",
      "devonian",
      "carboniferous",
      "permian",
      "triassic",
      "jurassic",
      "cretaceous",
      "paleogene",
      "neogene",
      "quaternary",
    ]));
    expect(rootChildIds).not.toContain("proterozoic");
    expect(rootChildIds).not.toContain("paleozoic");
    expect(rootChildIds).not.toContain("mesozoic");
    expect(rootChildIds).not.toContain("cenozoic");
    expect(ROOT_ERA.children?.find((era) => era.id === "jurassic")?.name).toBe("Jurassic");
    expect(ROOT_ERA.children?.find((era) => era.id === "cambrian")?.name).toBe("Cambrian");
    expect(quaternary?.sourceRefs?.[0]?.note).toContain("human-history handoff");
  });

  it("keeps cosmic phases directly under the root timeline", () => {
    const rootChildIds = ROOT_ERA.children?.map((era) => era.id) ?? [];

    expect(rootChildIds).not.toContain("cosmic-history");
    expect(rootChildIds).toContain("primordial-universe");
    expect(rootChildIds).toContain("cosmic-dawn");
    expect(rootChildIds).toContain("galaxies-take-shape");
  });

  it("flattens prehistoric and ancient periods directly under human history", () => {
    const humanHistory = ROOT_ERA.children?.find((era) => era.id === "human-history");
    const humanChildIds = humanHistory?.children?.map((era) => era.id) ?? [];
    const bronzeAge = humanHistory?.children?.find((era) => era.id === "bronze-age");
    const ironAge = humanHistory?.children?.find((era) => era.id === "iron-age");

    expect(humanChildIds).toEqual([
      "paleolithic",
      "epipaleolithic",
      "neolithic",
      "chalcolithic",
      "bronze-age",
      "iron-age",
      "classical-antiquity",
      "post-classical-history",
      "early-modern-period",
      "age-of-industry-and-empire",
      "contemporary-history",
    ]);
    expect(humanChildIds).not.toContain("prehistory");
    expect(humanChildIds).not.toContain("ancient-history");
    expect(bronzeAge?.children?.map((era) => era.id)).toEqual([
      "early-bronze-age",
      "middle-bronze-age",
      "late-bronze-age",
    ]);
    expect(ironAge?.children?.map((era) => era.id)).toEqual([
      "early-iron-age",
      "middle-iron-age",
      "late-iron-age",
    ]);
  });
});