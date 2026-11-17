import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/components/pages/files/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "تعيين كلمة مرور جديدة | ALAZAB Files" },
      { name: "description", content: "اختر كلمة مرور جديدة لحسابك في معرض ملفات العزب." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "تعيين كلمة مرور جديدة | ALAZAB Files" },
      { property: "og:description", content: "اختر كلمة مرور جديدة لحسابك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});
