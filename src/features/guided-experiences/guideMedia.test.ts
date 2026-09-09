import { expect, it } from "vitest";
import { GUIDE_IMAGES, getChapterImages } from "./guideMedia";
import { PHOENICIA_EXPERIENCE } from "./experiences";

it("ships credited images and only attaches known media to chapters", () => {
  for (const image of Object.values(GUIDE_IMAGES)) {
    expect(image.src).toMatch(/guide-media\/[^/]+\.jpg$/);
    expect(image.source).toMatch(/^https:\/\/www.metmuseum.org\//);
    expect(image.credit).toContain("Public domain");
  }
  expect(getChapterImages("alphabet")[0].id).toBe("jug");
  expect(getChapterImages("tribute")[0].id).toBe("ivory");
});

it("contains no damaged punctuation in guide copy", () => {
  for (const stop of PHOENICIA_EXPERIENCE.stops) {
    for (const text of [stop.title, stop.description, stop.region, stop.dateLabel, ...stop.sources.map(source => source.title)]) {
      expect(text).not.toMatch(/[?\uFFFD]/);
    }
  }
});
