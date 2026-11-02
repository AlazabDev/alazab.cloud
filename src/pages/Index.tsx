import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  ExternalLink, 
  Settings as SettingsIcon, 
  Globe, 
  Lock, 
  Database, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  X, 
  Command, 
  Sparkles 
} from "lucide-react";
import { loadCatalog } from "@/lib/catalog";
import { type ServiceItem } from "@/data/catalog";
import { useLang } from "@/lib/i18n";
import ServiceIcon from "@/components/ServiceIcon";

const TABS = ["all", "public", "private", "frappe"] as const;
type Tab = (typeof TABS)[number];

export default function Index() {
  const { t, lang, setLang, dir } = useLang();
  const [catalog] = useState<ServiceItem[]>(() => loadCatalog());
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // اختصار Ctrl+K أو ⌘K للتركيز المباشر على البحث
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // حساب أعداد الخدمات لكل تبويب
  const counts = useMemo(() => {
    return {
      all: catalog.length,
      public: catalog.filter((s) => s.category === "public").length,
      private: catalog.filter((s) => s.category === "private").length,
      frappe: catalog.filter((s) => s.category === "frappe").length,
    };
  }, [catalog]);

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
    <div className="min-h-screen flex flex-col relative selection:bg-primary/30">
      {/* Header مع هالة خفيفة */}
      <header className="sticky top-0 z-30 glass-header transition-all">
        <div className="section-container flex items-center gap-3 h-16">
          {/* الشعار */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Alazab Cloud">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              A
            </span>
            <span className="font-display font-bold tracking-tight leading-none text-base sm:text-lg">
              ALAZAB <span className="text-primary group-hover:drop-shadow-[0_0_8px_rgba(255,185,0,0.5)] transition-all">CLOUD</span>
            </span>
          </Link>

          {/* حقل البحث المتطور */}
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors peer-focus:text-primary pointer-events-none" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && openWebSearch()}
              placeholder={t.searchPlaceholder}
              className="peer w-full h-10 rounded-xl bg-secondary/50 border border-border/80 ps-9 pe-16 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/80 transition-all placeholder:text-muted-foreground/70"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                title="مسح"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute end-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-muted-foreground bg-muted/60 border border-border/60 px-1.5 py-0.5 rounded pointer-events-none">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            )}
          </div>

          {/* تغيير اللغة والإعدادات */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="h-10 px-3 rounded-xl border border-border/80 bg-secondary/30 text-sm font-semibold hover:border-primary/60 hover:text-primary transition-all active:scale-95 shrink-0"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>
          <Link
            to="/settings"
            aria-label={t.settings}
            className="grid place-items-center w-10 h-10 rounded-xl border border-border/80 bg-secondary/30 hover:border-primary/60 hover:text-primary transition-all active:scale-95 shrink-0"
          >
            <SettingsIcon className="w-4 h-4 transition-transform hover:rotate-45" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-container pt-12 pb-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>بوابة الدخول الموحدة لكافة أنظمة وخدمات العزب</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight">
          <span className="gradient-text">{t.tagline}</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          {t.taglineSub}
        </p>
      </section>

      {/* Tabs مع العدادات الرقمية */}
      <nav className="section-container sticky top-16 z-20 pb-4 backdrop-blur-md pt-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TABS.map((tabId) => {
            const active = tab === tabId;
            return (
              <button
                key={tabId}
                onClick={() => setTab(tabId)}
                className={`flex items-center gap-2 px-4 h-9 rounded-full text-xs sm:text-sm font-medium border transition-all active:scale-95 ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 font-semibold"
                    : "border-border/80 bg-card/40 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-white/5"
                }`}
              >
                <span>{tabLabel[tabId]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? "bg-black/20 text-black font-bold" : "bg-muted/70 text-muted-foreground"
                  }`}
                >
                  {counts[tabId]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* شريط معلومات البحث */}
      {query && (
        <div className="section-container mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>نتائج البحث عن "{query}": {filtered.length} خدمة</span>
          <button onClick={() => setQuery("")} className="text-primary hover:underline">
            إلغاء التصفية
          </button>
        </div>
      )}

      {/* شبكة الخدمات المتفاعلة */}
      <main className="section-container flex-1 pb-16">
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-glow group rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid place-items-center w-12 h-12 rounded-xl bg-secondary/80 border border-border/80 group-hover:border-primary/60 group-hover:bg-primary/10 transition-all duration-300">
                      <ServiceIcon icon={s.icon} className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </span>
                    <div className="w-8 h-8 rounded-lg grid place-items-center bg-white/0 group-hover:bg-white/5 text-muted-foreground group-hover:text-primary transition-all">
                      <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                      {lang === "en" && s.nameEn ? s.nameEn : s.name}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {lang === "en" && s.descriptionEn ? s.descriptionEn : s.description}
                    </p>
                  </div>
                </div>

                {/* الشارات وحالة النظام */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  {s.category === "private" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                      <Lock className="w-3 h-3" /> {t.badges.private}
                    </span>
                  )}
                  {s.category === "frappe" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-[11px] font-medium text-accent">
                      <Database className="w-3 h-3" /> {t.badges.frappe}
                    </span>
                  )}
                  {s.category === "public" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Globe className="w-3 h-3" /> {t.tabs.public}
                    </span>
                  )}
                  {/* مؤشر الجاهزية الحيوي */}
                  <span className="ms-auto flex items-center gap-1 text-[10px] text-muted-foreground/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    جاهز
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl bg-card/20">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground/60" />
            <p className="mt-4 text-base font-medium">{t.noResults}</p>
            <p className="text-xs text-muted-foreground mt-1">لم نجد خدمة تطابق "{query}" داخل البوابة</p>
            {query.trim() && (
              <button
                onClick={openWebSearch}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 h-11 text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Search className="w-4 h-4" />
                {t.webSearchFor(query.trim())}
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card/30 py-8 mt-auto">
        <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
          <p>{t.footerRights}</p>
          <p className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-primary" />
            {t.footerNote}
            <Link to="/settings" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              {t.settings} <DirArrow className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
