import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "@/lib/ai/run-id.server";
import {
  CONFIDENCE_LEVELS,
  DISCIPLINE_IDS,
  DOC_TYPE_IDS,
  buildInstructions,
  buildUserMessage,
  normalizeSuggestion,
  type ClassifyResult,
} from "./classify";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const suggestionSchema = z.object({
  doc_type: z.enum(DOC_TYPE_IDS),
  discipline: z.enum(DISCIPLINE_IDS),
  issuing_party: z.string().nullable(),
  confidence: z.enum(CONFIDENCE_LEVELS),
  reason: z.string(),
});

export async function classifyDocument(opts: {
  request: Request | undefined;
  title: string;
  description: string;
  knownIssuers: string[];
  lang: "ar" | "en";
}): Promise<ClassifyResult> {
  const ar = opts.lang === "ar";
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    console.error("[classify] LOVABLE_API_KEY is missing");
    return { ok: false, code: "failed", message: ar ? "خدمة الذكاء الاصطناعي غير مُعدّة بعد." : "AI service is not configured." };
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(opts.request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: buildInstructions(opts.lang),
      messages: [{ role: "user", content: buildUserMessage(opts) }],
      output: Output.object({ schema: suggestionSchema }),
      maxRetries: 0,
      ...(opts.request?.signal ? { abortSignal: opts.request.signal } : {}),
      onError: () => {},
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const output = await result.output;
    return { ok: true, suggestion: normalizeSuggestion(output, opts.knownIssuers) };
  } catch (error) {
    return mapError(error, ar);
  }
}

function mapError(error: unknown, ar: boolean): ClassifyResult {
  const api = findApiError(error);
  const status = api?.statusCode;
  console.error("[classify] AI call failed", status ?? "", error instanceof Error ? error.message : error);
  if (status === 402) {
    return { ok: false, code: "credits", message: safeMessage(api) ?? (ar ? "رصيد الذكاء الاصطناعي نفد. أضف رصيدًا ثم حاول مرة أخرى." : "AI credits are used up. Add credits and try again.") };
  }
  if (status === 429) {
    return { ok: false, code: "busy", message: ar ? "الخدمة مشغولة الآن. انتظر دقيقة وحاول مرة أخرى." : "The AI service is busy. Wait a minute and try again." };
  }
  if (status === 403) {
    return { ok: false, code: "denied", message: safeMessage(api) ?? (ar ? "الوصول إلى خدمة الذكاء الاصطناعي غير متاح حاليًا." : "Access to the AI service is currently blocked.") };
  }
  if (NoObjectGeneratedError.isInstance(error)) {
    return { ok: false, code: "failed", message: ar ? "لم يتمكن النموذج من اقتراح تصنيف لهذا النص. اختر التصنيف يدويًا." : "The model could not suggest a classification for this text. Choose it manually." };
  }
  return { ok: false, code: "failed", message: ar ? "تعذّر الحصول على اقتراح الآن. حاول مرة أخرى بعد قليل." : "Could not get a suggestion right now. Try again shortly." };
}

function findApiError(error: unknown): APICallError | undefined {
  let e: unknown = error;
  for (let i = 0; i < 4 && e; i++) {
    if (APICallError.isInstance(e)) return e;
    e = (e as { cause?: unknown }).cause ?? (e as { lastError?: unknown }).lastError;
  }
  return undefined;
}

function safeMessage(api: APICallError | undefined): string | undefined {
  if (!api?.responseBody) return undefined;
  try {
    const body = JSON.parse(api.responseBody) as { message?: unknown; error?: { message?: unknown } };
    const msg = typeof body.message === "string" ? body.message : typeof body.error?.message === "string" ? body.error.message : undefined;
    return msg?.slice(0, 300);
  } catch {
    return undefined;
  }
}
