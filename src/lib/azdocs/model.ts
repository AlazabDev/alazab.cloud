import type { PaymentProfileId } from "./company";

export type SalesKind = "invoice" | "quote";

export interface LineItem {
  code: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Line total before tax (quantity × unit price − line discount). */
  total: number;
  imageUrl: string | null;
}

export interface SalesDoc {
  kind: SalesKind;
  /** Daftra record id (or "sample"). */
  id: string;
  /** Daftra's own number, e.g. AZ-INV-2026-0160. */
  number: string;
  date: string; // YYYY-MM-DD
  currency: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  representative: string;
  section: string;
  paymentProfile: PaymentProfileId;
  items: LineItem[];
  /** Before tax, after discount. */
  subtotal: number;
  /** Net of all taxes (VAT minus withholding). */
  tax: number;
  paid: number;
  /** Amount still due: total with tax minus paid. */
  finalTotal: number;
  /** Online link encoded in the QR code (Daftra preview), when available. */
  qrValue: string | null;
}

export const KIND_PREFIX: Record<SalesKind, string> = { invoice: "INV", quote: "QUT" };
export const KIND_TITLE: Record<SalesKind, string> = { invoice: "INVOICE", quote: "QUOTATION" };

/**
 * Code printed in the yellow tab, year and month taken from the document date:
 * - Daftra "AZ-INV-2026-0160" → "AZ-INV-2026-11-0160" (Daftra's sequence kept)
 * - plain Daftra number 25 → "AZ-INV-2026-11-10025"
 * - anything else (e.g. "draft-332") is printed as it is.
 */
export function docCode(kind: SalesKind, date: string, number: string): string {
  const [y, m] = ymOf(date);
  const n = number.trim();
  const prefix = `AZ-${KIND_PREFIX[kind]}-${y}-${m}`;
  if (!n) return `${prefix}-00000`;
  if (/^\d+$/.test(n)) return `${prefix}-${10000 + Number(n)}`;
  const az = /^AZ-[A-Z]+-\d{4}-(\d+)$/i.exec(n);
  if (az) return `${prefix}-${az[1]}`;
  return n;
}

export function ymOf(date: string): [string, string] {
  const match = /^(\d{4})-(\d{2})/.exec(date);
  if (match) return [match[1]!, match[2]!];
  const d = new Date();
  return [String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, "0")];
}

/** Daftra returns YYYY-MM-DD in lists and DD-MM-YYYY in single documents. */
export function toIsoDate(value: unknown): string {
  const s = String(value ?? "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = /^(\d{2})[-/.](\d{2})[-/.](\d{4})/.exec(s);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return "";
}

/** Rows that fit each page type of the multi-page design. */
export const PAGE_ROWS = { single: 3, first: 5, middle: 7, last: 5 } as const;

export interface PagePlan {
  start: number;
  end: number; // exclusive
  /** Empty rows to draw so the grid keeps its designed height. */
  capacity: number;
  header: boolean;
  totals: boolean;
}

/**
 * Splits line items across A4 pages: a one-page layout when they fit, otherwise
 * a first page with the header, full middle pages, and a last page with totals.
 * The last page always carries at least one item.
 */
export function paginate(count: number): PagePlan[] {
  const n = Math.max(0, Math.floor(count));
  if (n <= PAGE_ROWS.single) {
    return [{ start: 0, end: n, capacity: PAGE_ROWS.single, header: true, totals: true }];
  }
  const pages: PagePlan[] = [];
  const firstTake = Math.min(PAGE_ROWS.first, n - 1);
  pages.push({ start: 0, end: firstTake, capacity: PAGE_ROWS.first, header: true, totals: false });
  let at = firstTake;
  while (n - at > PAGE_ROWS.last) {
    const take = Math.min(PAGE_ROWS.middle, n - at - 1);
    pages.push({
      start: at,
      end: at + take,
      capacity: PAGE_ROWS.middle,
      header: false,
      totals: false,
    });
    at += take;
  }
  pages.push({ start: at, end: n, capacity: PAGE_ROWS.last, header: false, totals: true });
  return pages;
}

export function money(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrency(value: number, currency = "EGP", locale = "ar-EG"): string {
  const amount = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${money(amount)} ${currency}`;
  }
}

const ARABIC_ONES = [
  "",
  "واحد",
  "اثنان",
  "ثلاثة",
  "أربعة",
  "خمسة",
  "ستة",
  "سبعة",
  "ثمانية",
  "تسعة",
] as const;
const ARABIC_TENS = [
  "",
  "عشرة",
  "عشرون",
  "ثلاثون",
  "أربعون",
  "خمسون",
  "ستون",
  "سبعون",
  "ثمانون",
  "تسعون",
] as const;
const ARABIC_HUNDREDS = [
  "",
  "مائة",
  "مائتان",
  "ثلاثمائة",
  "أربعمائة",
  "خمسمائة",
  "ستمائة",
  "سبعمائة",
  "ثمانمائة",
  "تسعمائة",
] as const;
const ARABIC_TEENS = [
  "عشرة",
  "أحد عشر",
  "اثنا عشر",
  "ثلاثة عشر",
  "أربعة عشر",
  "خمسة عشر",
  "ستة عشر",
  "سبعة عشر",
  "ثمانية عشر",
  "تسعة عشر",
] as const;

function underThousandToArabic(value: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  if (hundreds) parts.push(ARABIC_HUNDREDS[hundreds]!);
  if (remainder >= 10 && remainder < 20) {
    parts.push(ARABIC_TEENS[remainder - 10]!);
  } else if (remainder >= 20) {
    const ones = remainder % 10;
    parts.push(
      ones
        ? `${ARABIC_ONES[ones]} و${ARABIC_TENS[Math.floor(remainder / 10)]}`
        : ARABIC_TENS[Math.floor(remainder / 10)]!,
    );
  } else if (remainder > 0) {
    parts.push(ARABIC_ONES[remainder]!);
  }
  return parts.join(" و");
}

function quantityToArabic(value: number, singular: string, dual: string, plural: string): string {
  if (value === 0) return `صفر ${singular}`;
  if (value === 1) return `${singular} واحد`;
  if (value === 2) return dual;
  if (value <= 10) return `${underThousandToArabic(value)} ${plural}`;
  return `${integerToArabic(value)} ${singular}ًا`;
}

function scaledGroupToArabic(
  value: number,
  singular: string,
  dual: string,
  plural: string,
): string {
  if (value === 1) return singular;
  if (value === 2) return dual;
  if (value <= 10) return `${underThousandToArabic(value)} ${plural}`;
  return `${underThousandToArabic(value)} ${singular}ًا`;
}

function integerToArabic(value: number): string {
  if (value === 0) return "صفر";
  const groups = [
    { divisor: 1_000_000, singular: "مليون", dual: "مليونان", plural: "ملايين" },
    { divisor: 1_000, singular: "ألف", dual: "ألفان", plural: "آلاف" },
  ];
  let remainder = value;
  const parts: string[] = [];
  for (const group of groups) {
    const count = Math.floor(remainder / group.divisor);
    if (count) parts.push(scaledGroupToArabic(count, group.singular, group.dual, group.plural));
    remainder %= group.divisor;
  }
  if (remainder) parts.push(underThousandToArabic(remainder));
  return parts.join(" و");
}

export function amountInArabicWords(value: number, currency = "EGP"): string {
  const currencies: Record<
    string,
    {
      singular: string;
      dual: string;
      plural: string;
      minor: string;
      minorDual: string;
      minorPlural: string;
    }
  > = {
    EGP: {
      singular: "جنيه",
      dual: "جنيهان",
      plural: "جنيهات",
      minor: "قرش",
      minorDual: "قرشان",
      minorPlural: "قروش",
    },
    USD: {
      singular: "دولار",
      dual: "دولاران",
      plural: "دولارات",
      minor: "سنت",
      minorDual: "سنتان",
      minorPlural: "سنتات",
    },
    SAR: {
      singular: "ريال",
      dual: "ريالان",
      plural: "ريالات",
      minor: "هللة",
      minorDual: "هللتان",
      minorPlural: "هللات",
    },
    AED: {
      singular: "درهم",
      dual: "درهمان",
      plural: "دراهم",
      minor: "فلس",
      minorDual: "فلسان",
      minorPlural: "فلوس",
    },
  };
  const unit = currencies[currency] ?? currencies["EGP"]!;
  const cents = Math.round(Math.abs(Number.isFinite(value) ? value : 0) * 100);
  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;
  const wholeWords = quantityToArabic(whole, unit.singular, unit.dual, unit.plural);
  const fractionWords = fraction
    ? quantityToArabic(fraction, unit.minor, unit.minorDual, unit.minorPlural)
    : "";
  const amountWords = fractionWords ? `${wholeWords} و${fractionWords}` : wholeWords;
  return `${value < 0 ? "سالب " : ""}${amountWords} فقط لا غير`;
}

export function qty(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("en-US", { maximumFractionDigits: 3 });
}

/* ---------- Daftra → SalesDoc ---------- */

type Raw = Record<string, unknown>;

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v)).trim();
const obj = (v: unknown): Raw =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {};
const arr = (v: unknown): Raw[] =>
  Array.isArray(v)
    ? v.map(obj)
    : v && typeof v === "object"
      ? Object.values(v as Raw).map(obj)
      : [];

export interface ProductInfo {
  code: string;
  imageUrl: string | null;
}

/** The record inside a Daftra single invoice / estimate response `data`. */
export function daftraHead(kind: SalesKind, data: Raw): Raw {
  return obj(
    data[kind === "invoice" ? "Invoice" : "Estimate"] ?? data["Invoice"] ?? data["Estimate"],
  );
}

/** Line items of a single document; Daftra nests them in the record and names them InvoiceItem for both kinds. */
export function daftraItems(kind: SalesKind, data: Raw): Raw[] {
  const head = daftraHead(kind, data);
  return arr(
    head["InvoiceItem"] ?? head["EstimateItem"] ?? data["InvoiceItem"] ?? data["EstimateItem"],
  );
}

/** Converts a Daftra single invoice / estimate response (`data`) into the template model. */
export function normalizeDaftraDoc(
  kind: SalesKind,
  data: Raw,
  products: Record<string, ProductInfo> = {},
  representative = "",
): SalesDoc {
  const head = daftraHead(kind, data);
  const client = obj(head["Client"] ?? data["Client"]);
  const items = daftraItems(kind, data);

  const lineItems: LineItem[] = items.map((it) => {
    const quantity = num(it["quantity"]);
    const unitPrice = num(it["unit_price"]);
    const embedded = obj(it["Product"]);
    const p = products[str(it["product_id"])];
    return {
      code: p?.code || str(embedded["product_code"]) || str(embedded["barcode"]),
      name: str(it["item"]),
      description: str(it["description"]),
      quantity,
      unitPrice,
      total: round2(quantity * unitPrice - num(it["calculated_discount"])),
      imageUrl: p?.imageUrl ?? null,
    };
  });

  const itemsSum = lineItems.reduce((s, i) => s + i.total, 0);
  const subtotal =
    head["summary_subtotal"] !== undefined && head["summary_subtotal"] !== null
      ? num(head["summary_subtotal"]) - num(head["summary_discount"])
      : itemsSum;
  const grand =
    head["summary_total"] !== undefined && head["summary_total"] !== null
      ? num(head["summary_total"])
      : subtotal;
  const paid = num(head["summary_paid"]);
  const unpaid = head["summary_unpaid"];

  const name =
    str(head["client_business_name"]) ||
    [str(head["client_first_name"]), str(head["client_last_name"])].filter(Boolean).join(" ") ||
    str(client["business_name"]);
  const address = [
    str(head["client_address1"]) || str(client["address1"]),
    str(head["client_address2"]) || str(client["address2"]),
    str(head["client_city"]) || str(client["city"]),
    str(head["client_state"]) || str(client["state"]),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    kind,
    id: str(head["id"]),
    number: str(head["no"]),
    date: toIsoDate(head["date"]) || toIsoDate(head["issue_date"]),
    currency: str(head["currency_code"]) || "EGP",
    clientName: name,
    clientPhone:
      str(head["client_phone2"]) ||
      str(head["client_phone1"]) ||
      str(client["phone2"]) ||
      str(client["phone1"]),
    clientAddress: address,
    representative,
    section: str(obj(head["OrderSource"] ?? data["OrderSource"])["name"]),
    paymentProfile: "combined",
    items: lineItems,
    subtotal: round2(subtotal),
    tax: round2(grand - subtotal),
    paid: round2(paid),
    finalTotal: round2(
      unpaid !== undefined && unpaid !== null && unpaid !== ""
        ? num(unpaid)
        : Math.max(0, grand - paid),
    ),
    qrValue: str(head["invoice_html_url"]) || str(head["estimate_html_url"]) || null,
  };
}

/** Pulls the product code and default photo out of a Daftra single-product response (`data`). */
export function normalizeDaftraProduct(data: Raw): ProductInfo {
  const product = obj(data["Product"]);
  const images = [
    ...arr(product["ProductImageS3"] ?? data["ProductImageS3"]),
    ...arr(product["ProductImage"] ?? data["ProductImage"]),
    obj(product["ProductMasterImage"] ?? data["ProductMasterImage"]),
  ].sort((a, b) => num(b["default"]) - num(a["default"]));
  let imageUrl: string | null = null;
  for (const img of images) {
    for (const key of ["file_full_path", "full_path", "url"]) {
      const v = str(img[key]);
      if (/^https:\/\//.test(v)) {
        imageUrl = v;
        break;
      }
    }
    if (imageUrl) break;
  }
  return { code: str(product["product_code"]) || str(product["barcode"]), imageUrl };
}

export interface SalesListRow {
  id: string;
  number: string;
  date: string;
  clientName: string;
  total: number;
  currency: string;
  paymentStatus: string;
}

export function normalizeDaftraListRow(kind: SalesKind, row: Raw): SalesListRow {
  const head = obj(
    row[kind === "invoice" ? "Invoice" : "Estimate"] ?? row["Invoice"] ?? row["Estimate"],
  );
  const client = obj(row["Client"] ?? head["Client"]);
  return {
    id: str(head["id"]),
    number: str(head["no"]),
    date: toIsoDate(head["date"]),
    clientName:
      str(head["client_business_name"]) ||
      [str(head["client_first_name"]), str(head["client_last_name"])].filter(Boolean).join(" ") ||
      str(client["business_name"]),
    total: num(head["summary_total"]),
    currency: str(head["currency_code"]) || "EGP",
    paymentStatus: str(head["payment_status"]),
  };
}

function round2(v: number) {
  return Math.round(v * 100) / 100;
}
