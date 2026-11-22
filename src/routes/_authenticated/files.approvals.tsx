import { createFileRoute } from "@tanstack/react-router";
import ApprovalsPage from "@/components/pages/files/ApprovalsPage";
import { privateHead } from "@/lib/seo";
import { approvalsQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files/approvals")({
  head: () =>
    privateHead(
      "الاعتمادات",
      "مركز الاعتمادات: طلبات المراجعة والقرارات والملاحظات على الإصدارات.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(approvalsQuery()),
  component: ApprovalsPage,
});
