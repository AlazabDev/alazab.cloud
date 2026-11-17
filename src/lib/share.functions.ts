import { createServerFn } from "@tanstack/react-start";

export type SharePayload =
  | { status: "not_found" | "revoked" | "expired" }
  | {
      status: "ok";
      title: string;
      docNumber: string | null;
      docType: string;
      projectName: string | null;
      recipient: string | null;
      note: string | null;
      expiresAt: string;
      allowDownload: boolean;
      revisionLabel: string | null;
      versionNumber: number;
      fileName: string;
      sizeBytes: number;
      viewUrl: string;
      downloadUrl: string | null;
    };

/**
 * Public: resolves an external share link. Anyone with the token may call it, so it
 * checks expiry/revocation itself and returns only the shared file, with short-lived URLs.
 */
export const resolveShare = createServerFn({ method: "GET" })
  .inputValidator((input: { token: string }) => {
    if (typeof input?.token !== "string" || !/^[a-f0-9]{64}$/.test(input.token)) {
      return { token: "" };
    }
    return { token: input.token };
  })
  .handler(async ({ data }): Promise<SharePayload> => {
    if (!data.token) return { status: "not_found" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: link } = await supabaseAdmin
      .from("share_links")
      .select("id, document_id, version_id, project_id, recipient, note, allow_download, expires_at, revoked_at, view_count")
      .eq("token", data.token)
      .maybeSingle();
    if (!link) return { status: "not_found" };
    if (link.revoked_at) return { status: "revoked" };
    if (new Date(link.expires_at) <= new Date()) return { status: "expired" };

    const { data: doc } = await supabaseAdmin
      .from("documents")
      .select("title, doc_number, doc_type, project:projects(name)")
      .eq("id", link.document_id)
      .maybeSingle();
    if (!doc) return { status: "not_found" };

    let versionQuery = supabaseAdmin
      .from("document_versions")
      .select("version_number, revision_label, file_name, size_bytes, storage_path")
      .eq("document_id", link.document_id);
    versionQuery = link.version_id
      ? versionQuery.eq("id", link.version_id)
      : versionQuery.order("version_number", { ascending: false }).limit(1);
    const { data: versions } = await versionQuery;
    const version = versions?.[0];
    if (!version) return { status: "not_found" };

    const bucket = supabaseAdmin.storage.from("project-files");
    const { data: view } = await bucket.createSignedUrl(version.storage_path, 15 * 60);
    const download = link.allow_download
      ? (await bucket.createSignedUrl(version.storage_path, 15 * 60, { download: version.file_name })).data
      : null;
    if (!view) return { status: "not_found" };

    await supabaseAdmin
      .from("share_links")
      .update({ view_count: link.view_count + 1, last_viewed_at: new Date().toISOString() })
      .eq("id", link.id);
    await supabaseAdmin.from("audit_events").insert({
      project_id: link.project_id,
      document_id: link.document_id,
      action: "share_viewed",
      details: { recipient: link.recipient },
    });

    const project = doc.project as unknown as { name: string } | null;
    return {
      status: "ok",
      title: doc.title,
      docNumber: doc.doc_number,
      docType: doc.doc_type,
      projectName: project?.name ?? null,
      recipient: link.recipient,
      note: link.note,
      expiresAt: link.expires_at,
      allowDownload: link.allow_download,
      revisionLabel: version.revision_label,
      versionNumber: version.version_number,
      fileName: version.file_name,
      sizeBytes: version.size_bytes,
      viewUrl: view.signedUrl,
      downloadUrl: download?.signedUrl ?? null,
    };
  });
