import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
      build: "نبني الأساس",
      buildText: "اللوجو والهوية والتطبيقات والمطبوعات.",
      show: "نظهر المشروع",
      showText: "محتوى السوشيال والتصميم والتصوير وReels.",
      launch: "نجهز الانطلاق",
      launchText: "Landing Page وتجهيز الحسابات وخطة الإطلاق.",
      why: "ليه Zoomix؟",
      whyItems: [
        "شريك واحد بدل جهات متعددة.",
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
      build: "BUILD — The foundation",
      buildText: "Logo, identity, applications and print.",
      show: "SHOW — The project",
      showText: "Social content, design, photography and Reels.",
      launch: "LAUNCH — The rollout",
      launchText: "Landing page, account setup and launch plan.",
      why: "Why Zoomix?",
      whyItems: [
        "One partner instead of many.",
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
  return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "ar";
}

const LanguageContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(readInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next) => setLanguage(next === "en" ? "en" : "ar"),
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
