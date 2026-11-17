import { createFileRoute } from "@tanstack/react-router";
import Storage from "@/components/pages/Storage";

export const Route = createFileRoute("/storage")({
  head: () => ({
    meta: [
      { title: "إدارة المخازن السحابية | Alazab Cloud" },
      { name: "description", content: "كل مساحات التخزين السحابية للعزب في واجهة واحدة: Google Drive وOneDrive وTeraBox وAzure." },
      { property: "og:title", content: "إدارة المخازن السحابية | Alazab Cloud" },
      { property: "og:description", content: "كل مساحات التخزين في واجهة واحدة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Storage,
});
