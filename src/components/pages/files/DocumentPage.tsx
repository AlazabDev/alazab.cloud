import { useState } from "react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  Check,
  Columns2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  History,
  Link2,
  Pencil,
  Share2,
  Upload,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang, useTx } from "@/lib/i18n";
import {
  AUDIT_LABELS,
  DISCIPLINES,
  DOC_TYPES,
  formatBytes,
  formatDate,
  formatDateTime,
  labelOf,
  shareState,
  type ApprovalStatus,
} from "@/lib/files/constants";
import { documentQuery, meQuery, type DocumentDetail } from "@/lib/files/queries";
import { Button } from "@/components/ui/button";
import FilePreview from "@/components/files/FilePreview";
import { EmptyState, StatusBadge } from "@/components/files/ui";
import { useSignedUrl } from "@/components/files/hooks";
import {
  ApprovalRequestDialog,
  DecisionDialog,
  EditDocumentDialog,
  NewVersionDialog,
  ShareDialog,
} from "@/components/files/DocumentDialogs";

const route = getRouteApi("/_authenticated/files/documents/$documentId");

export default function DocumentPage() {
  const { documentId } = route.useParams();
  const { data } = useSuspenseQuery(documentQuery(documentId));
  const tx = useTx();

  if (!data) {
    return (
      <EmptyState
        icon={<EyeOff className="w-6 h-6" />}
        title={tx("المستند غير متاح", "Document not available")}
        body={tx(
          "قد يكون المستند غير موجود أو ليست لديك صلاحية الاطلاع عليه.",
          "It may not exist, or you don't have access.",
        )}
        action={
          <Button asChild variant="outline">
            <Link to="/files/gallery">{tx("العودة للمعرض", "Back to gallery")}</Link>
          </Button>
        }
      />
    );
  }
  return <DocumentView key={documentId} data={data} />;
}

function DocumentView({ data }: { data: DocumentDetail }) {
  const { doc, versions, approvals, shares, audit, myRole } = data;
  const { data: me } = useSuspenseQuery(meQuery());
  const tx = useTx();
  const { lang, dir } = useLang();
  const qc = useQueryClient();
  const Chevron = dir === "rtl" ? ChevronLeft : ChevronRight;

  const canEdit = !!me?.isAdmin || myRole === "manager" || myRole === "editor";
  const canManage = !!me?.isAdmin || myRole === "manager";

  const [selectedId, setSelectedId] = useState<string | null>(versions[0]?.id ?? null);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "version" | "approval" | "share" | "edit">(null);
  const [decision, setDecision] = useState<{
    id: string;
    status: Exclude<ApprovalStatus, "pending">;
  } | null>(null);

  const selected = versions.find((v) => v.id === selectedId) ?? versions[0] ?? null;
  const compare = versions.find((v) => v.id === compareId) ?? null;
  const viewUrl = useSignedUrl(selected?.storage_path);
  const downloadUrl = useSignedUrl(selected?.storage_path, selected?.file_name);
  const compareUrl = useSignedUrl(compare?.storage_path);

  async function patchDoc(
    values: { client_visible?: boolean; archived_at?: string | null },
    okMsg: string,
  ) {
    const { error } = await supabase.from("documents").update(values).eq("id", doc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(okMsg);
    await qc.invalidateQueries({ queryKey: ["files"] });
  }

  async function revoke(id: string) {
    const { error } = await supabase
      .from("share_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(tx("تم إلغاء الرابط", "Link revoked"));
      await qc.invalidateQueries({ queryKey: ["files"] });
    }
  }

  const project = doc.project as { id: string; name: string; code: string | null } | null;
  const folder = doc.folder as { id: string; name: string } | null;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/files/projects" className="hover:text-foreground">
          {tx("المشروعات", "Projects")}
        </Link>
        <Chevron className="w-3 h-3" />
        {project && (
          <Link
            to="/files/projects/$projectId"
            params={{ projectId: project.id }}
            className="hover:text-foreground"
          >
            {project.name}
          </Link>
        )}
        {folder && (
          <>
            <Chevron className="w-3 h-3" />
            <span>{folder.name}</span>
          </>
        )}
      </nav>

      {doc.archived_at && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
          <span>
            {tx(
              `هذا المستند في الأرشيف منذ ${formatDate(doc.archived_at, lang)}`,
              `Archived on ${formatDate(doc.archived_at, lang)}`,
            )}
          </span>
          {canEdit && (
            <Button
              size="sm"
              onClick={() => patchDoc({ archived_at: null }, tx("تمت الاستعادة", "Restored"))}
            >
              <ArchiveRestore /> {tx("استعادة", "Restore")}
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-primary font-medium">
            {labelOf(DOC_TYPES, doc.doc_type, lang)} · {labelOf(DISCIPLINES, doc.discipline, lang)}
          </p>
          <h1 className="text-2xl font-bold mt-1 break-words">{doc.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {doc.doc_number && <span className="font-mono">{doc.doc_number}</span>}
            <StatusBadge status={doc.status} />
            {doc.client_visible ? (
              <span className="inline-flex items-center gap-1 text-xs">
                <Eye className="w-3.5 h-3.5" /> {tx("مرئي للعميل", "Visible to client")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs">
                <EyeOff className="w-3.5 h-3.5" /> {tx("داخلي فقط", "Internal only")}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {downloadUrl.data && (
            <Button asChild variant="secondary">
              <a href={downloadUrl.data}>
                <Download /> {tx("تنزيل", "Download")}
              </a>
            </Button>
          )}
          {canEdit && !doc.archived_at && (
            <>
              <Button onClick={() => setDialog("version")}>
                <Upload /> {tx("إصدار جديد", "New revision")}
              </Button>
              {selected && (
                <Button variant="secondary" onClick={() => setDialog("approval")}>
                  <FileCheck2 /> {tx("طلب اعتماد", "Request approval")}
                </Button>
              )}
              {selected && (
                <Button variant="secondary" onClick={() => setDialog("share")}>
                  <Share2 /> {tx("مشاركة", "Share")}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                title={tx("تعديل البيانات", "Edit details")}
                onClick={() => setDialog("edit")}
              >
                <Pencil />
              </Button>
              <Button
                variant="outline"
                size="icon"
                title={
                  doc.client_visible
                    ? tx("إخفاء عن العميل", "Hide from client")
                    : tx("إتاحة للعميل", "Release to client")
                }
                onClick={() =>
                  patchDoc(
                    { client_visible: !doc.client_visible },
                    doc.client_visible
                      ? tx("أصبح المستند داخليًا", "Now internal")
                      : tx("أصبح المستند متاحًا للعميل", "Released to client"),
                  )
                }
              >
                {doc.client_visible ? <EyeOff /> : <Eye />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                title={tx("أرشفة", "Archive")}
                onClick={() =>
                  patchDoc(
                    { archived_at: new Date().toISOString() },
                    tx("تم نقل المستند للأرشيف", "Archived"),
                  )
                }
              >
                <Archive />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        {/* Preview */}
        <section className="space-y-3 min-w-0">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {tx("الإصدار", "Revision")}{" "}
                  <span className="font-mono text-foreground">{selected.revision_label}</span> ·{" "}
                  {selected.file_name} · {formatBytes(selected.size_bytes)}
                </span>
                {versions.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Columns2 className="w-4 h-4 text-muted-foreground" />
                    <select
                      className="h-8 rounded-md border border-input bg-background/60 px-2 text-xs"
                      value={compareId ?? ""}
                      onChange={(e) => setCompareId(e.target.value || null)}
                    >
                      <option value="">{tx("مقارنة مع إصدار…", "Compare with…")}</option>
                      {versions
                        .filter((v) => v.id !== selected.id)
                        .map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.revision_label} · {formatDate(v.created_at, lang)}
                          </option>
                        ))}
                    </select>
                    {compareId && (
                      <button
                        onClick={() => setCompareId(null)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={tx("إغلاق المقارنة", "Close compare")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {compare ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-primary">{selected.revision_label}</p>
                    <FilePreview
                      fileName={selected.file_name}
                      url={viewUrl.data ?? null}
                      downloadUrl={downloadUrl.data ?? null}
                      className="h-[60vh]"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-muted-foreground">
                      {compare.revision_label}
                    </p>
                    <FilePreview
                      fileName={compare.file_name}
                      url={compareUrl.data ?? null}
                      className="h-[60vh]"
                    />
                  </div>
                </div>
              ) : (
                <FilePreview
                  fileName={selected.file_name}
                  url={viewUrl.data ?? null}
                  downloadUrl={downloadUrl.data ?? null}
                  className="h-[65vh]"
                />
              )}
              {selected.notes && (
                <p className="rounded-xl border border-border bg-card/50 p-3 text-sm">
                  {selected.notes}
                </p>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Upload className="w-6 h-6" />}
              title={tx("لا يوجد ملف لهذا المستند بعد", "No file yet")}
              action={
                canEdit ? (
                  <Button onClick={() => setDialog("version")}>
                    {tx("رفع ملف", "Upload file")}
                  </Button>
                ) : undefined
              }
            />
          )}
        </section>

        {/* Side panel */}
        <aside className="space-y-4">
          <Panel title={tx("بيانات المستند", "Metadata")}>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <Meta k={tx("المشروع", "Project")} v={project?.name} />
              <Meta k={tx("رقم المستند", "Doc no.")} v={doc.doc_number} mono />
              <Meta k={tx("الإصدار الحالي", "Current rev.")} v={versions[0]?.revision_label} mono />
              <Meta k={tx("الجهة المُصدِرة", "Issuing party")} v={doc.issuing_party} />
              <Meta k={tx("تاريخ الإنشاء", "Created")} v={formatDate(doc.created_at, lang)} />
              <Meta k={tx("آخر تحديث", "Updated")} v={formatDate(doc.updated_at, lang)} />
              {selected?.checksum && (
                <Meta
                  k="SHA-256"
                  v={selected.checksum.slice(0, 16) + "…"}
                  mono
                  title={selected.checksum}
                />
              )}
            </dl>
            {doc.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {doc.tags.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {doc.description && (
              <p className="mt-3 text-sm text-muted-foreground">{doc.description}</p>
            )}
          </Panel>

          <Panel title={tx("الإصدارات", "Revisions")} icon={<History className="w-4 h-4" />}>
            <ul className="space-y-1.5">
              {versions.map((v) => (
                <li key={v.id}>
                  <button
                    onClick={() => setSelectedId(v.id)}
                    className={`w-full text-start rounded-lg px-3 py-2 text-sm border transition-colors ${
                      v.id === selected?.id
                        ? "border-primary/60 bg-primary/10"
                        : "border-transparent hover:bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold">{v.revision_label}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(v.created_at, lang)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{v.file_name}</p>
                  </button>
                </li>
              ))}
              {versions.length === 0 && <li className="text-sm text-muted-foreground">—</li>}
            </ul>
          </Panel>

          <Panel title={tx("الاعتمادات", "Approvals")} icon={<FileCheck2 className="w-4 h-4" />}>
            {approvals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {tx("لا توجد طلبات اعتماد.", "No approval requests.")}
              </p>
            ) : (
              <ul className="space-y-3">
                {approvals.map((a) => {
                  const reviewer = a.reviewer as {
                    id: string;
                    full_name: string | null;
                    email: string | null;
                  } | null;
                  const version = a.version as {
                    revision_label: string | null;
                    version_number: number;
                  } | null;
                  const canDecide =
                    a.status === "pending" && (canManage || a.reviewer_id === me?.id);
                  return (
                    <li
                      key={a.id}
                      className="rounded-lg border border-border p-3 text-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs">{version?.revision_label}</span>
                        <StatusBadge status={a.status} kind="approval" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tx("المراجِع", "Reviewer")}:{" "}
                        {reviewer?.full_name ||
                          reviewer?.email ||
                          tx("مدير المشروع", "Project manager")}
                      </p>
                      {a.request_note && <p className="text-xs">{a.request_note}</p>}
                      {a.decision_note && (
                        <p className="text-xs border-s-2 border-primary ps-2">{a.decision_note}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {formatDateTime(a.created_at, lang)}
                        {a.decided_at && ` → ${formatDateTime(a.decided_at, lang)}`}
                      </p>
                      {canDecide && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <Button
                            size="sm"
                            onClick={() => setDecision({ id: a.id, status: "approved" })}
                          >
                            <Check /> {tx("اعتماد", "Approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setDecision({ id: a.id, status: "changes_requested" })}
                          >
                            <RotateCcw /> {tx("تعديلات", "Changes")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDecision({ id: a.id, status: "rejected" })}
                          >
                            <X /> {tx("رفض", "Reject")}
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {canEdit && (
            <Panel title={tx("روابط المشاركة", "Share links")} icon={<Link2 className="w-4 h-4" />}>
              {shares.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tx("لا توجد روابط.", "No links.")}</p>
              ) : (
                <ul className="space-y-2">
                  {shares.map((s) => {
                    const state = shareState(s);
                    return (
                      <li
                        key={s.id}
                        className="rounded-lg border border-border p-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">
                            {s.recipient || tx("بدون اسم", "Unnamed")}
                          </span>
                          <ShareStateBadge state={state} />
                        </div>
                        <p className="text-muted-foreground">
                          {tx("حتى", "Until")} {formatDateTime(s.expires_at, lang)} ·{" "}
                          {tx("مشاهدات", "views")}: {s.view_count}
                        </p>
                        {state === "active" && (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={async () => {
                                await navigator.clipboard.writeText(
                                  `${window.location.origin}/share/${s.token}`,
                                );
                                toast.success(tx("تم النسخ", "Copied"));
                              }}
                            >
                              <Copy /> {tx("نسخ", "Copy")}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => revoke(s.id)}>
                              {tx("إلغاء الرابط", "Revoke")}
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          )}

          {audit.length > 0 && (
            <Panel title={tx("سجل العمليات", "Activity log")}>
              <ol className="space-y-2 max-h-72 overflow-y-auto">
                {audit.map((e) => (
                  <li key={e.id} className="text-xs flex gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>
                      <span className="font-medium">
                        {AUDIT_LABELS[e.action]?.[lang] ?? e.action}
                      </span>
                      <span className="block text-muted-foreground">
                        {formatDateTime(e.created_at, lang)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
          )}
        </aside>
      </div>

      {project && (
        <>
          <NewVersionDialog
            open={dialog === "version"}
            onOpenChange={(v) => setDialog(v ? "version" : null)}
            projectId={project.id}
            documentId={doc.id}
          />
          {selected && (
            <ApprovalRequestDialog
              open={dialog === "approval"}
              onOpenChange={(v) => setDialog(v ? "approval" : null)}
              projectId={project.id}
              documentId={doc.id}
              versionId={selected.id}
              versionLabel={selected.revision_label ?? String(selected.version_number)}
            />
          )}
          <ShareDialog
            open={dialog === "share"}
            onOpenChange={(v) => setDialog(v ? "share" : null)}
            documentId={doc.id}
            versionId={selected?.id ?? null}
            projectId={project.id}
          />
        </>
      )}
      <EditDocumentDialog
        open={dialog === "edit"}
        onOpenChange={(v) => setDialog(v ? "edit" : null)}
        doc={doc}
      />
      {decision && (
        <DecisionDialog
          open={!!decision}
          onOpenChange={(v) => !v && setDecision(null)}
          approvalId={decision.id}
          decision={decision.status}
        />
      )}
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-3">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Meta({
  k,
  v,
  mono,
  title,
}: {
  k: string;
  v: string | null | undefined;
  mono?: boolean;
  title?: string;
}) {
  return (
    <>
      <dt className="text-muted-foreground text-xs pt-0.5">{k}</dt>
      <dd className={mono ? "font-mono text-xs pt-0.5 break-all" : ""} title={title}>
        {v || "—"}
      </dd>
    </>
  );
}

export function ShareStateBadge({ state }: { state: "active" | "expired" | "revoked" }) {
  const tx = useTx();
  const cls =
    state === "active"
      ? "bg-success/15 text-success border-success/40"
      : state === "expired"
        ? "bg-muted text-muted-foreground border-border"
        : "bg-destructive/15 text-destructive border-destructive/40";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {state === "active"
        ? tx("فعّال", "Active")
        : state === "expired"
          ? tx("منتهي", "Expired")
          : tx("ملغى", "Revoked")}
    </span>
  );
}
