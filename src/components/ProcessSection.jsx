import { useState, memo } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../i18n";
import { PROCESS_STEPS, FAQ_ITEMS } from "../data/processFaq";

const ProcessSection = memo(function ProcessSection() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section
      id="process-section"
      className="zoomix-section bg-[#F5F4EF] text-[#0A0A0A]"
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
        <div className="mt-16 grid md:grid-cols-4 gap-8 relative">
          <div
            className="connection-line absolute top-0 left-0 right-0 hidden md:block"
            aria-hidden="true"
          />
          {PROCESS_STEPS.map((step) => (
            <article
              key={step.key}
              className="relative pt-8 border-t md:border-t-0 border-black/20"
            >
              <span className="font-mono text-xs text-[#5f7f00]">{step.number}</span>
              <h3 className="mt-5 text-2xl font-black">
                {isArabic
                  ? step.key === "direction"
                    ? "DIRECTION"
                    : step.key.toUpperCase()
                  : step.key.toUpperCase()}
              </h3>
              <p className="mt-4 text-black/60 leading-7">{isArabic ? step.ar : step.en}</p>
            </article>
          ))}
        </div>

        <div id="faq-section" className="mt-28 md:mt-40 grid lg:grid-cols-[0.7fr_1.3fr] gap-12">
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
                    className="w-full flex items-center justify-between gap-6 py-5 text-left font-bold"
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
      </div>
    </section>
  );
});

export default ProcessSection;
