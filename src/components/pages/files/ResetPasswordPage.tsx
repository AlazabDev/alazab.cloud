import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTx } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "@/components/files/ui";

export default function ResetPasswordPage() {
  const tx = useTx();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(tx("تم تحديث كلمة المرور", "Password updated"));
    router.history.replace("/files");
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md card-glow rounded-2xl p-8">
        <KeyRound className="w-9 h-9 text-primary" />
        <h1 className="mt-3 text-xl font-bold">{tx("تعيين كلمة مرور جديدة", "Set a new password")}</h1>
        {ready ? (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label={tx("كلمة المرور الجديدة", "New password")}>
              <input required minLength={8} type="password" dir="ltr" autoComplete="new-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {tx("حفظ", "Save")}
            </Button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {tx("افتح هذه الصفحة من الرابط المرسل إلى بريدك الإلكتروني.", "Open this page from the link sent to your email.")}
          </p>
        )}
      </div>
    </div>
  );
}
