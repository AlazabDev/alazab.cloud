import { describe, expect, it } from "vitest";
import { fileKind, hasDirectPreview, isAllowedFile, safeStorageName, shareState } from "@/lib/files/constants";

describe("Gallery accepts the plan's target formats", () => {
  it.each(["a.pdf", "a.docx", "a.xlsx", "a.pptx", "a.dwg", "a.dxf", "a.ifc", "a.rvt", "a.jpg", "a.png", "a.webp", "a.svg", "a.obj", "a.glb", "a.gltf", "a.stl"])(
    "accepts %s",
    (name) => expect(isAllowedFile(name)).toBe(true),
  );

  it("rejects executables and unknown types", () => {
    expect(isAllowedFile("setup.exe")).toBe(false);
    expect(isAllowedFile("script.js")).toBe(false);
    expect(isAllowedFile("noextension")).toBe(false);
  });
});

describe("Upload does not mean in-browser preview", () => {
  it("CAD/BIM files have no direct preview", () => {
    for (const n of ["plan.dwg", "plan.dxf", "model.ifc", "model.rvt"]) {
      expect(fileKind(n)).toBe("cad");
      expect(hasDirectPreview(n)).toBe(false);
    }
  });
  it("PDF, images and GLB preview directly", () => {
    expect(hasDirectPreview("a.PDF")).toBe(true);
    expect(hasDirectPreview("a.jpg")).toBe(true);
    expect(hasDirectPreview("a.glb")).toBe(true);
    expect(hasDirectPreview("a.stl")).toBe(false);
  });
});

describe("Share links", () => {
  const now = new Date("2026-11-15T12:00:00Z");
  it("is active before expiry", () => {
    expect(shareState({ expires_at: "2026-11-16T12:00:00Z", revoked_at: null }, now)).toBe("active");
  });
  it("is expired at or after expiry", () => {
    expect(shareState({ expires_at: "2026-11-15T12:00:00Z", revoked_at: null }, now)).toBe("expired");
  });
  it("revoked wins over a future expiry", () => {
    expect(shareState({ expires_at: "2026-12-01T00:00:00Z", revoked_at: "2026-11-15T10:00:00Z" }, now)).toBe("revoked");
  });
});

describe("Storage names", () => {
  it("turns Arabic names into safe ASCII and keeps the extension", () => {
    const n = safeStorageName("مخطط الدور الثاني.dwg");
    expect(n.endsWith(".dwg")).toBe(true);
    expect(/^[A-Za-z0-9._-]+$/.test(n)).toBe(true);
  });
});
