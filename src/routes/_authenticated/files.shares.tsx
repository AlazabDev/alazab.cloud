import { createFileRoute } from "@tanstack/react-router";
import SharesPage from "@/components/pages/files/SharesPage";
import { privateHead } from "@/lib/seo";
import { sharesQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files/shares")({
  head: () => privateHead("المشاركات", "روابط المشاركة الخارجية المقيدة: المستفيد، مدة الصلاحية، وعدد المشاهدات."),
  loader: ({ context }) => context.queryClient.ensureQueryData(sharesQuery()),
  component: SharesPage,
});
