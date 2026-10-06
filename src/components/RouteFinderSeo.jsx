import { useEffect } from "react";
import { useLanguage } from "../i18n";

const SITE_URL = "https://zoomixegypt.com";
const COPY = {
  ar: {
    title: "خطوتك الجاية — ZOOMIX Route Finder",
    description: "جاوب على أسئلة بسيطة، وخلي Zoomix تحدد لك المسار والخدمة أو الباقة الأنسب لمشروعك.",
  },
  en: {
    title: "Your Next Move — ZOOMIX Route Finder",
    description: "Answer a few simple questions and let Zoomix find the right route, service or package for your project.",
  },
};

export default function RouteFinderSeo() {
  const { language } = useLanguage();

  useEffect(() => {
    const copy = COPY[language];
    const canonical = `${SITE_URL}/route-finder`;
    document.title = copy.title;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", copy.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", copy.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonical);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", copy.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", copy.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);

    return () => {
      document.title = language === "ar" ? "ZOOMIX — شريكك الإبداعي" : "ZOOMIX — Creative Partner";
      document.querySelector('meta[name="description"]')?.setAttribute("content", "هوية، محتوى، تصوير وحضور رقمي في اتجاه واحد واضح.");
      document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${SITE_URL}/`);
    };
  }, [language]);

  return null;
}
