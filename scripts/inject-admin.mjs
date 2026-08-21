import fs from "node:fs";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const tag = '    <script defer src="/admin-edit.js"></script>\n';

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(item) : entry.name.endsWith(".html") ? [item] : [];
  });
}

fs.copyFileSync(path.join(process.cwd(), "public", "admin-edit.js"), path.join(dist, "admin-edit.js"));
let count = 0;
for (const file of htmlFiles(dist)) {
  if (file.includes(`${path.sep}admin${path.sep}`)) continue;
  const html = fs.readFileSync(file, "utf8");
  if (html.includes("/admin-edit.js")) continue;
  fs.writeFileSync(file, html.replace("</body>", `${tag}  </body>`));
  count += 1;
}
console.log(`[admin] added contextual editing to ${count} generated pages`);
