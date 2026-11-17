import type { Database } from "@/integrations/supabase/types";

export type DocumentStatus = Database["public"]["Enums"]["document_status"];
export type ApprovalStatus = Database["public"]["Enums"]["approval_status"];
export type MemberRole = Database["public"]["Enums"]["project_member_role"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export const BUCKET = "project-files";

type Labeled = { id: string; ar: string; en: string };

/** Gallery categories, matching the cards in the implementation plan. */
export const DOC_TYPES: Labeled[] = [
  { id: "shop_drawing", ar: "المخططات التنفيذية", en: "Shop Drawings" },
  { id: "render_3d", ar: "معاينة التصميم", en: "3D Render" },
  { id: "product", ar: "الوحدات المصنعة", en: "Product Gallery" },
  { id: "construction_doc", ar: "الوثائق الإنشائية", en: "Construction Documents" },
  { id: "document", ar: "المستندات الفنية", en: "Documents" },
  { id: "model_3d", ar: "نماذج ثلاثية الأبعاد", en: "3D Models" },
  { id: "site_photo", ar: "صور الموقع", en: "Site Photos" },
  { id: "other", ar: "أخرى", en: "Other" },
];

export const DISCIPLINES: Labeled[] = [
  { id: "architectural", ar: "معماري", en: "Architectural" },
  { id: "structural", ar: "إنشائي", en: "Structural" },
  { id: "mep", ar: "كهروميكانيك", en: "MEP" },
  { id: "interior", ar: "تصميم داخلي", en: "Interior" },
  { id: "landscape", ar: "تنسيق موقع", en: "Landscape" },
  { id: "general", ar: "عام", en: "General" },
];

export const DOC_STATUSES: { id: DocumentStatus; ar: string; en: string }[] = [
  { id: "draft", ar: "مسودة", en: "Draft" },
  { id: "in_review", ar: "قيد المراجعة", en: "In review" },
  { id: "approved", ar: "معتمد", en: "Approved" },
  { id: "rejected", ar: "مرفوض", en: "Rejected" },
  { id: "superseded", ar: "مُلغى بإصدار أحدث", en: "Superseded" },
];

export const APPROVAL_STATUSES: { id: ApprovalStatus; ar: string; en: string }[] = [
  { id: "pending", ar: "بانتظار القرار", en: "Pending" },
  { id: "approved", ar: "معتمد", en: "Approved" },
  { id: "rejected", ar: "مرفوض", en: "Rejected" },
  { id: "changes_requested", ar: "مطلوب تعديلات", en: "Changes requested" },
];

export const MEMBER_ROLES: { id: MemberRole; ar: string; en: string }[] = [
  { id: "manager", ar: "مدير المشروع", en: "Project manager" },
  { id: "editor", ar: "محرر (رفع ملفات)", en: "Editor (uploads)" },
  { id: "viewer", ar: "مشاهد", en: "Viewer" },
  { id: "client", ar: "عميل", en: "Client" },
];

export const PROJECT_STATUSES: Labeled[] = [
  { id: "active", ar: "جاري", en: "Active" },
  { id: "on_hold", ar: "متوقف مؤقتًا", en: "On hold" },
  { id: "completed", ar: "مكتمل", en: "Completed" },
];

export function labelOf(list: Labeled[] | { id: string; ar: string; en: string }[], id: string | null | undefined, lang: "ar" | "en") {
  const item = list.find((x) => x.id === id);
  if (!item) return id ?? "";
  return lang === "ar" ? item.ar : item.en;
}

/* ---------- File formats (from the plan's target formats) ---------- */

export type FileKind = "image" | "pdf" | "video" | "office" | "model3d" | "model3d_raw" | "cad" | "other";

const KIND_BY_EXT: Record<string, FileKind> = {
  jpg: "image", jpeg: "image", png: "image", webp: "image", svg: "image", gif: "image",
  pdf: "pdf",
  mp4: "video", webm: "video", mov: "video",
  doc: "office", docx: "office", xls: "office", xlsx: "office", ppt: "office", pptx: "office",
  glb: "model3d", gltf: "model3d",
  obj: "model3d_raw", stl: "model3d_raw",
  dwg: "cad", dxf: "cad", ifc: "cad", rvt: "cad",
  txt: "other", csv: "other", zip: "other",
};

/** Extensions the gallery accepts for upload. */
export const ALLOWED_EXTENSIONS = Object.keys(KIND_BY_EXT);

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function fileKind(name: string): FileKind {
  return KIND_BY_EXT[fileExtension(name)] ?? "other";
}

export function isAllowedFile(name: string): boolean {
  return fileExtension(name) in KIND_BY_EXT;
}

/** Kinds the browser can show directly (others need download or a specialised viewer). */
export function hasDirectPreview(name: string): boolean {
  const k = fileKind(name);
  return k === "image" || k === "pdf" || k === "video" || k === "office" || k === "model3d";
}

/** Storage keys must be plain ASCII; the original name is kept in the database. */
export function safeStorageName(name: string): string {
  const ext = fileExtension(name);
  const base = (ext ? name.slice(0, -(ext.length + 1)) : name)
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
  return `${base || "file"}${ext ? "." + ext : ""}`;
}

export function formatBytes(bytes: number | null | undefined): string {
  const b = bytes ?? 0;
  if (b < 1024) return `${b} B`;
  const units = ["KB", "MB", "GB"];
  let v = b / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string | null | undefined, lang: "ar" | "en"): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string | null | undefined, lang: "ar" | "en"): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type ShareState = "active" | "expired" | "revoked";
export function shareState(link: { expires_at: string; revoked_at: string | null }, now = new Date()): ShareState {
  if (link.revoked_at) return "revoked";
  if (new Date(link.expires_at) <= now) return "expired";
  return "active";
}

export const AUDIT_LABELS: Record<string, { ar: string; en: string }> = {
  document_created: { ar: "إنشاء مستند", en: "Document created" },
  document_updated: { ar: "تعديل بيانات المستند", en: "Document details edited" },
  document_archived: { ar: "نقل إلى الأرشيف", en: "Archived" },
  document_restored: { ar: "استعادة من الأرشيف", en: "Restored" },
  status_changed: { ar: "تغيير الحالة", en: "Status changed" },
  released_to_client: { ar: "إتاحة للعميل", en: "Released to client" },
  hidden_from_client: { ar: "إخفاء عن العميل", en: "Hidden from client" },
  version_uploaded: { ar: "رفع إصدار", en: "Version uploaded" },
  approval_requested: { ar: "طلب اعتماد", en: "Approval requested" },
  approval_approved: { ar: "اعتماد", en: "Approved" },
  approval_rejected: { ar: "رفض", en: "Rejected" },
  approval_changes_requested: { ar: "طلب تعديلات", en: "Changes requested" },
  share_created: { ar: "إنشاء رابط مشاركة", en: "Share link created" },
  share_revoked: { ar: "إلغاء رابط مشاركة", en: "Share link revoked" },
  share_viewed: { ar: "فتح رابط مشاركة", en: "Share link opened" },
};
