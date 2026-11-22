import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET, type AppRole, type MemberRole } from "./constants";

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/* ---------- Current account ---------- */

export const meQuery = () =>
  queryOptions({
    queryKey: ["files", "me"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const [profile, roles] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(check),
        supabase.from("user_roles").select("role").eq("user_id", user.id).then(check),
      ]);
      const r = (roles ?? []).map((x) => x.role as AppRole);
      const isAdmin = r.includes("admin");
      const isStaff = isAdmin || r.includes("staff");
      return {
        id: user.id,
        email: user.email ?? "",
        profile,
        roles: r,
        isAdmin,
        isStaff,
        isClient: !isStaff && r.includes("client"),
        hasAccess: r.length > 0,
      };
    },
  });
export type Me = NonNullable<
  Awaited<ReturnType<NonNullable<ReturnType<typeof meQuery>["queryFn"]>>>
>;

/* ---------- Projects ---------- */

export const projectsQuery = () =>
  queryOptions({
    queryKey: ["files", "projects"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const [projects, mine] = await Promise.all([
        supabase
          .from("projects")
          .select("*, documents(count)")
          .order("updated_at", { ascending: false })
          .then(check),
        supabase
          .from("project_members")
          .select("project_id, member_role")
          .eq("user_id", user?.id ?? "")
          .then(check),
      ]);
      const roleBy = new Map((mine ?? []).map((m) => [m.project_id, m.member_role as MemberRole]));
      return (projects ?? []).map((p) => {
        const counts = p.documents as unknown as { count: number }[] | null;
        return { ...p, docCount: counts?.[0]?.count ?? 0, myRole: roleBy.get(p.id) ?? null };
      });
    },
  });
export type ProjectRow = Awaited<
  ReturnType<NonNullable<ReturnType<typeof projectsQuery>["queryFn"]>>
>[number];

export const projectQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["files", "project", projectId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const [project, folders, members] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).maybeSingle().then(check),
        supabase.from("folders").select("*").eq("project_id", projectId).order("name").then(check),
        supabase
          .from("project_members")
          .select("*, profile:profiles(id, full_name, email, company)")
          .eq("project_id", projectId)
          .order("created_at")
          .then(check),
      ]);
      const myRole = (members ?? []).find((m) => m.user_id === user?.id)?.member_role ?? null;
      return {
        project,
        folders: folders ?? [],
        members: members ?? [],
        myRole: myRole as MemberRole | null,
      };
    },
  });
export type ProjectDetail = Awaited<
  ReturnType<NonNullable<ReturnType<typeof projectQuery>["queryFn"]>>
>;

/* ---------- Documents ---------- */

const DOC_SELECT =
  "*, project:projects(id, name, code), document_versions(id, version_number, revision_label, file_name, mime_type, size_bytes, storage_path, created_at)";

function withLatest<T extends { document_versions: { version_number: number }[] | null }>(
  rows: T[],
) {
  type V = NonNullable<T["document_versions"]>[number];
  return rows.map((d) => {
    const versions = [...((d.document_versions ?? []) as V[])].sort(
      (a, b) => b.version_number - a.version_number,
    );
    return { ...d, latest: (versions[0] ?? null) as V | null, versionCount: versions.length };
  });
}

export const documentsQuery = (opts: { projectId?: string; archived?: boolean } = {}) =>
  queryOptions({
    queryKey: ["files", "documents", opts.projectId ?? "all", opts.archived ? "archived" : "live"],
    queryFn: async () => {
      let q = supabase
        .from("documents")
        .select(DOC_SELECT)
        .order("updated_at", { ascending: false })
        .limit(1000);
      if (opts.projectId) q = q.eq("project_id", opts.projectId);
      q = opts.archived ? q.not("archived_at", "is", null) : q.is("archived_at", null);
      const rows = check(await q);
      return withLatest(rows ?? []);
    },
  });
export type DocRow = Awaited<
  ReturnType<NonNullable<ReturnType<typeof documentsQuery>["queryFn"]>>
>[number];

export const documentQuery = (documentId: string) =>
  queryOptions({
    queryKey: ["files", "document", documentId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const doc = check(
        await supabase
          .from("documents")
          .select("*, project:projects(id, name, code, client_name), folder:folders(id, name)")
          .eq("id", documentId)
          .maybeSingle(),
      );
      if (!doc) return null;
      const [versions, approvals, shares, audit, membership] = await Promise.all([
        supabase
          .from("document_versions")
          .select("*")
          .eq("document_id", documentId)
          .order("version_number", { ascending: false })
          .then(check),
        supabase
          .from("approvals")
          .select(
            "*, reviewer:profiles(id, full_name, email), version:document_versions(version_number, revision_label)",
          )
          .eq("document_id", documentId)
          .order("created_at", { ascending: false })
          .then(check),
        supabase
          .from("share_links")
          .select("*")
          .eq("document_id", documentId)
          .order("created_at", { ascending: false })
          .then(check),
        supabase
          .from("audit_events")
          .select("*")
          .eq("document_id", documentId)
          .order("created_at", { ascending: false })
          .limit(100)
          .then(check),
        supabase
          .from("project_members")
          .select("member_role")
          .eq("project_id", doc.project_id)
          .eq("user_id", user?.id ?? "")
          .maybeSingle()
          .then(check),
      ]);
      return {
        doc,
        versions: versions ?? [],
        approvals: approvals ?? [],
        shares: shares ?? [],
        audit: audit ?? [],
        myRole: (membership?.member_role ?? null) as MemberRole | null,
      };
    },
  });
export type DocumentDetail = NonNullable<
  Awaited<ReturnType<NonNullable<ReturnType<typeof documentQuery>["queryFn"]>>>
>;

/* ---------- Approvals & shares ---------- */

export const approvalsQuery = () =>
  queryOptions({
    queryKey: ["files", "approvals"],
    queryFn: async () =>
      check(
        await supabase
          .from("approvals")
          .select(
            "*, document:documents(id, title, doc_number, project:projects(id, name)), version:document_versions(version_number, revision_label, file_name), reviewer:profiles(id, full_name, email)",
          )
          .order("created_at", { ascending: false })
          .limit(500),
      ) ?? [],
  });

export const sharesQuery = () =>
  queryOptions({
    queryKey: ["files", "shares"],
    queryFn: async () =>
      check(
        await supabase
          .from("share_links")
          .select("*, document:documents(id, title, doc_number, project:projects(id, name))")
          .order("created_at", { ascending: false })
          .limit(500),
      ) ?? [],
  });

/* ---------- People ---------- */

export const peopleQuery = () =>
  queryOptions({
    queryKey: ["files", "people"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at").then(check),
        supabase.from("user_roles").select("*").then(check),
      ]);
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
      }));
    },
  });

export const projectAuditQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["files", "audit", projectId],
    queryFn: async () =>
      check(
        await supabase
          .from("audit_events")
          .select("*, document:documents(id, title)")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(200),
      ) ?? [],
  });

/* ---------- Signed thumbnails for image files ---------- */

export const thumbsQuery = (paths: string[]) =>
  queryOptions({
    queryKey: ["files", "thumbs", paths],
    staleTime: 50 * 60 * 1000,
    enabled: paths.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const item of data ?? [])
        if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
      return map;
    },
  });
