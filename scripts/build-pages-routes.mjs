import { copyFile, mkdir } from "node:fs/promises";

// Pages serves files, rather than rewriting requests to the client-side router.
// Give public routes real entry files so direct visits and refreshes return 200.
for (const route of ["timeline", "sets", "sets/new"]) {
  await mkdir(new URL(`../dist/${route}/`, import.meta.url), { recursive: true });
  await copyFile(new URL("../dist/index.html", import.meta.url), new URL(`../dist/${route}/index.html`, import.meta.url));
}
// Dynamic set editor URLs still need the app shell when their path has no file.
await copyFile(new URL("../dist/index.html", import.meta.url), new URL("../dist/404.html", import.meta.url));
