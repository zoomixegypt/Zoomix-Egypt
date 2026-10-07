import { useState, memo } from "react";
import { ArrowUpLeft, ArrowUpRight, ChevronDown } from "lucide-react";
import { useLanguage } from "../i18n";
import { PROCESS_STEPS, FAQ_ITEMS } from "../data/processFaq";
import { Gsap } from "../utils/gsapAnimate";

const ProcessSection = memo(function ProcessSection() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  const [openFaq, setOpenFaq] = useState(null);
  const processLabels = {
    brief: { ar: "الفهم", en: "BRIEF" },
    direction: { ar: "الاتجاه", en: "DIRECTION" },
    build: { ar: "التنفيذ", en: "BUILD" },
    launch: { ar: "الانطلاق", en: "LAUNCH" },
  };

  return (
    <section
      id="process-section"
      className="process-section zoomix-section bg-[#F5F4EF] text-[#0A0A0A]"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex items-center gap-4 mb-12">
          <span className="w-2 h-2 bg-[#BBFF00]" />
          <span className="zoomix-label">04. {isArabic ? "طريقة العمل" : "PROCESS"}</span>
          <div className="flex-1 h-px bg-black/15" />
        </div>
        <h2
          className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.06em]"} text-5xl md:text-8xl font-black leading-[0.9]`}
        >
          {isArabic ? "من الـBrief إلى الإطلاق." : "From Brief to Launch."}
        </h2>
        <div className="process-steps-grid relative mt-10 grid gap-5 md:mt-16 md:grid-cols-4 md:gap-8">
          <div
            className="connection-line process-connection-line absolute top-0 left-0 right-0 hidden md:block"
            aria-hidden="true"
          />
          {PROCESS_STEPS.map((step, index) => (
            <Gsap.article
              key={step.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: "easeOut" }}
              className="process-step-card relative border-t border-black/20 pt-5 md:border-t-0 md:pt-8"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#BBFF00] font-mono text-[10px] font-bold text-black">
                {step.number}
              </span>
              <h3 className="process-step-title mt-3 text-2xl font-black md:mt-5">
                {processLabels[step.key]?.[isArabic ? "ar" : "en"] || step.key.toUpperCase()}
              </h3>
              <p className="process-step-description mt-2 text-black/60 leading-6 md:mt-4 md:leading-7">{isArabic ? step.ar : step.en}</p>
            </Gsap.article>
          ))}
        </div>

        <div id="faq-section" className="mt-16 grid gap-8 md:mt-40 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
          <h2
            className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.05em]"} text-4xl md:text-6xl font-black leading-none`}
          >
            FAQ<span className="text-[#BBFF00]">.</span>
          </h2>
          <div className="border-t border-black/20">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              const answerId = `faq-answer-${index}`;
              return (
                <div key={item.qAr} className="border-b border-black/20">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-start font-bold"
                  >
                    <span>{isArabic ? item.qAr : item.qEn}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div id={answerId} role="region" className="pb-5 text-black/60 leading-7">
                      {isArabic ? item.aAr : item.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="faq-route-cta mt-10 flex flex-col justify-between gap-5 border border-black/15 bg-white/60 p-5 md:flex-row md:items-center md:p-7">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">ZOOMIX / QUICK MATCH</span>
            <p className="mt-2 text-lg font-black">
              {isArabic ? "لسه مش عارف تبدأ منين؟" : "Still not sure where to start?"}
            </p>
            <p className="mt-1 text-sm leading-6 text-black/55">
              {isArabic ? "جاوب على 3 أسئلة ونوصلك للخطوة الأقرب لمشروعك." : "Answer three questions and we will point you to the closest next move."}
            </p>
          </div>
          <a href="/route-finder" className="zoomix-button w-full shrink-0 justify-center bg-[#BBFF00] text-black sm:w-auto">
            {isArabic ? "اختيار سريع — 3 أسئلة" : "Quick match — 3 questions"}
            <ActionArrow size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
});

export default ProcessSection;
