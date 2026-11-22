import { labelOf, PROJECT_STATUSES } from "@/lib/files/constants";
import type { ProjectRow } from "@/lib/files/queries";

type ReportProject = Pick<ProjectRow, "id" | "code" | "name" | "status" | "docCount">;

type ReportApproval = {
  status: string;
  document: { project: { id: string } | null } | null;
};

function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function createProjectReportCsv(
  projects: readonly ReportProject[],
  approvals: readonly ReportApproval[],
  lang: "ar" | "en",
): string {
  const pendingByProject = new Map<string, number>();
  for (const approval of approvals) {
    const projectId = approval.document?.project?.id;
    if (approval.status === "pending" && projectId) {
      pendingByProject.set(projectId, (pendingByProject.get(projectId) ?? 0) + 1);
    }
  }

  const headers =
    lang === "ar"
      ? ["كود المشروع", "اسم المشروع", "الحالة", "عدد الملفات", "الاعتمادات المعلقة"]
      : ["Project code", "Project name", "Status", "Files", "Pending approvals"];
  const rows = [
    headers,
    ...projects.map((project) => [
      project.code,
      project.name,
      labelOf(PROJECT_STATUSES, project.status, lang),
      project.docCount,
      pendingByProject.get(project.id) ?? 0,
    ]),
  ];

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

export function projectReportFilename(now = new Date()): string {
  return `alazab-project-report-${now.toISOString().slice(0, 10)}.csv`;
}
