import fs from "node:fs/promises";
import path from "node:path";

const owner = () => process.env.GITHUB_OWNER || "LautaroGartner";
const repo = () => process.env.GITHUB_REPO || "lautarogartner.com";
const branch = () => process.env.GITHUB_BRANCH || "main";
const token = () => process.env.GITHUB_TOKEN;
const api = (pathname) => `https://api.github.com/repos/${owner()}/${repo()}/contents/${pathname}`;
const headers = () => ({ Accept: "application/vnd.github+json", Authorization: `Bearer ${token()}`, "X-GitHub-Api-Version": "2022-11-28" });

async function github(pathname, options) {
  const response = await fetch(`${api(pathname)}${options?.method === "PUT" ? "" : `?ref=${branch()}`}`, { ...options, headers: { ...headers(), ...options?.headers } });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${(await response.json().catch(() => null))?.message || "request failed"}`);
  return response.json();
}

async function listDirectory(kind) {
  const directory = kind === "page" ? "pages" : "posts";
  if (!token()) {
    const dir = path.join(process.cwd(), "content", directory);
    const names = (await fs.readdir(dir)).filter(name => name.endsWith(".json"));
    return Promise.all(names.map(async name => ({ ...JSON.parse(await fs.readFile(path.join(dir, name), "utf8")), kind })));
  }
  const files = await github(`content/${directory}`);
  return Promise.all(files.filter(file => file.name.endsWith(".json")).map(async file => {
    const data = await github(file.path);
    return { ...JSON.parse(Buffer.from(data.content, "base64").toString("utf8")), kind, sha: data.sha };
  }));
}

export async function listContent() {
  const [posts, pages] = await Promise.all([listDirectory("post"), listDirectory("page")]);
  return { posts, pages };
}

export async function writeContent(post) {
  const directory = post.kind === "page" ? "pages" : "posts";
  const pathname = `content/${directory}/${post.slug}.json`;
  const { sha, ...content } = post;
  if (!token()) {
    await fs.writeFile(path.join(process.cwd(), pathname), `${JSON.stringify(content, null, 2)}\n`);
    return { ...content, sha: "local" };
  }
  const payload = {
    message: `${post.kind === "page" ? "Update page" : post.status === "published" ? "Publish" : "Save draft"}: ${post.title}`,
    content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString("base64"),
    branch: branch(),
    ...(sha ? { sha } : {}),
  };
  const data = await github(pathname, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return { ...content, sha: data.content.sha };
}

export async function readSiteSettings() {
  if (!token()) return { ...JSON.parse(await fs.readFile(path.join(process.cwd(), "content", "site.json"), "utf8")), sha: "local" };
  const data = await github("content/site.json");
  return { ...JSON.parse(Buffer.from(data.content, "base64").toString("utf8")), sha: data.sha };
}

export async function writeSiteSettings(settings) {
  const { sha, ...content } = settings;
  const pathname = "content/site.json";
  if (!token()) {
    await fs.writeFile(path.join(process.cwd(), pathname), `${JSON.stringify(content, null, 2)}\n`);
    return { ...content, sha: "local" };
  }
  const payload = {
    message: "Update site settings",
    content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString("base64"),
    branch: branch(),
    ...(sha ? { sha } : {}),
  };
  const data = await github(pathname, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return { ...content, sha: data.content.sha };
}
