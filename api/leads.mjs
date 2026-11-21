import { requireAuth } from "../server/auth.mjs";
import { applicationStore } from "../server/application-store.mjs";
import { budgets, challenges, decisions, investments, roles, stages, timelines } from "../site/acquisition-assessment.mjs";
import { revenueBands } from "../site/application-options.mjs";

const tags = ["Unreviewed", "Qualified", "Follow up", "Not a fit"];
let store;

function lead(row) {
  const record = JSON.parse(row.record);
  const answers = record.qualification || {};
  return {
    id: row.id, received: Number(row.received), tag: row.tag,
    name: record.name, email: record.email, phone: record.phone,
    business: record.business, priority: answers.priority,
    details: Object.entries({
      Challenge: challenges[answers.challenge], Budget: budgets[answers.budget] || investments[answers.investment],
      Timing: timelines[answers.timing], Role: roles[answers.role], Approval: decisions[answers.decision],
      Stage: stages[answers.stage], "Annual revenue": revenueBands[record.revenue], Goal: answers.goal,
      "Call requested": typeof record.planCall === "boolean" ? (record.planCall ? "Yes" : "No") : undefined
    }).filter(([, value]) => value)
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (!requireAuth(req, res, { csrf: req.method !== "GET" })) return;
  try {
    if (req.method === "GET") {
      const { tag, before } = req.query || {};
      if ((tag !== undefined && !tags.includes(tag)) || (before !== undefined && !/^[1-9]\d{0,14}$/.test(before)))
        return res.status(400).json({ error: "Invalid filter or page." });
      store ??= applicationStore(process.env);
      const rows = await store.listLeads(tag, before);
      const page = rows.slice(0, 25);
      return res.status(200).json({ tags, leads: page.map(lead), next: rows.length > 25 ? Number(page.at(-1).cursor) : null });
    }
    if (req.method === "PATCH") {
      const { id, tag, previous } = req.body || {};
      if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id) || !tags.includes(tag) || !tags.includes(previous))
        return res.status(400).json({ error: "Choose a valid lead and tag." });
      store ??= applicationStore(process.env);
      if (!await store.setLeadTag(id, tag, previous))
        return res.status(409).json({ error: "This lead changed. Refresh the list before tagging it again." });
      return res.status(200).json({ tag });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch {
    return res.status(503).json({ error: "The lead database is unavailable. Try again shortly." });
  }
}
