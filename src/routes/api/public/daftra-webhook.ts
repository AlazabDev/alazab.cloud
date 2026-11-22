import { createFileRoute } from "@tanstack/react-router";

// Daftra calls this when an invoice / estimate is created or edited:
//   https://azabart.lovable.app/api/public/daftra-webhook?token=<DAFTRA_WEBHOOK_SECRET>
// Without a document id in the payload (or for a scheduler) it re-syncs the newest documents.

function findId(v: unknown, depth = 0): string | null {
  if (!v || typeof v !== "object" || depth > 3) return null;
  const o = v as Record<string, unknown>;
  for (const k of ["id", "invoice_id", "estimate_id", "record_id"]) {
    const x = o[k];
    if ((typeof x === "string" || typeof x === "number") && /^\d{1,12}$/.test(String(x)))
      return String(x);
  }
  for (const k of ["Invoice", "Estimate", "data", "record", "payload"]) {
    const found = findId(o[k], depth + 1);
    if (found) return found;
  }
  return null;
}

function tokenOk(given: string | null, expected: string | undefined) {
  if (!expected || !given || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

async function handle(request: Request) {
  const url = new URL(request.url);
  const given = url.searchParams.get("token") ?? request.headers.get("x-webhook-token");
  if (!tokenOk(given, process.env["DAFTRA_WEBHOOK_SECRET"]))
    return new Response("Unauthorized", { status: 401 });

  let payload: unknown = null;
  if (request.method === "POST") {
    const text = (await request.text()).slice(0, 200_000);
    try {
      payload = JSON.parse(text);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(text));
    }
  }
  const sync = await import("@/lib/azdocs/sync.server");
  const text = JSON.stringify(payload ?? {}).toLowerCase();
  const kind = text.includes("estimate") || url.searchParams.get("kind") === "quote" ? "quote" : "invoice";
  const id = findId(payload) ?? url.searchParams.get("id");
  try {
    if (id && /^\d{1,12}$/.test(id)) {
      await sync.syncOne(kind, id);
      await sync.logRun("webhook", 1, 0, null);
      return Response.json({ ok: true, synced: 1 });
    }
    const r = await sync.syncRecent("webhook-recent", 1);
    return Response.json({ ok: true, synced: r.processed, failed: r.failed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sync.logRun("webhook", 0, 1, msg).catch(() => {});
    return Response.json({ ok: false }, { status: 502 });
  }
}

export const Route = createFileRoute("/api/public/daftra-webhook")({
  server: { handlers: { POST: ({ request }) => handle(request), GET: ({ request }) => handle(request) } },
});
