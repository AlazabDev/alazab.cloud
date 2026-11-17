import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/components/pages/files/AuthPage";

type AuthSearch = { redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | ALAZAB Files" },
      { name: "description", content: "دخول موظفي وعملاء العزب إلى معرض ملفات المشروعات." },
      { property: "og:title", content: "تسجيل الدخول | ALAZAB Files" },
      { property: "og:description", content: "دخول موظفي وعملاء العزب إلى معرض ملفات المشروعات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});
