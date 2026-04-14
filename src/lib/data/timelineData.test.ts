import { describe, expect, it } from "vitest";
import { ERA_SOURCES } from "./eraSources";
import { ROOT_ERA, ROOT_TIMELINE, TIMELINE_DISPLAY } from "./eras";

describe("root timeline display data", () => {
  it("keeps the stitched root era as the canonical root export", () => {
    expect(ROOT_TIMELINE.rootEra).toBe(ROOT_ERA);
    expect(ROOT_TIMELINE.display).toBe(TIMELINE_DISPLAY);
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
      "gobekli-tepe-monuments",
      "agriculture-emerges-in-southwest-asia",
      "catalhoyuk-settled-farming-community",
      "jericho-ritual-community",
      "stonehenge-begins",
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

  it("includes the historical overlay bands with valid sources", () => {
    expect(TIMELINE_DISPLAY.overlays.map((band) => band.id)).toEqual([
      "cambrian-explosion",
      "age-of-dinosaurs",
      "mesopotamia",
      "indus-valley-civilization",
      "ancient-egypt",
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

    for (const band of TIMELINE_DISPLAY.overlays) {
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
  });

  it("keeps the root era child chronology stitched in the expected order", () => {
    expect(ROOT_TIMELINE.rootEra.children?.map((child) => child.id)).toEqual(
      ROOT_ERA.children?.map((child) => child.id),
    );
    expect(ROOT_TIMELINE.rootEra.children?.map((child) => child.id)).toEqual([
      "primordial-universe",
      "cosmic-dawn",
      "galaxies-take-shape",
      "hadean",
      "archean",
      "proterozoic",
      "paleozoic",
      "mesozoic",
      "cenozoic",
      "human-history",
    ]);
  });
});