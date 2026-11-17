import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layers, Lock, Eye } from "lucide-react";
import { useLang, useTx } from "@/lib/i18n";
import { DISCIPLINES, DOC_TYPES, fileKind, formatBytes, formatDate, labelOf } from "@/lib/files/constants";
import { thumbsQuery, type DocRow } from "@/lib/files/queries";
import { KindIcon, StatusBadge } from "./ui";

export default function DocumentsView({ docs, view, showProject = true }: { docs: DocRow[]; view: "grid" | "list"; showProject?: boolean }) {
  const { lang } = useLang();
  const tx = useTx();
  const imagePaths = docs
    .filter((d) => d.latest && fileKind(d.latest.file_name) === "image")
    .map((d) => d.latest!.storage_path)
    .slice(0, 200);
  const { data: thumbs } = useQuery(thumbsQuery(imagePaths));

  if (view === "list") {
    return (
      <div className="overflow-x-auto rounded-xl border border-border bg-card/40">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground border-b border-border">
            <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:text-start [&>th]:font-medium">
              <th>{tx("المستند", "Document")}</th>
              <th>{tx("رقم المستند", "Doc no.")}</th>
              {showProject && <th>{tx("المشروع", "Project")}</th>}
              <th>{tx("النوع", "Type")}</th>
              <th>{tx("الإصدار", "Rev.")}</th>
              <th>{tx("الحالة", "Status")}</th>
              <th>{tx("الحجم", "Size")}</th>
              <th>{tx("آخر تحديث", "Updated")}</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/40 [&>td]:px-3 [&>td]:py-2.5">
                <td>
                  <Link to="/files/documents/$documentId" params={{ documentId: d.id }} className="flex items-center gap-2 font-medium hover:text-primary">
                    <KindIcon fileName={d.latest?.file_name} className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate max-w-64">{d.title}</span>
                    {!d.client_visible && <Lock className="w-3 h-3 text-muted-foreground shrink-0" aria-label={tx("داخلي", "Internal")} />}
                  </Link>
                </td>
                <td className="font-mono text-xs text-muted-foreground">{d.doc_number || "—"}</td>
                {showProject && <td className="text-muted-foreground">{d.project?.name}</td>}
                <td className="text-muted-foreground">{labelOf(DOC_TYPES, d.doc_type, lang)}</td>
                <td className="font-mono text-xs">{d.latest?.revision_label ?? "—"}</td>
                <td>
                  <StatusBadge status={d.status} />
                </td>
                <td className="text-muted-foreground text-xs">{formatBytes(d.latest?.size_bytes)}</td>
                <td className="text-muted-foreground text-xs">{formatDate(d.updated_at, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {docs.map((d) => {
        const thumb = d.latest ? thumbs?.[d.latest.storage_path] : undefined;
        return (
          <Link
            key={d.id}
            to="/files/documents/$documentId"
            params={{ documentId: d.id }}
            className="card-glow group rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] bg-secondary/50 grid place-items-center overflow-hidden relative">
              {thumb ? (
                <img src={thumb} alt={d.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <KindIcon fileName={d.latest?.file_name} className="w-12 h-12 text-primary/70" />
              )}
              <div className="absolute top-2 start-2 flex gap-1">
                <StatusBadge status={d.status} />
              </div>
              <div className="absolute top-2 end-2 flex gap-1">
                {d.client_visible ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/80 border border-border px-2 py-0.5 text-[10px]">
                    <Eye className="w-3 h-3" /> {tx("مرئي للعميل", "Client")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/80 border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    <Lock className="w-3 h-3" /> {tx("داخلي", "Internal")}
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 flex flex-col gap-1.5 flex-1">
              <p className="text-[11px] text-primary font-medium">
                {labelOf(DOC_TYPES, d.doc_type, lang)} · {labelOf(DISCIPLINES, d.discipline, lang)}
              </p>
              <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{d.title}</h3>
              {showProject && <p className="text-xs text-muted-foreground truncate">{d.project?.name}</p>}
              <div className="mt-auto pt-2 flex items-center gap-3 text-[11px] text-muted-foreground border-t border-border/40">
                <span className="font-mono">{d.doc_number || "—"}</span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {d.latest?.revision_label ?? tx("بدون ملف", "No file")}
                </span>
                <span className="ms-auto">{formatDate(d.updated_at, lang)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
