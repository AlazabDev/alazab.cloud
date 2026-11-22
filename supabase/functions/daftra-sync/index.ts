
import { createClient } from "npm:@supabase/supabase-js@2";

type JsonObject = Record<string, unknown>;

type InvoiceRow = {
  id: string;
  doc_number: string;
  client_name: string | null;
  client_phone: string | null;
  issue_date: string | null;
  subtotal: number | null;
  tax_total: number | null;
  final_total: number | null;
  paid_amount: number | null;
  currency: string;
  status: string | null;
  items_json: unknown;
  raw_data: JsonObject;
  updated_at: string;
};

class RequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RequestError";
  }
}

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function respond(
  data: JsonObject,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}

function isObject(value: unknown): value is JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function first(
  object: JsonObject,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    const value = object[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "boolean"
  ) {
    return null;
  }

  const result = String(value).trim();
  return result || null;
}

function asAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const amount =
    typeof value === "number"
      ? value
      : Number(value.trim());

  return Number.isFinite(amount) ? amount : null;
}

function asDate(value: unknown): string | null {
  const text = asText(value);

  if (!text) return null;

  // Preserve the calendar date without timezone conversion.
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(text);

  if (!match) {
    throw new RequestError(400, "Invalid invoice date");
  }

  const date = match[1];
  const parsed = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new RequestError(400, "Invalid invoice date");
  }

  return date;
}

function unwrapInvoice(payload: unknown): JsonObject {
  if (!isObject(payload)) {
    throw new RequestError(400, "Expected a JSON object");
  }

  const data = isObject(payload.data)
    ? payload.data
    : payload;

  const candidate =
    data.invoice ?? data.Invoice ?? data;

  if (!isObject(candidate)) {
    throw new RequestError(400, "Invalid invoice object");
  }

  return candidate;
}

function normalizeInvoice(invoice: JsonObject): InvoiceRow {
  const id = asText(first(invoice, "id", "invoice_id"));

  if (!id) {
    throw new RequestError(400, "Invoice ID is required");
  }

  const client = isObject(invoice.Client)
    ? invoice.Client
    : isObject(invoice.client)
      ? invoice.client
      : {};

  const itemSource = first(
    invoice,
    "InvoiceItem",
    "invoice_items",
    "items",
  );

  if (
    itemSource !== null &&
    !Array.isArray(itemSource)
  ) {
    throw new RequestError(400, "Invoice items must be an array");
  }

  const items = itemSource ?? [];

  const docNumber =
    asText(first(invoice, "number", "invoice_number")) ?? id;

  const clientName =
    asText(first(
      invoice,
      "client_business_name",
      "client_name",
    )) ??
    asText(first(
      client,
      "business_name",
      "name",
      "full_name",
    ));

  const clientPhone =
    asText(first(
      invoice,
      "client_phone",
      "phone",
    )) ??
    asText(first(
      client,
      "phone",
      "mobile",
    ));

  return {
    id,
    doc_number: docNumber,
    client_name: clientName,
    client_phone: clientPhone,

    issue_date: asDate(
      first(invoice, "date", "issue_date"),
    ),

    subtotal: asAmount(
      first(
        invoice,
        "summary_subtotal",
        "sub_total",
        "subtotal",
      ),
    ),

    tax_total: asAmount(
      first(
        invoice,
        "summary_tax",
        "tax_total",
        "tax",
      ),
    ),

    final_total: asAmount(
      first(
        invoice,
        "summary_total",
        "final_total",
        "total",
      ),
    ),

    paid_amount: asAmount(
      first(
        invoice,
        "paid_amount",
        "paid",
      ),
    ),

    currency:
      asText(first(
        invoice,
        "currency_code",
        "currency",
      )) ?? "EGP",

    status: asText(first(invoice, "status")),

    items_json: items,
    raw_data: invoice,
    updated_at: new Date().toISOString(),
  };
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function validSecret(
  supplied: string | null,
  expected: string,
): Promise<boolean> {
  if (!supplied) return false;

  const encoder = new TextEncoder();
  const digest = async (value: string): Promise<Uint8Array> => {
    const hash = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(value),
    );
    return new Uint8Array(hash);
  };

  const [actualHash, expectedHash] = await Promise.all([
    digest(supplied),
    digest(expected),
  ]);

  let difference = 0;

  for (let i = 0; i < expectedHash.length; i++) {
    difference |= actualHash[i] ^ expectedHash[i];
  }

  return difference === 0;
}

export async function handleDaftraSync(
  req: Request,
): Promise<Response> {
  if (req.method === "GET") {
    return respond({
      service: "daftra-sync",
      status: "ok",
    });
  }

  if (req.method !== "POST") {
    return respond(
      { error: "Method not allowed" },
      405,
    );
  }

  try {
    const syncSecret = requiredEnv("DAFTRA_SYNC_SECRET");

    const customHeader = req.headers.get("x-daftra-secret");
    const authorization = req.headers.get("authorization");

    const bearerToken =
      authorization?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;

    const suppliedSecret = customHeader ?? bearerToken;

    if (!(await validSecret(suppliedSecret, syncSecret))) {
      return respond({ error: "Unauthorized" }, 401);
    }

    const contentType =
      req.headers.get("content-type")?.toLowerCase() ?? "";

    if (!contentType.includes("application/json")) {
      return respond(
        { error: "Content-Type must be application/json" },
        415,
      );
    }

    // Reject oversized bodies before parsing.
    const bodyText = await req.text();

    if (new TextEncoder().encode(bodyText).length > 1_000_000) {
      return respond({ error: "Payload too large" }, 413);
    }

    let payload: unknown;

    try {
      payload = JSON.parse(bodyText);
    } catch {
      return respond({ error: "Invalid JSON" }, 400);
    }

    const invoice = unwrapInvoice(payload);
    const row = normalizeInvoice(invoice);

    const supabaseUrl = requiredEnv("SUPABASE_URL");

    const serviceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
    let adminKey = serviceKey;

    if (!adminKey && secretKeys) {
      const parsed: unknown = JSON.parse(secretKeys);

      if (isObject(parsed)) {
        adminKey = asText(parsed.default) ?? undefined;
      }
    }

    if (!adminKey) {
      throw new Error("Missing Supabase admin key");
    }

    const supabase = createClient(supabaseUrl, adminKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase
      .from("daftra_invoices")
      .upsert(row, {
        onConflict: "id",
      });

    if (error) {
      console.error("Daftra invoice upsert failed", {
        invoiceId: row.id,
        code: error.code,
        message: error.message,
      });

      return respond(
        {
          success: false,
          error: "Database synchronization failed",
        },
        500,
      );
    }

    console.info("Daftra invoice synchronized", {
      invoiceId: row.id,
      docNumber: row.doc_number,
    });

    return respond({
      success: true,
      source: "daftra",
      action: "upsert",
      invoice_id: row.id,
      doc_number: row.doc_number,
      synchronized_at: row.updated_at,
    });
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      return respond({ error: error.message }, error.status);
    }

    console.error(
      "Daftra sync error",
      error instanceof Error ? error.message : "Unknown error",
    );

    return respond(
      {
        success: false,
        error: "Internal synchronization error",
      },
      500,
    );
  }
}

Deno.serve(handleDaftraSync);
