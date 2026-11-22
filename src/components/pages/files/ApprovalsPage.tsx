import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, FileCheck2, RotateCcw, X } from "lucide-react";
import { useLang, useTx } from "@/lib/i18n";
import { formatDateTime, type ApprovalStatus } from "@/lib/files/constants";
import { approvalsQuery, meQuery } from "@/lib/files/queries";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, StatusBadge } from "@/components/files/ui";
import { DecisionDialog } from "@/components/files/DocumentDialogs";

type Tab = "mine" | "pending" | "decided";

export default function ApprovalsPage() {
  const tx = useTx();
  const { lang } = useLang();
  const { data: me } = useSuspenseQuery(meQuery());
  const { data: approvals } = useSuspenseQuery(approvalsQuery());
  const [tab, setTab] = useState<Tab>("mine");
  const [decision, setDecision] = useState<{
    id: string;
    status: Exclude<ApprovalStatus, "pending">;
  } | null>(null);

  const mine = approvals.filter(
    (a) => a.status === "pending" && (a.reviewer_id === me?.id || (!a.reviewer_id && me?.isStaff)),
  );
  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending");
  const list = tab === "mine" ? mine : tab === "pending" ? pending : decided;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "mine", label: tx("بانتظار قراري", "Awaiting me"), count: mine.length },
    { id: "pending", label: tx("كل المعلقة", "All pending"), count: pending.length },
    { id: "decided", label: tx("تم البت فيها", "Decided"), count: decided.length },
  ];

  return (
    <div>
      <PageHeader
        title={tx("مركز الاعتمادات", "Approval center")}
        subtitle={tx(
          "المراجعات والقرارات والملاحظات — كل قرار مرتبط بإصدار محدد.",
          "Reviews, decisions and notes — each tied to a specific revision.",
        )}
      />
      <div className="flex gap-1 border-b border-border mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`h-10 px-4 text-sm border-b-2 -mb-px ${tab === t.id ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label} <span className="text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="w-6 h-6" />}
          title={tx("لا توجد طلبات هنا", "Nothing here")}
        />
      ) : (
        <ul className="space-y-3">
          {list.map((a) => {
            const doc = a.document as {
              id: string;
              title: string;
              doc_number: string | null;
              project: { id: string; name: string } | null;
            } | null;
            const version = a.version as {
              revision_label: string | null;
              file_name: string;
            } | null;
            const reviewer = a.reviewer as {
              full_name: string | null;
              email: string | null;
            } | null;
            return (
              <li
                key={a.id}
                className="rounded-2xl border border-border bg-card/50 p-4 flex flex-wrap items-start gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  {doc && (
                    <Link
                      to="/files/documents/$documentId"
                      params={{ documentId: doc.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {doc.title}
                    </Link>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {doc?.project?.name} · {tx("الإصدار", "Rev.")}{" "}
                    <span className="font-mono">{version?.revision_label}</span>
                    {doc?.doc_number && <span className="font-mono"> · {doc.doc_number}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx("المراجِع", "Reviewer")}:{" "}
                    {reviewer?.full_name ||
                      reviewer?.email ||
                      tx("مدير المشروع", "Project manager")}{" "}
                    · {formatDateTime(a.created_at, lang)}
                  </p>
                  {a.request_note && <p className="text-sm">{a.request_note}</p>}
                  {a.decision_note && (
                    <p className="text-sm border-s-2 border-primary ps-2">{a.decision_note}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={a.status} kind="approval" />
                  {a.status === "pending" && (a.reviewer_id === me?.id || me?.isStaff) && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => setDecision({ id: a.id, status: "approved" })}
                      >
                        <Check /> {tx("اعتماد", "Approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setDecision({ id: a.id, status: "changes_requested" })}
                      >
                        <RotateCcw />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDecision({ id: a.id, status: "rejected" })}
                      >
                        <X />
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {decision && (
        <DecisionDialog
          open
          onOpenChange={(v) => !v && setDecision(null)}
          approvalId={decision.id}
          decision={decision.status}
        />
      )}
    </div>
  );
}
