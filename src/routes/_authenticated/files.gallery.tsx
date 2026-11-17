import { createFileRoute } from "@tanstack/react-router";
import GalleryPage from "@/components/pages/files/GalleryPage";
import { privateHead } from "@/lib/seo";
import { documentsQuery, projectsQuery } from "@/lib/files/queries";

export type GallerySearch = {
  q?: string;
  type?: string;
  project?: string;
  discipline?: string;
  status?: string;
  view?: "grid" | "list";
};

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/_authenticated/files/gallery")({
  validateSearch: (s: Record<string, unknown>): GallerySearch => {
    const out: GallerySearch = {};
    const q = str(s["q"]);
    const type = str(s["type"]);
    const project = str(s["project"]);
    const discipline = str(s["discipline"]);
    const status = str(s["status"]);
    if (q) out.q = q;
    if (type) out.type = type;
    if (project) out.project = project;
    if (discipline) out.discipline = discipline;
    if (status) out.status = status;
    if (s["view"] === "list") out.view = "list";
    return out;
  },
  head: () => privateHead("المعرض", "معرض ملفات المشروعات: عرض شبكي، تصفية، ومعاينة لكل المخططات والمستندات."),
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(documentsQuery()), queryClient.ensureQueryData(projectsQuery())]),
  component: GalleryPage,
});
