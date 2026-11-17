import { createFileRoute } from "@tanstack/react-router";
import DocumentPage from "@/components/pages/files/DocumentPage";
import { privateHead } from "@/lib/seo";
import { documentQuery } from "@/lib/files/queries";

export const Route = createFileRoute("/_authenticated/files/documents/$documentId")({
  head: () => privateHead("تفاصيل المستند", "معاينة المستند وبياناته وإصداراته واعتماداته وروابط مشاركته."),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(documentQuery(params.documentId)),
  component: DocumentPage,
});
