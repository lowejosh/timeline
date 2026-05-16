/**
 * Fetches Natural Earth 110m land GeoJSON and converts it to an SVG path
 * in the map's equirectangular coordinate space (360x180 units).
 * Run once: node scripts/generate-world-land.mjs
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MAP_WIDTH = 360;
const MAP_HEIGHT = 180;
// Simplification tolerance in map units (1 unit = 1 degree).
// 0.15 keeps fine coastal detail while removing sub-pixel noise at default zoom.
const TOLERANCE = 0.15;

const URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson";

function projectPosition([longitude, latitude]) {
  const x = ((longitude + 180) / 360) * MAP_WIDTH;
  const y = ((90 - latitude) / 180) * MAP_HEIGHT;
  return [x, y];
}

// Douglas-Peucker simplification
function perpendicularDist([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  return Math.abs(dy * px - dx * py + bx * ay - by * ax) / Math.sqrt(lenSq);
}

function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points;
  let maxDist = 0;
  let maxIdx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDist(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }
  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), tolerance);
    const right = douglasPeucker(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[points.length - 1]];
}

function ringToPath(ring) {
  const projected = ring.map(projectPosition);
  const simplified = douglasPeucker(projected, TOLERANCE);
  if (simplified.length < 3) return "";
  const [[x0, y0], ...rest] = simplified;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}` +
    rest.map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`).join("") + "Z";
}

function geometryToPath(geometry) {
  if (!geometry) return "";

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(ringToPath).filter(Boolean).join("");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .flatMap((poly) => poly.map(ringToPath).filter(Boolean))
      .join("");
  }

  return "";
}

console.log("Fetching Natural Earth 110m land GeoJSON...");
const response = await fetch(URL);

if (!response.ok) {
  console.error("Failed to fetch:", response.status, response.statusText);
  process.exit(1);
}

const geojson = await response.json();
console.log(`Processing ${geojson.features.length} features...`);

const path = geojson.features
  .map((f) => geometryToPath(f.geometry))
  .filter(Boolean)
  .join("");

const outPath = join(__dirname, "../public/world-land.path");
writeFileSync(outPath, path, "utf-8");

console.log(`Written to public/world-land.path`);
console.log(`Path length: ${(path.length / 1024).toFixed(1)} KB`);
