import { createFileRoute } from "@tanstack/react-router";
import FilesHome from "@/components/pages/files/FilesHome";
import { privateHead } from "@/lib/seo";
import { approvalsQuery, documentsQuery, projectsQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files/")({
  head: () =>
    privateHead(
      "الرئيسية",
      "نظرة عامة على ملفات ومشروعات العزب: أحدث الملفات والاعتمادات المعلقة.",
    ),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(projectsQuery()),
      queryClient.ensureQueryData(documentsQuery()),
      queryClient.ensureQueryData(approvalsQuery()),
    ]),
  component: FilesHome,
});
