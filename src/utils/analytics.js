const CONSENT_KEY = "zoomix-analytics-consent";

export function getAnalyticsConsent() {
  if (typeof window === "undefined") return "declined";
  return window.localStorage.getItem(CONSENT_KEY) || "unknown";
}

export function setAnalyticsConsent(value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value === "accepted" ? "accepted" : "declined");
  window.dispatchEvent(new CustomEvent("zoomix:analytics-consent", { detail: value }));
}

export function trackEvent(eventName, properties = {}) {
  if (getAnalyticsConsent() !== "accepted" || typeof window === "undefined") return;
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

export { CONSENT_KEY };
