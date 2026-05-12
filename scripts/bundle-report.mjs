import { brotliCompressSync, gzipSync } from "node:zlib";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST_DIR = "dist";
const ASSETS_DIR = join(DIST_DIR, "assets");
const INDEX_HTML = join(DIST_DIR, "index.html");

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function getAssetRefs(indexHtml, pattern) {
  return [...indexHtml.matchAll(pattern)].map((match) =>
    match[1].replace(/^\/timeline\//, ""),
  );
}

function measureFile(path) {
  const content = readFileSync(path);

  return {
    path,
    raw: content.byteLength,
    gzip: gzipSync(content).byteLength,
    brotli: brotliCompressSync(content).byteLength,
  };
}

function printSection(label, rows) {
  if (rows.length === 0) {
    return;
  }

  console.log(`\n${label}`);
  console.log("file".padEnd(48), "raw".padStart(10), "gzip".padStart(10), "br".padStart(10));

  for (const row of rows) {
    console.log(
      relative(DIST_DIR, row.path).padEnd(48),
      formatKb(row.raw).padStart(10),
      formatKb(row.gzip).padStart(10),
      formatKb(row.brotli).padStart(10),
    );
  }
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + row[key], 0);
}

function enforceBudget(name, actualBytes, envName) {
  const budgetKb = Number(process.env[envName]);

  if (!Number.isFinite(budgetKb) || budgetKb <= 0) {
    return;
  }

  const budgetBytes = budgetKb * 1024;

  if (actualBytes > budgetBytes) {
    console.error(
      `\n${name} budget exceeded: ${formatKb(actualBytes)} > ${formatKb(budgetBytes)} (${envName})`,
    );
    process.exitCode = 1;
  }
}

if (!existsSync(INDEX_HTML) || !existsSync(ASSETS_DIR)) {
  console.error("No dist build found. Run `npm run build` first.");
  process.exit(1);
}

const indexHtml = readText(INDEX_HTML);
const entryScripts = getAssetRefs(
  indexHtml,
  /<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/g,
);
const preloadedScripts = getAssetRefs(
  indexHtml,
  /<link\b[^>]*\brel="modulepreload"[^>]*\bhref="([^"]+\.js)"[^>]*>/g,
);
const entryStyles = getAssetRefs(
  indexHtml,
  /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+\.css)"[^>]*>/g,
);
const referencedAssets = new Set([
  ...entryScripts,
  ...preloadedScripts,
  ...entryStyles,
]);
const allAssets = readdirSync(ASSETS_DIR)
  .map((file) => join(ASSETS_DIR, file))
  .filter((path) => statSync(path).isFile())
  .sort();
const rowsByRelativePath = new Map(
  allAssets.map((assetPath) => [relative(DIST_DIR, assetPath), measureFile(assetPath)]),
);
const pickRows = (refs) =>
  refs.map((ref) => rowsByRelativePath.get(ref)).filter(Boolean);
const entryScriptRows = pickRows(entryScripts);
const preloadRows = pickRows(preloadedScripts);
const styleRows = pickRows(entryStyles);
const asyncRows = [...rowsByRelativePath.entries()]
  .filter(([assetPath]) => !referencedAssets.has(assetPath))
  .map(([, row]) => row);
const initialRows = [...entryScriptRows, ...preloadRows, ...styleRows];
const totalRows = [...rowsByRelativePath.values()];
const totals = {
  initialRaw: sum(initialRows, "raw"),
  initialGzip: sum(initialRows, "gzip"),
  initialBrotli: sum(initialRows, "brotli"),
  totalRaw: sum(totalRows, "raw"),
  totalGzip: sum(totalRows, "gzip"),
  totalBrotli: sum(totalRows, "brotli"),
};

console.log("Bundle report");
console.log(`initial raw:    ${formatKb(totals.initialRaw)}`);
console.log(`initial gzip:   ${formatKb(totals.initialGzip)}`);
console.log(`initial brotli: ${formatKb(totals.initialBrotli)}`);
console.log(`total raw:      ${formatKb(totals.totalRaw)}`);
console.log(`total gzip:     ${formatKb(totals.totalGzip)}`);
console.log(`total brotli:   ${formatKb(totals.totalBrotli)}`);

printSection("Initial scripts", entryScriptRows);
printSection("Initial preloads", preloadRows);
printSection("Initial styles", styleRows);
printSection("Async chunks", asyncRows);

enforceBudget("Initial gzip", totals.initialGzip, "BUNDLE_INITIAL_GZIP_BUDGET_KB");
enforceBudget("Total gzip", totals.totalGzip, "BUNDLE_TOTAL_GZIP_BUDGET_KB");
