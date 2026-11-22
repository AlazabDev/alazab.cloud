import { describe, expect, it, vi } from "vitest";
vi.mock("./daftra.server", () => ({ daftraGet: vi.fn() }));
import { toInvoiceRow } from "./sync.server";

describe("toInvoiceRow", () => {
  const data = {
    Invoice: {
      id: "160", no: "AZ-INV-2026-0160", date: "2026-11-10", client_business_name: "Alazab",
      summary_subtotal: "75750", summary_discount: "0", summary_total: "85642.5",
      summary_paid: "0", currency_code: "EGP", payment_status: "0", InvoiceItem: [{ item: "a" }],
    },
  };
  it("stores Daftra totals and number", () => {
    const r = toInvoiceRow("invoice", data);
    expect(r.id).toBe("160");
    expect(r.doc_number).toBe("AZ-INV-2026-0160");
    expect(r.subtotal).toBe(75750);
    expect(r.tax_total).toBe(9892.5);
    expect(r.final_total).toBe(85642.5);
  });
  it("keeps quotations apart from invoices with the same id", () => {
    expect(toInvoiceRow("quote", { Estimate: { id: "160" } }).id).toBe("quote-160");
  });
});
