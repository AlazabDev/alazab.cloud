import { Link, Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  FolderKanban,
  Images,
  FileCheck2,
  Share2,
  Archive,
  Users,
  LogOut,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { meQuery } from "@/lib/files/queries";
import { useLang, useTx } from "@/lib/i18n";

export default function FilesShell() {
  const { data: me } = useSuspenseQuery(meQuery());
  const tx = useTx();
  const { lang, setLang, dir } = useLang();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await router.invalidate();
    navigate({ to: "/auth", search: {}, replace: true });
  }

  const nav = [
    { to: "/files", label: tx("الرئيسية", "Home"), icon: LayoutGrid, exact: true, show: true },
    { to: "/files/projects", label: tx("المشروعات", "Projects"), icon: FolderKanban, exact: false, show: true },
    { to: "/files/gallery", label: tx("المعرض", "Gallery"), icon: Images, exact: false, show: true },
    { to: "/files/approvals", label: tx("الاعتمادات", "Approvals"), icon: FileCheck2, exact: false, show: true },
    { to: "/files/shares", label: tx("المشاركات", "Shares"), icon: Share2, exact: false, show: me?.isStaff ?? false },
    { to: "/files/archive", label: tx("الأرشيف", "Archive"), icon: Archive, exact: false, show: me?.isStaff ?? false },
    { to: "/files/users", label: tx("المستخدمون", "Users"), icon: Users, exact: false, show: me?.isAdmin ?? false },
  ] as const;

  const displayName = me?.profile?.full_name || me?.email || "";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 glass-header">
        <div className="flex items-center gap-3 h-16 px-4 lg:px-6">
          <Link to="/files" className="flex items-center gap-2.5 shrink-0">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <FolderOpen className="w-5 h-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display font-bold text-base tracking-tight">
                ALAZAB <span className="text-primary">Files</span>
              </span>
              <span className="block text-[11px] text-muted-foreground">Enterprise Gallery</span>
            </span>
          </Link>

          <div className="flex-1" />

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Back className="w-3.5 h-3.5" /> {tx("البوابة", "Gateway")}
          </Link>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="h-9 px-3 rounded-lg border border-border bg-secondary/30 text-sm font-semibold hover:border-primary/60 hover:text-primary transition-colors"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>
          <div className="hidden md:flex flex-col items-end leading-tight max-w-48">
            <span className="text-sm font-medium truncate max-w-48">{displayName}</span>
            <span className="text-[11px] text-muted-foreground">
              {me?.isAdmin
                ? tx("مدير النظام", "Administrator")
                : me?.isStaff
                  ? tx("موظف", "Staff")
                  : me?.isClient
                    ? tx("عميل", "Client")
                    : tx("بانتظار التفعيل", "Awaiting access")}
            </span>
          </div>
          <button
            onClick={signOut}
            aria-label={tx("تسجيل الخروج", "Sign out")}
            title={tx("تسجيل الخروج", "Sign out")}
            className="grid place-items-center w-9 h-9 rounded-lg border border-border bg-secondary/30 hover:border-destructive/60 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {me?.hasAccess && (
          <nav className="lg:hidden flex gap-1 overflow-x-auto px-3 pb-2">
            {nav
              .filter((n) => n.show)
              .map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.exact }}
                  className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs border border-border text-muted-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:border-primary"
                >
                  <n.icon className="w-3.5 h-3.5" />
                  {n.label}
                </Link>
              ))}
          </nav>
        )}
      </header>

      <div className="flex flex-1">
        {me?.hasAccess && (
          <aside className="hidden lg:block w-60 shrink-0 border-e border-border bg-sidebar/60">
            <nav className="sticky top-16 p-3 space-y-1">
              {nav
                .filter((n) => n.show)
                .map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    activeOptions={{ exact: n.exact }}
                    className="flex items-center gap-3 h-10 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors data-[status=active]:bg-primary/10 data-[status=active]:text-primary data-[status=active]:font-semibold"
                  >
                    <n.icon className="w-4 h-4" />
                    {n.label}
                  </Link>
                ))}
            </nav>
          </aside>
        )}
        <main className="flex-1 min-w-0 p-4 lg:p-8">
          {me?.hasAccess ? (
            <Outlet />
          ) : (
            <div className="max-w-lg mx-auto mt-16 text-center card-glow rounded-2xl p-8">
              <Clock className="w-10 h-10 mx-auto text-primary" />
              <h1 className="mt-4 text-xl font-bold">{tx("حسابك بانتظار التفعيل", "Your account is awaiting access")}</h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {tx(
                  "تم إنشاء حسابك بنجاح. سيقوم مدير النظام في العزب بتحديد صلاحياتك (موظف أو عميل) وربطك بمشروعاتك، ثم يمكنك الدخول للمعرض.",
                  "Your account was created. An Alazab administrator will set your access (staff or client) and add you to your projects.",
                )}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">{me?.email}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
