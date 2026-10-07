import { useLanguage } from "../i18n";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";

const stages = [
  { code: "START", ar: "البداية", en: "START" },
  { code: "SHOW", ar: "الظهور", en: "SHOW" },
  { code: "CONTINUE", ar: "الاستمرار", en: "CONTINUE" },
  { code: "ONE THING", ar: "خدمة واحدة", en: "ONE THING" },
];

export default function RouteFinderEntry() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;

  return (
    <section id="route-finder-entry" className="route-finder-entry border-y border-black/15 bg-[#F5F4EF] text-[#0A0A0A]" dir={isArabic ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-2 w-2 bg-[#BBFF00]" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">ZOOMIX / {isArabic ? "خطوتك الجاية" : "NEXT MOVE"}</span>
            </div>
            <h2 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.05em]"} max-w-xl text-5xl font-black leading-[0.92] md:text-7xl`}>
              {isArabic ? "مش عارف تبدأ منين؟" : "Not sure where to start?"}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/60 md:text-xl">
              {isArabic
                ? "خلّي Zoomix ترتب لك الخطوة الجاية. جاوب على كام سؤال بسيط، وشوف الطريق اللي يناسب مشروعك قبل ما تدخل في أي تفاصيل."
                : "Let Zoomix organize your next move. Answer a few simple questions and see the route that fits your project before getting into the details."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex flex-col items-start gap-2">
                <span className="quick-match-badge">{isArabic ? "الأسرع" : "FASTEST"}</span>
                <a href="/route-finder" className="zoomix-button quick-match-primary gap-3 bg-[#BBFF00] text-black shadow-[0_10px_24px_rgba(187,255,0,0.16)] hover:bg-[#0A0A0A] hover:text-white">
                  <span className="quick-match-pulse-dot" aria-hidden="true" />
                  <span>{isArabic ? "اختيار سريع — 3 أسئلة" : "Quick match — 3 questions"}</span>
                  <ActionArrow className="quick-match-arrow" size={18} aria-hidden="true" />
                </a>
              </div>
              <a href="/#packages-section" className="zoomix-button border-black/25 text-black hover:border-black hover:bg-white">
                {isArabic ? "عارف هتبدأ بإيه؟ شوف الباقات" : "Know what you need? See packages"}
              </a>
            </div>
          </div>

          <div className="route-finder-entry-map border-y border-black/15 py-8 md:py-10">
            <div className="relative mb-10 h-px bg-black/15">
              <span className="absolute inset-y-0 start-0 w-full bg-[#BBFF00]" />
              <span className="absolute -top-1 end-0 h-2 w-2 rounded-full bg-[#BBFF00]" aria-hidden="true" />
            </div>
            <div className="grid gap-8 sm:grid-cols-4">
              {stages.map((stage, index) => (
                <div key={stage.code} className="relative">
                  <span className="font-mono text-xs text-black/45">0{index + 1}</span>
                  <strong className="mt-3 block text-xl font-black">{isArabic ? stage.ar : stage.en}</strong>
                  <span className="mt-2 block font-mono text-[10px] tracking-[0.16em] text-black/40">{stage.code}</span>
                  {index < stages.length - 1 && <span className="absolute -end-5 top-7 hidden text-black/25 sm:block" aria-hidden="true">→</span>}
                </div>
              ))}
            </div>
            <p className="mt-10 max-w-md border-s-2 border-[#BBFF00] ps-4 text-sm leading-6 text-black/55">
              {isArabic
                ? "مش قائمة خدمات؛ دي مسارات تساعدنا نفهم مشروعك ونحدد طريقة التعامل الأقرب. نظام التنفيذ نفسه: BUILD / SHOW / LAUNCH."
                : "Not a service list — these routes help us understand your project and choose the right way to work together. The delivery system itself is BUILD / SHOW / LAUNCH."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
