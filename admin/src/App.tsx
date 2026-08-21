import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, EyeSlash, FileText, Gear, Info, Plus, SignOut } from "@phosphor-icons/react";

type Status = "draft" | "published";
type ContentKind = "post" | "page";
type View = "posts" | "pages" | "settings";
type ContentItem = {
  kind: ContentKind;
  slug: string;
  path?: string;
  title: string;
  description: string;
  publishedAt?: string;
  topics?: string[];
  body: string;
  tokenSummary: string;
  status?: Status;
  nav?: boolean;
  sha?: string;
};
type SiteSettings = {
  title: string;
  description: string;
  url: string;
  author: string;
  authorUrl: string;
  followLabel: string;
  sourceUrl: string;
  sha?: string;
};

let csrfToken = "";
const today = () => new Date().toISOString().slice(0, 10);
const emptyPost = (): ContentItem => ({ kind: "post", slug: "", title: "Untitled post", description: "", publishedAt: today(), topics: [], body: "", tokenSummary: "", status: "draft" });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[’'\"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const editorTarget = () => { const params = new URLSearchParams(window.location.search); return { kind: params.get("type"), slug: params.get("slug") }; };
const isLocal = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const publicUrl = (path: string) => isLocal ? `http://127.0.0.1:3000${path}` : path;
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const method = options?.method || "GET";
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(method !== "GET" && csrfToken ? { "X-CSRF-Token": csrfToken } : {}), ...options?.headers } });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Something went wrong");
  return response.json();
}

async function requestPreview(item: ContentItem, settings: SiteSettings): Promise<string> {
  const response = await fetch("/api/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: JSON.stringify({ item, settings }),
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Preview failed");
  return response.text();
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await request("/api/login", { method: "POST", body: JSON.stringify({ password }) }); onLogin(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to sign in"); }
    finally { setBusy(false); }
  }
  const local = isLocal;
  const oauthError = new URLSearchParams(window.location.search).get("error");
  return <div className="login-shell"><main className="login-panel">
      {local ? <form onSubmit={submit}><input className="visually-hidden" tabIndex={-1} autoComplete="username" value="site-owner" readOnly aria-hidden="true" /><span className="password-control"><input aria-label="Password" placeholder="Password" autoFocus autoComplete="current-password" type={visible ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(value => !value)}>{visible ? <EyeSlash size={17} /> : <Eye size={17} />}</button></span>{error && <p className="error">{error}</p>}<button className="primary" disabled={busy}>{busy ? "Signing in…" : "Enter"}</button></form>
      : <><a className="github-login" href="/api/auth-start">Continue with GitHub</a>{oauthError && <p className="error">Access failed.</p>}</>}
    </main>
  </div>;
}

function SiteHeader({ settings, editor = false, onSignOut }: { settings: SiteSettings | null; editor?: boolean; onSignOut?: () => void }) {
  return <header className="site-header"><a href={publicUrl("/")} className="brand">{settings?.author || "Lautaro Gärtner"}</a><nav aria-label={editor ? "Editor" : "Site"}>{editor && <span>Private editor</span>}<a href={publicUrl("/about")}>About</a><a href={settings?.authorUrl || "https://x.com/lautarogartner_"}>{settings?.followLabel || "Follow"}</a>{onSignOut && <button onClick={onSignOut}><SignOut size={15} />Sign out</button>}</nav></header>;
}

function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  return <footer className="site-footer"><span>{settings?.author || "Lautaro Gärtner"} <a href={settings?.authorUrl || "https://x.com/lautarogartner_"}>{settings?.followLabel || "Follow"}</a></span><span>Private publishing room</span></footer>;
}

function PublicPreview({ html, onBack }: { html: string; onBack: () => void }) {
  return <div className="preview-wrap"><div className="preview-bar"><button onClick={onBack}><ArrowLeft size={16} />Back to editor</button><span>Rendered by the public Paideia template</span></div><iframe title="Public page preview" srcDoc={html} /></div>;
}

export function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [pages, setPages] = useState<ContentItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [view, setView] = useState<View>("posts");
  const [query, setQuery] = useState("");
  const [topics, setTopics] = useState("");
  const [notice, setNotice] = useState("All changes saved");
  const [busy, setBusy] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  async function load() {
    try {
      const session = await request<{ authenticated: boolean; csrf?: string }>("/api/session");
      if (!session.authenticated || !session.csrf) throw new Error("Sign in required");
      csrfToken = session.csrf;
      const [content, site] = await Promise.all([request<{ posts: ContentItem[]; pages: ContentItem[] }>("/api/posts"), request<{ settings: SiteSettings }>("/api/settings")]);
      const target = editorTarget(); const all = [...content.pages, ...content.posts]; const initial = all.find(item => item.kind === target.kind && item.slug === target.slug) || content.posts[0] || content.pages[0] || emptyPost();
      setAuthenticated(true); setPosts(content.posts); setPages(content.pages); setSettings(site.settings); setSelected(initial); setView(initial.kind === "page" ? "pages" : "posts");
    } catch { setAuthenticated(false); }
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { setTopics(selected?.topics?.join(", ") || ""); }, [selected?.kind, selected?.slug]);

  const filtered = useMemo(() => posts.filter(post => `${post.title} ${post.description}`.toLowerCase().includes(query.toLowerCase())), [posts, query]);
  function choose(item: ContentItem) { setSelected(item); setView(item.kind === "page" ? "pages" : "posts"); setPreviewHtml(null); setNotice("All changes saved"); }
  function update<K extends keyof ContentItem>(key: K, value: ContentItem[K]) { setSelected(item => item ? { ...item, [key]: value } : item); setNotice("Unsaved changes"); }
  async function save(status?: Status) {
    if (!selected) return;
    const item = { ...selected, ...(selected.kind === "post" ? { status: status || selected.status, topics: topics.split(",").map(value => value.trim()).filter(Boolean), slug: selected.slug || slugify(selected.title), tokenSummary: selected.tokenSummary || selected.description } : {}) };
    setBusy(true); setNotice(item.kind === "page" ? "Saving About…" : status === "published" ? "Publishing…" : "Saving draft…");
    try { const data = await request<{ post: ContentItem }>("/api/posts", { method: "PUT", body: JSON.stringify({ post: item }) }); setSelected(data.post); if (data.post.kind === "page") setPages(old => old.map(page => page.slug === data.post.slug ? data.post : page)); else setPosts(old => [data.post, ...old.filter(post => post.slug !== data.post.slug)].sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))); setNotice(isLocal ? `${data.post.kind === "page" ? "About" : status === "published" ? "Post" : "Draft"} saved locally` : data.post.kind === "page" ? "About saved — deployment started" : status === "published" ? "Published — deployment started" : "Draft saved"); }
    catch (caught) { setNotice(caught instanceof Error ? caught.message : "Save failed"); }
    finally { setBusy(false); }
  }
  async function saveSettings() {
    if (!settings) return; setBusy(true); setNotice("Saving settings…");
    try { const data = await request<{ settings: SiteSettings }>("/api/settings", { method: "PUT", body: JSON.stringify({ settings }) }); setSettings(data.settings); setNotice(isLocal ? "Settings saved locally" : "Settings saved — deployment started"); }
    catch (caught) { setNotice(caught instanceof Error ? caught.message : "Save failed"); }
    finally { setBusy(false); }
  }
  async function openPreview() {
    if (!selected || !settings) return;
    setBusy(true); setNotice("Rendering public preview…");
    try {
      const item = selected.kind === "post"
        ? { ...selected, topics: topics.split(",").map(value => value.trim()).filter(Boolean) }
        : selected;
      setPreviewHtml(await requestPreview(item, settings));
      setNotice("Public preview ready");
    } catch (caught) { setNotice(caught instanceof Error ? caught.message : "Preview failed"); }
    finally { setBusy(false); }
  }
  async function signOut() { await request("/api/logout", { method: "POST" }); csrfToken = ""; setAuthenticated(false); }
  if (authenticated === null) return <div className="loading">Opening your site…</div>;
  if (!authenticated) return <Login onLogin={load} />;
  if (!selected || !settings) return null;
  if (previewHtml) return <PublicPreview html={previewHtml} onBack={() => setPreviewHtml(null)} />;

  return <div className="admin-shell"><SiteHeader settings={settings} editor onSignOut={signOut} />
    <div className="editor-nav"><button className={view === "posts" ? "active" : ""} onClick={() => { setView("posts"); if (selected.kind !== "post") setSelected(posts[0] || emptyPost()); }}><FileText size={16} />Posts</button><button className={view === "pages" ? "active" : ""} onClick={() => { setView("pages"); if (selected.kind !== "page" && pages[0]) setSelected(pages[0]); }}><Info size={16} />Pages</button><button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}><Gear size={16} />Settings</button><span className={notice.includes("failed") ? "notice error" : "notice"}><Check size={14} />{notice}</span></div>
    {view === "posts" && <div className="editor-grid"><aside className="content-index"><div className="index-heading"><strong>Writing</strong><button onClick={() => choose(emptyPost())}><Plus size={15} />New</button></div><input aria-label="Search posts" placeholder="Search writing…" value={query} onChange={event => setQuery(event.target.value)} />{filtered.map(post => <button key={post.slug || post.title} className={post.slug === selected.slug ? "active" : ""} onClick={() => choose(post)}><time>{post.publishedAt}</time><strong>{post.title}</strong><small>{post.status}</small></button>)}</aside><Editor item={selected} topics={topics} busy={busy} onTopics={value => { setTopics(value); setNotice("Unsaved changes"); }} onUpdate={update} onSave={save} onPreview={openPreview} /></div>}
    {view === "pages" && <div className="editor-grid"><aside className="content-index"><div className="index-heading"><strong>Pages</strong></div>{pages.map(page => <button key={page.slug} className={page.slug === selected.slug ? "active" : ""} onClick={() => choose(page)}><strong>{page.title}</strong><small>{page.path}</small></button>)}</aside><Editor item={selected} topics={topics} busy={busy} onTopics={setTopics} onUpdate={update} onSave={save} onPreview={openPreview} /></div>}
    {view === "settings" && <SettingsEditor settings={settings} busy={busy} onChange={patch => { setSettings(current => current ? { ...current, ...patch } : current); setNotice("Unsaved changes"); }} onSave={saveSettings} />}
    <SiteFooter settings={settings} />
  </div>;
}

function Editor({ item, topics, busy, onTopics, onUpdate, onSave, onPreview }: { item: ContentItem; topics: string; busy: boolean; onTopics: (value: string) => void; onUpdate: <K extends keyof ContentItem>(key: K, value: ContentItem[K]) => void; onSave: (status?: Status) => void; onPreview: () => void }) {
  const page = item.kind === "page";
  return <main className="editor"><div className="editor-heading"><div><p className="eyebrow">{page ? "Page" : item.status}</p><h1>{page ? "Edit page" : "Edit post"}</h1></div><div className="editor-actions"><button disabled={busy} onClick={onPreview}>{busy ? "Rendering…" : "Preview"}</button>{page ? <button className="primary" disabled={busy} onClick={() => onSave()}>Save page</button> : <><button disabled={busy} onClick={() => onSave("draft")}>Save draft</button><button className="primary" disabled={busy} onClick={() => onSave("published")}>Publish</button></>}</div></div>
    <div className="fields"><label><span>Title</span><input className="title-input" value={item.title} onChange={event => { onUpdate("title", event.target.value); if (!item.sha && !page) onUpdate("slug", slugify(event.target.value)); }} /></label>{!page && <label><span>Slug</span><input value={item.slug} onChange={event => onUpdate("slug", slugify(event.target.value))} /></label>}<label><span>Description</span><textarea rows={2} value={item.description} onChange={event => onUpdate("description", event.target.value)} /></label>{!page && <div className="field-pair"><label><span>Topics</span><input value={topics} onChange={event => onTopics(event.target.value)} /></label><label><span>Date</span><input type="date" value={item.publishedAt} onChange={event => onUpdate("publishedAt", event.target.value)} /></label></div>}<label className="body-label"><span>Markdown</span><textarea value={item.body} onChange={event => onUpdate("body", event.target.value)} /></label><div className="word-count">{item.body.trim().split(/\s+/).filter(Boolean).length} words · {item.body.length.toLocaleString()} characters</div></div>
  </main>;
}

function SettingsEditor({ settings, busy, onChange, onSave }: { settings: SiteSettings; busy: boolean; onChange: (patch: Partial<SiteSettings>) => void; onSave: () => void }) {
  return <main className="settings-editor"><div className="editor-heading"><div><p className="eyebrow">Public identity</p><h1>Settings</h1></div><button className="primary" disabled={busy} onClick={onSave}>Save settings</button></div><p className="settings-intro">These values feed the public header, metadata, navigation, and footer on the next build.</p><div className="fields"><label><span>Site title</span><input value={settings.title} onChange={event => onChange({ title: event.target.value })} /></label><label><span>Description</span><textarea rows={2} value={settings.description} onChange={event => onChange({ description: event.target.value })} /></label><div className="field-pair"><label><span>Author</span><input value={settings.author} onChange={event => onChange({ author: event.target.value })} /></label><label><span>Follow label</span><input value={settings.followLabel} onChange={event => onChange({ followLabel: event.target.value })} /></label></div><label><span>Social URL</span><input type="url" value={settings.authorUrl} onChange={event => onChange({ authorUrl: event.target.value })} /></label><label><span>Site URL</span><input type="url" value={settings.url} onChange={event => onChange({ url: event.target.value })} /></label><label><span>Source URL</span><input type="url" value={settings.sourceUrl} onChange={event => onChange({ sourceUrl: event.target.value })} /></label></div></main>;
}
