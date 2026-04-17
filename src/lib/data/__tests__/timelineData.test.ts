import { describe, expect, it } from "vitest";
import { ERA_SOURCES } from "../eraSources";
import { ROOT_ERA, ROOT_TIMELINE, TIMELINE_DISPLAY } from "../eras";
import {
  TIMELINE_DECORATION_CATEGORIES,
  TIMELINE_DECORATION_GROUPS,
} from "../timelineDecorations";
import { bce, yearsAgo } from "../timelineDateBuilders";
import type { TimelineOverlayBand } from "../timelineTypes";

function flattenOverlayBands(
  bands: TimelineOverlayBand[],
): TimelineOverlayBand[] {
  return bands.flatMap((band) => [
    band,
    ...flattenOverlayBands(band.children ?? []),
  ]);
}

describe("root timeline display data", () => {
  it("keeps the stitched root era as the canonical root export", () => {
    expect(ROOT_TIMELINE.rootEra).toBe(ROOT_ERA);
    expect(ROOT_TIMELINE.display).toBe(TIMELINE_DISPLAY);
  });

  it("keeps decoration group metadata aligned with the assembled display data", () => {
    const categoryIds = new Set(
      TIMELINE_DECORATION_CATEGORIES.map((category) => category.id),
    );
    const groupIds = new Set(
      TIMELINE_DECORATION_GROUPS.map((group) => group.id),
    );

    expect(
      TIMELINE_DECORATION_GROUPS.every((group) =>
        categoryIds.has(group.categoryId),
      ),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.markers.every(
        (marker) => !marker.groupId || groupIds.has(marker.groupId),
      ),
    ).toBe(true);

    expect(
      flattenOverlayBands(TIMELINE_DISPLAY.overlays).every(
        (band) => !band.groupId || groupIds.has(band.groupId),
      ),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.markers
        .filter((marker) => marker.year >= bce(12_000))
        .every((marker) => marker.groupId === "human-history"),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .filter((band) => band.startYear >= bce(3_500))
        .every((band) => band.groupId === "civilizations"),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.markers
        .filter((marker) =>
          [
            "great-oxidation-event",
            "first-eukaryotic-cells",
            "k-pg-asteroid-impact",
          ].includes(marker.id),
        )
        .every((marker) => marker.groupId === "deep-time-life"),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .filter((band) =>
          ["cambrian-explosion", "age-of-dinosaurs"].includes(band.id),
        )
        .every((band) => band.groupId === "deep-time-life"),
    ).toBe(true);
  });

  it("keeps core markers ordered chronologically with valid sources", () => {
    expect(TIMELINE_DISPLAY.markers.map((marker) => marker.id)).toEqual([
      "solar-system-formation",
      "earth-formation",
      "earliest-evidence-of-life",
      "great-oxidation-event",
      "first-eukaryotic-cells",
      "first-large-multicellular-life",
      "first-land-plants",
      "late-ordovician-mass-extinction",
      "late-devonian-mass-extinction",
      "first-tetrapods-step-onto-land",
      "first-reptiles-appear",
      "giant-insects-fill-carboniferous-skies",
      "end-permian-mass-extinction",
      "first-mammals-appear",
      "end-triassic-mass-extinction",
      "archaeopteryx-first-known-bird",
      "k-pg-asteroid-impact",
      "earliest-likely-bipedal-hominins-appear",
      "early-bipedal-femur-evidence-in-kenya",
      "earliest-stone-tools-associated-with-early-homo",
      "genus-homo-emerges",
      "early-humans-expand-beyond-africa",
      "acheulean-handaxes-appear",
      "hearths-and-fireplaces-appear-in-heidelbergensis-era",
      "neanderthal-and-modern-human-lineages-diverge",
      "homo-sapiens-evolves-in-africa",
      "ground-ocher-markings-appear-in-africa",
      "last-known-homo-floresiensis-survives-on-flores",
      "last-neanderthals-disappear",
      "chauvet-cave-figurative-art",
      "venus-of-dolni-vestonice",
      "gobekli-tepe-monuments",
      "agriculture-emerges-in-southwest-asia",
      "natufian-settled-hunter-gatherers-at-eynan",
      "mehrgarh-early-farming-community",
      "catalhoyuk-settled-farming-community",
      "jericho-ritual-community",
      "jiahu-bone-flutes-and-village-life",
      "irrigation-reshapes-southern-mesopotamia",
      "wheeled-transport-appears-in-sumer",
      "uruk-becomes-the-first-city",
      "cuneiform-writing-emerges",
      "stonehenge-begins",
      "great-pyramid-of-giza-completed",
      "sargon-of-akkad-builds-an-empire",
      "hammurabi-promulgates-his-laws",
      "earliest-attested-chinese-writing",
      "bronze-age-collapse",
      "alexander-dies-hellenistic-age-begins",
      "caesar-crosses-the-rubicon",
      "augustus-becomes-emperor",
      "fall-of-western-rome",
      "hijra",
      "charlemagne-crowned-emperor",
      "first-crusade-called",
      "genghis-khan-proclaimed",
      "black-death",
      "gutenberg-press",
      "fall-of-constantinople",
      "columbian-exchange-begins",
      "protestant-reformation",
      "american-independence-declared",
      "french-revolution",
      "titanic-sinks",
      "world-war-i",
      "russian-revolution",
      "world-war-ii",
      "apollo-11-moon-landing",
    ]);

    for (const marker of TIMELINE_DISPLAY.markers) {
      for (const reference of marker.sourceRefs ?? []) {
        expect(ERA_SOURCES[reference.sourceId]).toBeDefined();
      }
    }

    expect(
      TIMELINE_DISPLAY.markers.every(
        (marker, index, markers) =>
          index === 0 || markers[index - 1].year <= marker.year,
      ),
    ).toBe(true);
  });

  it("marks representative ancient markers and overlays with scope and approximation metadata", () => {
    const agriculture = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "agriculture-emerges-in-southwest-asia",
    );
    const collapse = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "bronze-age-collapse",
    );
    const cuneiform = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "cuneiform-writing-emerges",
    );
    const homoSapiens = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "homo-sapiens-evolves-in-africa",
    );
    const uruk = TIMELINE_DISPLAY.markers.find(
      (marker) => marker.id === "uruk-becomes-the-first-city",
    );
    const mesopotamia = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "mesopotamia",
    );
    const hittites = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "hittite-empire",
    );
    const akkad = mesopotamia?.children?.find(
      (band) => band.id === "akkadian-empire",
    );

    expect(agriculture).toMatchObject({
      regionalScopeLabel: "Southwest Asia",
      approximate: true,
    });
    expect(collapse).toMatchObject({
      regionalScopeLabel: "Eastern Mediterranean",
      approximate: true,
    });
    expect(cuneiform).toMatchObject({
      regionalScopeLabel: "Mesopotamia",
      approximate: true,
    });
    expect(homoSapiens).toMatchObject({
      regionalScopeLabel: "Africa",
      approximate: true,
    });
    expect(uruk).toMatchObject({
      regionalScopeLabel: "Southern Mesopotamia",
      approximate: true,
    });
    expect(mesopotamia).toMatchObject({
      regionalScopeLabel: "Mesopotamia",
      approximateStart: true,
    });
    expect(hittites).toMatchObject({
      regionalScopeLabel: "Anatolia and northern Syria",
      approximateStart: true,
      approximateEnd: true,
    });
    expect(akkad).toMatchObject({
      regionalScopeLabel: "Mesopotamia",
      approximateStart: true,
      approximateEnd: true,
    });
  });

  it("keeps deep-time crisis markers descriptive and source-backed", () => {
    const crisisMarkerIds = [
      "great-oxidation-event",
      "late-ordovician-mass-extinction",
      "late-devonian-mass-extinction",
      "end-permian-mass-extinction",
      "end-triassic-mass-extinction",
      "k-pg-asteroid-impact",
    ];

    for (const markerId of crisisMarkerIds) {
      const marker = TIMELINE_DISPLAY.markers.find(
        (timelineMarker) => timelineMarker.id === markerId,
      );

      expect(marker?.description).toBeTruthy();
      expect(marker?.sourceRefs?.length).toBeGreaterThan(0);
    }

    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "late-ordovician-mass-extinction",
      )?.description,
    ).toContain("85%");
    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "late-devonian-mass-extinction",
      )?.description,
    ).toContain("75%");
    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "end-permian-mass-extinction",
      )?.description,
    ).toContain("9 in 10");
    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "end-triassic-mass-extinction",
      )?.description,
    ).toContain("more than a third");
    expect(
      TIMELINE_DISPLAY.markers.find(
        (marker) => marker.id === "k-pg-asteroid-impact",
      )?.description,
    ).toContain("75%");
    expect(
      TIMELINE_DISPLAY.markers
        .find((marker) => marker.id === "great-oxidation-event")
        ?.sourceRefs?.some(
          (reference) => reference.sourceId === "asmGreatOxidationEvent",
        ),
    ).toBe(true);
  });

  it("includes the historical overlay bands with valid sources", () => {
    expect(TIMELINE_DISPLAY.overlays.map((band) => band.id)).toEqual([
      "cambrian-explosion",
      "age-of-dinosaurs",
      "sahelanthropus-tchadensis",
      "orrorin-tugenensis",
      "ardipithecus-kadabba",
      "ardipithecus-ramidus",
      "australopithecus-anamensis",
      "australopithecus-afarensis",
      "kenyanthropus-platyops",
      "australopithecus-africanus",
      "paranthropus-aethiopicus",
      "australopithecus-garhi",
      "homo-habilis",
      "paranthropus-boisei",
      "australopithecus-sediba",
      "homo-rudolfensis",
      "homo-erectus",
      "paranthropus-robustus",
      "homo-heidelbergensis",
      "homo-neanderthalensis",
      "homo-naledi",
      "homo-sapiens",
      "homo-floresiensis",
      "mesopotamia",
      "indus-valley-civilization",
      "ancient-egypt",
      "hittite-empire",
      "mycenaean-greece",
      "ancient-greece",
      "achaemenid-persia",
      "roman-republic",
      "hellenistic-world",
      "han-china",
      "roman-empire",
      "byzantine-empire",
      "abbasid-caliphate",
      "song-china",
      "mongol-empire",
      "ottoman-empire",
      "ming-dynasty",
      "aztec-empire",
      "inca-empire",
    ]);

    for (const band of flattenOverlayBands(TIMELINE_DISPLAY.overlays)) {
      for (const reference of band.sourceRefs ?? []) {
        expect(ERA_SOURCES[reference.sourceId]).toBeDefined();
      }
    }

    expect(
      TIMELINE_DISPLAY.overlays.every(
        (band, index, bands) =>
          index === 0 || bands[index - 1].startYear <= band.startYear,
      ),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .filter(
          (band) =>
            band.startYear <= yearsAgo(100_000) &&
            band.endYear <= yearsAgo(40_000),
        )
        .some((band) => band.id === "homo-neanderthalensis"),
    ).toBe(true);

    expect(
      TIMELINE_DISPLAY.overlays
        .find((band) => band.id === "mesopotamia")
        ?.children?.map((band) => band.id),
    ).toEqual([
      "sumerian-city-states",
      "akkadian-empire",
      "ur-iii-empire",
      "old-babylonian-empire",
      "kassite-babylonia",
      "middle-assyrian-empire",
      "neo-assyrian-empire",
      "neo-babylonian-empire",
    ]);

    const mesopotamiaChildren = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "mesopotamia",
    )?.children;

    expect(
      mesopotamiaChildren?.every(
        (band, index, bands) =>
          index === 0 || bands[index - 1].startYear <= band.startYear,
      ),
    ).toBe(true);
  });

  it("keeps deep-time overlays descriptive and source-backed", () => {
    const cambrianExplosion = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "cambrian-explosion",
    );
    const ageOfDinosaurs = TIMELINE_DISPLAY.overlays.find(
      (band) => band.id === "age-of-dinosaurs",
    );

    expect(cambrianExplosion).toMatchObject({
      description: expect.stringContaining("major animal lineages"),
    });
    expect(ageOfDinosaurs).toMatchObject({
      description: expect.stringContaining("archosaurs"),
    });
    expect(cambrianExplosion?.sourceRefs?.length).toBeGreaterThan(0);
    expect(ageOfDinosaurs?.sourceRefs?.length).toBeGreaterThan(0);
  });

  it("keeps the flattened root era child chronology stitched in the expected order", () => {
    expect(ROOT_TIMELINE.rootEra.children?.map((child) => child.id)).toEqual(
      ROOT_ERA.children?.map((child) => child.id),
    );
    expect(ROOT_TIMELINE.rootEra.children?.map((child) => child.id)).toEqual([
      "primordial-universe",
      "cosmic-dawn",
      "galaxies-take-shape",
      "hadean",
      "archean",
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
  });
});
