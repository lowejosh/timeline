import { describe, expect, it } from "vitest";
import { ERA_SOURCES } from "../eraSources";
import {
  ROOT_ERA,
  findEraById,
  getRootDisplayEras,
  getSeededEraColor,
  isEraFamilyRoot,
  type Era,
} from "../eras";
import { yearsAgo } from "../timelineDateBuilders";

function walkEraTree(
  era: Era,
  visit: (era: Era, parent?: Era) => void,
  parent?: Era,
) {
  visit(era, parent);
  for (const child of era.children ?? []) {
    walkEraTree(child, visit, era);
  }
}

describe("era data", () => {
  it("keeps children within their parent range and sibling eras non-overlapping within each family branch", () => {
    walkEraTree(ROOT_ERA, (era, parent) => {
      if (parent) {
        expect(era.startYear).toBeGreaterThanOrEqual(parent.startYear);
        expect(era.endYear).toBeLessThanOrEqual(parent.endYear);
      }

      if (!era.children || era.children.length === 0) {
        return;
      }

      if (era.id === ROOT_ERA.id) {
        expect(era.children.every((child) => isEraFamilyRoot(child))).toBe(true);
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

      const hasLinkedSource = (era.sourceRefs ?? []).some((reference) => {
        const source = ERA_SOURCES[reference.sourceId];

        return "url" in source && Boolean(source.url);
      });

      expect(hasLinkedSource).toBe(true);
    });
  });

  it("includes a sourced prehistory path down to the Neolithic", () => {
    const neolithic = findEraById(ROOT_ERA, "neolithic");
    const ppnb = neolithic?.children?.find(
      (era) => era.id === "pre-pottery-neolithic-b",
    );

    const paleolithic = findEraById(ROOT_ERA, "paleolithic");

    expect(paleolithic?.sourceRefs?.length).toBeGreaterThan(0);
    expect(neolithic?.name).toBe("Neolithic");
    expect(ppnb?.name).toBe("Pre-Pottery Neolithic B");
  });

  it("flags near eastern archaeological phases as regional and approximate without changing hierarchy", () => {
    const epipaleolithic = findEraById(ROOT_ERA, "epipaleolithic");
    const neolithic = findEraById(ROOT_ERA, "neolithic");
    const bronzeAge = findEraById(ROOT_ERA, "bronze-age");
    const lateIronAge = findEraById(ROOT_ERA, "iron-age")
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
    const paleolithic = findEraById(ROOT_ERA, "paleolithic");
    const cambrian = findEraById(ROOT_ERA, "cambrian");

    expect(paleolithic?.color).toBe(getSeededEraColor("paleolithic"));
    expect(cambrian?.color).toBe("rgb(127, 160, 86)");
    expect(cambrian?.color).not.toBe(getSeededEraColor("cambrian"));
  });

  it("breaks geological systems into ICS series children", () => {
    const cambrian = findEraById(ROOT_ERA, "cambrian");
    const silurian = findEraById(ROOT_ERA, "silurian");
    const carboniferous = findEraById(ROOT_ERA, "carboniferous");
    const quaternary = findEraById(ROOT_ERA, "quaternary");

    expect(cambrian?.children?.map((era) => era.id)).toEqual([
      "terreneuvian",
      "cambrian-series-2",
      "miaolingian",
      "furongian",
    ]);
    expect(cambrian?.children?.[0]?.color).toBe("rgb(140, 176, 108)");

    expect(silurian?.children?.map((era) => era.id)).toEqual([
      "llandovery",
      "wenlock",
      "ludlow",
      "pridoli",
    ]);

    expect(carboniferous?.children?.map((era) => era.id)).toEqual([
      "lower-mississippian",
      "middle-mississippian",
      "upper-mississippian",
      "lower-pennsylvanian",
      "middle-pennsylvanian",
      "upper-pennsylvanian",
    ]);

    expect(quaternary?.children?.map((era) => era.id)).toEqual([
      "pleistocene",
      "holocene",
    ]);
    expect(quaternary?.children?.[0]?.endYear).toBe(yearsAgo(11_700));
    expect(quaternary?.children?.[1]?.endYear).toBe(yearsAgo(0));
  });

  it("keeps era families directly under the root timeline", () => {
    const rootChildIds = ROOT_ERA.children?.map((era) => era.id) ?? [];

    expect(rootChildIds).toEqual([
      "cosmic-history",
      "geological-history",
      "human-history",
    ]);
  });

  it("keeps geological eras directly under the geological family root", () => {
    const geologicalFamily = findEraById(ROOT_ERA, "geological-history");
    const hadean = findEraById(ROOT_ERA, "hadean");
    const archean = findEraById(ROOT_ERA, "archean");
    const geologicalChildIds = geologicalFamily?.children?.map((era) => era.id) ?? [];
    const quaternary = findEraById(ROOT_ERA, "quaternary");

    expect(hadean?.children).toBeUndefined();
    expect(archean?.children).toBeUndefined();
    expect(geologicalChildIds).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(geologicalChildIds).not.toContain("proterozoic");
    expect(geologicalChildIds).not.toContain("paleozoic");
    expect(geologicalChildIds).not.toContain("mesozoic");
    expect(geologicalChildIds).not.toContain("cenozoic");
    expect(findEraById(ROOT_ERA, "jurassic")?.name).toBe("Jurassic");
    expect(findEraById(ROOT_ERA, "cambrian")?.name).toBe("Cambrian");
    expect(quaternary?.endYear).toBe(yearsAgo(0));
  });

  it("keeps cosmic phases directly under the cosmic family root", () => {
    const cosmicChildIds =
      findEraById(ROOT_ERA, "cosmic-history")?.children?.map((era) => era.id) ?? [];

    expect(cosmicChildIds).toEqual([
      "planck-epoch",
      "grand-unification-epoch",
      "inflationary-epoch",
      "electroweak-epoch",
      "quark-epoch",
      "hadron-epoch",
      "lepton-epoch",
      "big-bang-nucleosynthesis",
      "photon-epoch",
      "recombination",
      "dark-ages",
      "first-stars-and-reionization",
      "galaxy-assembly",
      "dark-energy-acceleration",
    ]);
  });

  it("keeps prehistoric and historical eras directly under the human-history family root", () => {
    const humanHistory = findEraById(ROOT_ERA, "human-history");
    const humanHistoryChildIds = humanHistory?.children?.map((era) => era.id) ?? [];
    const bronzeAge = findEraById(ROOT_ERA, "bronze-age");
    const ironAge = findEraById(ROOT_ERA, "iron-age");
    const contemporary = findEraById(ROOT_ERA, "contemporary-history");

    expect(humanHistoryChildIds).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(humanHistoryChildIds).not.toContain("human-history");
    expect(humanHistoryChildIds).not.toContain("prehistory");
    expect(humanHistoryChildIds).not.toContain("ancient-history");
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
    expect(contemporary?.children?.map((era) => era.id)).toEqual([
      "postwar-order",
      "cold-war-and-decolonization",
      "digital-age",
    ]);
  });

  it("keeps a flattened root display chronology for the top-level stage", () => {
    const rootDisplayIds = getRootDisplayEras(ROOT_ERA).map((era) => era.id);

    expect(rootDisplayIds).toEqual(
      expect.arrayContaining([
        "planck-epoch",
        "recombination",
        "dark-energy-acceleration",
        "hadean",
        "quaternary",
        "paleolithic",
        "contemporary-history",
      ]),
    );
  });

  it("assigns higher priority to human-history eras than overlapping geological eras", () => {
    const quaternary = findEraById(ROOT_ERA, "quaternary");
    const paleolithic = findEraById(ROOT_ERA, "paleolithic");
    const holocene = findEraById(ROOT_ERA, "holocene");

    expect(quaternary?.familyId).toBe("geological");
    expect(holocene?.familyId).toBe("geological");
    expect(paleolithic?.familyId).toBe("human-history");
    expect((paleolithic?.priority ?? 0) > (quaternary?.priority ?? 0)).toBe(true);
  });

  it("keeps overlapping geological eras above late cosmic eras", () => {
    const darkEnergyAcceleration = findEraById(
      ROOT_ERA,
      "dark-energy-acceleration",
    );
    const quaternary = findEraById(ROOT_ERA, "quaternary");
    const holocene = findEraById(ROOT_ERA, "holocene");

    expect(darkEnergyAcceleration?.familyId).toBe("cosmic");
    expect(quaternary?.familyId).toBe("geological");
    expect(holocene?.familyId).toBe("geological");
    expect((quaternary?.priority ?? 0) > (darkEnergyAcceleration?.priority ?? 0)).toBe(true);
    expect((holocene?.priority ?? 0) > (darkEnergyAcceleration?.priority ?? 0)).toBe(true);
  });
});
