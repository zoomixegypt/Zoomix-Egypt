import { useEffect } from "react";
import { useLanguage } from "../i18n";

const HOME_COPY = {
  ar: {
    title: "ZOOMIX — شريكك الإبداعي",
    description: "شريك إبداعي واحد للمشروعات: هوية، محتوى، تصوير وحضور رقمي في اتجاه واضح.",
  },
  en: {
    title: "ZOOMIX — Creative Partner",
    description:
      "One creative partner for identity, content, photography and digital presence — all in one clear direction.",
  },
};

const HOME_IMAGE = "https://zoomixegypt.com/og-image.png";

export default function HomeSeo({ preview = false }) {
  const { language } = useLanguage();

  useEffect(() => {
    const previewUrl = "https://zoomixegypt.com/preview/";
    const copy = HOME_COPY[language];
    const title = preview ? "ZOOMIX — Preview" : copy.title;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", copy.description);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", preview ? previewUrl : "https://zoomixegypt.com/");
    document.querySelector('meta[property="og:image"]')?.setAttribute("content", HOME_IMAGE);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
    document
      .querySelector('meta[name="twitter:url"]')
      ?.setAttribute("content", preview ? previewUrl : "https://zoomixegypt.com/");
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", copy.description);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", HOME_IMAGE);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", preview ? previewUrl : "https://zoomixegypt.com/");
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", preview ? "noindex, nofollow" : "index, follow");
  }, [language, preview]);

  return null;
}
