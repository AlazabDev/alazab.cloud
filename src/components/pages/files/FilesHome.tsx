import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DraftingCompass, Box, Package, Building2, FileText, FolderKanban, Files, FileCheck2, ArrowLeft, ArrowRight } from "lucide-react";
import { useLang, useTx } from "@/lib/i18n";
import { approvalsQuery, documentsQuery, meQuery, projectsQuery } from "@/lib/files/queries";
import { formatDate } from "@/lib/files/constants";
import DocumentsView from "@/components/files/DocumentsView";
import { EmptyState, StatusBadge } from "@/components/files/ui";

const CATEGORY_CARDS = [
  { id: "shop_drawing", en: "Shop Drawings", ar: "المخططات التنفيذية", icon: DraftingCompass },
  { id: "render_3d", en: "3D Render", ar: "معاينة التصميم", icon: Box },
  { id: "product", en: "Product Gallery", ar: "الوحدات المصنعة", icon: Package },
  { id: "construction_doc", en: "Construction Documents", ar: "الوثائق الإنشائية", icon: Building2 },
  { id: "document", en: "Documents", ar: "المستندات الفنية", icon: FileText },
];

export default function FilesHome() {
  const tx = useTx();
  const { lang, dir } = useLang();
  const { data: me } = useSuspenseQuery(meQuery());
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const { data: docs } = useSuspenseQuery(documentsQuery());
  const { data: approvals } = useSuspenseQuery(approvalsQuery());
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const pending = approvals.filter((a) => a.status === "pending");
  const mine = pending.filter((a) => a.reviewer_id === me?.id);
  const name = me?.profile?.full_name?.split(" ")[0] ?? "";

  const stats = [
    { label: tx("المشروعات", "Projects"), value: projects.length, icon: FolderKanban, to: "/files/projects" as const },
    { label: tx("المستندات", "Documents"), value: docs.length, icon: Files, to: "/files/gallery" as const },
    { label: tx("اعتمادات معلقة", "Pending approvals"), value: pending.length, icon: FileCheck2, to: "/files/approvals" as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {tx("مرحبًا", "Welcome")}
          {name && `، ${name}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{tx("معرض ملفات المشروعات — عرض شبكي · تصفية · معاينة", "Project files gallery — grid · filter · preview")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card-glow rounded-2xl p-5 flex items-center gap-4">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
              <s.icon className="w-5 h-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">{tx("تصنيفات المعرض", "Gallery categories")}</h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {CATEGORY_CARDS.map((c) => {
            const count = docs.filter((d) => d.doc_type === c.id).length;
            return (
              <Link key={c.id} to="/files/gallery" search={{ type: c.id }} className="card-glow group rounded-2xl p-4 flex flex-col gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <c.icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-sm">{c.en}</p>
                  <p className="text-xs text-muted-foreground">{c.ar}</p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-auto">
                  {count} {tx("ملف", "files")}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {mine.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{tx("بانتظار قرارك", "Awaiting your decision")}</h2>
          <ul className="space-y-2">
            {mine.slice(0, 5).map((a) => {
              const doc = a.document as { id: string; title: string; project: { name: string } | null } | null;
              return (
                <li key={a.id}>
                  {doc && (
                    <Link
                      to="/files/documents/$documentId"
                      params={{ documentId: doc.id }}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 hover:border-primary/60"
                    >
                      <FileCheck2 className="w-4 h-4 text-primary" />
                      <span className="font-medium truncate">{doc.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{doc.project?.name}</span>
                      <span className="ms-auto flex items-center gap-2">
                        <StatusBadge status={a.status} kind="approval" />
                        <span className="text-xs text-muted-foreground">{formatDate(a.created_at, lang)}</span>
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{tx("أحدث الملفات", "Latest files")}</h2>
          <Link to="/files/gallery" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
            {tx("كل الملفات", "All files")} <Arrow className="w-3.5 h-3.5" />
          </Link>
        </div>
        {docs.length > 0 ? (
          <DocumentsView docs={docs.slice(0, 8)} view="grid" />
        ) : (
          <EmptyState
            icon={<Files className="w-6 h-6" />}
            title={tx("لا توجد ملفات بعد", "No files yet")}
            body={
              me?.isStaff
                ? tx("أنشئ مشروعًا ثم ارفع المخططات والمستندات داخله.", "Create a project, then upload drawings and documents into it.")
                : tx("ستظهر هنا ملفات مشروعاتك عندما يتيحها لك فريق العزب.", "Your project files will appear here once the Alazab team releases them.")
            }
            action={
              me?.isStaff ? (
                <Link to="/files/projects" className="text-sm text-primary hover:underline">
                  {tx("الذهاب إلى المشروعات", "Go to projects")}
                </Link>
              ) : undefined
            }
          />
        )}
      </section>
    </div>
  );
}
