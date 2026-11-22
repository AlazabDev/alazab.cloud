import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { FolderOpen, Loader2, MailCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getRouteApi } from "@tanstack/react-router";

const Route = getRouteApi("/auth");
import { useLang, useTx } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "@/components/files/ui";

type Mode = "signin" | "signup" | "forgot";

function safeRedirect(target: string | undefined): string {
  if (!target) return "/files";
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return "/files";
    return url.pathname + url.search;
  } catch {
    return "/files";
  }
}

export default function AuthPage() {
  const tx = useTx();
  const { lang, setLang, dir } = useLang();
  const router = useRouter();
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.history.replace(safeRedirect(search.redirect));
    });
  }, [router, search.redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await router.invalidate();
        router.history.replace(safeRedirect(search.redirect));
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/files`,
            data: { full_name: fullName, company },
          },
        });
        if (error) throw error;
        if (data.session) {
          await router.invalidate();
          router.history.replace("/files");
        } else {
          setSentTo(email);
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSentTo(email);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        msg.includes("Invalid login")
          ? tx("البريد أو كلمة المرور غير صحيحة", "Wrong email or password")
          : msg.includes("Email not confirmed")
            ? tx(
                "يرجى تأكيد بريدك الإلكتروني أولًا من الرسالة المرسلة إليك",
                "Please confirm your email first",
              )
            : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Back className="w-3.5 h-3.5" /> {tx("البوابة", "Gateway")}
          </Link>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:text-primary"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>
        </div>
        <div className="card-glow rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary text-primary-foreground">
              <FolderOpen className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-lg font-bold">
                ALAZAB <span className="text-primary">Files</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {tx(
                  "معرض ملفات المشروعات — للموظفين والعملاء",
                  "Project files gallery — staff & clients",
                )}
              </p>
            </div>
          </div>

          {sentTo ? (
            <div className="text-center py-4">
              <MailCheck className="w-10 h-10 mx-auto text-primary" />
              <p className="mt-3 font-medium">
                {tx("تحقق من بريدك الإلكتروني", "Check your email")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "forgot"
                  ? tx(
                      `أرسلنا رابط تعيين كلمة المرور إلى ${sentTo}`,
                      `We sent a reset link to ${sentTo}`,
                    )
                  : tx(
                      `أرسلنا رابط تأكيد الحساب إلى ${sentTo}. بعد التأكيد سجّل الدخول.`,
                      `We sent a confirmation link to ${sentTo}. Confirm, then sign in.`,
                    )}
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => {
                  setSentTo(null);
                  setMode("signin");
                }}
              >
                {tx("العودة لتسجيل الدخول", "Back to sign in")}
              </Button>
            </div>
          ) : (
            <>
              {mode !== "forgot" && (
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-secondary/60 mb-5">
                  {(["signin", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`h-9 rounded-md text-sm font-medium transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {m === "signin"
                        ? tx("تسجيل الدخول", "Sign in")
                        : tx("حساب جديد", "Create account")}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && (
                  <>
                    <Field label={tx("الاسم الكامل", "Full name")}>
                      <input
                        required
                        className={inputCls}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </Field>
                    <Field label={tx("الشركة / الجهة (للعملاء)", "Company (for clients)")}>
                      <input
                        className={inputCls}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </Field>
                  </>
                )}
                <Field label={tx("البريد الإلكتروني", "Email")}>
                  <input
                    required
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    className={inputCls}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                {mode !== "forgot" && (
                  <Field label={tx("كلمة المرور", "Password")}>
                    <input
                      required
                      type="password"
                      dir="ltr"
                      minLength={8}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className={inputCls}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                )}
                <Button type="submit" className="w-full h-10" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  {mode === "signin"
                    ? tx("دخول", "Sign in")
                    : mode === "signup"
                      ? tx("إنشاء الحساب", "Create account")
                      : tx("إرسال رابط التعيين", "Send reset link")}
                </Button>
              </form>
              <div className="mt-4 text-center text-xs">
                {mode === "forgot" ? (
                  <button
                    className="text-primary hover:underline"
                    onClick={() => setMode("signin")}
                  >
                    {tx("العودة لتسجيل الدخول", "Back to sign in")}
                  </button>
                ) : (
                  <button
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => setMode("forgot")}
                  >
                    {tx("نسيت كلمة المرور؟", "Forgot password?")}
                  </button>
                )}
              </div>
              {mode === "signup" && (
                <p className="mt-4 text-[11px] text-muted-foreground text-center leading-relaxed">
                  {tx(
                    "بعد إنشاء الحساب يحدد مدير النظام صلاحياتك ويربطك بمشروعاتك.",
                    "After sign-up, an administrator sets your access and adds you to your projects.",
                  )}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
