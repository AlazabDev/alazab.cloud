import { describe, expect, it } from "vitest";
import { DISCIPLINES, DOC_TYPES } from "@/lib/files/constants";
import { DISCIPLINE_IDS, DOC_TYPE_IDS, canSuggest, normalizeSuggestion, uniqueIssuers, KNOWN_ISSUERS_MAX } from "@/lib/files/classify";

describe("AI classification rules", () => {
  it("only suggests categories the gallery offers", () => {
    expect([...DOC_TYPE_IDS].sort()).toEqual(DOC_TYPES.map((t) => t.id).sort());
  });

  it("only suggests disciplines the gallery offers", () => {
    expect([...DISCIPLINE_IDS].sort()).toEqual(DISCIPLINES.map((t) => t.id).sort());
  });

  it("falls back to 'other' / 'general' for unknown values", () => {
    const s = normalizeSuggestion({ doc_type: "invoice", discipline: "legal", issuing_party: null, confidence: "sure", reason: "x" });
    expect(s.docType).toBe("other");
    expect(s.discipline).toBe("general");
    expect(s.confidence).toBe("low");
  });

  it("reuses the exact spelling of a known issuer", () => {
    const s = normalizeSuggestion(
      { doc_type: "shop_drawing", discipline: "structural", issuing_party: "  dar al-handasah ", confidence: "high", reason: "r" },
      ["Dar Al-Handasah"],
    );
    expect(s.issuingParty).toBe("Dar Al-Handasah");
  });

  it("keeps the issuer empty when none is stated", () => {
    const s = normalizeSuggestion({ doc_type: "document", discipline: "general", issuing_party: "  ", confidence: "medium", reason: "r" });
    expect(s.issuingParty).toBeNull();
  });

  it("needs a title of 3+ characters or a description of 10+ characters", () => {
    expect(canSuggest("ab", "")).toBe(false);
    expect(canSuggest("abc", "")).toBe(true);
    expect(canSuggest("", "short")).toBe(false);
    expect(canSuggest("", "a longer description")).toBe(true);
  });

  it("dedupes known issuers case-insensitively and caps the list", () => {
    expect(uniqueIssuers(["ACE", "ace ", null, "", "Orascom"])).toEqual(["ACE", "Orascom"]);
    const many = Array.from({ length: 40 }, (_, i) => `Issuer ${i}`);
    expect(uniqueIssuers(many)).toHaveLength(KNOWN_ISSUERS_MAX);
  });
});
