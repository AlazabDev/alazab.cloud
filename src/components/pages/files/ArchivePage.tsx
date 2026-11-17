import { useSuspenseQuery } from "@tanstack/react-query";
import { Archive } from "lucide-react";
import { useTx } from "@/lib/i18n";
import { documentsQuery } from "@/lib/files/queries";
import DocumentsView from "@/components/files/DocumentsView";
import { EmptyState, PageHeader } from "@/components/files/ui";

export default function ArchivePage() {
  const tx = useTx();
  const { data: docs } = useSuspenseQuery(documentsQuery({ archived: true }));
  return (
    <div>
      <PageHeader
        title={tx("الأرشيف", "Archive")}
        subtitle={tx("مستندات خارج التداول اليومي، محفوظة بكل إصداراتها. افتح أي مستند لاستعادته.", "Documents out of daily use, kept with all revisions. Open one to restore it.")}
      />
      {docs.length === 0 ? <EmptyState icon={<Archive className="w-6 h-6" />} title={tx("الأرشيف فارغ", "The archive is empty")} /> : <DocumentsView docs={docs} view="list" />}
    </div>
  );
}
