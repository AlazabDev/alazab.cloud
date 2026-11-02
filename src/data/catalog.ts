/**
 * Alazab Cloud service catalog — starter seed.
 * Real services are managed from the gateway Settings screen;
 * these starter entries are placeholders to be replaced there.
 */

export type ServiceCategory = "public" | "private" | "frappe";

export interface ServiceItem {
  id: string;
  /** Arabic name (primary) */
  name: string;
  /** English name (fallback: Arabic name) */
  nameEn: string;
  url: string;
  /** Lucide icon key from ICON_CHOICES, or an image URL */
  icon: string;
  description: string;
  descriptionEn: string;
  category: ServiceCategory;
}

export const STARTER_CATALOG: ServiceItem[] = [
  {
    id: "alazab-site",
    name: "الموقع الرسمي للعزب",
    nameEn: "Alazab Official Site",
    url: "https://example.com",
    icon: "hardhat",
    description: "أخبار ومعلومات مجموعة العزب",
    descriptionEn: "News and information about the Alazab group",
    category: "public",
  },
  {
    id: "alazab-exhibitions",
    name: "معارض العزب",
    nameEn: "Alazab Exhibitions",
    url: "https://example.com",
    icon: "images",
    description: "المعارض والمشاريع",
    descriptionEn: "Exhibitions and projects",
    category: "public",
  },
  {
    id: "alazab-blog",
    name: "مدونة العزب",
    nameEn: "Alazab Blog",
    url: "https://example.com",
    icon: "pen",
    description: "مقالات وتحديثات",
    descriptionEn: "Articles and updates",
    category: "public",
  },
  {
    id: "alazab-portal",
    name: "بوابة العملاء",
    nameEn: "Client Portal",
    url: "https://example.com",
    icon: "key",
    description: "خدمات العملاء — الدخول عند فتح الخدمة",
    descriptionEn: "Client services — sign-in on open",
    category: "private",
  },
  {
    id: "alazab-frappe",
    name: "بيئة Frappe",
    nameEn: "Frappe Workspace",
    url: "https://example.com",
    icon: "database",
    description: "نظام إدارة العزب وتطبيقاته",
    descriptionEn: "The Alazab management system and its apps",
    category: "frappe",
  },
];
