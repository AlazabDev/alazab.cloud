import { useEffect, useState } from "react";
import { Download, DraftingCompass, Loader2 } from "lucide-react";
import { useTx } from "@/lib/i18n";
import { fileExtension, fileKind } from "@/lib/files/constants";
import { Button } from "@/components/ui/button";

/** Shows a file in the browser where possible; otherwise explains and offers download. */
export default function FilePreview({
  fileName,
  url,
  downloadUrl,
  className = "h-[60vh]",
}: {
  fileName: string;
  url: string | null;
  downloadUrl?: string | null;
  className?: string;
}) {
  const tx = useTx();
  const kind = fileKind(fileName);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    if (kind !== "model3d") return;
    let cancelled = false;
    import("@google/model-viewer").then(() => {
      if (!cancelled) setModelReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  if (!url) {
    return (
      <div className={`grid place-items-center rounded-xl border border-border bg-background/40 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const frame = `w-full rounded-xl border border-border bg-background/40 ${className}`;

  if (kind === "image") {
    return (
      <div className={`${frame} grid place-items-center overflow-hidden`}>
        <img src={url} alt={fileName} className="max-w-full max-h-full object-contain" />
      </div>
    );
  }
  if (kind === "pdf") return <iframe title={fileName} src={url} className={frame} />;
  if (kind === "video") return <video src={url} controls className={frame} />;
  if (kind === "office") {
    return (
      <iframe
        title={fileName}
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
        className={frame}
      />
    );
  }
  if (kind === "model3d") {
    return modelReady ? (
      <model-viewer src={url} alt={fileName} camera-controls auto-rotate shadow-intensity="1" className={`block ${frame}`} />
    ) : (
      <div className={`${frame} grid place-items-center`}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ext = fileExtension(fileName).toUpperCase();
  return (
    <div className={`${frame} grid place-items-center p-6 text-center`}>
      <div className="max-w-sm">
        <DraftingCompass className="w-10 h-10 mx-auto text-primary" />
        <p className="mt-3 font-medium">
          {tx(`لا تتوفر معاينة مباشرة لملفات ${ext} في المتصفح`, `No in-browser preview for ${ext} files`)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {kind === "cad"
            ? tx(
                "ملفات CAD وBIM تحتاج برنامجًا متخصصًا (AutoCAD، Revit، أو عارض IFC). نزّل الملف لفتحه.",
                "CAD and BIM files need a dedicated viewer (AutoCAD, Revit or an IFC viewer). Download to open.",
              )
            : tx("نزّل الملف لفتحه على جهازك.", "Download the file to open it on your device.")}
        </p>
        {downloadUrl && (
          <Button asChild className="mt-4">
            <a href={downloadUrl}>
              <Download /> {tx("تنزيل", "Download")}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
