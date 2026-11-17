import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderKanban, MapPin, Plus, Search, User } from "lucide-react";
import { useLang, useTx } from "@/lib/i18n";
import { MEMBER_ROLES, PROJECT_STATUSES, labelOf } from "@/lib/files/constants";
import { meQuery, projectsQuery } from "@/lib/files/queries";
import { Button } from "@/components/ui/button";
import ProjectFormDialog from "@/components/files/ProjectFormDialog";
import { EmptyState, PageHeader, inputCls } from "@/components/files/ui";

export default function ProjectsPage() {
  const tx = useTx();
  const { lang } = useLang();
  const { data: me } = useSuspenseQuery(meQuery());
  const { data: projects } = useSuspenseQuery(projectsQuery());
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const list = projects.filter((p) =>
    [p.name, p.code, p.client_name, p.location].join(" ").toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title={tx("المشروعات", "Projects")}
        subtitle={tx("كل مشروع بملفاته ومجلداته وفريقه وصلاحياته.", "Each project with its files, folders, team and access.")}
        actions={
          me?.isStaff && (
            <Button onClick={() => setOpen(true)}>
              <Plus /> {tx("مشروع جديد", "New project")}
            </Button>
          )
        }
      />
      {projects.length > 0 && (
        <div className="relative max-w-sm mb-5">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className={`${inputCls} ps-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx("ابحث بالاسم أو الكود أو العميل", "Search name, code or client")} />
        </div>
      )}
      {list.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" />}
          title={projects.length === 0 ? tx("لا توجد مشروعات بعد", "No projects yet") : tx("لا توجد نتائج", "No results")}
          body={
            projects.length === 0
              ? me?.isStaff
                ? tx("ابدأ بإنشاء أول مشروع لتنظيم ملفاته.", "Create your first project to organize its files.")
                : tx("لم تتم إضافتك لأي مشروع بعد.", "You haven't been added to a project yet.")
              : undefined
          }
          action={
            projects.length === 0 && me?.isStaff ? (
              <Button onClick={() => setOpen(true)}>
                <Plus /> {tx("مشروع جديد", "New project")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <Link key={p.id} to="/files/projects/$projectId" params={{ projectId: p.id }} className="card-glow rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                  <FolderKanban className="w-5 h-5" />
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{labelOf(PROJECT_STATUSES, p.status, lang)}</span>
              </div>
              <div>
                {p.code && <p className="font-mono text-[11px] text-primary">{p.code}</p>}
                <h3 className="font-semibold text-lg leading-snug">{p.name}</h3>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {p.client_name && (
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {p.client_name}
                  </p>
                )}
                {p.location && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {p.location}
                  </p>
                )}
              </div>
              <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {p.docCount} {tx("مستند", "documents")}
                </span>
                <span>{p.myRole ? labelOf(MEMBER_ROLES, p.myRole, lang) : me?.isAdmin ? tx("مدير النظام", "Admin") : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <ProjectFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
