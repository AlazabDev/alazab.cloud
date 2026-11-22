import { useMemo, useState } from "react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Files,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Search,
  Trash2,
  Upload,
  User,
  UserPlus,
  ChevronDown,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang, useTx } from "@/lib/i18n";
import {
  AUDIT_LABELS,
  MEMBER_ROLES,
  PROJECT_STATUSES,
  formatDateTime,
  labelOf,
  type MemberRole,
} from "@/lib/files/constants";
import {
  documentsQuery,
  meQuery,
  peopleQuery,
  projectAuditQuery,
  projectQuery,
} from "@/lib/files/queries";
import { Button } from "@/components/ui/button";
import DocumentsView from "@/components/files/DocumentsView";
import UploadDialog from "@/components/files/UploadDialog";
import ProjectFormDialog from "@/components/files/ProjectFormDialog";
import { EmptyState, inputCls, selectCls } from "@/components/files/ui";

const route = getRouteApi("/_authenticated/files/projects/$projectId");
type Tab = "files" | "team" | "activity";

export default function ProjectPage() {
  const { projectId } = route.useParams();
  const tx = useTx();
  const { lang } = useLang();
  const qc = useQueryClient();
  const { data: me } = useSuspenseQuery(meQuery());
  const { data } = useSuspenseQuery(projectQuery(projectId));
  const { data: docs } = useSuspenseQuery(documentsQuery({ projectId }));
  const { project, folders, members, myRole } = data;

  const canEdit = !!me?.isAdmin || myRole === "manager" || myRole === "editor";
  const canManage = !!me?.isAdmin || myRole === "manager";

  const [tab, setTab] = useState<Tab>("files");
  const [folderId, setFolderId] = useState<string | "all" | "root">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const childrenOf = useMemo(() => {
    const map = new Map<string | null, typeof folders>();
    for (const f of folders) {
      const key = f.parent_id ?? null;
      map.set(key, [...(map.get(key) ?? []), f]);
    }
    return map;
  }, [folders]);

  const descendantIds = useMemo(() => {
    if (folderId === "all" || folderId === "root") return null;
    const ids = new Set<string>([folderId]);
    const walk = (id: string) =>
      (childrenOf.get(id) ?? []).forEach((c) => (ids.add(c.id), walk(c.id)));
    walk(folderId);
    return ids;
  }, [folderId, childrenOf]);

  const visibleDocs = docs.filter((d) => {
    if (folderId === "root" && d.folder_id) return false;
    if (descendantIds && (!d.folder_id || !descendantIds.has(d.folder_id))) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return [d.title, d.doc_number, d.latest?.file_name, d.issuing_party, ...(d.tags ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  if (!project) {
    return (
      <EmptyState
        icon={<EyeOff className="w-6 h-6" />}
        title={tx("المشروع غير متاح", "Project not available")}
        body={tx(
          "قد لا يكون موجودًا أو لست عضوًا فيه.",
          "It may not exist or you're not a member.",
        )}
      />
    );
  }

  async function newFolder() {
    const name = window.prompt(tx("اسم المجلد الجديد", "New folder name"));
    if (!name?.trim()) return;
    const parent = folderId !== "all" && folderId !== "root" ? folderId : null;
    const { error } = await supabase
      .from("folders")
      .insert({ project_id: projectId, parent_id: parent, name: name.trim() });
    if (error) toast.error(error.message);
    else await qc.invalidateQueries({ queryKey: ["files", "project", projectId] });
  }

  async function renameFolder(id: string, current: string) {
    const name = window.prompt(tx("اسم المجلد", "Folder name"), current);
    if (!name?.trim() || name === current) return;
    const { error } = await supabase.from("folders").update({ name: name.trim() }).eq("id", id);
    if (error) toast.error(error.message);
    else await qc.invalidateQueries({ queryKey: ["files", "project", projectId] });
  }

  async function deleteFolder(id: string) {
    if (
      !window.confirm(
        tx(
          "حذف المجلد ومجلداته الفرعية؟ المستندات بداخله ستنتقل لجذر المشروع.",
          "Delete this folder and its sub-folders? Its documents move to the project root.",
        ),
      )
    )
      return;
    const { error } = await supabase.from("folders").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      setFolderId("all");
      await qc.invalidateQueries({ queryKey: ["files"] });
    }
  }

  function FolderNode({ id, name, depth }: { id: string; name: string; depth: number }) {
    const kids = childrenOf.get(id) ?? [];
    const active = folderId === id;
    return (
      <li>
        <div
          className={`group flex items-center gap-1.5 rounded-md h-8 pe-1 text-sm cursor-pointer ${active ? "bg-primary/10 text-primary" : "hover:bg-secondary/60"}`}
          style={{ paddingInlineStart: 8 + depth * 14 }}
          onClick={() => setFolderId(id)}
        >
          {active ? (
            <FolderOpen className="w-4 h-4 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate flex-1">{name}</span>
          {canEdit && (
            <span className="hidden group-hover:flex items-center">
              <button
                className="p-1 hover:text-primary"
                onClick={(e) => (e.stopPropagation(), renameFolder(id, name))}
                aria-label={tx("إعادة تسمية", "Rename")}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                className="p-1 hover:text-destructive"
                onClick={(e) => (e.stopPropagation(), deleteFolder(id))}
                aria-label={tx("حذف", "Delete")}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
        {kids.length > 0 && (
          <ul>
            {kids.map((k) => (
              <FolderNode key={k.id} id={k.id} name={k.name} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "files", label: tx("الملفات", "Files"), show: true },
    { id: "team", label: tx("الفريق", "Team"), show: !!me?.isStaff },
    { id: "activity", label: tx("سجل النشاط", "Activity"), show: canManage },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/files/projects"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {tx("المشروعات", "Projects")}
          </Link>
          <h1 className="text-2xl font-bold mt-1">{project.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {project.code && <span className="font-mono text-primary">{project.code}</span>}
            <span className="rounded-full border border-border px-2 py-0.5">
              {labelOf(PROJECT_STATUSES, project.status, lang)}
            </span>
            {project.client_name && (
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {project.client_name}
              </span>
            )}
            {project.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {project.location}
              </span>
            )}
          </div>
          {project.description && (
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> {tx("تعديل", "Edit")}
            </Button>
          )}
          {canEdit && (
            <Button onClick={() => setUploadOpen(true)}>
              <Upload /> {tx("رفع ملفات", "Upload files")}
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs
          .filter((t) => t.show)
          .map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-10 px-4 text-sm border-b-2 -mb-px transition-colors ${tab === t.id ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {tab === "files" && (
        <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
          <aside className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {tx("المجلدات", "Folders")}
              </span>
              {canEdit && (
                <button
                  onClick={newFolder}
                  className="p-1 text-muted-foreground hover:text-primary"
                  aria-label={tx("مجلد جديد", "New folder")}
                  title={tx("مجلد جديد", "New folder")}
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              )}
            </div>
            <ul className="space-y-0.5">
              <li
                onClick={() => setFolderId("all")}
                className={`flex items-center gap-1.5 rounded-md h-8 px-2 text-sm cursor-pointer ${folderId === "all" ? "bg-primary/10 text-primary" : "hover:bg-secondary/60"}`}
              >
                <Files className="w-4 h-4" /> {tx("كل الملفات", "All files")}
                <span className="ms-auto text-[11px] text-muted-foreground">{docs.length}</span>
              </li>
              <li
                onClick={() => setFolderId("root")}
                className={`flex items-center gap-1.5 rounded-md h-8 px-2 text-sm cursor-pointer ${folderId === "root" ? "bg-primary/10 text-primary" : "hover:bg-secondary/60"}`}
              >
                <ChevronDown className="w-4 h-4" /> {tx("جذر المشروع", "Project root")}
              </li>
              {(childrenOf.get(null) ?? []).map((f) => (
                <FolderNode key={f.id} id={f.id} name={f.name} depth={0} />
              ))}
            </ul>
          </aside>

          <section className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className={`${inputCls} ps-9`}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={tx(
                    "ابحث بالاسم أو رقم المستند أو الكلمات الدلالية",
                    "Search name, number or tags",
                  )}
                />
              </div>
              <ViewToggle view={view} onChange={setView} />
            </div>
            {visibleDocs.length > 0 ? (
              <DocumentsView docs={visibleDocs} view={view} showProject={false} />
            ) : (
              <EmptyState
                icon={<Files className="w-6 h-6" />}
                title={tx("لا توجد ملفات هنا", "No files here")}
                action={
                  canEdit ? (
                    <Button onClick={() => setUploadOpen(true)}>
                      <Upload /> {tx("رفع ملفات", "Upload files")}
                    </Button>
                  ) : undefined
                }
              />
            )}
          </section>
        </div>
      )}

      {tab === "team" && (
        <TeamPanel
          projectId={projectId}
          members={members}
          canManage={canManage}
          myId={me?.id ?? ""}
        />
      )}
      {tab === "activity" && canManage && <ActivityPanel projectId={projectId} />}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        projectId={projectId}
        folders={folders}
        defaultFolderId={folderId !== "all" && folderId !== "root" ? folderId : null}
        key={String(uploadOpen) + folderId}
      />
      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
    </div>
  );
}

export function ViewToggle({
  view,
  onChange,
}: {
  view: "grid" | "list";
  onChange: (v: "grid" | "list") => void;
}) {
  const tx = useTx();
  return (
    <div className="flex rounded-lg border border-border p-0.5">
      <button
        onClick={() => onChange("grid")}
        className={`p-2 rounded-md ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        aria-label={tx("عرض شبكي", "Grid view")}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={`p-2 rounded-md ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        aria-label={tx("عرض قائمة", "List view")}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

function TeamPanel({
  projectId,
  members,
  canManage,
  myId,
}: {
  projectId: string;
  members: {
    id: string;
    user_id: string;
    member_role: MemberRole;
    profile: {
      id: string;
      full_name: string | null;
      email: string | null;
      company: string | null;
    } | null;
  }[];
  canManage: boolean;
  myId: string;
}) {
  const tx = useTx();
  const { lang } = useLang();
  const qc = useQueryClient();
  const { data: people } = useQuery({ ...peopleQuery(), enabled: canManage });
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<MemberRole>("viewer");

  const refresh = () => qc.invalidateQueries({ queryKey: ["files"] });
  const candidates = (people ?? []).filter(
    (p) => !members.some((m) => m.user_id === p.id) && p.roles.length > 0,
  );

  async function add() {
    if (!userId) return;
    const person = people?.find((p) => p.id === userId);
    const finalRole: MemberRole =
      person && !person.roles.some((r) => r === "admin" || r === "staff") ? "client" : role;
    const { error } = await supabase
      .from("project_members")
      .insert({ project_id: projectId, user_id: userId, member_role: finalRole });
    if (error) toast.error(error.message);
    else {
      setUserId("");
      toast.success(tx("تمت إضافة العضو", "Member added"));
      await refresh();
    }
  }

  async function changeRole(id: string, r: MemberRole) {
    const { error } = await supabase
      .from("project_members")
      .update({ member_role: r })
      .eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  }

  async function remove(id: string) {
    if (!window.confirm(tx("إزالة العضو من المشروع؟", "Remove this member from the project?")))
      return;
    const { error } = await supabase.from("project_members").delete().eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {canManage && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card/50 p-4">
          <div className="flex-1 min-w-48">
            <span className="text-xs text-muted-foreground">{tx("إضافة عضو", "Add member")}</span>
            <select
              className={`${selectCls} mt-1`}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">{tx("— اختر حسابًا —", "— Choose an account —")}</option>
              {candidates.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email}{" "}
                  {p.roles.includes("client") ? `(${tx("عميل", "client")})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <span className="text-xs text-muted-foreground">
              {tx("الدور في المشروع", "Project role")}
            </span>
            <select
              className={`${selectCls} mt-1`}
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
            >
              {MEMBER_ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {lang === "ar" ? r.ar : r.en}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={add} disabled={!userId}>
            <UserPlus /> {tx("إضافة", "Add")}
          </Button>
          <p className="w-full text-[11px] text-muted-foreground">
            {tx(
              "حسابات العملاء تُضاف دائمًا بدور «عميل». الحسابات الجديدة تظهر هنا بعد أن يحدد مدير النظام نوعها.",
              "Client accounts are always added with the Client role. New accounts appear after an admin sets their type.",
            )}
          </p>
        </div>
      )}
      <ul className="divide-y divide-border rounded-xl border border-border bg-card/40">
        {members.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-secondary text-sm font-semibold">
              {(m.profile?.full_name || m.profile?.email || "?").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{m.profile?.full_name || m.profile?.email}</p>
              <p className="text-xs text-muted-foreground truncate" dir="ltr">
                {m.profile?.email}
                {m.profile?.company && ` · ${m.profile.company}`}
              </p>
            </div>
            {canManage && m.user_id !== myId ? (
              <>
                <select
                  className="h-8 rounded-md border border-input bg-background/60 px-2 text-xs"
                  value={m.member_role}
                  onChange={(e) => changeRole(m.id, e.target.value as MemberRole)}
                >
                  {MEMBER_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {lang === "ar" ? r.ar : r.en}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => remove(m.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive"
                  aria-label={tx("إزالة", "Remove")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                {labelOf(MEMBER_ROLES, m.member_role, lang)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityPanel({ projectId }: { projectId: string }) {
  const tx = useTx();
  const { lang } = useLang();
  const { data, isLoading } = useQuery(projectAuditQuery(projectId));
  if (isLoading) return <p className="text-sm text-muted-foreground">…</p>;
  if (!data || data.length === 0)
    return (
      <p className="text-sm text-muted-foreground">{tx("لا يوجد نشاط بعد.", "No activity yet.")}</p>
    );
  return (
    <ol className="max-w-3xl space-y-2">
      {data.map((e) => {
        const doc = e.document as { id: string; title: string } | null;
        return (
          <li
            key={e.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card/40 px-4 py-2.5 text-sm"
          >
            <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="font-medium">{AUDIT_LABELS[e.action]?.[lang] ?? e.action}</span>
              {doc && (
                <>
                  {" · "}
                  <Link
                    to="/files/documents/$documentId"
                    params={{ documentId: doc.id }}
                    className="text-primary hover:underline"
                  >
                    {doc.title}
                  </Link>
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDateTime(e.created_at, lang)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
