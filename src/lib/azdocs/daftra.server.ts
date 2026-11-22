// Server-only Daftra client. Calls go through the Lovable connector gateway, which
// adds the alazab-co Daftra API key; the app only holds the gateway credentials.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/udc_daftra";

export class DaftraError extends Error {
  constructor(
    public code: "not_configured" | "unauthorized" | "not_found" | "rate_limited" | "upstream",
    message: string,
  ) {
    super(message);
  }
}

export function daftraConfigured(): boolean {
  return Boolean(process.env["LOVABLE_API_KEY"] && process.env["UDC_DAFTRA_API_KEY"]);
}

/** GET a Daftra api2 endpoint such as `/invoices.json`. */
export async function daftraGet(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<Record<string, unknown>> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["UDC_DAFTRA_API_KEY"];
  if (!lovableKey || !connectionKey) {
    throw new DaftraError("not_configured", "Daftra is not connected yet.");
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  const url = `${GATEWAY_URL}${path}${params.size ? `?${params}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connectionKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Daftra request failed [${res.status}] ${path}: ${body.slice(0, 500)}`);
    if (res.status === 401 || res.status === 403)
      throw new DaftraError("unauthorized", `Daftra refused the request [${res.status}].`);
    if (res.status === 404) throw new DaftraError("not_found", "Document not found in Daftra.");
    if (res.status === 429)
      throw new DaftraError("rate_limited", "Daftra rate limit reached, try again in a minute.");
    throw new DaftraError("upstream", `Daftra error [${res.status}].`);
  }

  const body = (await res.json()) as Record<string, unknown>;
  if (body["result"] === "failed") {
    console.error(`Daftra reported failure ${path}: ${JSON.stringify(body).slice(0, 500)}`);
    if (Number(body["code"]) === 404)
      throw new DaftraError("not_found", "Document not found in Daftra.");
    throw new DaftraError("upstream", String(body["message"] ?? "Daftra request failed."));
  }
  return body;
}
