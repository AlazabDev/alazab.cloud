import { describe, expect, it } from "vitest";
import { amountInArabicWords, docCode, formatCurrency, toIsoDate } from "./model";

describe("AZ Docs formatting", () => {
  it("builds the approved invoice code from the document month", () => {
    expect(docCode("invoice", "2026-04-13", "AZ-INV-2026-0160")).toBe("AZ-INV-2026-04-0160");
    expect(docCode("invoice", "2026-04-13", "25")).toBe("AZ-INV-2026-04-10025");
    expect(docCode("quote", "2026-04-13", "draft-332")).toBe("draft-332");
  });

  it("normalizes ISO and Daftra day-first dates", () => {
    expect(toIsoDate("2026-04-13")).toBe("2026-04-13");
    expect(toIsoDate("13-04-2026")).toBe("2026-04-13");
    expect(toIsoDate("not a date")).toBe("");
  });

  it("formats currency using the requested locale and currency", () => {
    expect(formatCurrency(1234.5, "EGP", "en-US")).toContain("1,234.50");
  });

  it("spells out Egyptian pounds and piasters in Arabic", () => {
    expect(amountInArabicWords(25)).toBe("خمسة وعشرون جنيهًا فقط لا غير");
    expect(amountInArabicWords(10.25)).toBe("عشرة جنيهات وخمسة وعشرون قرشًا فقط لا غير");
    expect(amountInArabicWords(-1)).toBe("سالب جنيه واحد فقط لا غير");
  });
});
