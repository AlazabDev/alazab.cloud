import { createFileRoute } from "@tanstack/react-router";
import ProjectsPage from "@/components/pages/files/ProjectsPage";
import { privateHead } from "@/lib/seo";
import { projectsQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files/projects/")({
  head: () => privateHead("المشروعات", "مكتبة مشروعات العزب: كل مشروع بملفاته ومجلداته وفريقه."),
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery()),
  component: ProjectsPage,
});
