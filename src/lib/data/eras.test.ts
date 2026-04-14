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

  it("uses seeded default colors consistently", () => {
    const humanHistory = ROOT_ERA.children?.find((era) => era.id === "human-history");
    const cenozoic = ROOT_ERA.children?.find((era) => era.id === "cenozoic");

    expect(humanHistory?.color).toBe(getSeededEraColor("human-history"));
    expect(cenozoic?.color).toBe(getSeededEraColor("cenozoic"));
  });

  it("keeps geological eras directly under the root timeline", () => {
    const rootChildIds = ROOT_ERA.children?.map((era) => era.id) ?? [];

    expect(rootChildIds).not.toContain("earth-life-prehistory");
    expect(rootChildIds).toContain("hadean");
    expect(rootChildIds).toContain("cenozoic");
  });

  it("uses system-level geological subdivisions where the ICS chart provides them", () => {
    const hadean = ROOT_ERA.children?.find((era) => era.id === "hadean");
    const proterozoic = ROOT_ERA.children?.find((era) => era.id === "proterozoic");
    const paleozoic = ROOT_ERA.children?.find((era) => era.id === "paleozoic");
    const mesozoic = ROOT_ERA.children?.find((era) => era.id === "mesozoic");
    const cenozoic = ROOT_ERA.children?.find((era) => era.id === "cenozoic");

    expect(hadean?.children).toBeUndefined();
    expect(proterozoic?.children?.map((era) => era.id)).toEqual([
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
    ]);
    expect(paleozoic?.children?.map((era) => era.id)).toEqual([
      "cambrian",
      "ordovician",
      "silurian",
      "devonian",
      "carboniferous",
      "permian",
    ]);
    expect(mesozoic?.children?.map((era) => era.id)).toEqual([
      "triassic",
      "jurassic",
      "cretaceous",
    ]);
    expect(cenozoic?.children?.map((era) => era.id)).toEqual([
      "paleogene",
      "neogene",
      "quaternary",
    ]);
    expect(mesozoic?.children?.find((era) => era.id === "jurassic")?.name).toBe(
      "Jurassic",
    );
    expect(paleozoic?.children?.find((era) => era.id === "cambrian")?.name).toBe(
      "Cambrian",
    );
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
  });
});