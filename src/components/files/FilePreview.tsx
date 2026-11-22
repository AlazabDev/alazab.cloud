import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Download, DraftingCompass, Expand, Loader2, Minimize } from "lucide-react";
import { useTx } from "@/lib/i18n";
import { fileExtension, fileKind } from "@/lib/files/constants";
import { Button } from "@/components/ui/button";

const DxfViewer = lazy(() => import("@/components/files/DxfViewer"));
const IfcViewer = lazy(() => import("@/components/files/IfcViewer"));

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
  const extension = fileExtension(fileName);
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
      <div
        className={`grid min-h-[320px] place-items-center rounded-xl border border-border bg-background/40 ${className}`}
      >
        <Loader2
          className="size-6 animate-spin text-muted-foreground"
          aria-label={tx("جارٍ تجهيز المعاينة", "Loading preview")}
        />
      </div>
    );
  }

  if (kind === "image") {
    return (
      <PreviewShell fileName={fileName} className={className}>
        <div className="grid h-full w-full place-items-center overflow-hidden bg-background/40 p-2">
          <img src={url} alt={fileName} className="max-h-full max-w-full object-contain" />
        </div>
      </PreviewShell>
    );
  }
  if (kind === "pdf") {
    return (
      <PreviewShell fileName={fileName} className={className}>
        <iframe title={fileName} src={url} className="h-full w-full bg-background/40" />
      </PreviewShell>
    );
  }
  if (kind === "video") {
    return (
      <PreviewShell fileName={fileName} className={className}>
        <video
          src={url}
          controls
          playsInline
          className="h-full w-full bg-black"
          aria-label={fileName}
        />
      </PreviewShell>
    );
  }
  if (kind === "model3d") {
    return (
      <PreviewShell fileName={fileName} className={className}>
        {modelReady ? (
          <model-viewer
            src={url}
            alt={fileName}
            camera-controls
            auto-rotate
            shadow-intensity="1"
            className="block h-full w-full bg-background/40"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-background/40">
            <Loader2
              className="size-6 animate-spin text-muted-foreground"
              aria-label={tx("جارٍ تحميل النموذج", "Loading model")}
            />
          </div>
        )}
      </PreviewShell>
    );
  }
  if (kind === "cad" && extension === "dxf") {
    return (
      <PreviewShell fileName={fileName} className={className}>
        <Suspense
          fallback={<ViewerLoader label={tx("جارٍ فتح مخطط DXF…", "Opening DXF drawing…")} />}
        >
          <DxfViewer url={url} className="h-full w-full" />
        </Suspense>
      </PreviewShell>
    );
  }
  if (kind === "cad" && extension === "ifc") {
    return (
      <PreviewShell fileName={fileName} className={className}>
        <Suspense
          fallback={<ViewerLoader label={tx("جارٍ تجهيز نموذج IFC…", "Preparing IFC model…")} />}
        >
          <IfcViewer url={url} fileName={fileName} className="h-full w-full" />
        </Suspense>
      </PreviewShell>
    );
  }

  const ext = extension.toUpperCase();
  return (
    <div
      className={`grid min-h-[320px] place-items-center rounded-xl border border-border bg-background/40 p-6 text-center ${className}`}
    >
      <div className="max-w-sm">
        <DraftingCompass className="mx-auto size-10 text-primary" aria-hidden="true" />
        <p className="mt-3 font-medium">
          {tx(
            `لا تتوفر معاينة مباشرة لملفات ${ext} في المتصفح`,
            `No in-browser preview for ${ext} files`,
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {kind === "cad"
            ? tx(
                "ملف DWG أو Revit الأصلي محفوظ كما هو. نزّله لفتحه في AutoCAD أو Revit.",
                "The original DWG or Revit file is preserved. Download it to open in AutoCAD or Revit.",
              )
            : kind === "office"
              ? tx(
                  "تتوفر ملفات Office للتنزيل فقط حتى لا نرسل رابط الملف الخاص إلى عارض خارجي.",
                  "Office files are download-only so private file links are not sent to an external viewer.",
                )
              : tx("نزّل الملف لفتحه على جهازك.", "Download the file to open it on your device.")}
        </p>
        {downloadUrl && (
          <Button asChild className="mt-4">
            <a href={downloadUrl}>
              <Download />
              {tx("تنزيل الملف الأصلي", "Download original")}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function ViewerLoader({ label }: { label: string }) {
  return (
    <div
      className="grid h-full min-h-[320px] w-full place-items-center rounded-xl border border-border bg-background/40 text-sm text-muted-foreground"
      role="status"
    >
      <span className="flex items-center gap-2">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}

function PreviewShell({
  fileName,
  className,
  children,
}: {
  fileName: string;
  className: string;
  children: ReactNode;
}) {
  const tx = useTx();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateFullscreen = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === containerRef.current) await document.exitFullscreen();
      else await containerRef.current?.requestFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`group/preview relative min-h-[320px] overflow-hidden rounded-xl border border-border bg-background/40 ${className}`}
      style={
        isFullscreen
          ? { height: "100dvh", width: "100vw", maxWidth: "none", borderRadius: 0 }
          : undefined
      }
    >
      <div className="absolute end-3 top-3 z-20 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/preview:opacity-100 sm:focus-within:opacity-100">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label={
            isFullscreen
              ? tx("إنهاء ملء الشاشة", "Exit fullscreen")
              : tx("ملء الشاشة", "Enter fullscreen")
          }
          aria-pressed={isFullscreen}
          title={
            isFullscreen
              ? tx("إنهاء ملء الشاشة", "Exit fullscreen")
              : tx("ملء الشاشة", "Enter fullscreen")
          }
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize /> : <Expand />}
        </Button>
      </div>
      {children}
      <span className="sr-only">{fileName}</span>
    </div>
  );
}
