import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";
import { MemoryRouter } from "react-router-dom";
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { copy, getRecommendation, getGoalOptions } = await vite.ssrLoadModule(
    "/src/components/OfferPathSection.jsx",
  );
  let branches = 0;
  for (const language of ["ar", "en"]) {
    const text = copy[language];
    for (const stage of text.stages)
      for (const need of text.needs[stage.value] || []) {
        for (const goal of getGoalOptions(text, stage.value, need.value)) {
          const result = getRecommendation(stage.value, need.value, goal.value);
          assert.ok(result.route);
          assert.ok(result.packages);
          const offers = Array.isArray(result.packages)
            ? result.packages
            : result.packages[language];
          assert.ok(offers.length > 0);
          if (result.packageId)
            assert.ok(
              offers.some((item) => item.id === result.packageId),
              result.packageId,
            );
          branches++;
        }
      }
  }
  const { default: PackageRail } = await vite.ssrLoadModule("/src/components/PackageRail.jsx");
  const { ZOOMIX_CONTENT_PACKAGES, ZOOMIX_PARTNER_PACKAGES } = await vite.ssrLoadModule(
    "/src/data/zoomixOfferings.js",
  );
  for (const language of ["ar", "en"]) {
    const html = renderToString(
      React.createElement(
        PackageRail,
        { offers: ZOOMIX_CONTENT_PACKAGES, language },
        React.createElement("article", null, "Complete scope"),
      ),
    );
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /tabindex="0"/);
    assert.match(html, language === "ar" ? /مقارنة سريعة ظاهرة/ : /Quick comparison/);
    assert.match(html, language === "ar" ? /قارن الباقات/ : /Compare packages/);
    assert.match(html, /aria-expanded="false"/);
    for (const item of ZOOMIX_CONTENT_PACKAGES) {
      assert.ok(
        !item.outputs[language]
          .join(" ")
          .includes(language === "ar" ? "خامات العميل" : "client-provided"),
      );
      assert.ok(item.outputs[language].join(" ").includes("Zoomix"));
      assert.ok(item.priceNote[language].includes(language === "ar" ? "المعدات" : "Equipment"));
    }
    for (const item of ZOOMIX_PARTNER_PACKAGES) {
      assert.ok(
        item.outputs[language]
          .join(" ")
          .includes(language === "ar" ? "مخرج واحد" : "one deliverable"),
      );
      assert.ok(
        item.priceNote[language].includes(
          language === "ar" ? "خامات العميل" : "client-provided footage",
        ),
      );
    }
  }
  const { ZOOMIX_PACKAGES } = await vite.ssrLoadModule("/src/data/zoomixPackages.js");
  assert.deepEqual(
    ZOOMIX_PACKAGES.map((item) => item.revisions),
    [2, 2, 2],
  );
  const { I18nProvider } = await vite.ssrLoadModule("/src/i18n.jsx");
  const analytics = await vite.ssrLoadModule("/src/utils/analytics.js");
  const { default: BriefSaveReceipt } = await vite.ssrLoadModule(
    "/src/components/BriefSaveReceipt.jsx",
  );
  for (const language of ["ar", "en"]) {
    for (const contactPreference of ["email", "call", "whatsapp"]) {
      for (const whatsappBlocked of [true, false]) {
        const receipt = renderToString(
          React.createElement(BriefSaveReceipt, {
            language,
            contactPreference,
            whatsappBlocked,
            referenceCode: "ZMX-QA-006",
          }),
        );
        assert.match(
          receipt,
          /<bdi dir="ltr" class="public-number whitespace-nowrap font-bold">ZMX-QA-006<\/bdi>/,
        );
        if (contactPreference === "whatsapp")
          assert.ok(
            receipt.includes(
              whatsappBlocked
                ? language === "ar"
                  ? "انسخ الرسالة"
                  : "copy the message"
                : language === "ar"
                  ? "اضغط إرسال داخل واتساب"
                  : "press Send in WhatsApp",
            ),
          );
      }
    }
  }
  assert.doesNotThrow(() => analytics.trackPageView());
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  try {
    globalThis.window = Object.defineProperty({}, "localStorage", {
      get() {
        throw new Error("privacy blocked");
      },
    });
    assert.equal(analytics.getAnalyticsConsent(), "unknown");
    assert.doesNotThrow(() => analytics.trackEvent("qa_no_consent"));
    assert.doesNotThrow(() => analytics.trackPageView());
    assert.doesNotThrow(() =>
      renderToString(
        React.createElement(
          I18nProvider,
          null,
          React.createElement("p", null, "Storage-independent UI"),
        ),
      ),
    );
  } finally {
    delete globalThis.window;
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
  }
  for (const file of [
    "HeroSection",
    "PackagesSection",
    "ProjectBriefSection",
    "Navbar",
    "ProcessSection",
  ]) {
    const { default: Component } = await vite.ssrLoadModule(`/src/components/${file}.jsx`);
    const html = renderToString(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(I18nProvider, null, React.createElement(Component)),
      ),
    );
    assert.ok(html.length > 100, file);
  }
  const brief = await readFile("src/components/ProjectBriefSection.jsx", "utf8");
  assert.match(brief, /public-brief-review/);
  assert.match(brief, /goToStep\(1\)/);
  assert.match(brief, /goToStep\(2\)/);
  assert.match(brief, /editSummaryField/);
  assert.match(brief, /Back to review/);
  assert.match(brief, /brief-privacy/);
  assert.match(brief, /if \(submitLock.current \|\| submitted\) return/);
  assert.match(brief, /disabled=\{submitting \|\| submitted\}/);
  assert.match(brief, /finally/);
  assert.match(brief, /hidden md:flex/);
  const navigation = await readFile("src/components/Navbar.jsx", "utf8");
  assert.match(navigation, /"project-section", "packages-section"/);
  assert.match(navigation, /menuRef.current\?\.focus\(\)/);
  assert.match(navigation, /getClientRects\(\).length/);
  assert.match(navigation, /!menuRef.current\?\.contains\(document.activeElement\)/);
  const app = await readFile("src/App.jsx", "utf8");
  assert.match(app, /path="\/preview" element=\{<Home previewMode \/>\}/);
  const pages = await readFile("scripts/prepare-pages-routes.mjs", "utf8");
  assert.match(pages, /path: "\/preview", type: "preview"/);
  const previewSeo = await readFile("src/components/HomeSeo.jsx", "utf8");
  assert.match(previewSeo, /noindex, nofollow/);
  const mobileBar = await readFile("src/components/MobileBottomBar.jsx", "utf8");
  assert.match(mobileBar, /mobile_bottom_bar_start/);
  assert.match(mobileBar, /packages-section/);
  assert.match(mobileBar, /project-section/);
  assert.match(mobileBar, /whatsapp/);
  const shortcutDecision = await readFile("docs/MAIN-SITE-SHORTCUTS-DECISION-20261011.md", "utf8");
  assert.match(shortcutDecision, /يبقى/);
  assert.match(shortcutDecision, /لا مسار يتيم/);
  console.log(
    `PASS: ${branches} bilingual route branches, package scopes, rail semantics, public component SSR, final review/privacy and navigation guards. No submissions or live writes.`,
  );
} finally {
  await vite.close();
}
