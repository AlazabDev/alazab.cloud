/** Head metadata for signed-in gallery screens: unique title, never indexed. */
export function privateHead(title: string, description: string) {
  const full = `${title} | ALAZAB Files`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
