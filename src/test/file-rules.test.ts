import { describe, expect, it } from "vitest";
import DxfParser from "dxf-parser";
import {
  fileKind,
  hasDirectPreview,
  isAllowedFile,
  safeStorageName,
  shareState,
} from "@/lib/files/constants";

describe("Gallery accepts the plan's target formats", () => {
  it.each([
    "a.pdf",
    "a.docx",
    "a.xlsx",
    "a.pptx",
    "a.dwg",
    "a.dxf",
    "a.ifc",
    "a.rvt",
    "a.jpg",
    "a.png",
    "a.webp",
    "a.svg",
    "a.obj",
    "a.glb",
    "a.gltf",
    "a.stl",
  ])("accepts %s", (name) => expect(isAllowedFile(name)).toBe(true));

  it("rejects executables and unknown types", () => {
    expect(isAllowedFile("setup.exe")).toBe(false);
    expect(isAllowedFile("script.js")).toBe(false);
    expect(isAllowedFile("noextension")).toBe(false);
  });
});

describe("DXF parser", () => {
  it("reads common line and circle entities from an ASCII drawing", () => {
    const source = [
      "0",
      "SECTION",
      "2",
      "ENTITIES",
      "0",
      "LINE",
      "8",
      "0",
      "10",
      "0",
      "20",
      "0",
      "30",
      "0",
      "11",
      "100",
      "21",
      "50",
      "31",
      "0",
      "0",
      "CIRCLE",
      "8",
      "0",
      "10",
      "25",
      "20",
      "10",
      "30",
      "0",
      "40",
      "5",
      "0",
      "ENDSEC",
      "0",
      "EOF",
    ].join("\n");
    const drawing = new DxfParser().parseSync(source);
    expect(drawing?.entities.map((entity) => entity.type)).toEqual(["LINE", "CIRCLE"]);
  });
});

describe("Direct file preview support", () => {
  it("opens DXF and IFC files in browser viewers while preserving native-only formats for download", () => {
    for (const n of ["plan.dwg", "model.rvt"]) {
      expect(fileKind(n)).toBe("cad");
      expect(hasDirectPreview(n)).toBe(false);
    }
    for (const n of ["plan.dxf", "model.ifc"]) {
      expect(fileKind(n)).toBe("cad");
      expect(hasDirectPreview(n)).toBe(true);
    }
  });
  it("PDF, images and GLB preview directly", () => {
    expect(hasDirectPreview("a.PDF")).toBe(true);
    expect(hasDirectPreview("a.jpg")).toBe(true);
    expect(hasDirectPreview("a.glb")).toBe(true);
    expect(hasDirectPreview("a.docx")).toBe(false);
    expect(hasDirectPreview("a.stl")).toBe(false);
  });
});

describe("Share links", () => {
  const now = new Date("2026-11-15T12:00:00Z");
  it("is active before expiry", () => {
    expect(shareState({ expires_at: "2026-11-16T12:00:00Z", revoked_at: null }, now)).toBe(
      "active",
    );
  });
  it("is expired at or after expiry", () => {
    expect(shareState({ expires_at: "2026-11-15T12:00:00Z", revoked_at: null }, now)).toBe(
      "expired",
    );
  });
  it("revoked wins over a future expiry", () => {
    expect(
      shareState({ expires_at: "2026-12-01T00:00:00Z", revoked_at: "2026-11-15T10:00:00Z" }, now),
    ).toBe("revoked");
  });
});

describe("Storage names", () => {
  it("turns Arabic names into safe ASCII and keeps the extension", () => {
    const n = safeStorageName("مخطط الدور الثاني.dwg");
    expect(n.endsWith(".dwg")).toBe(true);
    expect(/^[A-Za-z0-9._-]+$/.test(n)).toBe(true);
  });
});
