import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink, Settings as SettingsIcon, Globe, Lock, Database, ArrowRight, ArrowLeft, Plus, X, Check } from "lucide-react";
import { loadCatalog, saveCatalog, resetCatalog, newId } from "@/lib/catalog";
import { STARTER_CATALOG, type ServiceItem, type ServiceCategory } from "@/data/catalog";
import { useLang } from "@/lib/i18n";
import ServiceIcon from "@/components/ServiceIcon";

const TABS = ["all", "public", "private", "frappe"] as const;
type Tab = (typeof TABS)[number];

export default function Index() {
  const { t, lang, setLang, dir } = useLang();
  const [catalog, setCatalog] = useState<ServiceItem[]>(() => loadCatalog());
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((s) => {
      if (tab !== "all" && s.category !== tab) return false;
      if (!q) return true;
      return [s.name, s.nameEn, s.description, s.descriptionEn, s.url]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [catalog, query, tab]);

  const openWebSearch = () => {
    const q = query.trim();
    if (q) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank", "noopener,noreferrer");
  };

  const tabLabel: Record<Tab, string> = {
    all: t.tabs.all,
    public: t.tabs.public,
    private: t.tabs.private,
    frappe: t.tabs.frappe,
  };

  const DirArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/10">
        <div className="section-container flex items-center gap-3 h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Alazab Cloud">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg">
              A
            </span>
            <span className="font-display font-bold tracking-tight leading-none">
              ALAZAB <span className="text-primary">CLOUD</span>
            </span>
          </Link>

          <div className="flex-1 min-w-0 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && openWebSearch()}
              placeholder={t.searchPlaceholder}
              className="w-full h-10 rounded-lg bg-secondary/60 border border-border ps-9 pe-3 text-sm outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring"
            />
          </div>

          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="h-10 px-3 rounded-lg border border-border text-sm font-semibold hover:border-primary/60 hover:text-primary transition-colors shrink-0"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>
          <Link
            to="/settings"
            aria-label={t.settings}
            className="grid place-items-center w-10 h-10 rounded-lg border border-border hover:border-primary/60 hover:text-primary transition-colors shrink-0"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="section-container pt-12 pb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-display font-bold">
          <span className="gradient-text">{t.tagline}</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          {t.taglineSub}
        </p>
      </section>

      {/* Tabs */}
      <nav className="section-container sticky top-16 z-10 pb-4">
        <div className="flex flex-wrap justify-center gap-2">
          {TABS.map((tabId) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`px-4 h-9 rounded-full text-sm font-medium border transition-colors ${
                tab === tabId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {tabLabel[tabId]}
            </button>
          ))}
        </div>
      </nav>

      {/* Service grid */}
      <main className="section-container flex-1 pb-16">
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover group rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid place-items-center w-11 h-11 rounded-lg bg-secondary border border-border group-hover:border-primary/50 transition-colors">
                    <ServiceIcon icon={s.icon} className="w-5 h-5 text-primary" />
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base">
                    {lang === "en" && s.nameEn ? s.nameEn : s.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {lang === "en" && s.descriptionEn ? s.descriptionEn : s.description}
                  </p>
                </div>
                {s.category === "private" && (
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
                    <Lock className="w-3 h-3" /> {t.badges.private}
                  </span>
                )}
                {s.category === "frappe" && (
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
                    <Database className="w-3 h-3" /> {t.badges.frappe}
                  </span>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Globe className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">{query ? t.noResults : t.noResults}</p>
            {query.trim() && (
              <button
                onClick={openWebSearch}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 h-10 text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                <Search className="w-4 h-4" />
                {t.webSearchFor(query.trim())}
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{t.footerRights}</p>
          <p className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-primary" />
            {t.footerNote}
            <Link to="/settings" className="text-primary hover:underline inline-flex items-center gap-1">
              {t.settings} <DirArrow className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
