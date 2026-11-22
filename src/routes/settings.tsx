import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/components/pages/Settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "إعدادات البوابة | Alazab Cloud" },
      {
        name: "description",
        content: "أضف وعدّل واحذف خدمات العزب في دليل البوابة: الاسم والرابط والأيقونة والتصنيف.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "إعدادات البوابة | Alazab Cloud" },
      { property: "og:description", content: "إدارة دليل خدمات Alazab Cloud." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});
