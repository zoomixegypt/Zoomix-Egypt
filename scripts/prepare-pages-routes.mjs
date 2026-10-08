import { createServer } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const SITE_URL = "https://zoomixegypt.com";
const template = await readFile("build/index.html", "utf8");
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

const { render } = await vite.ssrLoadModule("/src/ssr-entry.jsx");
const { PROJECT_META } = await vite.ssrLoadModule("/src/data/projectMeta.js");
const { ZOOMIX_PROJECTS } = await vite.ssrLoadModule("/src/data/zoomixProjects.js");

const routes = [
  { path: "/", type: "home" },
  { path: "/route-finder", type: "route-finder" },
  { path: "/prototype/commercial-studio", type: "prototype" },
  { path: "/studio", type: "prototype" },
  ...PROJECT_META.map((project) => ({
    path: `/projects/${project.slug}`,
    type: "project",
    project,
  })),
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const escapeJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

function replaceMeta(html, attribute, name, content) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tagPattern = new RegExp(`<meta\\s+${attribute}=["']${escapedName}["'][^>]*>`, "i");
  const nextTag = `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
  return tagPattern.test(html)
    ? html.replace(tagPattern, nextTag)
    : html.replace("</head>", `    ${nextTag}\n  </head>`);
}

function replaceLink(html, rel, href) {
  const tagPattern = new RegExp(`<link\\s+rel=["']${rel}["'][^>]*>`, "i");
  const nextTag = `<link rel="${rel}" href="${escapeHtml(href)}" />`;
  return tagPattern.test(html)
    ? html.replace(tagPattern, nextTag)
    : html.replace("</head>", `    ${nextTag}\n  </head>`);
}

function replaceTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function replaceSchema(html, schema) {
  const nextScript = `<script type="application/ld+json">${escapeJson(schema)}</script>`;
  const schemaPattern = /<script type="application\/ld\+json">[\s\S]*?<\/script>/i;
  return schemaPattern.test(html)
    ? html.replace(schemaPattern, nextScript)
    : html.replace("</head>", `    ${nextScript}\n  </head>`);
}

function pageHead(route) {
  if (route.type === "route-finder") {
    const title = "خطوتك الجاية — ZOOMIX Route Finder";
    const description =
      "جاوب على أسئلة بسيطة، وخلي Zoomix تحدد لك المسار والخدمة أو الباقة الأنسب لمشروعك.";
    return {
      title,
      description,
      canonical: `${SITE_URL}/route-finder`,
      image: `${SITE_URL}/og-image.png`,
      schema: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: `${SITE_URL}/route-finder`,
        isPartOf: { "@type": "WebSite", name: "ZOOMIX", url: SITE_URL },
      },
    };
  }

  if (route.type === "project") {
    const project = ZOOMIX_PROJECTS[route.project.slug];
    const title = `${project.title.ar} — ZOOMIX`;
    const description = project.overview.ar;
    const canonical = `${SITE_URL}/projects/${route.project.slug}`;
    return {
      title,
      description,
      canonical,
      image: `${SITE_URL}${project.image}`,
      schema: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title.ar,
        description,
        url: canonical,
        image: `${SITE_URL}${project.image}`,
        isPartOf: { "@type": "WebSite", name: "ZOOMIX", url: SITE_URL },
      },
    };
  }

  if (route.type === "prototype") {
    return {
      title: "ZOOMIX Commercial Studio Prototype",
      description: "Interactive commercial workspace prototype for ZOOMIX.",
      canonical: `${SITE_URL}${route.path}`,
      image: `${SITE_URL}/og-image.png`,
      robots: "noindex, nofollow",
      schema: null,
    };
  }

  const title = "ZOOMIX — شريكك الإبداعي";
  const description = "شريك إبداعي واحد للمشروعات: هوية، محتوى، تصوير وحضور رقمي في اتجاه واضح.";
  return {
    title,
    description,
    canonical: `${SITE_URL}/`,
    image: `${SITE_URL}/og-image.png`,
    schema: {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "ZOOMIX",
      url: SITE_URL,
      description,
      areaServed: "Egypt",
      telephone: "+201555451535",
      sameAs: [
        "https://www.instagram.com/zoomixegypt",
        "https://www.tiktok.com/@zoomixegypt",
        "https://x.com/zoomixegypt",
      ],
    },
  };
}

function buildPage(templateHtml, route, markup) {
  const meta = pageHead(route);
  let html = templateHtml.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  html = replaceTitle(html, meta.title);
  html = replaceMeta(html, "name", "description", meta.description);
  html = replaceMeta(html, "property", "og:url", meta.canonical);
  html = replaceMeta(html, "property", "og:title", meta.title);
  html = replaceMeta(html, "property", "og:description", meta.description);
  html = replaceMeta(html, "property", "og:image", meta.image);
  html = replaceMeta(html, "name", "twitter:title", meta.title);
  html = replaceMeta(html, "name", "twitter:description", meta.description);
  html = replaceMeta(html, "name", "twitter:image", meta.image);
  html = replaceLink(html, "canonical", meta.canonical);
  html = replaceMeta(html, "name", "robots", meta.robots || "index, follow");
  if (meta.schema) html = replaceSchema(html, meta.schema);
  return html;
}

try {
  for (const route of routes) {
    const markup = await render(route.path);
    const outputDir = route.path === "/" ? "build" : join("build", route.path.slice(1));
    const outputPath = join(outputDir, "index.html");
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, buildPage(template, route, markup), "utf8");
    console.log(`pre-rendered ${route.path}`);
  }
} finally {
  await vite.close();
}
