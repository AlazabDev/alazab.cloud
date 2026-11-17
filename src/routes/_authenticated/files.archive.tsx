import { createFileRoute } from "@tanstack/react-router";
import ArchivePage from "@/components/pages/files/ArchivePage";
import { privateHead } from "@/lib/seo";
import { documentsQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files/archive")({
  head: () => privateHead("الأرشيف", "المستندات المؤرشفة مع إمكانية الاستعادة."),
  loader: ({ context }) => context.queryClient.ensureQueryData(documentsQuery({ archived: true })),
  component: ArchivePage,
});
