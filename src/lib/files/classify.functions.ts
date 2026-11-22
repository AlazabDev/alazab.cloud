import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  canSuggest,
  uniqueIssuers,
  type ClassifyResult,
} from "./classify";
import { classifyDocument } from "./classify.server";

const inputSchema = z.object({
  title: z.string().max(TITLE_MAX),
  description: z.string().max(DESCRIPTION_MAX),
  projectId: z.string().uuid().nullable(),
  lang: z.enum(["ar", "en"]),
});

/** Staff-only: suggests category, discipline and issuing party from a document's title and description. */
export const suggestDocumentClassification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof inputSchema>) => inputSchema.parse(input))
  .handler(async ({ data, context }): Promise<ClassifyResult> => {
    const ar = data.lang === "ar";
    const title = data.title.trim();
    const description = data.description.trim();
    if (!canSuggest(title, description)) {
      return {
        ok: false,
        code: "invalid",
        message: ar
          ? "اكتب عنوانًا أو وصفًا أوضح أولًا."
          : "Write a clearer title or description first.",
      };
    }

    const { supabase, userId } = context;
    const { data: staff } = await supabase.rpc("is_staff", { _user_id: userId });
    if (!staff) {
      return {
        ok: false,
        code: "forbidden",
        message: ar
          ? "هذه الميزة متاحة لموظفي الشركة فقط."
          : "This feature is for company staff only.",
      };
    }
    if (data.projectId) {
      const { data: canEdit } = await supabase.rpc("can_edit_project", {
        _project_id: data.projectId,
        _user_id: userId,
      });
      if (!canEdit) {
        return {
          ok: false,
          code: "forbidden",
          message: ar
            ? "ليست لديك صلاحية الرفع في هذا المشروع."
            : "You can't add files to this project.",
        };
      }
    }

    // Issuers already used (visible to this user) keep suggested names consistent.
    let q = supabase
      .from("documents")
      .select("issuing_party")
      .not("issuing_party", "is", null)
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.projectId) q = q.eq("project_id", data.projectId);
    const { data: rows } = await q;
    let knownIssuers = uniqueIssuers((rows ?? []).map((r) => r.issuing_party));
    if (data.projectId && knownIssuers.length < 5) {
      const { data: all } = await supabase
        .from("documents")
        .select("issuing_party")
        .not("issuing_party", "is", null)
        .order("created_at", { ascending: false })
        .limit(300);
      knownIssuers = uniqueIssuers([...knownIssuers, ...(all ?? []).map((r) => r.issuing_party)]);
    }

    return classifyDocument({
      request: getRequest(),
      title,
      description,
      knownIssuers,
      lang: data.lang,
    });
  });
