export type GuideImage = {
  id: string; src: string; title: string; date: string; caption: string; source: string; credit: string;
};
const base = `${import.meta.env.BASE_URL}guide-media/`;
export const GUIDE_IMAGES: Record<string, GuideImage> = {
  jug: { id: "jug", src: `${base}phoenician-jug.jpg`, title: "Inscribed terracotta jug", date: "7th century BCE",
    caption: "Five Phoenician letters on the shoulder may record a name. Their meaning remains unresolved. This later example shows the script in use on an everyday object.",
    source: "https://www.metmuseum.org/art/collection/search/240970", credit: "The Met, 74.51.1401. Public domain." },
  ivory: { id: "ivory", src: `${base}ivory-plaque.jpg`, title: "Ivory furniture plaque from Nimrud", date: "9th-8th century BCE",
    caption: "Egyptian-style figures flank a tree. Found in Assyria, the plaque is carved in a Phoenician style. Luxury ivories reached Assyrian palaces through several channels, including tribute and plunder.",
    source: "https://www.metmuseum.org/art/collection/search/325564", credit: "The Met, 62.269.3. Public domain." },
  seal: { id: "seal", src: `${base}scarab-seal.jpg`, title: "Scarab seal and modern impression", date: "6th-5th century BCE",
    caption: "Winged deities flank Osiris on this jasper seal. Phoenician engravers adapted Egyptian imagery; the impression makes the small carved design easier to read.",
    source: "https://www.metmuseum.org/art/collection/search/323744", credit: "The Met, 41.160.162. Public domain." },
};
export function getChapterImages(id: string): GuideImage[] {
  const ids: Record<string, string[]> = {
    alphabet: ["jug"], workshops: ["ivory", "seal"], tribute: ["ivory"],
    "western-routes": ["jug", "seal"], "western-power": ["seal"],
    "persian-rule": ["seal"], "persian-fleet": ["seal"], "hellenistic-cities": ["seal", "jug"],
    "roman-coast": ["jug", "ivory", "seal"],
  };
  return (ids[id] ?? []).map(key => GUIDE_IMAGES[key]);
}
