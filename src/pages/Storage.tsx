import { useState } from "react";
import { Link } from "react-router-dom";
import { Cloud, HardDrive, Box, Server, ExternalLink, Search, ArrowRight, FolderOpen } from "lucide-react";

type Provider = {
  id: string;
  name: string;
  desc: string;
  url: string;
  icon: typeof Cloud;
  status: "pending" | "connected";
};

const PROVIDERS: Provider[] = [
  { id: "gdrive", name: "Google Drive", desc: "ملفات ومستندات جوجل", url: "https://drive.google.com", icon: HardDrive, status: "pending" },
  { id: "onedrive", name: "OneDrive", desc: "تخزين مايكروسوفت الشخصي والعمل", url: "https://onedrive.live.com", icon: Cloud, status: "pending" },
  { id: "terabox", name: "TeraBox", desc: "مساحة تخزين كبيرة للأرشيف والوسائط", url: "https://www.terabox.com", icon: Box, status: "pending" },
  { id: "azure", name: "Microsoft Azure", desc: "حاويات Azure Blob Storage", url: "https://portal.azure.com/#browse/Microsoft.Storage%2FStorageAccounts", icon: Server, status: "pending" },
];

export default function Storage() {
  const [q, setQ] = useState("");
  const list = PROVIDERS.filter((p) => (p.name + p.desc).toLowerCase().includes(q.toLowerCase()));

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <FolderOpen className="w-6 h-6" /> إدارة المخازن السحابية
            </h1>
            <p className="text-sm text-muted-foreground mt-1">كل مساحات التخزين في واجهة واحدة</p>
          </div>
          <Link to="/" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
            <ArrowRight className="w-4 h-4" /> البوابة
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن مخزن..."
            className="w-full rounded-lg border border-input bg-background py-2 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 transition hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${p.status === "connected" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                    {p.status === "connected" ? "مربوط" : "بانتظار الربط"}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90">
                  فتح المخزن <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
