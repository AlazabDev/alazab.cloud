import { Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang, useTx } from "@/lib/i18n";
import { formatDateTime, shareState } from "@/lib/files/constants";
import { sharesQuery } from "@/lib/files/queries";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/files/ui";
import { ShareStateBadge } from "./DocumentPage";

export default function SharesPage() {
  const tx = useTx();
  const { lang } = useLang();
  const qc = useQueryClient();
  const { data: shares } = useSuspenseQuery(sharesQuery());

  async function revoke(id: string) {
    const { error } = await supabase
      .from("share_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(tx("تم إلغاء الرابط", "Link revoked"));
      await qc.invalidateQueries({ queryKey: ["files"] });
    }
  }

  return (
    <div>
      <PageHeader
        title={tx("المشاركات", "Shares")}
        subtitle={tx(
          "روابط خارجية مقيدة بمدة. أنشئ رابطًا جديدًا من صفحة أي مستند.",
          "Time-limited external links. Create one from any document page.",
        )}
      />
      {shares.length === 0 ? (
        <EmptyState
          icon={<Share2 className="w-6 h-6" />}
          title={tx("لا توجد روابط مشاركة", "No share links")}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card/40">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:text-start [&>th]:font-medium">
                <th>{tx("المستند", "Document")}</th>
                <th>{tx("المستفيد", "Recipient")}</th>
                <th>{tx("تنتهي", "Expires")}</th>
                <th>{tx("المشاهدات", "Views")}</th>
                <th>{tx("الحالة", "State")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shares.map((s) => {
                const doc = s.document as {
                  id: string;
                  title: string;
                  project: { name: string } | null;
                } | null;
                const state = shareState(s);
                return (
                  <tr
                    key={s.id}
                    className="border-b border-border/50 last:border-0 [&>td]:px-3 [&>td]:py-2.5"
                  >
                    <td>
                      {doc && (
                        <Link
                          to="/files/documents/$documentId"
                          params={{ documentId: doc.id }}
                          className="font-medium hover:text-primary"
                        >
                          {doc.title}
                        </Link>
                      )}
                      <p className="text-xs text-muted-foreground">{doc?.project?.name}</p>
                    </td>
                    <td>{s.recipient || "—"}</td>
                    <td className="text-xs text-muted-foreground">
                      {formatDateTime(s.expires_at, lang)}
                    </td>
                    <td className="text-xs">
                      {s.view_count}
                      {s.last_viewed_at && (
                        <span className="block text-muted-foreground">
                          {formatDateTime(s.last_viewed_at, lang)}
                        </span>
                      )}
                    </td>
                    <td>
                      <ShareStateBadge state={state} />
                    </td>
                    <td>
                      {state === "active" && (
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              await navigator.clipboard.writeText(
                                `${window.location.origin}/share/${s.token}`,
                              );
                              toast.success(tx("تم النسخ", "Copied"));
                            }}
                          >
                            <Copy />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => revoke(s.id)}>
                            {tx("إلغاء", "Revoke")}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
