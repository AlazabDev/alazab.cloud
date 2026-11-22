import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { Box3 } from "three";
import { useTx } from "@/lib/i18n";

const MAX_IFC_BYTES = 250 * 1024 * 1024;

export default function IfcViewer({
  url,
  fileName,
  className = "h-[60vh]",
}: {
  url: string;
  fileName: string;
  className?: string;
}) {
  const tx = useTx();
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileQuery = useQuery({
    queryKey: ["ifc-preview", url],
    queryFn: async ({ signal }) => {
      const response = await fetch(url, { signal });
      if (!response.ok)
        throw new Error(
          tx("تعذر تنزيل النموذج من التخزين.", "Could not download the model from storage."),
        );
      const declaredLength = Number(response.headers.get("content-length"));
      if (declaredLength > MAX_IFC_BYTES) {
        throw new Error(
          tx(
            "يتجاوز النموذج الحد الآمن للمعاينة (250 ميغابايت). نزّل الملف لفتحه في عارض BIM.",
            "This model exceeds the 250 MB browser-preview limit. Download it in a dedicated BIM viewer.",
          ),
        );
      }
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_IFC_BYTES) {
        throw new Error(
          tx(
            "يتجاوز النموذج الحد الآمن للمعاينة (250 ميغابايت). نزّل الملف لفتحه في عارض BIM.",
            "This model exceeds the 250 MB browser-preview limit. Download it in a dedicated BIM viewer.",
          ),
        );
      }
      return buffer;
    },
    enabled: Boolean(url),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const sourceBuffer = fileQuery.data;
    if (!sourceBuffer || !hostRef.current) return;
    let cancelled = false;
    let components: import("@thatopen/components").Components | null = null;

    async function initialize() {
      try {
        setStatus("loading");
        setErrorMessage("");
        const OBC = await import("@thatopen/components");
        if (cancelled || !hostRef.current) return;

        components = new OBC.Components();
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create<
          import("@thatopen/components").SimpleScene,
          import("@thatopen/components").OrthoPerspectiveCamera,
          import("@thatopen/components").SimpleRenderer
        >();
        world.scene = new OBC.SimpleScene(components);
        world.scene.setup();
        world.scene.three.background = null;
        world.renderer = new OBC.SimpleRenderer(components, hostRef.current);
        world.camera = new OBC.OrthoPerspectiveCamera(components);
        await world.camera.controls?.setLookAt(25, 20, 25, 0, 0, 0);
        components.init();
        components.get(OBC.Grids).create(world);

        const fragments = components.get(OBC.FragmentsManager);
        const workerUrl = await OBC.FragmentsManager.getWorker();
        if (cancelled) return;
        fragments.init(workerUrl);
        world.camera.controls?.addEventListener("update", () => fragments.core.update());
        fragments.list.onItemSet.add(({ value: model }) => {
          model.useCamera(world.camera.three);
          world.scene.three.add(model.object);
          fragments.core.update(true);
          const box = new Box3().setFromObject(model.object);
          if (!box.isEmpty()) void world.camera.controls?.fitToBox(box, true);
        });

        const loader = components.get(OBC.IfcLoader);
        await loader.setup({ autoSetWasm: true });
        if (cancelled) return;
        const bytes = new Uint8Array(sourceBuffer!);
        await loader.load(bytes, false, fileName, {
          processData: {
            progressCallback: (value: number) => {
              if (!cancelled && Number.isFinite(value)) {
                setProgress(Math.max(0, Math.min(100, Math.round(value * 100))));
              }
            },
          },
        });
        if (!cancelled) setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to initialize the IFC viewer.",
        );
      }
    }

    void initialize();
    return () => {
      cancelled = true;
      components?.dispose();
    };
  }, [fileName, fileQuery.data]);

  if (fileQuery.isError) {
    return (
      <ViewerMessage
        className={className}
        message={
          fileQuery.error instanceof Error
            ? fileQuery.error.message
            : tx("تعذر تنزيل نموذج IFC.", "Could not download the IFC model.")
        }
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-[#10131c] ${className}`}
    >
      <div
        ref={hostRef}
        className="h-full w-full"
        role="img"
        aria-label={tx("عارض نموذج IFC ثلاثي الأبعاد", "IFC 3D model viewer")}
      />
      {status !== "ready" && (
        <div
          className="absolute inset-0 grid place-items-center bg-[#10131c]/90 p-6 text-center"
          role={status === "error" ? "alert" : "status"}
        >
          <div className="max-w-md text-white/75">
            {status === "error" ? (
              <AlertCircle className="mx-auto size-7 text-amber-400" />
            ) : (
              <Loader2 className="mx-auto size-7 animate-spin text-primary" />
            )}
            <p className="mt-3 text-sm">
              {status === "error"
                ? errorMessage
                : tx(
                    "جارٍ تجهيز المشهد وتحويل ملف IFC محليًا في المتصفح…",
                    "Preparing the scene and converting this IFC file in your browser…",
                  )}
            </p>
            {status === "loading" && progress !== null && (
              <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <p className="absolute bottom-3 start-3 rounded-md bg-black/55 px-2.5 py-1.5 text-[11px] text-white/75 backdrop-blur-sm">
        {fileName} · {tx("اسحب للدوران، عجلة الفأرة للتكبير", "Drag to orbit · scroll to zoom")}
      </p>
    </div>
  );
}

function ViewerMessage({ className, message }: { className: string; message: string }) {
  return (
    <div
      className={`grid place-items-center rounded-xl border border-border bg-background/40 p-6 text-center ${className}`}
      role="alert"
    >
      <div className="max-w-sm text-muted-foreground">
        <AlertCircle className="mx-auto size-6" />
        <p className="mt-3 text-sm">{message}</p>
      </div>
    </div>
  );
}
