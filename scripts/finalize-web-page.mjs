import { readFile, writeFile } from "node:fs/promises";

const webPagePath = new URL("../dist/web/index.html", import.meta.url);
const original = await readFile(webPagePath, "utf8");
const updated = original
  .replace(
    "email lautaro@lautarogartner.com",
    'email <a href="mailto:lautaro@lautarogartner.com">lautaro@lautarogartner.com</a>'
  )
  .replace(
    "professional profile on LinkedIn.",
    'professional profile on <a href="https://www.linkedin.com/in/lautarogartner" rel="me">LinkedIn</a>.'
  );

if (updated === original || !updated.includes('href="mailto:lautaro@lautarogartner.com"')) {
  throw new Error("Expected web-page contact copy was not found");
}

await writeFile(webPagePath, updated);
console.log("[web] linked contact email and LinkedIn profile");
