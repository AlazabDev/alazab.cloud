import { getRouteApi } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Images, Search, X } from "lucide-react";
import { useLang, useTx } from "@/lib/i18n";
import { DISCIPLINES, DOC_STATUSES, DOC_TYPES } from "@/lib/files/constants";
import { documentsQuery, projectsQuery } from "@/lib/files/queries";
import DocumentsView from "@/components/files/DocumentsView";
import { EmptyState, PageHeader, inputCls, selectCls } from "@/components/files/ui";
import { ViewToggle } from "./ProjectPage";

const route = getRouteApi("/_authenticated/files/gallery");

export default function GalleryPage() {
  const tx = useTx();
  const { lang } = useLang();
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { data: docs } = useSuspenseQuery(documentsQuery());
  const { data: projects } = useSuspenseQuery(projectsQuery());

  const set = (patch: Record<string, string | undefined>) =>
    navigate({
      search: (prev) => {
        const next: Record<string, string | undefined> = { ...prev, ...patch };
        for (const k of Object.keys(next)) if (!next[k]) delete next[k];
        return next;
      },
      replace: true,
    });

  const needle = (search.q ?? "").trim().toLowerCase();
  const list = docs.filter((d) => {
    if (search.type && d.doc_type !== search.type) return false;
    if (search.project && d.project_id !== search.project) return false;
    if (search.discipline && d.discipline !== search.discipline) return false;
    if (search.status && d.status !== search.status) return false;
    if (!needle) return true;
    return [d.title, d.doc_number, d.latest?.file_name, d.project?.name, d.project?.code, d.issuing_party, d.description, ...(d.tags ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  const filtered = !!(search.q || search.type || search.project || search.discipline || search.status);

  return (
    <div>
      <PageHeader title={tx("معرض ملفات المشروعات", "Project files gallery")} subtitle={tx("عرض شبكي · تصفية · معاينة", "Grid view · filters · preview")} />

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => set({ type: undefined })}
          className={`h-8 px-3 rounded-full text-xs border ${!search.type ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          {tx("الكل", "All")} <span className="opacity-70">({docs.length})</span>
        </button>
        {DOC_TYPES.map((t) => {
          const count = docs.filter((d) => d.doc_type === t.id).length;
          if (count === 0 && search.type !== t.id) return null;
          return (
            <button
              key={t.id}
              onClick={() => set({ type: t.id })}
              className={`h-8 px-3 rounded-full text-xs border ${search.type === t.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {lang === "ar" ? t.ar : t.en} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className={`${inputCls} ps-9`}
            defaultValue={search.q ?? ""}
            onChange={(e) => set({ q: e.target.value })}
            placeholder={tx("ابحث باسم الملف أو المشروع أو رقم المستند أو البيانات الوصفية", "Search file, project, number or metadata")}
          />
        </div>
        <select className={`${selectCls} w-auto`} value={search.project ?? ""} onChange={(e) => set({ project: e.target.value })}>
          <option value="">{tx("كل المشروعات", "All projects")}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select className={`${selectCls} w-auto`} value={search.discipline ?? ""} onChange={(e) => set({ discipline: e.target.value })}>
          <option value="">{tx("كل التخصصات", "All disciplines")}</option>
          {DISCIPLINES.map((d) => (
            <option key={d.id} value={d.id}>
              {lang === "ar" ? d.ar : d.en}
            </option>
          ))}
        </select>
        <select className={`${selectCls} w-auto`} value={search.status ?? ""} onChange={(e) => set({ status: e.target.value })}>
          <option value="">{tx("كل الحالات", "All statuses")}</option>
          {DOC_STATUSES.map((d) => (
            <option key={d.id} value={d.id}>
              {lang === "ar" ? d.ar : d.en}
            </option>
          ))}
        </select>
        <ViewToggle view={search.view ?? "grid"} onChange={(v) => set({ view: v === "list" ? "list" : undefined })} />
        {filtered && (
          <button
            onClick={() => navigate({ search: {}, replace: true })}
            className="inline-flex items-center gap-1 h-10 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" /> {tx("مسح التصفية", "Clear filters")}
          </button>
        )}
      </div>

      {list.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            {list.length} {tx("مستند", "documents")}
          </p>
          <DocumentsView docs={list} view={search.view ?? "grid"} />
        </>
      ) : (
        <EmptyState icon={<Images className="w-6 h-6" />} title={filtered ? tx("لا توجد ملفات مطابقة", "No matching files") : tx("المعرض فارغ", "The gallery is empty")} />
      )}
    </div>
  );
}
