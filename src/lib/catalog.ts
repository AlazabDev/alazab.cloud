import { supabase } from "@/integrations/supabase/client";
import { STARTER_CATALOG, type ServiceCategory, type ServiceItem } from "@/data/catalog";

// The service directory is shared: stored in the portal_services table, readable by everyone,
// editable only by signed-in staff (enforced by database access rules).

type Row = {
  id: string;
  name: string;
  name_en: string;
  url: string;
  icon: string;
  description: string;
  description_en: string;
  category: string;
};

function fromRow(r: Row): ServiceItem {
  return {
    id: r.id,
    name: r.name,
    nameEn: r.name_en,
    url: r.url,
    icon: r.icon,
    description: r.description,
    descriptionEn: r.description_en,
    category: (["public", "private", "frappe"].includes(r.category)
      ? r.category
      : "public") as ServiceCategory,
  };
}

export async function loadCatalog(): Promise<ServiceItem[]> {
  const { data, error } = await supabase
    .from("portal_services")
    .select("id,name,name_en,url,icon,description,description_en,category")
    .order("sort_order")
    .order("created_at");
  if (error || !data) return [...STARTER_CATALOG];
  return (data as Row[]).map(fromRow);
}

/** Inserts or updates one service; returns an Arabic/English-neutral error code on failure. */
export async function saveService(
  item: Omit<ServiceItem, "id">,
  id?: string,
): Promise<{ ok: true } | { ok: false; reason: "signin" | "error" }> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, reason: "signin" };
  const row = {
    name: item.name.trim(),
    name_en: item.nameEn.trim(),
    url: item.url.trim(),
    icon: item.icon,
    description: item.description.trim(),
    description_en: item.descriptionEn.trim(),
    category: item.category,
  };
  const res = id
    ? await supabase.from("portal_services").update(row).eq("id", id).select("id")
    : await supabase
        .from("portal_services")
        .insert({ ...row, created_by: auth.user.id })
        .select("id");
  if (res.error || !res.data?.length) return { ok: false, reason: res.error ? "error" : "signin" };
  return { ok: true };
}

export async function deleteService(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: "signin" | "error" }> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, reason: "signin" };
  const res = await supabase.from("portal_services").delete().eq("id", id).select("id");
  if (res.error || !res.data?.length) return { ok: false, reason: res.error ? "error" : "signin" };
  return { ok: true };
}
