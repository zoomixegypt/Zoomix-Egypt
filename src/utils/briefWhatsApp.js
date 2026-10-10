// This opens a draft, never sends a WhatsApp message automatically.
export function openBriefWhatsApp(message, openWindow = (...args) => window.open(...args)) {
  try {
    return Boolean(openWindow(
      `https://wa.me/201555451535?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    ));
  } catch {
    return false;
  }
}
