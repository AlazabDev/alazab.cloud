import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  Box,
  Building2,
  CheckCircle2,
  Clock3,
  DraftingCompass,
  FileCheck2,
  FileText,
  Files,
  Download,
  FolderKanban,
  Package,
  Plus,
  Sparkles,
} from "lucide-react";
import { useLang, useTx } from "@/lib/i18n";
import { approvalsQuery, documentsQuery, meQuery, projectsQuery } from "@/lib/files/queries";
import { formatDate, labelOf, PROJECT_STATUSES } from "@/lib/files/constants";
import DocumentsView from "@/components/files/DocumentsView";
import { EmptyState, StatusBadge } from "@/components/files/ui";
import { Button } from "@/components/ui/button";
import { createProjectReportCsv, projectReportFilename } from "@/lib/files/report";

const CATEGORY_CARDS = [
  { id: "shop_drawing", en: "Shop drawings", ar: "المخططات التنفيذية", icon: DraftingCompass },
  { id: "render_3d", en: "3D visualization", ar: "التصميمات ثلاثية الأبعاد", icon: Box },
  { id: "product", en: "Products", ar: "الوحدات والمنتجات", icon: Package },
  { id: "construction_doc", en: "Construction", ar: "الوثائق الإنشائية", icon: Building2 },
  { id: "document", en: "Technical docs", ar: "المستندات الفنية", icon: FileText },
];

export default function FilesHome() {
  const tx = useTx();
  const { lang, dir } = useLang();
  const { data: me } = useSuspenseQuery(meQuery());
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const { data: docs } = useSuspenseQuery(documentsQuery());
  const { data: approvals } = useSuspenseQuery(approvalsQuery());
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const pending = approvals.filter((approval) => approval.status === "pending");
  const myPending = pending.filter((approval) => approval.reviewer_id === me?.id);
  const approved = docs.filter((doc) => doc.status === "approved").length;
  const name = me?.profile?.full_name?.split(" ")[0] ?? "";
  const activeProjects = projects.filter((project) => project.status === "active");
  const latestProjects = projects.slice(0, 3);
  const exportProjectReport = () => {
    const blob = new Blob([createProjectReportCsv(projects, approvals, lang)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = projectReportFilename();
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const stats = [
    {
      label: tx("المشروعات النشطة", "Active projects"),
      value: activeProjects.length,
      icon: FolderKanban,
      to: "/files/projects" as const,
    },
    {
      label: tx("إجمالي الملفات", "Total files"),
      value: docs.length,
      icon: Files,
      to: "/files/gallery" as const,
    },
    {
      label: tx("ملفات معتمدة", "Approved files"),
      value: approved,
      icon: CheckCircle2,
      to: "/files/gallery" as const,
    },
    {
      label: tx("بانتظار الاعتماد", "Awaiting approval"),
      value: pending.length,
      icon: Clock3,
      to: "/files/approvals" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">
      <section
        className="relative isolate min-h-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-primary-dark bg-cover bg-center px-6 py-7 sm:px-9 sm:py-9 lg:min-h-[300px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(3,9,36,.96) 0%, rgba(3,9,36,.84) 48%, rgba(3,9,36,.2) 100%), url('/images/alazab-workspace-hero.png')",
        }}
        aria-labelledby="files-home-title"
      >
        <div className="absolute inset-y-0 start-0 w-1.5 bg-primary" aria-hidden="true" />
        <div className="relative flex min-h-[210px] max-w-2xl flex-col items-start justify-center gap-5 lg:min-h-[220px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-primary" />
            {tx("مساحة العمل الرقمية لشركة العزب", "ALAZAB project workspace")}
          </span>
          <div>
            <h1
              id="files-home-title"
              className="text-3xl font-bold leading-tight text-white sm:text-4xl"
            >
              {tx("كل مشروع. كل ملف. في مكان واحد.", "Every project. Every file. One place.")}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              {tx(
                `مرحبًا${name ? `، ${name}` : ""} — نظّم المخططات والمستندات، تابع الاعتمادات، وشارك الملفات مع فريقك وعملائك بأمان.`,
                `Welcome${name ? `, ${name}` : ""} — organize drawings, track approvals, and share project files with your team and clients.`,
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="font-semibold">
              <Link to="/files/projects">
                <FolderKanban data-icon="inline-start" />{" "}
                {tx("استكشف المشروعات", "Explore projects")}
              </Link>
            </Button>
            <Link
              to="/files/gallery"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {tx("تصفح الملفات", "Browse files")} <Arrow className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-label={tx("ملخص مساحة العمل", "Workspace overview")}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card/70 p-4 transition-colors hover:border-primary/50 hover:bg-card sm:p-5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <stat.icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-bold leading-none tabular-nums">
                {stat.value}
              </span>
              <span className="mt-1.5 block truncate text-xs text-muted-foreground">
                {stat.label}
              </span>
            </span>
            <ArrowUpLeft
              className="ms-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </Link>
        ))}
      </section>

      {me?.isStaff && (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="font-semibold">
              {tx("تقرير متابعة المشروعات", "Project activity report")}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {tx(
                "نزّل ملخصًا بالمشروعات والملفات والاعتمادات المعلقة المتاحة لحسابك.",
                "Download a summary of projects, files, and pending approvals available to your account.",
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={exportProjectReport}
            disabled={projects.length === 0}
          >
            <Download data-icon="inline-start" aria-hidden="true" />
            {tx("تنزيل CSV", "Download CSV")}
          </Button>
        </section>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <section>
            <SectionHeading
              title={tx("المشروعات الأخيرة", "Recent projects")}
              actionLabel={tx("عرض كل المشروعات", "All projects")}
              to="/files/projects"
            />
            {latestProjects.length ? (
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {latestProjects.map((project) => (
                  <Link
                    key={project.id}
                    to="/files/projects/$projectId"
                    params={{ projectId: project.id }}
                    className="group flex min-h-36 flex-col rounded-2xl border border-border/80 bg-card/65 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                        <Building2 className="size-5" />
                      </span>
                      <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                        {labelOf(PROJECT_STATUSES, project.status, lang)}
                      </span>
                    </span>
                    <span className="mt-4 min-w-0">
                      {project.code && (
                        <span className="block font-mono text-[10px] tracking-wider text-primary">
                          {project.code}
                        </span>
                      )}
                      <span className="mt-1 block truncate font-semibold group-hover:text-primary">
                        {project.name}
                      </span>
                    </span>
                    <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-muted-foreground">
                      <span>
                        {project.docCount} {tx("ملف", "files")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {project.client_name || tx("مشروع العزب", "Alazab project")}{" "}
                        <Arrow className="size-3.5" />
                      </span>
                    </span>
                  </Link>
                ))}
                {me?.isStaff && (
                  <Link
                    to="/files/projects"
                    className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background/30 p-4 text-center text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-secondary">
                      <Plus className="size-5" />
                    </span>
                    <span className="text-sm font-medium">
                      {tx("افتح إدارة المشروعات", "Open project management")}
                    </span>
                  </Link>
                )}
              </div>
            ) : (
              <EmptyState
                icon={<FolderKanban className="size-6" />}
                title={tx("لا توجد مشروعات بعد", "No projects yet")}
                body={tx(
                  "ستظهر المشروعات المضافة إلى حسابك هنا.",
                  "Projects shared with your account will appear here.",
                )}
              />
            )}
          </section>

          <section>
            <SectionHeading
              title={tx("أحدث الملفات", "Recently updated files")}
              actionLabel={tx("كل الملفات", "Browse all files")}
              to="/files/gallery"
            />
            {docs.length ? (
              <DocumentsView docs={docs.slice(0, 4)} view="grid" />
            ) : (
              <EmptyState
                icon={<Files className="size-6" />}
                title={tx("لا توجد ملفات بعد", "No files yet")}
                body={
                  me?.isStaff
                    ? tx(
                        "أنشئ مشروعًا ثم ارفع المخططات والمستندات داخله.",
                        "Create a project, then upload drawings and documents into it.",
                      )
                    : tx(
                        "ستظهر هنا الملفات التي يتيحها لك فريق العزب.",
                        "Files released to your account will appear here.",
                      )
                }
              />
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <section>
            <SectionHeading title={tx("تصفح حسب النوع", "Browse by category")} />
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/60">
              {CATEGORY_CARDS.map((category, index) => {
                const count = docs.filter((doc) => doc.doc_type === category.id).length;
                return (
                  <Link
                    key={category.id}
                    to="/files/gallery"
                    search={{ type: category.id }}
                    className={`group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/60 ${index ? "border-t border-border/60" : ""}`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <category.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {lang === "ar" ? category.ar : category.en}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {count} {tx("ملف", "files")}
                      </span>
                    </span>
                    <Arrow className="size-3.5 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </section>

          {me?.isStaff && (
            <Link
              to="/azdocs"
              className="group block rounded-2xl border border-primary/25 bg-primary/5 p-5 transition-colors hover:border-primary/50 hover:bg-primary/10"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="size-5" />
              </span>
              <span className="mt-4 block font-semibold">
                {tx("المستندات والفواتير", "Documents & invoices")}
              </span>
              <span className="mt-1 block text-xs leading-6 text-muted-foreground">
                {tx(
                  "إنشاء ومتابعة مستندات الشركة الرسمية من مساحة واحدة.",
                  "Create and manage official company documents in one place.",
                )}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                {tx("فتح AZ Docs", "Open AZ Docs")} <Arrow className="size-3.5" />
              </span>
            </Link>
          )}

          {myPending.length > 0 && (
            <section>
              <SectionHeading
                title={tx("بانتظار قرارك", "Awaiting your decision")}
                actionLabel={tx("كل الاعتمادات", "All approvals")}
                to="/files/approvals"
              />
              <ul className="overflow-hidden rounded-2xl border border-border/80 bg-card/60">
                {myPending.slice(0, 4).map((approval, index) => {
                  const doc = approval.document as {
                    id: string;
                    title: string;
                    project: { name: string } | null;
                  } | null;
                  if (!doc) return null;
                  return (
                    <li key={approval.id} className={index ? "border-t border-border/60" : ""}>
                      <Link
                        to="/files/documents/$documentId"
                        params={{ documentId: doc.id }}
                        className="block p-4 transition-colors hover:bg-secondary/40"
                      >
                        <span className="flex items-start gap-3">
                          <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{doc.title}</span>
                            <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                              {doc.project?.name} · {formatDate(approval.created_at, lang)}
                            </span>
                          </span>
                          <StatusBadge status={approval.status} kind="approval" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  actionLabel,
  to,
}: {
  title: string;
  actionLabel?: string;
  to?: "/files/projects" | "/files/gallery" | "/files/approvals";
}) {
  const { dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {actionLabel && to && (
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {actionLabel}
          <Arrow className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
