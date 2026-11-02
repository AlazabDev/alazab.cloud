import { STARTER_CATALOG, type ServiceItem } from "@/data/catalog";

const CATALOG_KEY = "alazab-cloud-catalog-v1";

export function loadCatalog(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return [...STARTER_CATALOG];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (s): s is ServiceItem => !!s && typeof s.url === "string" && typeof s.name === "string"
      );
    }
  } catch {
    /* corrupted or unavailable storage — fall back to starter */
  }
  return [...STARTER_CATALOG];
}

export function saveCatalog(items: ServiceItem[]): void {
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — changes stay in memory for this session */
  }
}

export function resetCatalog(): ServiceItem[] {
  try {
    localStorage.removeItem(CATALOG_KEY);
  } catch {
    /* ignore */
  }
  return [...STARTER_CATALOG];
}

export function newId(): string {
  return `svc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
