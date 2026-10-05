import { useEffect } from "react";
import { useLanguage } from "../i18n";

const SITE_URL = "https://zoomixegypt.com";

export default function ProjectSeo({ project }) {
  const { language } = useLanguage();

  useEffect(() => {
    if (!project) return undefined;
    const title = `${project.title[language]} — ZOOMIX`;
    const description = project.overview[language];
    const canonical = `${SITE_URL}/projects/${project.slug}`;
    const tags = [
      ["title", title],
      ["description", description],
      ["og:title", title],
      ["og:description", description],
      ["og:url", canonical],
      ["og:image", `${SITE_URL}${project.image}`],
      ["twitter:title", title],
      ["twitter:description", description],
      ["twitter:image", `${SITE_URL}${project.image}`],
    ];

    document.title = title;
    tags.forEach(([name, content]) => {
      const isProperty = name.startsWith("og:") || name.startsWith("twitter:");
      const attribute = isProperty ? "property" : "name";
      const selector = `meta[${attribute}="${name}"]`;
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    });

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);

    const schemaId = "zoomix-project-schema";
    let schema = document.getElementById(schemaId);
    if (!schema) {
      schema = document.createElement("script");
      schema.id = schemaId;
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.title[language],
      description,
      url: canonical,
      image: `${SITE_URL}${project.image}`,
      isPartOf: { "@type": "WebSite", name: "ZOOMIX", url: SITE_URL },
    });

    return () => {
      document.title = language === "ar" ? "ZOOMIX — شريكك الإبداعي" : "ZOOMIX — Creative Partner";
      document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", `${SITE_URL}/`);
      document.getElementById(schemaId)?.remove();
    };
  }, [language, project]);

  return null;
}
