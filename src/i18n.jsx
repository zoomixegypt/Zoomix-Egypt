import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { trackEvent } from "./utils/analytics";
import { readBrowserValue, writeBrowserValue } from "./utils/browserStorage";

const STORAGE_KEY = "zoomix-language";

const translations = {
  ar: {
    nav: {
      about: "عن زومكس",
      services: "الخدمات",
      work: "الأعمال",
      packages: "الباقات",
      process: "طريقة العمل",
      contact: "تواصل",
      language: "EN",
      start: "ابدأ مشروعك",
      menu: "القائمة",
      close: "إغلاق",
    },
    hero: {
      eyebrow: "CAIRO, EGYPT — CREATIVE PARTNER",
      titleA: "خلي مشروعك",
      titleAccent: "يظهر",
      titleB: "بالشكل اللي يستحقه.",
      description: "هوية، محتوى، تصوير وحضور رقمي في اتجاه واحد واضح.",
      partnerLine: "شريكك الإبداعي من أول فكرة مشروعك لحد ما يبقى جاهز للظهور والانطلاق.",
      work: "شوف أعمالنا",
      build: "BUILD THE BRAND",
      show: "SHOW THE WORK",
      launch: "LAUNCH WITH CLARITY",
    },
    gallery: {
      label: "02. أعمال زومكس",
      titleA: "شغل",
      titleB: "واضح.",
      description: "نحوّل الأفكار إلى أنظمة بصرية جاهزة للاستخدام.",
      view: "شوف المشروع",
      explore: "اسحب للمزيد",
      previous: "المشروع السابق",
      next: "المشروع التالي",
      explorations: "ZOOMIX PROJECTS",
    },
    services: {
      eyebrow: "01. الأساس",
      problem: "مش لازم تتعامل مع خمس جهات علشان تبدأ صح.",
      intro: "Zoomix تجمع الهوية والمحتوى والتصوير والمطبوعات والحضور الرقمي في اتجاه واحد.",
      partnerIntro:
        "مش مجرد خدمات منفصلة؛ إحنا شريك عملي للمشروعات الصغيرة والناشئة، بنرتب الصورة ونتحمل مسؤولية تنفيذها.",
      build: "نبني الأساس",
      buildText: "اللوجو والهوية والتطبيقات والمطبوعات.",
      show: "نظهر المشروع",
      showText: "محتوى مخطط وتغطية إيفنتات تخلي المشروع يظهر بالشكل اللي يستحقه.",
      launch: "نجهز الانطلاق",
      launchText: "Landing Page وتجهيز الحسابات ومحتوى الإطلاق.",
      systemLabel: "نظام الشغل: BUILD / SHOW / LAUNCH",
      why: "ليه Zoomix؟",
      whyItems: [
        "مشروعك مشروعنا — من الفكرة للتنفيذ.",
        "اتجاه بصري متسق.",
        "نطاق وسعر واضح.",
        "مخرجات جاهزة للاستخدام.",
      ],
    },
    footer: {
      label: "// START_A_PROJECT",
      partner: "ZOOMIX — CREATIVE PARTNER",
      title: "جاهز نرتب",
      accent: "صورة مشروعك؟",
      description: "هوية، محتوى، تصوير وحضور رقمي في اتجاه واحد واضح.",
      promise: "إنت ركّز في شغلك، وإحنا نرتب الصورة.",
      sitemap: "روابط الموقع",
      socials: "السوشيال ميديا",
      whatsapp: "واتساب",
      cairo: "القاهرة، مصر",
      top: "العودة للأعلى",
    },
  },
  en: {
    nav: {
      about: "About Zoomix",
      services: "Services",
      work: "Work",
      packages: "Packages",
      process: "Process",
      contact: "Contact",
      language: "ع",
      start: "Start a project",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      eyebrow: "CAIRO, EGYPT — CREATIVE PARTNER",
      titleA: "Make your business",
      titleAccent: "show up",
      titleB: "the way it deserves.",
      description:
        "Identity, content, photography and digital presence, built in one clear direction.",
      partnerLine:
        "Your creative partner from the first idea to a project ready to show up and launch.",
      work: "View our work",
      build: "BUILD THE BRAND",
      show: "SHOW THE WORK",
      launch: "LAUNCH WITH CLARITY",
    },
    gallery: {
      label: "02. ZOOMIX PROJECTS",
      titleA: "Clear",
      titleB: "work.",
      description: "Turning ideas into visual systems ready to use.",
      view: "View project",
      explore: "Swipe to explore",
      previous: "Previous project",
      next: "Next project",
      explorations: "ZOOMIX PROJECTS",
    },
    services: {
      eyebrow: "01. THE FOUNDATION",
      problem: "You should not need five different partners to start right.",
      intro:
        "Zoomix brings identity, content, photography, print and digital presence into one clear direction.",
      partnerIntro:
        "Not a list of separate services; a practical creative partner for small and growing businesses, organizing the work and owning the execution.",
      build: "BUILD — The foundation",
      buildText: "Logo, identity, applications and print.",
      show: "SHOW — The project",
      showText: "Planned content and event coverage that makes the work show up.",
      launch: "LAUNCH — The rollout",
      launchText: "Landing page, account setup and launch content.",
      systemLabel: "THE ZOOMIX SYSTEM: BUILD / SHOW / LAUNCH",
      why: "Why Zoomix?",
      whyItems: [
        "Your project is ours — from idea to execution.",
        "A consistent visual direction.",
        "Clear scope and pricing.",
        "Ready-to-use deliverables.",
      ],
    },
    footer: {
      label: "// START_A_PROJECT",
      partner: "ZOOMIX — CREATIVE PARTNER",
      title: "LET'S",
      accent: "BUILD.",
      description:
        "Identity, content, photography and digital presence, built in one clear direction.",
      promise: "Focus on your business. We will organize the creative picture.",
      sitemap: "Sitemap",
      socials: "Social networks",
      whatsapp: "WhatsApp",
      cairo: "Cairo, Egypt",
      top: "Back to top",
    },
  },
};

function readInitialLanguage() {
  if (typeof window === "undefined") return "ar";
  return readBrowserValue(STORAGE_KEY) === "en" ? "en" : "ar";
}

const LanguageContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(readInitialLanguage);

  useEffect(() => {
    writeBrowserValue(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next) => {
        const nextLanguage = next === "en" ? "en" : "ar";
        if (nextLanguage !== language) trackEvent("language_change", { from_language: language, to_language: nextLanguage });
        setLanguage(nextLanguage);
      },
      t: (section, key) =>
        translations[language]?.[section]?.[key] ?? translations.ar[section]?.[key] ?? key,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside I18nProvider");
  return context;
}
