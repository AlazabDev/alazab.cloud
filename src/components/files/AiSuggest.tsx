import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, useTx } from "@/lib/i18n";
import { DISCIPLINES, DOC_TYPES, labelOf } from "@/lib/files/constants";
import { canSuggest, type ClassificationSuggestion } from "@/lib/files/classify";
import { suggestDocumentClassification } from "@/lib/files/classify.functions";
import { cn } from "@/lib/utils";

const CONFIDENCE: Record<
  ClassificationSuggestion["confidence"],
  { ar: string; en: string; tone: string }
> = {
  high: {
    ar: "ثقة عالية",
    en: "High confidence",
    tone: "bg-success/15 text-success border-success/40",
  },
  medium: {
    ar: "ثقة متوسطة",
    en: "Medium confidence",
    tone: "bg-accent/15 text-accent-foreground border-accent/40",
  },
  low: {
    ar: "ثقة منخفضة",
    en: "Low confidence",
    tone: "bg-muted text-muted-foreground border-border",
  },
};

/** Staff helper: suggests category, discipline and issuing party from the title and description. */
export function AiSuggest({
  title,
  description,
  projectId,
  onApply,
}: {
  title: string;
  description: string;
  projectId: string | null;
  onApply: (s: ClassificationSuggestion) => void;
}) {
  const tx = useTx();
  const { lang } = useLang();
  const suggest = useServerFn(suggestDocumentClassification);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationSuggestion | null>(null);
  const ready = canSuggest(title, description);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await suggest({ data: { title, description, projectId, lang } });
      if (res.ok) setResult(res.suggestion);
      else setError(res.message);
    } catch (e) {
      console.error(e);
      setError(
        tx(
          "تعذّر الاتصال بالخدمة. تأكد من تسجيل الدخول وحاول مرة أخرى.",
          "Could not reach the service. Check you're signed in and try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          {tx("اقتراح التصنيف بالذكاء الاصطناعي", "AI classification suggestion")}
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={run} disabled={busy || !ready}>
          {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {result ? tx("اقتراح جديد", "Suggest again") : tx("اقترح", "Suggest")}
        </Button>
      </div>
      {!ready && !result && (
        <p className="text-[11px] text-muted-foreground">
          {tx(
            "اكتب عنوان المستند أو وصفه ليقترح النموذج التصنيف والتخصص والجهة المُصدِرة.",
            "Enter the document title or description to get a suggested category, discipline and issuing party.",
          )}
        </p>
      )}
      {busy && (
        <p className="text-xs text-muted-foreground">
          {tx("جارٍ تحليل العنوان والوصف…", "Reading the title and description…")}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="space-y-2" aria-live="polite">
          <dl className="grid gap-2 sm:grid-cols-3 text-sm">
            <SuggestionItem
              label={tx("التصنيف", "Category")}
              value={labelOf(DOC_TYPES, result.docType, lang)}
            />
            <SuggestionItem
              label={tx("التخصص", "Discipline")}
              value={labelOf(DISCIPLINES, result.discipline, lang)}
            />
            <SuggestionItem
              label={tx("الجهة المُصدِرة", "Issuing party")}
              value={result.issuingParty ?? tx("غير مذكورة", "Not stated")}
              muted={!result.issuingParty}
            />
          </dl>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
                CONFIDENCE[result.confidence].tone,
              )}
            >
              {lang === "ar" ? CONFIDENCE[result.confidence].ar : CONFIDENCE[result.confidence].en}
            </span>
            {result.reason && (
              <p className="text-xs text-muted-foreground flex-1 min-w-40">{result.reason}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply(result);
                setResult(null);
              }}
            >
              <Check />
              {tx("تطبيق الاقتراح", "Apply suggestion")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setResult(null)}>
              <X />
              {tx("تجاهل", "Dismiss")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestionItem({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-lg bg-background/60 border border-border px-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd
        className={cn("font-medium truncate", muted && "text-muted-foreground font-normal")}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
