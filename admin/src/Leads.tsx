import { useEffect, useState } from "react";

type Lead = {
  id: string; name: string; business?: string; email: string; phone: string;
  received: number; priority?: string; tag: string; details: [string, string][];
};
type Page = { leads: Lead[]; next: number | null; tags: string[] };
type Request = <T>(url: string, options?: RequestInit) => Promise<T>;

export function Leads({ request }: { request: Request }) {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState<Page>({ leads: [], tags: [], next: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const busy = loading || Boolean(saving);

  function listUrl(before?: number) {
    const query = new URLSearchParams();
    if (filter) query.set("tag", filter);
    if (before) query.set("before", String(before));
    return "/api/leads?" + query.toString();
  }
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    request<Page>(listUrl()).then(result => { if (active) setPage(result); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter, refresh, request]);

  async function more() {
    if (!page.next) return;
    setLoading(true); setError("");
    try {
      const result = await request<Page>(listUrl(page.next));
      setPage(old => ({ ...result, leads: [...old.leads, ...result.leads] }));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load more leads."); }
    finally { setLoading(false); }
  }

  async function tagLead(lead: Lead, tag: string) {
    setSaving(lead.id); setError("");
    try {
      await request("/api/leads", { method: "PATCH", body: JSON.stringify({ id: lead.id, tag, previous: lead.tag }) });
      setPage(old => ({ ...old, leads: old.leads.map(item => item.id === lead.id ? { ...item, tag } : item)
        .filter(item => !filter || item.tag === filter) }));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save tag."); }
    finally { setSaving(""); }
  }

  return <>
    <div className="lead-tools"><label>Filter by tag <select value={filter} disabled={busy} onChange={event => {
      setFilter(event.target.value); setPage(old => ({ ...old, leads: [], next: null }));
    }}><option value="">All leads</option>{page.tags.map(tag => <option key={tag}>{tag}</option>)}</select></label>
    <button disabled={busy} onClick={() => setRefresh(value => value + 1)}>Refresh</button></div>
    {error && <p role="alert" className="error">{error}</p>}
    {loading && <p role="status">Loading leads…</p>}
    {!busy && !error && !page.leads.length && <p>{filter ? "No leads with this tag." : "New assessment requests will appear here."}</p>}
    <ul className="lead-list">{page.leads.map(lead => <li key={lead.id}>
      <div><time dateTime={new Date(lead.received * 1000).toISOString()}>{new Date(lead.received * 1000).toLocaleString()}</time>
      <h2>{lead.business || lead.name}</h2>{lead.business && <p>{lead.name}</p>}
      <p className="lead-contact"><a href={"mailto:" + lead.email}>{lead.email}</a>{lead.phone && <a href={"tel:" + lead.phone}>{lead.phone}</a>}</p>
      {lead.priority && <p>Suggested call priority · <strong>{lead.priority}</strong></p>}
      <details><summary>Form answers</summary><dl>{lead.details.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></details></div>
      <label>Qualification tag <select value={lead.tag} disabled={busy} onChange={event => tagLead(lead, event.target.value)}>
      {page.tags.map(tag => <option key={tag}>{tag}</option>)}</select></label>
    </li>)}</ul>
    {page.next && <button disabled={busy} onClick={more}>Load more leads</button>}
  </>;
}
