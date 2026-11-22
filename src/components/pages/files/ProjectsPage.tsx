import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowUpLeft,
  Building2,
  CheckCheck,
  CircleDot,
  FolderKanban,
  MapPin,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useLang, useTx } from "@/lib/i18n";
import { MEMBER_ROLES, PROJECT_STATUSES, labelOf } from "@/lib/files/constants";
import { meQuery, projectsQuery } from "@/lib/files/queries";
import { Button } from "@/components/ui/button";
import ProjectFormDialog from "@/components/files/ProjectFormDialog";
import { EmptyState, inputCls } from "@/components/files/ui";

type ProjectFilter = "all" | "active" | "on_hold" | "completed";

export default function ProjectsPage() {
  const tx = useTx();
  const { lang } = useLang();
  const { data: me } = useSuspenseQuery(meQuery());
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const counts = {
    all: projects.length,
    active: projects.filter((project) => project.status === "active").length,
    on_hold: projects.filter((project) => project.status === "on_hold").length,
    completed: projects.filter((project) => project.status === "completed").length,
  };
  const filters: { id: ProjectFilter; label: string }[] = [
    { id: "all", label: tx("كل المشروعات", "All projects") },
    { id: "active", label: tx("جارية", "Active") },
    { id: "on_hold", label: tx("متوقفة", "On hold") },
    { id: "completed", label: tx("مكتملة", "Completed") },
  ];
  const list = useMemo(
    () =>
      projects.filter((project) => {
        const matchesFilter = filter === "all" || project.status === filter;
        const query = q.trim().toLowerCase();
        const matchesSearch = [project.name, project.code, project.client_name, project.location]
          .join(" ")
          .toLowerCase()
          .includes(query);
        return matchesFilter && matchesSearch;
      }),
    [filter, projects, q],
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <section className="relative overflow-hidden rounded-[26px] border border-border/80 bg-card/70 p-5 sm:p-7">
        <div
          className="absolute inset-y-0 end-0 hidden w-1/3 bg-gradient-to-l from-primary/10 to-transparent sm:block"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
              <Building2 className="size-4" />
              {tx("إدارة المشروعات", "Project management")}
            </span>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {tx("مشروعات العزب", "Alazab projects")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {tx(
                "مساحة موحدة لمتابعة ملفات التنفيذ، فرق العمل، ومشاركة المستندات مع العملاء حسب صلاحيات كل مشروع.",
                "A unified workspace for project files, teams, and permission-based document sharing with clients.",
              )}
            </p>
          </div>
          {me?.isStaff && (
            <Button onClick={() => setOpen(true)}>
              <Plus data-icon="inline-start" />
              {tx("مشروع جديد", "New project")}
            </Button>
          )}
        </div>
      </section>

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label={tx("ملخص المشروعات", "Project summary")}
      >
        <ProjectMetric
          label={tx("إجمالي المشروعات", "Total projects")}
          value={counts.all}
          icon={FolderKanban}
        />
        <ProjectMetric
          label={tx("قيد التنفيذ", "In progress")}
          value={counts.active}
          icon={CircleDot}
        />
        <ProjectMetric
          label={tx("مكتملة", "Completed")}
          value={counts.completed}
          icon={CheckCheck}
        />
        <ProjectMetric
          label={tx("إجمالي المستندات", "Total documents")}
          value={projects.reduce((sum, project) => sum + project.docCount, 0)}
          icon={Building2}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={tx("تصفية المشروعات", "Filter projects")}
          >
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors ${filter === item.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card/50 text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
                <span
                  className={
                    filter === item.id
                      ? "rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[10px]"
                      : "rounded-full bg-secondary px-1.5 py-0.5 text-[10px]"
                  }
                >
                  {counts[item.id]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              className={`${inputCls} ps-9`}
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={tx("ابحث بالاسم أو الكود أو العميل", "Search name, code or client")}
              aria-label={tx("البحث في المشروعات", "Search projects")}
            />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-6" />}
            title={
              projects.length === 0
                ? tx("لا توجد مشروعات بعد", "No projects yet")
                : tx("لا توجد نتائج مطابقة", "No matching projects")
            }
            body={
              projects.length === 0
                ? me?.isStaff
                  ? tx(
                      "ابدأ بإنشاء أول مشروع لتنظيم ملفاته وفريقه.",
                      "Create your first project to organize its files and team.",
                    )
                  : tx("لم تتم إضافتك لأي مشروع بعد.", "You haven't been added to a project yet.")
                : tx(
                    "جرّب تغيير كلمات البحث أو حالة المشروع.",
                    "Try changing your search or project status filter.",
                  )
            }
            action={
              projects.length === 0 && me?.isStaff ? (
                <Button onClick={() => setOpen(true)}>
                  <Plus data-icon="inline-start" />
                  {tx("إنشاء مشروع", "Create project")}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((project) => (
              <Link
                key={project.id}
                to="/files/projects/$projectId"
                params={{ projectId: project.id }}
                className="group flex min-h-[230px] flex-col rounded-2xl border border-border/80 bg-card/65 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Building2 className="size-5" />
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] ${project.status === "active" ? "border-success/30 bg-success/10 text-success" : "border-border bg-secondary/60 text-muted-foreground"}`}
                  >
                    {labelOf(PROJECT_STATUSES, project.status, lang)}
                  </span>
                </div>
                <div className="mt-4">
                  {project.code && (
                    <p className="font-mono text-[10px] tracking-wider text-primary">
                      {project.code}
                    </p>
                  )}
                  <h2 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
                    {project.name}
                  </h2>
                </div>
                <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
                  {project.client_name && (
                    <p className="flex items-center gap-2">
                      <User className="size-3.5 shrink-0" />{" "}
                      <span className="truncate">{project.client_name}</span>
                    </p>
                  )}
                  {project.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0" />{" "}
                      <span className="truncate">{project.location}</span>
                    </p>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <span>
                    {project.docCount} {tx("مستند", "documents")}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="max-w-32 truncate">
                      {project.myRole
                        ? labelOf(MEMBER_ROLES, project.myRole, lang)
                        : me?.isAdmin
                          ? tx("مدير النظام", "Admin")
                          : ""}
                    </span>
                    <ArrowUpLeft
                      className="size-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <ProjectFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function ProjectMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FolderKanban;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/60 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-4.5" />
      </span>
      <span>
        <span className="block text-xl font-bold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}
