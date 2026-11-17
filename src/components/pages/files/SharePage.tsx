import { Download, FolderOpen, Link2Off, Clock } from "lucide-react";
import { getRouteApi } from "@tanstack/react-router";

const Route = getRouteApi("/share/$token");
import { useLang, useTx } from "@/lib/i18n";
import { DOC_TYPES, formatBytes, formatDateTime, labelOf } from "@/lib/files/constants";
import FilePreview from "@/components/files/FilePreview";
import { Button } from "@/components/ui/button";

export default function SharePage() {
  const data = Route.useLoaderData();
  const tx = useTx();
  const { lang, setLang } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-header">
        <div className="section-container h-16 flex items-center gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <FolderOpen className="w-5 h-5" />
          </span>
          <span className="font-display font-bold">
            ALAZAB <span className="text-primary">Files</span>
          </span>
          <span className="flex-1" />
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="h-9 px-3 rounded-lg border border-border text-sm font-semibold hover:text-primary">
            {lang === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </header>
      <main className="section-container flex-1 py-8 w-full">
        {data.status !== "ok" ? (
          <div className="max-w-md mx-auto mt-16 text-center card-glow rounded-2xl p-8">
            {data.status === "expired" ? <Clock className="w-10 h-10 mx-auto text-primary" /> : <Link2Off className="w-10 h-10 mx-auto text-primary" />}
            <h1 className="mt-4 text-xl font-bold">
              {data.status === "expired"
                ? tx("انتهت صلاحية رابط المشاركة", "This share link has expired")
                : data.status === "revoked"
                  ? tx("تم إلغاء رابط المشاركة", "This share link was revoked")
                  : tx("رابط المشاركة غير موجود", "Share link not found")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{tx("تواصل مع فريق العزب للحصول على رابط جديد.", "Contact the Alazab team for a new link.")}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs text-primary font-medium">
                  {data.projectName} · {labelOf(DOC_TYPES, data.docType, lang)}
                </p>
                <h1 className="text-2xl font-bold mt-1">{data.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.docNumber && <span className="font-mono me-3">{data.docNumber}</span>}
                  {tx("الإصدار", "Revision")} {data.revisionLabel ?? data.versionNumber} · {data.fileName} · {formatBytes(data.sizeBytes)}
                </p>
              </div>
              {data.downloadUrl && (
                <Button asChild>
                  <a href={data.downloadUrl}>
                    <Download /> {tx("تنزيل الملف", "Download file")}
                  </a>
                </Button>
              )}
            </div>
            {data.note && <p className="rounded-xl border border-border bg-card/50 p-4 text-sm">{data.note}</p>}
            <FilePreview fileName={data.fileName} url={data.viewUrl} downloadUrl={data.downloadUrl} className="h-[70vh]" />
            <p className="text-xs text-muted-foreground">
              {data.recipient && <>{tx("مُرسل إلى", "Shared with")}: {data.recipient} · </>}
              {tx("الرابط صالح حتى", "Link valid until")} {formatDateTime(data.expiresAt, lang)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
