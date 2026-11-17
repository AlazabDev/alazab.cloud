import { supabase } from "@/integrations/supabase/client";
import { BUCKET, isAllowedFile, safeStorageName } from "./constants";

export async function sha256Hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export class UploadError extends Error {}

/** Uploads one file as a new immutable revision of an existing document. */
export async function uploadVersion(opts: {
  projectId: string;
  documentId: string;
  file: File;
  revisionLabel?: string;
  notes?: string;
}) {
  const { projectId, documentId, file } = opts;
  if (!isAllowedFile(file.name)) throw new UploadError("unsupported");
  if (file.size === 0) throw new UploadError("empty");

  const checksum = await sha256Hex(file);
  const path = `${projectId}/${documentId}/${crypto.randomUUID()}-${safeStorageName(file.name)}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) throw new UploadError(upErr.message);

  const { data, error } = await supabase
    .from("document_versions")
    .insert({
      document_id: documentId,
      project_id: projectId,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      checksum,
      revision_label: opts.revisionLabel?.trim() || null,
      notes: opts.notes?.trim() || null,
    })
    .select()
    .single();
  if (error) throw new UploadError(error.message);
  return data;
}

/** Creates a document record and uploads its first revision. */
export async function createDocumentWithFile(opts: {
  projectId: string;
  folderId: string | null;
  file: File;
  title: string;
  docNumber: string;
  docType: string;
  discipline: string;
  issuingParty: string;
  description?: string;
  clientVisible: boolean;
  revisionLabel: string;
  notes: string;
}) {
  if (!isAllowedFile(opts.file.name)) throw new UploadError("unsupported");
  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      project_id: opts.projectId,
      folder_id: opts.folderId,
      title: opts.title.trim() || opts.file.name,
      doc_number: opts.docNumber.trim() || null,
      doc_type: opts.docType,
      discipline: opts.discipline,
      issuing_party: opts.issuingParty.trim() || null,
      description: opts.description?.trim() || null,
      client_visible: opts.clientVisible,
    })
    .select()
    .single();
  if (error) throw new UploadError(error.message);

  await uploadVersion({
    projectId: opts.projectId,
    documentId: doc.id,
    file: opts.file,
    revisionLabel: opts.revisionLabel,
    notes: opts.notes,
  });
  return doc;
}

export async function signedUrl(path: string, opts?: { download?: string }) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60, opts?.download ? { download: opts.download } : undefined);
  if (error) throw error;
  return data.signedUrl;
}
