import { createFileRoute } from "@tanstack/react-router";
import SharePage from "@/components/pages/files/SharePage";
import { resolveShare } from "@/lib/share.functions";

export const Route = createFileRoute("/share/$token")({
  loader: ({ params }) => resolveShare({ data: { token: params.token } }),
  staleTime: Infinity,
  head: () => ({
    meta: [
      { title: "ملف مُشارك | ALAZAB Files" },
      { name: "description", content: "ملف مُشارك من معرض ملفات مشروعات العزب برابط محدود المدة." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "ملف مُشارك | ALAZAB Files" },
      { property: "og:description", content: "ملف مُشارك من معرض ملفات العزب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SharePage,
});
