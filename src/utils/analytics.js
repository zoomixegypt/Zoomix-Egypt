import { readBrowserValue, writeBrowserValue } from "./browserStorage";
const CONSENT_KEY = "zoomix-analytics-consent";
const GOOGLE_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-XWCZXLJ14C";
let googleAnalyticsReady = false;

function loadGoogleAnalytics() {
  if (googleAnalyticsReady || !GOOGLE_MEASUREMENT_ID || typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  if (!window.__zoomixGaConfigured) {
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_MEASUREMENT_ID, { send_page_view: false });
    window.__zoomixGaConfigured = true;
  }

  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_MEASUREMENT_ID)}`;
    script.dataset.zoomixGa = GOOGLE_MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  googleAnalyticsReady = true;
}

export function getAnalyticsConsent() {
  if (typeof window === "undefined") return "declined";
  return readBrowserValue(CONSENT_KEY, "unknown");
}

export function setAnalyticsConsent(value) {
  if (typeof window === "undefined") return;
  writeBrowserValue(CONSENT_KEY, value === "accepted" ? "accepted" : "declined");
  if (value === "accepted") {
    loadGoogleAnalytics();
    window.gtag?.("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
    });
    trackPageView();
  }
  window.dispatchEvent(new CustomEvent("zoomix:analytics-consent", { detail: value }));
}

export function trackEvent(eventName, properties = {}) {
  if (getAnalyticsConsent() !== "accepted" || typeof window === "undefined") return;
  loadGoogleAnalytics();
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, properties);
  }
  const payload = {
    event: eventName,
    language: document.documentElement.lang === "en" ? "en" : "ar",
    properties,
    consent: true,
  };
  fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(path) {
  if (getAnalyticsConsent() !== "accepted" || typeof window === "undefined") return;
  path ??= window.location.pathname + window.location.search;
  loadGoogleAnalytics();
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

export { CONSENT_KEY };
