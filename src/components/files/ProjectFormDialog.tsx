import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLang, useTx } from "@/lib/i18n";
import { PROJECT_STATUSES } from "@/lib/files/constants";
import { Field, inputCls, selectCls, textareaCls } from "./ui";

type ProjectInput = {
  id?: string;
  name: string;
  code: string | null;
  client_name: string | null;
  location: string | null;
  status: string;
  description: string | null;
};

export default function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project?: ProjectInput;
}) {
  const tx = useTx();
  const { lang } = useLang();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", code: "", client_name: "", location: "", status: "active", description: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: project?.name ?? "",
        code: project?.code ?? "",
        client_name: project?.client_name ?? "",
        location: project?.location ?? "",
        status: project?.status ?? "active",
        description: project?.description ?? "",
      });
    }
  }, [open, project]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || null,
      client_name: form.client_name.trim() || null,
      location: form.location.trim() || null,
      status: form.status,
      description: form.description.trim() || null,
    };
    try {
      if (project?.id) {
        const { error } = await supabase.from("projects").update(payload).eq("id", project.id);
        if (error) throw error;
        toast.success(tx("تم حفظ المشروع", "Project saved"));
      } else {
        const { data: auth } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("projects")
          .insert({ ...payload, created_by: auth.user?.id ?? null })
          .select("id")
          .single();
        if (error) throw error;
        toast.success(tx("تم إنشاء المشروع", "Project created"));
        navigate({ to: "/files/projects/$projectId", params: { projectId: data.id } });
      }
      await qc.invalidateQueries({ queryKey: ["files"] });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{project?.id ? tx("تعديل المشروع", "Edit project") : tx("مشروع جديد", "New project")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label={tx("اسم المشروع", "Project name")}>
              <input required className={inputCls} value={form.name} onChange={set("name")} />
            </Field>
          </div>
          <Field label={tx("كود المشروع", "Project code")}>
            <input className={inputCls} dir="ltr" value={form.code} onChange={set("code")} placeholder="AZB-2026-014" />
          </Field>
          <Field label={tx("الحالة", "Status")}>
            <select className={selectCls} value={form.status} onChange={set("status")}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === "ar" ? s.ar : s.en}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tx("العميل", "Client")}>
            <input className={inputCls} value={form.client_name} onChange={set("client_name")} />
          </Field>
          <Field label={tx("الموقع", "Location")}>
            <input className={inputCls} value={form.location} onChange={set("location")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={tx("وصف مختصر", "Short description")}>
              <textarea className={textareaCls} value={form.description} onChange={set("description")} />
            </Field>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tx("إلغاء", "Cancel")}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {tx("حفظ", "Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
