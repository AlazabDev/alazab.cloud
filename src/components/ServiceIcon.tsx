import {
  HardHat,
  Images,
  PenTool,
  Key,
  Database,
  Globe,
  Building2,
  Briefcase,
  Wrench,
  Layers,
  Truck,
  Store,
  Users,
  ShieldCheck,
  FileText,
  BarChart3,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

export const ICON_OPTIONS: { id: string; labelAr: string; labelEn: string; icon: LucideIcon }[] = [
  { id: "hardhat", labelAr: "إنشاءات ومشاريع", labelEn: "Construction", icon: HardHat },
  { id: "images", labelAr: "معارض وصور", labelEn: "Exhibitions", icon: Images },
  { id: "pen", labelAr: "مدونة ومقالات", labelEn: "Blog", icon: PenTool },
  { id: "key", labelAr: "بوابات ودخول", labelEn: "Portal & Auth", icon: Key },
  { id: "database", labelAr: "قواعد وبيئة Frappe", labelEn: "Database & Frappe", icon: Database },
  { id: "globe", labelAr: "موقع عام", labelEn: "Website", icon: Globe },
  { id: "building", labelAr: "إدارة ومقرات", labelEn: "Corporate", icon: Building2 },
  { id: "briefcase", labelAr: "أعمال وإدارة", labelEn: "Business", icon: Briefcase },
  { id: "wrench", labelAr: "خدمات وصيانة", labelEn: "Services", icon: Wrench },
  { id: "layers", labelAr: "أنظمة متعددة", labelEn: "Systems", icon: Layers },
  { id: "truck", labelAr: "لوجستيات وتوريد", labelEn: "Logistics", icon: Truck },
  { id: "store", labelAr: "متجر أو منافذ", labelEn: "Store", icon: Store },
  { id: "users", labelAr: "عملاء وموظفين", labelEn: "Users", icon: Users },
  { id: "shield", labelAr: "أمان ومصادقة", labelEn: "Security", icon: ShieldCheck },
  { id: "file-text", labelAr: "مستندات وتقارير", labelEn: "Documents", icon: FileText },
  { id: "bar-chart", labelAr: "إحصاءات ومتابعة", labelEn: "Analytics", icon: BarChart3 },
];

const ICON_MAP: Record<string, LucideIcon> = {
  hardhat: HardHat,
  images: Images,
  pen: PenTool,
  key: Key,
  database: Database,
  globe: Globe,
  building: Building2,
  briefcase: Briefcase,
  wrench: Wrench,
  layers: Layers,
  truck: Truck,
  store: Store,
  users: Users,
  shield: ShieldCheck,
  "file-text": FileText,
  "bar-chart": BarChart3,
};

interface ServiceIconProps {
  icon?: string;
  className?: string;
}

export default function ServiceIcon({ icon, className = "w-5 h-5" }: ServiceIconProps) {
  if (!icon) {
    return <Globe className={className} />;
  }

  // دعم الروابط المباشرة لصور مخصصة
  if (icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("data:")) {
    return (
      <img
        src={icon}
        alt=""
        className={`${className} object-contain rounded`}
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
      />
    );
  }

  const Matched = ICON_MAP[icon.toLowerCase()] || ExternalLink;
  return <Matched className={className} />;
}
