import { createFileRoute } from "@tanstack/react-router";
import Index from "@/components/pages/Index";

const title = "Alazab Cloud | بوابة الخدمات الرقمية للعزب";
const description =
  "Alazab Cloud هي بوابة موحدة للوصول إلى خدمات ومواقع وأنظمة العزب، بما في ذلك المواقع العامة، الأنظمة الخاصة، وبيئة Frappe. واجهة عربية/إنجليزية سريعة وواضحة.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content:
          "Alazab Cloud, بوابة العزب, خدمات العزب, مواقع العزب, أنظمة العزب, Frappe, بوابة موحدة, Alazab services, Alazab portals",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:title", content: title },
      {
        property: "og:description",
        content:
          "بوابة موحدة للوصول إلى كافة خدمات ومواقع وأنظمة العزب في مكان واحد، بتجربة عربية/إنجليزية واضحة وسريعة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://alazab.cloud/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      {
        name: "twitter:description",
        content: "بوابة موحدة للوصول إلى كافة خدمات ومواقع وأنظمة العزب في مكان واحد.",
      },
    ],
    links: [{ rel: "canonical", href: "https://alazab.cloud/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Alazab Cloud",
          url: "https://alazab.cloud/",
          inLanguage: ["ar", "en"],
          description: "بوابة موحدة للوصول إلى خدمات ومواقع وأنظمة العزب",
          publisher: { "@type": "Organization", name: "Alazab" },
        }),
      },
    ],
  }),
  component: Index,
});
