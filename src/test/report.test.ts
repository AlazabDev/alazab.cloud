import { describe, expect, it } from "vitest";
import { createProjectReportCsv, projectReportFilename } from "@/lib/files/report";

describe("project activity report", () => {
  it("exports localized project and pending approval totals as Excel-friendly CSV", () => {
    const csv = createProjectReportCsv(
      [
        { id: "p1", code: "AZ-2026-01", name: "Project One", status: "active", docCount: 3 },
        { id: "p2", code: null, name: "Project Two", status: "on_hold", docCount: 0 },
      ],
      [
        { status: "pending", document: { project: { id: "p1" } } },
        { status: "pending", document: { project: { id: "p1" } } },
        { status: "approved", document: { project: { id: "p1" } } },
      ],
      "en",
    );

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.split("\r\n")[1]).toBe('"AZ-2026-01","Project One","Active","3","2"');
    expect(csv.split("\r\n")[2]).toBe('"","Project Two","On hold","0","0"');
  });

  it("quotes commas and neutralizes spreadsheet formula cells", () => {
    const csv = createProjectReportCsv(
      [
        {
          id: "p1",
          code: "AZ-1",
          name: '=HYPERLINK("https://example.com")',
          status: "active",
          docCount: 1,
        },
      ],
      [],
      "ar",
    );

    expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")"');
    expect(csv).toContain('"كود المشروع","اسم المشروع"');
  });

  it("uses a date-stamped download filename", () => {
    expect(projectReportFilename(new Date("2026-11-21T12:00:00Z"))).toBe(
      "alazab-project-report-2026-11-21.csv",
    );
  });
});
