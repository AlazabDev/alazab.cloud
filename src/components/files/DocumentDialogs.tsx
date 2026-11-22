import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Copy, FileUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLang, useTx } from "@/lib/i18n";
import {
  ALLOWED_EXTENSIONS,
  DISCIPLINES,
  DOC_STATUSES,
  DOC_TYPES,
  MEMBER_ROLES,
  formatBytes,
  isAllowedFile,
  labelOf,
  type ApprovalStatus,
  type DocumentStatus,
} from "@/lib/files/constants";
import { projectQuery } from "@/lib/files/queries";
import { uploadVersion } from "@/lib/files/upload";
import { Field, inputCls, selectCls, textareaCls } from "./ui";
import { AiSuggest } from "./AiSuggest";

type OpenProps = { open: boolean; onOpenChange: (v: boolean) => void };

function useRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["files"] });
}

/* ---------- New revision ---------- */
export function NewVersionDialog({
  open,
  onOpenChange,
  projectId,
  documentId,
}: OpenProps & { projectId: string; documentId: string }) {
  const tx = useTx();
  const refresh = useRefresh();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setFile(null);
      setLabel("");
      setNotes("");
    }
  }, [open]);

  async function submit() {
    if (!file) return;
    if (!isAllowedFile(file.name)) {
      toast.error(tx("صيغة غير مدعومة", "Unsupported format"));
      return;
    }
    setBusy(true);
    try {
      await uploadVersion({ projectId, documentId, file, revisionLabel: label, notes });
      toast.success(tx("تم رفع الإصدار الجديد", "New revision uploaded"));
      await refresh();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("رفع إصدار جديد", "Upload new revision")}</DialogTitle>
          <DialogDescription>
            {tx(
              "الإصدارات السابقة تبقى محفوظة كما هي مع قرارات اعتمادها.",
              "Earlier revisions stay untouched with their approval decisions.",
            )}
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border-2 border-dashed border-border hover:border-primary/60 p-5 text-center"
        >
          <FileUp className="w-7 h-7 mx-auto text-primary" />
          <p className="mt-2 text-sm">
            {file ? `${file.name} · ${formatBytes(file.size)}` : tx("اختر الملف", "Choose file")}
          </p>
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_EXTENSIONS.map((e) => "." + e).join(",")}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Field
          label={tx("رمز المراجعة", "Revision label")}
          hint={tx("فارغ = ترقيم تلقائي", "Empty = automatic")}
        >
          <input
            className={inputCls}
            dir="ltr"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="R01"
          />
        </Field>
        <Field label={tx("ما الذي تغيّر؟", "What changed?")}>
          <textarea
            className={textareaCls}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {tx("إلغاء", "Cancel")}
          </Button>
          <Button onClick={submit} disabled={!file || busy}>
            {busy && <Loader2 className="animate-spin" />}
            {tx("رفع", "Upload")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Request approval ---------- */
export function ApprovalRequestDialog({
  open,
  onOpenChange,
  projectId,
  documentId,
  versionId,
  versionLabel,
}: OpenProps & { projectId: string; documentId: string; versionId: string; versionLabel: string }) {
  const tx = useTx();
  const { lang } = useLang();
  const refresh = useRefresh();
  const { data } = useQuery({ ...projectQuery(projectId), enabled: open });
  const [reviewer, setReviewer] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const { error } = await supabase.from("approvals").insert({
      document_id: documentId,
      version_id: versionId,
      project_id: projectId,
      reviewer_id: reviewer || null,
      request_note: note.trim() || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(tx("تم إرسال طلب الاعتماد", "Approval requested"));
    setNote("");
    setReviewer("");
    await refresh();
    onOpenChange(false);
  }

  const reviewerRole = data?.members.find((m) => m.user_id === reviewer)?.member_role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("طلب اعتماد", "Request approval")}</DialogTitle>
          <DialogDescription>
            {tx(`للإصدار ${versionLabel}`, `For revision ${versionLabel}`)}
          </DialogDescription>
        </DialogHeader>
        <Field
          label={tx("المراجِع", "Reviewer")}
          hint={tx(
            "اتركه فارغًا ليقرر أي مدير للمشروع",
            "Leave empty so any project manager can decide",
          )}
        >
          <select
            className={selectCls}
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
          >
            <option value="">{tx("— مدير المشروع —", "— Project manager —")}</option>
            {data?.members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.profile?.full_name || m.profile?.email || m.user_id} ·{" "}
                {labelOf(MEMBER_ROLES, m.member_role, lang)}
              </option>
            ))}
          </select>
        </Field>
        {reviewerRole === "client" && (
          <p className="text-xs text-primary">
            {tx(
              "سيصبح المستند مرئيًا لهذا العميل حتى يتمكن من المراجعة.",
              "The document will be released to this client so they can review it.",
            )}
          </p>
        )}
        <Field label={tx("ملاحظة للمراجِع", "Note for the reviewer")}>
          <textarea
            className={textareaCls}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tx("إلغاء", "Cancel")}
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {tx("إرسال الطلب", "Send request")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Approval decision ---------- */
export function DecisionDialog({
  open,
  onOpenChange,
  approvalId,
  decision,
}: OpenProps & { approvalId: string; decision: Exclude<ApprovalStatus, "pending"> }) {
  const tx = useTx();
  const refresh = useRefresh();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const title =
    decision === "approved"
      ? tx("اعتماد الإصدار", "Approve revision")
      : decision === "rejected"
        ? tx("رفض الإصدار", "Reject revision")
        : tx("طلب تعديلات", "Request changes");

  async function submit() {
    setBusy(true);
    const { data, error } = await supabase
      .from("approvals")
      .update({ status: decision, decision_note: note.trim() || null })
      .eq("id", approvalId)
      .select("id");
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data || data.length === 0) {
      toast.error(tx("ليست لديك صلاحية البت في هذا الطلب", "You can't decide on this request"));
      return;
    }
    toast.success(tx("تم تسجيل القرار", "Decision recorded"));
    setNote("");
    await refresh();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Field label={tx("ملاحظات القرار", "Decision notes")}>
          <textarea
            className={textareaCls}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required={decision !== "approved"}
          />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tx("إلغاء", "Cancel")}
          </Button>
          <Button
            variant={decision === "rejected" ? "destructive" : "default"}
            onClick={submit}
            disabled={busy || (decision !== "approved" && !note.trim())}
          >
            {busy && <Loader2 className="animate-spin" />}
            {tx("تأكيد", "Confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Share link ---------- */
export function ShareDialog({
  open,
  onOpenChange,
  documentId,
  versionId,
  projectId,
}: OpenProps & { documentId: string; versionId: string | null; projectId: string }) {
  const tx = useTx();
  const refresh = useRefresh();
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");
  const [days, setDays] = useState("7");
  const [pinVersion, setPinVersion] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setLink(null);
      setCopied(false);
    }
  }, [open]);

  async function submit() {
    setBusy(true);
    const expires = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("share_links")
      .insert({
        document_id: documentId,
        project_id: projectId,
        version_id: pinVersion ? versionId : null,
        recipient: recipient.trim() || null,
        note: note.trim() || null,
        allow_download: allowDownload,
        expires_at: expires,
      })
      .select("token")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLink(`${window.location.origin}/share/${data.token}`);
    await refresh();
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success(tx("تم نسخ الرابط", "Link copied"));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tx("مشاركة مع جهة خارجية", "Share externally")}</DialogTitle>
          <DialogDescription>
            {tx(
              "رابط مقيد بمدة، يمكن إلغاؤه في أي وقت، وكل فتح له يُسجَّل.",
              "A time-limited link you can revoke anytime; every open is logged.",
            )}
          </DialogDescription>
        </DialogHeader>
        {link ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                readOnly
                dir="ltr"
                value={link}
                className={`${inputCls} font-mono text-xs`}
                onFocus={(e) => e.target.select()}
              />
              <Button onClick={copy} variant="secondary">
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>{tx("تم", "Done")}</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <Field label={tx("المستفيد", "Recipient")}>
              <input
                className={inputCls}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={tx("مثال: استشاري المشروع", "e.g. Project consultant")}
              />
            </Field>
            <Field label={tx("مدة الصلاحية", "Valid for")}>
              <select className={selectCls} value={days} onChange={(e) => setDays(e.target.value)}>
                <option value="1">{tx("يوم واحد", "1 day")}</option>
                <option value="3">{tx("3 أيام", "3 days")}</option>
                <option value="7">{tx("أسبوع", "1 week")}</option>
                <option value="30">{tx("30 يومًا", "30 days")}</option>
              </select>
            </Field>
            <Field label={tx("رسالة تظهر للمستفيد", "Message for the recipient")}>
              <textarea
                className={textareaCls}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="accent-primary w-4 h-4"
                checked={pinVersion}
                onChange={(e) => setPinVersion(e.target.checked)}
              />
              {tx(
                "مشاركة هذا الإصدار تحديدًا (وليس أحدث إصدار دائمًا)",
                "Share this exact revision (not always the latest)",
              )}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="accent-primary w-4 h-4"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
              />
              {tx("السماح بالتنزيل", "Allow download")}
            </label>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {tx("إلغاء", "Cancel")}
              </Button>
              <Button onClick={submit} disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                {tx("إنشاء الرابط", "Create link")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Edit details ---------- */
type DocEditable = {
  id: string;
  project_id?: string;
  title: string;
  doc_number: string | null;
  doc_type: string;
  discipline: string;
  issuing_party: string | null;
  description: string | null;
  status: DocumentStatus;
  tags: string[];
};

export function EditDocumentDialog({ open, onOpenChange, doc }: OpenProps & { doc: DocEditable }) {
  const tx = useTx();
  const { lang } = useLang();
  const refresh = useRefresh();
  const [f, setF] = useState({ ...doc, tagsText: doc.tags.join("، ") });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setF({ ...doc, tagsText: doc.tags.join("، ") });
  }, [open, doc]);

  async function save() {
    setBusy(true);
    const { error } = await supabase
      .from("documents")
      .update({
        title: f.title.trim() || doc.title,
        doc_number: f.doc_number?.trim() || null,
        doc_type: f.doc_type,
        discipline: f.discipline,
        issuing_party: f.issuing_party?.trim() || null,
        description: f.description?.trim() || null,
        status: f.status,
        tags: f.tagsText
          .split(/[,،]/)
          .map((t) => t.trim())
          .filter(Boolean),
      })
      .eq("id", doc.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(tx("تم حفظ البيانات", "Details saved"));
    await refresh();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tx("بيانات المستند", "Document details")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={tx("العنوان", "Title")}>
              <input
                className={inputCls}
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
            </Field>
          </div>
          <Field label={tx("رقم المستند", "Doc number")}>
            <input
              className={inputCls}
              dir="ltr"
              value={f.doc_number ?? ""}
              onChange={(e) => setF({ ...f, doc_number: e.target.value })}
            />
          </Field>
          <Field label={tx("الحالة", "Status")}>
            <select
              className={selectCls}
              value={f.status}
              onChange={(e) => setF({ ...f, status: e.target.value as DocumentStatus })}
            >
              {DOC_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === "ar" ? s.ar : s.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tx("التصنيف", "Category")}>
            <select
              className={selectCls}
              value={f.doc_type}
              onChange={(e) => setF({ ...f, doc_type: e.target.value })}
            >
              {DOC_TYPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === "ar" ? s.ar : s.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tx("التخصص", "Discipline")}>
            <select
              className={selectCls}
              value={f.discipline}
              onChange={(e) => setF({ ...f, discipline: e.target.value })}
            >
              {DISCIPLINES.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === "ar" ? s.ar : s.en}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label={tx("الجهة المُصدِرة", "Issuing party")}>
              <input
                className={inputCls}
                value={f.issuing_party ?? ""}
                onChange={(e) => setF({ ...f, issuing_party: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label={tx("كلمات دلالية (مفصولة بفاصلة)", "Tags (comma separated)")}>
              <input
                className={inputCls}
                value={f.tagsText}
                onChange={(e) => setF({ ...f, tagsText: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label={tx("الوصف", "Description")}>
              <textarea
                className={textareaCls}
                value={f.description ?? ""}
                onChange={(e) => setF({ ...f, description: e.target.value })}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <AiSuggest
              title={f.title}
              description={f.description ?? ""}
              projectId={doc.project_id ?? null}
              onApply={(s) =>
                setF((prev) => ({
                  ...prev,
                  doc_type: s.docType,
                  discipline: s.discipline,
                  issuing_party: s.issuingParty ?? prev.issuing_party,
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tx("إلغاء", "Cancel")}
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {tx("حفظ", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
