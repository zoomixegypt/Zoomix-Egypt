import { useEffect } from "react";
import { useLanguage } from "../i18n";

const HOME_COPY = {
  ar: {
    title: "ZOOMIX — شريكك الإبداعي",
    description: "هوية، محتوى، تصوير وحضور رقمي في اتجاه واحد واضح.",
  },
  en: {
    title: "ZOOMIX — Creative Partner",
    description:
      "Identity, content, photography and digital presence, built in one clear direction.",
  },
};

const HOME_IMAGE = "https://zoomixegypt.com/og-image.svg";

export default function HomeSeo() {
  const { language } = useLanguage();

  useEffect(() => {
    const copy = HOME_COPY[language];
    document.title = copy.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", copy.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", copy.description);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", "https://zoomixegypt.com/");
    document.querySelector('meta[property="og:image"]')?.setAttribute("content", HOME_IMAGE);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", copy.title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", copy.description);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", HOME_IMAGE);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", "https://zoomixegypt.com/");
  }, [language]);

  return null;
}
