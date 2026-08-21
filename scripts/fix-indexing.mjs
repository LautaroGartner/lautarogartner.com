import { readFile, writeFile } from "node:fs/promises";

const notFoundPath = new URL("../dist/404.html", import.meta.url);
const original = await readFile(notFoundPath, "utf8");
const updated = original
  .replace(
    '<meta name="robots" content="index,follow">',
    '<meta name="robots" content="noindex,follow">'
  )
  .replace(/\n\s*<link rel="canonical" href="[^"]+">/, "")
  .replace(/\n\s*<meta property="og:url" content="[^"]+">/, "");

if (updated === original) {
  throw new Error("Expected 404 indexing metadata was not found");
}

await writeFile(notFoundPath, updated);
console.log("[indexing] marked the 404 page noindex and removed its canonical URL");
