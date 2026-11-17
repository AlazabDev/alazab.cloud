import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Upload, XCircle, FileUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLang, useTx } from "@/lib/i18n";
import { ALLOWED_EXTENSIONS, DISCIPLINES, DOC_TYPES, formatBytes, isAllowedFile } from "@/lib/files/constants";
import { createDocumentWithFile } from "@/lib/files/upload";
import { Field, inputCls, selectCls, textareaCls } from "./ui";
import { AiSuggest } from "./AiSuggest";
import { DESCRIPTION_MAX, TITLE_MAX } from "@/lib/files/classify";

type Folder = { id: string; name: string; parent_id: string | null };
type Item = { file: File; state: "waiting" | "uploading" | "done" | "error"; error?: string };

export default function UploadDialog({
  open,
  onOpenChange,
  projectId,
  folders,
  defaultFolderId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  folders: Folder[];
  defaultFolderId: string | null;
}) {
  const tx = useTx();
  const { lang } = useLang();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [folderId, setFolderId] = useState<string>(defaultFolderId ?? "");
  const [docType, setDocType] = useState("shop_drawing");
  const [discipline, setDiscipline] = useState("architectural");
  const [title, setTitle] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [issuingParty, setIssuingParty] = useState("");
  const [revisionLabel, setRevisionLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [clientVisible, setClientVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: Item[] = [];
    for (const f of Array.from(list)) {
      if (!isAllowedFile(f.name)) {
        toast.error(tx(`صيغة غير مدعومة: ${f.name}`, `Unsupported format: ${f.name}`));
        continue;
      }
      next.push({ file: f, state: "waiting" });
    }
    setItems((prev) => [...prev, ...next]);
  }

  function reset() {
    setItems([]);
    setTitle("");
    setDocNumber("");
    setNotes("");
    setDescription("");
    setRevisionLabel("");
  }

  async function start() {
    if (items.length === 0) return;
    setBusy(true);
    let ok = 0;
    let failed = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i]!;
      if (it.state === "done") continue;
      setItems((prev) => prev.map((p, j) => (j === i ? { ...p, state: "uploading" } : p)));
      try {
        const single = items.length === 1;
        await createDocumentWithFile({
          projectId,
          folderId: folderId || null,
          file: it.file,
          title: single && title ? title : it.file.name.replace(/\.[^.]+$/, ""),
          docNumber: single ? docNumber : "",
          docType,
          discipline,
          issuingParty,
          description,
          clientVisible,
          revisionLabel,
          notes,
        });
        ok++;
        setItems((prev) => prev.map((p, j) => (j === i ? { ...p, state: "done" } : p)));
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        setItems((prev) => prev.map((p, j) => (j === i ? { ...p, state: "error", error: msg } : p)));
      }
    }
    setBusy(false);
    await qc.invalidateQueries({ queryKey: ["files"] });
    if (ok > 0) toast.success(tx(`تم رفع ${ok} ملف`, `${ok} file(s) uploaded`));
    if (failed === 0) {
      reset();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tx("رفع ملفات", "Upload files")}</DialogTitle>
          <DialogDescription>
            {tx(
              "كل ملف يصبح مستندًا مستقلًا بإصداره الأول. الملف الأصلي يُحفظ ولا يُستبدل أبدًا.",
              "Each file becomes its own document with a first revision. Originals are kept and never replaced.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
          }`}
        >
          <FileUp className="w-8 h-8 mx-auto text-primary" />
          <p className="mt-2 text-sm font-medium">{tx("اسحب الملفات هنا أو اضغط للاختيار", "Drop files here or click to choose")}</p>
          <p className="mt-1 text-[11px] text-muted-foreground uppercase">{ALLOWED_EXTENSIONS.join(" · ")}</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept={ALLOWED_EXTENSIONS.map((e) => "." + e).join(",")}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {items.length > 0 && (
          <ul className="space-y-1.5 max-h-40 overflow-y-auto">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-2 text-sm rounded-lg bg-secondary/40 px-3 py-2">
                {it.state === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                {it.state === "done" && <CheckCircle2 className="w-4 h-4 text-success" />}
                {it.state === "error" && <XCircle className="w-4 h-4 text-destructive" />}
                {it.state === "waiting" && <Upload className="w-4 h-4 text-muted-foreground" />}
                <span className="truncate flex-1">{it.file.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(it.file.size)}</span>
                {it.state === "waiting" && !busy && (
                  <button
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                )}
                {it.error && <span className="text-[11px] text-destructive truncate max-w-40" title={it.error}>{it.error}</span>}
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {items.length <= 1 && (
            <>
              <Field label={tx("عنوان المستند", "Document title")}>
                <input className={inputCls} value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder={items[0]?.file.name ?? ""} />
              </Field>
              <Field label={tx("رقم المستند", "Document number")}>
                <input className={inputCls} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="AZB-ARC-SD-001" dir="ltr" />
              </Field>
            </>
          )}
          <div className="sm:col-span-2">
            <Field
              label={tx("وصف المستند", "Document description")}
              hint={items.length > 1 ? tx("يُحفظ لكل الملفات المرفوعة معًا", "Saved on every file in this batch") : undefined}
            >
              <textarea
                className={textareaCls}
                value={description}
                maxLength={DESCRIPTION_MAX}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={tx("مثال: لوحة تسليح سقف الدور الأرضي – مبنى B، صادرة من المكتب الاستشاري", "e.g. Ground floor slab reinforcement – Building B, issued by the consultant")}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <AiSuggest
              title={title || (items.length === 1 ? (items[0]?.file.name.replace(/\.[^.]+$/, "") ?? "") : "")}
              description={description}
              projectId={projectId}
              onApply={(s) => {
                setDocType(s.docType);
                setDiscipline(s.discipline);
                if (s.issuingParty) setIssuingParty(s.issuingParty);
                toast.success(tx("تم تطبيق الاقتراح، راجعه قبل الرفع", "Suggestion applied — review it before uploading"));
              }}
            />
          </div>
          <Field label={tx("التصنيف", "Category")}>
            <select className={selectCls} value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {lang === "ar" ? t.ar : t.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tx("التخصص", "Discipline")}>
            <select className={selectCls} value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
              {DISCIPLINES.map((t) => (
                <option key={t.id} value={t.id}>
                  {lang === "ar" ? t.ar : t.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tx("المجلد", "Folder")}>
            <select className={selectCls} value={folderId} onChange={(e) => setFolderId(e.target.value)}>
              <option value="">{tx("— جذر المشروع —", "— Project root —")}</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tx("الجهة المُصدِرة", "Issuing party")}>
            <input className={inputCls} value={issuingParty} onChange={(e) => setIssuingParty(e.target.value)} placeholder={tx("مكتب التصميم / المقاول", "Designer / contractor")} />
          </Field>
          <Field label={tx("رمز المراجعة", "Revision label")} hint={tx("اتركه فارغًا ليُرقَّم تلقائيًا (R00)", "Leave empty for automatic (R00)")}>
            <input className={inputCls} value={revisionLabel} onChange={(e) => setRevisionLabel(e.target.value)} placeholder="R00" dir="ltr" />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2 cursor-pointer">
            <input type="checkbox" checked={clientVisible} onChange={(e) => setClientVisible(e.target.checked)} className="accent-primary w-4 h-4" />
            {tx("إتاحة للعميل (يظهر لعملاء هذا المشروع)", "Release to client (visible to this project's clients)")}
          </label>
          <div className="sm:col-span-2">
            <Field label={tx("ملاحظات الإصدار", "Revision notes")}>
              <textarea className={textareaCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {tx("إلغاء", "Cancel")}
          </Button>
          <Button onClick={start} disabled={busy || items.length === 0}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            {tx("رفع", "Upload")} {items.length > 0 && `(${items.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
