import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang, useTx } from "@/lib/i18n";
import { formatDate, type AppRole } from "@/lib/files/constants";
import { meQuery, peopleQuery } from "@/lib/files/queries";
import { EmptyState, PageHeader } from "@/components/files/ui";

type Access = AppRole | "none";

export default function UsersPage() {
  const tx = useTx();
  const { lang } = useLang();
  const qc = useQueryClient();
  const { data: me } = useSuspenseQuery(meQuery());
  const { data: people } = useSuspenseQuery(peopleQuery());

  if (!me?.isAdmin) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6" />}
        title={tx("هذه الصفحة لمدير النظام فقط", "Administrators only")}
      />
    );
  }

  const options: { id: Access; label: string }[] = [
    { id: "none", label: tx("بدون صلاحية", "No access") },
    { id: "client", label: tx("عميل", "Client") },
    { id: "staff", label: tx("موظف", "Staff") },
    { id: "admin", label: tx("مدير النظام", "Administrator") },
  ];

  async function setAccess(userId: string, current: AppRole[], next: Access) {
    const toRemove = current.filter((r) => r !== next);
    if (toRemove.length) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .in("role", toRemove);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    if (next !== "none" && !current.includes(next)) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: next });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    toast.success(tx("تم تحديث الصلاحية", "Access updated"));
    await qc.invalidateQueries({ queryKey: ["files"] });
  }

  const pending = people.filter((p) => p.roles.length === 0);

  return (
    <div>
      <PageHeader
        title={tx("المستخدمون والصلاحيات", "Users & access")}
        subtitle={tx(
          "حدّد نوع كل حساب. الموظفون يرون مشروعاتهم، والعملاء يرون فقط ما يُتاح لهم من مشروعاتهم.",
          "Set each account's type. Staff see their projects; clients only see what's released to them.",
        )}
      />
      {pending.length > 0 && (
        <p className="mb-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
          {tx(
            `${pending.length} حساب جديد بانتظار تحديد الصلاحية`,
            `${pending.length} new account(s) awaiting access`,
          )}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-border bg-card/40">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground border-b border-border">
            <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:text-start [&>th]:font-medium">
              <th>{tx("الاسم", "Name")}</th>
              <th>{tx("البريد", "Email")}</th>
              <th>{tx("الشركة", "Company")}</th>
              <th>{tx("تاريخ التسجيل", "Joined")}</th>
              <th>{tx("الصلاحية", "Access")}</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => {
              const current: Access = p.roles.includes("admin")
                ? "admin"
                : p.roles.includes("staff")
                  ? "staff"
                  : p.roles.includes("client")
                    ? "client"
                    : "none";
              return (
                <tr
                  key={p.id}
                  className="border-b border-border/50 last:border-0 [&>td]:px-3 [&>td]:py-2.5"
                >
                  <td className="font-medium">{p.full_name || "—"}</td>
                  <td className="text-xs" dir="ltr">
                    {p.email}
                  </td>
                  <td className="text-xs text-muted-foreground">{p.company || "—"}</td>
                  <td className="text-xs text-muted-foreground">
                    {formatDate(p.created_at, lang)}
                  </td>
                  <td>
                    <select
                      className={`h-8 rounded-md border bg-background/60 px-2 text-xs ${current === "none" ? "border-primary/60" : "border-input"}`}
                      value={current}
                      disabled={p.id === me.id}
                      onChange={(e) => setAccess(p.id, p.roles, e.target.value as Access)}
                    >
                      {options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
