import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const ar = {
  appName: "Alazab Cloud",
  tagline: "بوابة واحدة لكل خدمات العزب",
  taglineSub: "كل ما تقدمه العزب في مكان واحد — واضح، وسريع، ومنظم. دون تسجيل، ودون معرفة أين يستضيف كل نظام.",
  searchPlaceholder: "ابحث في خدمات العزب أو الويب…",
  webSearch: "ابحث في الويب",
  webSearchFor: (q: string) => `ابحث في الويب عن «${q}»`,
  settings: "الإعدادات",
  tabs: {
    all: "كل الخدمات",
    public: "مواقع ومعارض ومدونات",
    private: "أنظمة خاصة",
    frappe: "بيئة Frappe",
  },
  badges: {
    private: "دخول عند الفتح",
    frappe: "بيئة Frappe",
  },
  noResults: "لا توجد نتائج مطابقة في دليل العزب.",
  openService: "فتح",
  footerNote: "تُدار خدمات البوابة من الإعدادات — أضف أي موقع أو نظام جديد دون إعادة تصميم.",
  footerRights: "Alazab Cloud — الواجهة الرقمية الموحدة لمجموعة العزب",
  notFoundTitle: "الصفحة غير موجودة",
  notFoundBody: "الرابط الذي فتحته غير موجود في البوابة.",
  backHome: "العودة إلى البوابة",
  // Settings
  settingsTitle: "إعدادات البوابة",
  settingsSub: "أضف وعدّل واحذف خدمات العزب: الاسم والرابط والأيقونة والتصنيف.",
  addService: "إضافة خدمة",
  editService: "تعديل الخدمة",
  fieldNameAr: "الاسم (عربي)",
  fieldNameEn: "الاسم (إنجليزي)",
  fieldUrl: "الرابط",
  fieldDescAr: "وصف مختصر (عربي)",
  fieldDescEn: "وصف مختصر (إنجليزي)",
  fieldCategory: "التصنيف",
  fieldIcon: "الأيقونة",
  fieldIconUrl: "أو الصق رابط صورة للأيقونة",
  catPublic: "عام — يظهر للجميع",
  catPrivate: "خاص — دخول عند فتح الخدمة",
  catFrappe: "بيئة Frappe",
  save: "حفظ",
  cancel: "إلغاء",
  edit: "تعديل",
  remove: "حذف",
  removeConfirm: "هل تريد حذف هذه الخدمة من الدليل؟",
  reset: "استعادة القائمة الابتدائية",
  resetConfirm: "سيتم استبدال دليلك الحالي بالقائمة الابتدائية. هل تريد المتابعة؟",
  saved: "تم حفظ الدليل",
  currentServices: "الخدمات الحالية",
  requiredHint: "الاسم والرابط مطلوبان",
  addNew: "إضافة جديدة",
};

const en: typeof ar = {
  appName: "Alazab Cloud",
  tagline: "One Gateway. All Alazab Services.",
  taglineSub: "Everything Alazab offers in one place — clear, fast and organized. No sign-up, and no need to know where each system lives.",
  searchPlaceholder: "Search Alazab services or the web…",
  webSearch: "Search the web",
  webSearchFor: (q: string) => `Search the web for “${q}”`,
  settings: "Settings",
  tabs: {
    all: "All services",
    public: "Sites & blogs",
    private: "Private systems",
    frappe: "Frappe workspace",
  },
  badges: {
    private: "Sign-in on open",
    frappe: "Frappe workspace",
  },
  noResults: "No matching services in the Alazab directory.",
  openService: "Open",
  footerNote: "Services are managed from Settings — add any new site or system without redesigning the gateway.",
  footerRights: "Alazab Cloud — the unified digital gateway of the Alazab group",
  notFoundTitle: "Page not found",
  notFoundBody: "This link is not part of the gateway.",
  backHome: "Back to the gateway",
  settingsTitle: "Gateway settings",
  settingsSub: "Add, edit and remove Alazab services: name, link, icon and category.",
  addService: "Add service",
  editService: "Edit service",
  fieldNameAr: "Name (Arabic)",
  fieldNameEn: "Name (English)",
  fieldUrl: "Link",
  fieldDescAr: "Short description (Arabic)",
  fieldDescEn: "Short description (English)",
  fieldCategory: "Category",
  fieldIcon: "Icon",
  fieldIconUrl: "or paste an image URL for the icon",
  catPublic: "Public — visible to everyone",
  catPrivate: "Private — sign-in when opening",
  catFrappe: "Frappe workspace",
  save: "Save",
  cancel: "Cancel",
  edit: "Edit",
  remove: "Delete",
  removeConfirm: "Remove this service from the directory?",
  reset: "Restore starter directory",
  resetConfirm: "Your current directory will be replaced by the starter one. Continue?",
  saved: "Directory saved",
  currentServices: "Current services",
  requiredHint: "Name and link are required",
  addNew: "Add new",
};

const dicts = { ar, en };

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof ar;
  dir: "rtl" | "ltr";
}

const LangContext = createContext<LangContextValue>({
  lang: "ar",
  setLang: () => {},
  t: ar,
  dir: "rtl",
});

const LANG_KEY = "alazab-cloud-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      return stored === "en" ? "en" : "ar";
    } catch {
      return "ar";
    }
  });

  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir]);

  const setLang = (l: Lang) => setLangState(l);

  return (
    <LangContext.Provider value={{ lang, setLang, t: dicts[lang], dir }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
