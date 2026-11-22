import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  daftraHead,
  daftraItems,
  normalizeDaftraDoc,
  normalizeDaftraListRow,
  normalizeDaftraProduct,
  type ProductInfo,
  type SalesDoc,
  type SalesListRow,
} from "./model";

export type DaftraFailure = { ok: false; code: string; message: string };

const kindSchema = z.enum(["invoice", "quote"]);
const PATH = { invoice: "invoices", quote: "estimates" } as const;

async function ensureStaff(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
  return data === true;
}

function failure(e: unknown): DaftraFailure {
  if (e && typeof e === "object" && "code" in e && "message" in e) {
    return {
      ok: false,
      code: String((e as { code: unknown }).code),
      message: String((e as { message: unknown }).message),
    };
  }
  console.error(e);
  return { ok: false, code: "upstream", message: "Daftra request failed." };
}

const listSchema = z.object({
  kind: kindSchema,
  page: z.number().int().min(1).max(10000).default(1),
  q: z.string().trim().max(100).default(""),
});

/** Staff-only: one page (20) of Daftra invoices or estimates, newest first. */
export const listSalesDocs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof listSchema>) => listSchema.parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<
      { ok: true; rows: SalesListRow[]; page: number; pageCount: number } | DaftraFailure
    > => {
      if (!(await ensureStaff(context)))
        return { ok: false, code: "forbidden", message: "Staff only." };
      try {
        const { daftraGet } = await import("./daftra.server");
        const query: Record<string, string | number> = { page: data.page, limit: 20 };
        if (data.q) query["keywords"] = data.q;
        const body = await daftraGet(`/${PATH[data.kind]}.json`, query);
        const rows = Array.isArray(body["data"]) ? (body["data"] as Record<string, unknown>[]) : [];
        const pg = (body["pagination"] ?? {}) as Record<string, unknown>;
        return {
          ok: true,
          rows: rows.map((r) => normalizeDaftraListRow(data.kind, r)),
          page: Number(pg["page"] ?? data.page) || data.page,
          pageCount: Number(pg["page_count"] ?? 1) || 1,
        };
      } catch (e) {
        return failure(e);
      }
    },
  );

const getSchema = z.object({ kind: kindSchema, id: z.string().regex(/^\d{1,12}$/) });

/** Staff-only: a single Daftra invoice / estimate with line items, product codes and photos. */
export const getSalesDoc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof getSchema>) => getSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true; doc: SalesDoc } | DaftraFailure> => {
    if (!(await ensureStaff(context)))
      return { ok: false, code: "forbidden", message: "Staff only." };
    try {
      const { daftraGet } = await import("./daftra.server");
      const body = await daftraGet(`/${PATH[data.kind]}/${data.id}.json`);
      const raw = (body["data"] ?? {}) as Record<string, unknown>;
      const head = daftraHead(data.kind, raw);
      const items = daftraItems(data.kind, raw);
      const productIds = [
        ...new Set(
          items
            .map((i) => String(i["product_id"] ?? ""))
            .filter((id) => /^\d+$/.test(id) && id !== "0"),
        ),
      ].slice(0, 80);

      // Representative name from the staff record (the document only holds its id).
      let representative = "";
      const staffId = String(head["staff_id"] ?? "");
      if (/^\d+$/.test(staffId) && staffId !== "0") {
        try {
          const s = await daftraGet(`/staff/${staffId}.json`);
          const staff = ((s["data"] as Record<string, unknown> | undefined)?.["Staff"] ??
            {}) as Record<string, unknown>;
          representative = String(staff["full_name"] ?? staff["name"] ?? "").trim();
        } catch {
          // Optional on the print.
        }
      }

      // Product photos live on the product record; Daftra is rate limited, so a few at a time.
      const products: Record<string, ProductInfo> = {};
      for (let i = 0; i < productIds.length; i += 4) {
        await Promise.all(
          productIds.slice(i, i + 4).map(async (pid) => {
            try {
              const p = await daftraGet(`/products/${pid}.json`);
              products[pid] = normalizeDaftraProduct((p["data"] ?? {}) as Record<string, unknown>);
            } catch {
              // A missing product only loses its photo.
            }
          }),
        );
      }
      return { ok: true, doc: normalizeDaftraDoc(data.kind, raw, products, representative) };
    } catch (e) {
      return failure(e);
    }
  });

/** Staff-only: whether Daftra is connected and reachable, with the account name. */
export const daftraStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true; business: string } | DaftraFailure> => {
    if (!(await ensureStaff(context)))
      return { ok: false, code: "forbidden", message: "Staff only." };
    try {
      const { daftraGet, daftraConfigured } = await import("./daftra.server");
      if (!daftraConfigured())
        return { ok: false, code: "not_configured", message: "Daftra is not connected yet." };
      const body = await daftraGet("/site_info.json");
      const site = ((body["data"] as Record<string, unknown> | undefined)?.["Site"] ??
        {}) as Record<string, unknown>;
      return { ok: true, business: String(site["business_name"] ?? site["subdomain"] ?? "Daftra") };
    } catch (e) {
      return failure(e);
    }
  });

export type SyncStatus = {
  ok: true;
  lastRunAt: string | null;
  lastSource: string | null;
  lastError: string | null;
  storedCount: number;
};

/** Staff-only: last sync run and how many documents are stored. */
export const daftraSyncStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncStatus | DaftraFailure> => {
    if (!(await ensureStaff(context)))
      return { ok: false, code: "forbidden", message: "Staff only." };
    const [{ data: log }, { count }] = await Promise.all([
      context.supabase
        .from("daftra_sync_logs")
        .select("created_at,source,error")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      context.supabase.from("daftra_invoices").select("id", { count: "exact", head: true }),
    ]);
    return {
      ok: true,
      lastRunAt: log?.created_at ?? null,
      lastSource: log?.source ?? null,
      lastError: log?.error ?? null,
      storedCount: count ?? 0,
    };
  });

/** Staff-only: pull the newest invoices and quotations from Daftra into the database now. */
export const syncDaftraNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({ context }): Promise<{ ok: true; processed: number; failed: number } | DaftraFailure> => {
      if (!(await ensureStaff(context)))
        return { ok: false, code: "forbidden", message: "Staff only." };
      try {
        const { syncRecent } = await import("./sync.server");
        const r = await syncRecent("manual", 3);
        return { ok: true, ...r };
      } catch (e) {
        return failure(e);
      }
    },
  );
