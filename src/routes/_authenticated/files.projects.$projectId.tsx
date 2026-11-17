import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "@/components/pages/files/ProjectPage";
import { privateHead } from "@/lib/seo";
import { documentsQuery, projectQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files/projects/$projectId")({
  head: () => privateHead("ملفات المشروع", "مستكشف ملفات المشروع: المجلدات والمستندات والإصدارات والفريق."),
  loader: ({ context: { queryClient }, params }) =>
    Promise.all([
      queryClient.ensureQueryData(projectQuery(params.projectId)),
      queryClient.ensureQueryData(documentsQuery({ projectId: params.projectId })),
    ]),
  component: ProjectPage,
});
