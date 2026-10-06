import { useEffect, useState } from "react";
import { useLanguage } from "../i18n";
import { getAnalyticsConsent, setAnalyticsConsent, trackEvent } from "../utils/analytics";

export default function AnalyticsConsent() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getAnalyticsConsent() === "unknown");
    const onConsent = () => setVisible(false);
    window.addEventListener("zoomix:analytics-consent", onConsent);
    return () => window.removeEventListener("zoomix:analytics-consent", onConsent);
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    setAnalyticsConsent(value);
    if (value === "accepted") trackEvent("analytics_consent", { choice: "accepted" });
  };

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-2xl border border-white/20 bg-[#0A0A0A] p-4 text-white shadow-[8px_8px_0_rgba(187,255,0,0.9)]" dir={isArabic ? "rtl" : "ltr"} aria-label={isArabic ? "إعدادات الخصوصية" : "Privacy settings"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#BBFF00]">ZOOMIX / SIGNALS</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
            {isArabic ? "نقيس تفاعل الموقع بشكل مجهول علشان نحسّن التجربة. مفيش أسماء أو أرقام أو محتوى بريف بيتسجل." : "We measure anonymous site interactions to improve the experience. No names, phone numbers or brief content are tracked."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose("declined")} className="border border-white/25 px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:border-white hover:text-white">
            {isArabic ? "لا شكرًا" : "No thanks"}
          </button>
          <button type="button" onClick={() => choose("accepted")} className="bg-[#BBFF00] px-4 py-2 text-xs font-black text-[#0A0A0A] transition-transform hover:-translate-y-0.5">
            {isArabic ? "السماح بالقياس" : "Allow measurement"}
          </button>
        </div>
      </div>
    </aside>
  );
}
