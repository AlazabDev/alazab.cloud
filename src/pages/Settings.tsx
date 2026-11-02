import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Save,
  X,
  ExternalLink,
  Shield,
  Database,
  Globe,
} from "lucide-react";
import { loadCatalog, saveCatalog, resetCatalog, newId } from "@/lib/catalog";
import { STARTER_CATALOG, type ServiceItem, type ServiceCategory } from "@/data/catalog";
import { useLang } from "@/lib/i18n";
import ServiceIcon, { ICON_OPTIONS } from "@/components/ServiceIcon";

const EMPTY_FORM: Omit<ServiceItem, "id"> = {
  name: "",
  nameEn: "",
  url: "",
  icon: "globe",
  description: "",
  descriptionEn: "",
  category: "public",
};

export default function Settings() {
  const { t, lang, setLang, dir } = useLang();
  const [items, setItems] = useState<ServiceItem[]>(() => loadCatalog());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ServiceItem, "id">>(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const DirArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const notify = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 3000);
  };

  const startAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const startEdit = (item: ServiceItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      nameEn: item.nameEn || "",
      url: item.url,
      icon: item.icon || "globe",
      description: item.description || "",
      descriptionEn: item.descriptionEn || "",
      category: item.category,
    });
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;

    let updated: ServiceItem[];
    if (editingId) {
      updated = items.map((it) => (it.id === editingId ? { ...form, id: editingId } : it));
    } else {
      updated = [{ ...form, id: newId() }, ...items];
    }

    setItems(updated);
    saveCatalog(updated);
    setIsFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    notify(t.saved);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t.removeConfirm)) return;
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    saveCatalog(updated);
    notify(t.saved);
  };

  const handleReset = () => {
    if (!window.confirm(t.resetConfirm)) return;
    const reset = resetCatalog();
    setItems(reset);
    notify(t.saved);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/10">
        <div className="section-container flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 h-10 rounded-lg border border-border hover:border-primary/60 hover:text-primary transition-colors text-sm font-semibold"
            >
              <DirArrow className="w-4 h-4" />
              <span>{t.backHome}</span>
            </Link>
            <div className="h-5 w-px bg-border hidden sm:block" />
            <h1 className="font-display font-bold text-lg hidden sm:block">{t.settingsTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="h-10 px-3 rounded-lg border border-border text-sm font-semibold hover:border-primary/60 hover:text-primary transition-colors"
            >
              {lang === "ar" ? "EN" : "ع"}
            </button>
            <button
              onClick={startAdd}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addService}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section-container flex-1 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-display font-bold">{t.settingsTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.settingsSub}</p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.reset}</span>
          </button>
        </div>

        {msg && (
          <div className="mt-4 p-3 rounded-lg bg-primary-muted text-primary border border-primary/30 text-sm font-medium animate-fade-in">
            {msg}
          </div>
        )}

        {/* Modal / Form Drawer */}
        {isFormOpen && (
          <div className="my-6 p-6 rounded-xl border border-primary/40 bg-card shadow-lg animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <h3 className="font-display font-bold text-lg">
                {editingId ? t.editService : t.addService}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                    {t.fieldNameAr} *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: الموقع الرسمي للعزب"
                    className="w-full h-10 px-3 rounded-lg bg-secondary/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                    {t.fieldNameEn}
                  </label>
                  <input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="e.g. Alazab Official Site"
                    className="w-full h-10 px-3 rounded-lg bg-secondary/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                  {t.fieldUrl} *
                </label>
                <input
                  required
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-lg bg-secondary/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                    {t.fieldDescAr}
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-3 rounded-lg bg-secondary/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                    {t.fieldDescEn}
                  </label>
                  <textarea
                    rows={2}
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="w-full p-3 rounded-lg bg-secondary/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">
                  {t.fieldCategory}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: "public", label: t.catPublic, icon: Globe },
                      { id: "private", label: t.catPrivate, icon: Shield },
                      { id: "frappe", label: t.catFrappe, icon: Database },
                    ] as const
                  ).map((cat) => {
                    const Icon = cat.icon;
                    const active = form.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.id as ServiceCategory })}
                        className={`p-3 rounded-lg border text-start flex items-center gap-2.5 transition-colors ${
                          active
                            ? "border-primary bg-primary-muted text-primary"
                            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-semibold">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-xs font-semibold mb-2 text-muted-foreground">
                  {t.fieldIcon}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = form.icon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setForm({ ...form, icon: opt.id })}
                        title={lang === "ar" ? opt.labelAr : opt.labelEn}
                        className={`h-11 rounded-lg border grid place-items-center transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow"
                            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 h-10 rounded-lg border border-border text-sm font-semibold hover:bg-secondary/60 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Catalog List */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">{t.currentServices}</h3>
          <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
            {items.map((it) => (
              <div
                key={it.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="grid place-items-center w-10 h-10 rounded-lg bg-secondary border border-border shrink-0">
                    <ServiceIcon icon={it.icon} className="w-5 h-5 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">
                        {lang === "en" && it.nameEn ? it.nameEn : it.name}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground shrink-0">
                        {it.category}
                      </span>
                    </div>
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary/80 hover:underline truncate block"
                    >
                      {it.url}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startEdit(it)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title={t.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(it.id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    title={t.remove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
