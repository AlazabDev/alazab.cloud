import type { ReactNode } from "react";
import {
  FileImage,
  FileText,
  FileVideo,
  FileSpreadsheet,
  Box,
  DraftingCompass,
  File as FileIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  APPROVAL_STATUSES,
  DOC_STATUSES,
  fileExtension,
  fileKind,
  labelOf,
  type ApprovalStatus,
  type DocumentStatus,
} from "@/lib/files/constants";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  in_review: "bg-accent/15 text-accent-foreground border-accent/40",
  pending: "bg-accent/15 text-accent-foreground border-accent/40",
  approved: "bg-success/15 text-success border-success/40",
  rejected: "bg-destructive/15 text-destructive border-destructive/40",
  changes_requested: "bg-primary/15 text-primary border-primary/40",
  superseded: "bg-muted text-muted-foreground border-border line-through",
};

export function StatusBadge({
  status,
  kind = "document",
}: {
  status: DocumentStatus | ApprovalStatus;
  kind?: "document" | "approval";
}) {
  const { lang } = useLang();
  const label = labelOf(kind === "approval" ? APPROVAL_STATUSES : DOC_STATUSES, status, lang);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        STATUS_TONE[status],
      )}
    >
      {label}
    </span>
  );
}

export function KindIcon({
  fileName,
  className,
}: {
  fileName: string | null | undefined;
  className?: string;
}) {
  const name = fileName ?? "";
  const kind = fileKind(name);
  const ext = fileExtension(name);
  const cls = cn("w-5 h-5", className);
  if (kind === "image") return <FileImage className={cls} />;
  if (kind === "video") return <FileVideo className={cls} />;
  if (kind === "model3d" || kind === "model3d_raw") return <Box className={cls} />;
  if (kind === "cad") return <DraftingCompass className={cls} />;
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return <FileSpreadsheet className={cls} />;
  if (kind === "pdf" || kind === "office") return <FileText className={cls} />;
  return <FileIcon className={cls} />;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body?: string | undefined;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-6 border border-dashed border-border rounded-2xl bg-card/30">
      <div className="mx-auto w-12 h-12 grid place-items-center rounded-xl bg-secondary text-primary">
        {icon}
      </div>
      <p className="mt-4 font-medium">{title}</p>
      {body && <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string | undefined;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full h-10 rounded-lg border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/70 transition";
export const selectCls = inputCls;
export const textareaCls =
  "w-full min-h-20 rounded-lg border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/70 transition";
