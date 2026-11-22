// Server-only: copies Daftra invoices / estimates into daftra_invoices and logs each run.
import { daftraGet } from "./daftra.server";
import { daftraHead, daftraItems, toIsoDate, type SalesKind } from "./model";

const PATH = { invoice: "invoices", quote: "estimates" } as const;
type Raw = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

export function toInvoiceRow(kind: SalesKind, data: Raw) {
  const h = daftraHead(kind, data);
  const name =
    s(h["client_business_name"]) ||
    [s(h["client_first_name"]), s(h["client_last_name"])].filter(Boolean).join(" ");
  const sub = n(h["summary_subtotal"]);
  const total = n(h["summary_total"]);
  const id = s(h["id"]);
  return {
    id: kind === "invoice" ? id : `quote-${id}`,
    kind,
    doc_number: s(h["no"]) || id,
    client_id: s(h["client_id"]) || null,
    client_name: name || null,
    client_phone: s(h["client_phone2"]) || s(h["client_phone1"]) || null,
    issue_date: toIsoDate(h["date"]) || null,
    due_date: toIsoDate(h["due_date"]) || null,
    subtotal: sub === null ? null : sub - (n(h["summary_discount"]) ?? 0),
    tax_total: total !== null && sub !== null ? total - sub + (n(h["summary_discount"]) ?? 0) : null,
    final_total: total,
    paid_amount: n(h["summary_paid"]),
    currency: s(h["currency_code"]) || "EGP",
    status: s(h["draft"]) === "1" ? "draft" : "issued",
    payment_status: s(h["payment_status"]) || null,
    items_json: daftraItems(kind, data) as unknown as never,
    raw_data: data as unknown as never,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Fetches one document from Daftra and stores it. */
export async function syncOne(kind: SalesKind, id: string) {
  const body = await daftraGet(`/${PATH[kind]}/${id}.json`);
  const row = toInvoiceRow(kind, (body["data"] ?? {}) as Raw);
  const db = await admin();
  const { error } = await db.from("daftra_invoices").upsert(row);
  if (error) throw new Error(error.message);
}

/** Syncs the newest `pages` × 20 documents of each kind; returns counts and logs the run. */
export async function syncRecent(source: string, pages = 1) {
  let processed = 0;
  let failed = 0;
  let lastError: string | null = null;
  for (const kind of ["invoice", "quote"] as const) {
    for (let page = 1; page <= pages; page++) {
      const body = await daftraGet(`/${PATH[kind]}.json`, { page, limit: 20 });
      const rows = Array.isArray(body["data"]) ? (body["data"] as Raw[]) : [];
      for (const r of rows) {
        const id = s(daftraHead(kind, r)["id"]);
        if (!/^\d+$/.test(id)) continue;
        try {
          await syncOne(kind, id);
          processed++;
        } catch (e) {
          failed++;
          lastError = e instanceof Error ? e.message : String(e);
        }
      }
      if (rows.length < 20) break;
    }
  }
  await logRun(source, processed, failed, lastError);
  return { processed, failed };
}

export async function logRun(source: string, processed: number, failed: number, error: string | null) {
  const db = await admin();
  await db.from("daftra_sync_logs").insert({ source, processed, failed, error });
}
