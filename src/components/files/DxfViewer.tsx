import { useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import DxfParser, { type IEntity, type IPoint } from "dxf-parser";
import { AlertCircle, Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, useTx } from "@/lib/i18n";

type DxfEntity = IEntity & {
  vertices?: IPoint[];
  center?: IPoint;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  shape?: boolean;
  fitPoints?: IPoint[];
  controlPoints?: IPoint[];
};
type Drawable = { entity: DxfEntity; points: IPoint[] };
const MAX_RENDER_ENTITIES = 5000;

export default function DxfViewer({
  url,
  className = "h-[60vh]",
}: {
  url: string;
  className?: string;
}) {
  const tx = useTx();
  const { lang } = useLang();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const fileQuery = useQuery({
    queryKey: ["dxf-preview", url],
    queryFn: async ({ signal }) => {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error("Unable to load this drawing.");
      return response.text();
    },
    enabled: Boolean(url),
    staleTime: 5 * 60 * 1000,
  });
  const parsed = useMemo(() => {
    if (!fileQuery.data) return null;
    try {
      return { drawing: new DxfParser().parseSync(fileQuery.data), error: null };
    } catch {
      return {
        drawing: null,
        error: tx(
          "تعذر قراءة ملف DXF. تحقق من سلامة الملف.",
          "This DXF file could not be parsed. Check the file integrity.",
        ),
      };
    }
  }, [fileQuery.data, tx]);

  const drawing = parsed?.drawing;
  const visibleEntities = useMemo(
    () => (drawing?.entities ?? []).filter((entity) => entity.visible && !entity.inPaperSpace),
    [drawing],
  );
  const drawableEntities = useMemo(
    () => visibleEntities.slice(0, MAX_RENDER_ENTITIES) as DxfEntity[],
    [visibleEntities],
  );
  const drawables = useMemo(
    () =>
      drawableEntities
        .map((entity) => ({ entity, points: entityPoints(entity) }))
        .filter((entry) => entry.points.length > 0),
    [drawableEntities],
  );
  const allPoints = useMemo(() => drawables.flatMap((entry) => entry.points), [drawables]);
  const bounds = useMemo(() => boundsOf(allPoints), [allPoints]);
  const width = bounds ? Math.max(bounds.maxX - bounds.minX, 1) : 1;
  const height = bounds ? Math.max(bounds.maxY - bounds.minY, 1) : 1;
  const viewportWidth = width / zoom;
  const viewportHeight = height / zoom;
  const viewBox = bounds
    ? `${bounds.minX + (width - viewportWidth) / 2 + pan.x} ${bounds.minY + (height - viewportHeight) / 2 + pan.y} ${viewportWidth} ${viewportHeight}`
    : "0 0 1 1";

  if (fileQuery.isLoading) {
    return (
      <ViewerMessage
        className={className}
        icon={<Loader2 className="size-6 animate-spin" />}
        message={tx("جارٍ فتح مخطط DXF…", "Opening DXF drawing…")}
      />
    );
  }
  if (fileQuery.isError || parsed?.error || !drawing || !bounds) {
    return (
      <ViewerMessage
        className={className}
        icon={<AlertCircle className="size-6" />}
        message={
          parsed?.error ??
          tx(
            "تعذر فتح ملف DXF. نزّل الملف لمراجعته في برنامج CAD.",
            "Could not open this DXF file. Download it to review in CAD software.",
          )
        }
      />
    );
  }

  const unsupportedCount = visibleEntities.length - drawables.length;
  const truncated = visibleEntities.length > MAX_RENDER_ENTITIES;
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-[#10131c] text-white ${className}`}
    >
      <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-3">
        <p
          className="rounded-md bg-black/60 px-2.5 py-1.5 text-[11px] text-white/75 backdrop-blur-sm"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {tx("معاينة متجهية ثنائية الأبعاد", "2D vector preview")} ·{" "}
          {drawables.length.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}{" "}
          {tx("عنصر", "entities")}
        </p>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-black/60 p-1 backdrop-blur-sm">
          <IconButton
            label={tx("تكبير", "Zoom in")}
            onClick={() => setZoom((value) => Math.min(8, value * 1.25))}
          >
            <Plus className="size-4" />
          </IconButton>
          <IconButton
            label={tx("تصغير", "Zoom out")}
            onClick={() => setZoom((value) => Math.max(0.25, value / 1.25))}
          >
            <Minus className="size-4" />
          </IconButton>
          <IconButton
            label={tx("إعادة ضبط العرض", "Reset view")}
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <RotateCcw className="size-4" />
          </IconButton>
        </div>
      </div>
      <svg
        className="h-full w-full cursor-grab touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        tabIndex={0}
        aria-label={tx(
          "اسحب لتحريك مخطط DXF؛ استخدم الأسهم للتحريك أو أزرار التكبير.",
          "Drag to pan the DXF drawing; use arrow keys to pan or the zoom controls.",
        )}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: pan.x,
            originY: pan.y,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const rect = event.currentTarget.getBoundingClientRect();
          setPan({
            x: drag.originX - ((event.clientX - drag.startX) * viewportWidth) / rect.width,
            y: drag.originY - ((event.clientY - drag.startY) * viewportHeight) / rect.height,
          });
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        onKeyDown={(event) => {
          const movement = viewportWidth * 0.08;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            setPan((current) => ({
              ...current,
              x: current.x + (event.key === "ArrowLeft" ? -movement : movement),
            }));
          }
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            setPan((current) => ({
              ...current,
              y:
                current.y +
                (event.key === "ArrowUp" ? -viewportHeight * 0.08 : viewportHeight * 0.08),
            }));
          }
        }}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={Math.max(width, height) / 900}
          vectorEffect="non-scaling-stroke"
          opacity="0.88"
        >
          {drawables.map(({ entity, points }, index) => (
            <DxfShape key={`${entity.handle}-${index}`} entity={entity} points={points} />
          ))}
        </g>
      </svg>
      {(unsupportedCount > 0 || truncated) && (
        <p
          className="absolute inset-x-3 bottom-3 rounded-md bg-black/65 px-3 py-2 text-[11px] leading-5 text-white/75"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {truncated &&
            tx(
              "تم تقليل العناصر المعروضة للحفاظ على سرعة المتصفح؛ استخدم التنزيل لمراجعة الرسم كاملًا.",
              "Rendering was capped to keep the browser responsive; download the file to inspect the complete drawing.",
            )}
          {truncated && unsupportedCount > 0 ? " " : ""}
          {unsupportedCount > 0 &&
            tx(
              "بعض أنواع العناصر المتقدمة لا تظهر في هذه المعاينة.",
              "Some advanced entity types are not included in this preview.",
            )}
        </p>
      )}
    </div>
  );
}

function entityPoints(entity: DxfEntity): IPoint[] {
  if (entity.type === "CIRCLE" && entity.center && entity.radius) {
    return Array.from({ length: 48 }, (_, index) => {
      const angle = (index / 48) * Math.PI * 2;
      return {
        x: entity.center!.x + Math.cos(angle) * entity.radius!,
        y: entity.center!.y + Math.sin(angle) * entity.radius!,
        z: 0,
      };
    });
  }
  if (entity.type === "ARC" && entity.center && entity.radius !== undefined) {
    const start = ((entity.startAngle ?? 0) * Math.PI) / 180;
    let span = ((((entity.endAngle ?? 0) - (entity.startAngle ?? 0)) % 360) + 360) % 360;
    if (span === 0) span = 360;
    const segments = Math.max(12, Math.ceil(span / 5));
    return Array.from({ length: segments + 1 }, (_, index) => {
      const angle = start + ((span * Math.PI) / 180) * (index / segments);
      return {
        x: entity.center!.x + Math.cos(angle) * entity.radius!,
        y: entity.center!.y + Math.sin(angle) * entity.radius!,
        z: 0,
      };
    });
  }
  return entity.vertices ?? entity.fitPoints ?? entity.controlPoints ?? [];
}

function boundsOf(points: IPoint[]) {
  if (points.length === 0) return null;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const point of points) {
    const x = point.x;
    const y = -point.y;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const padding = Math.max(maxX - minX, maxY - minY, 1) * 0.04;
  return { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding };
}

function DxfShape({ entity, points }: { entity: DxfEntity; points: IPoint[] }) {
  if (entity.type === "CIRCLE" && entity.center && entity.radius !== undefined) {
    return <circle cx={entity.center.x} cy={-entity.center.y} r={entity.radius} />;
  }
  const closed = entity.type === "LWPOLYLINE" && entity.shape;
  const pointString = points.map((point) => `${point.x},${-point.y}`).join(" ");
  return closed ? <polygon points={pointString} /> : <polyline points={pointString} />;
}

function ViewerMessage({
  className,
  icon,
  message,
}: {
  className: string;
  icon: ReactNode;
  message: string;
}) {
  return (
    <div
      className={`grid place-items-center rounded-xl border border-border bg-background/40 p-6 text-center ${className}`}
      role="status"
    >
      <div className="max-w-sm text-muted-foreground">
        {icon}
        <p className="mt-3 text-sm">{message}</p>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={label}
      title={label}
      className="size-8 text-white hover:bg-white/15 hover:text-white"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
