import { memo } from "react";
import { ArrowUpLeft, ArrowUpRight, Check } from "lucide-react";
import { useLanguage } from "../i18n";
import { ZOOMIX_PACKAGES } from "../data/zoomixPackages";

const PackagesSection = memo(function PackagesSection() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  const journeyLabel = isArabic ? "رحلة المشروع" : "THE ZOOMIX JOURNEY";

  const selectPackage = (id) => {
    window.localStorage.setItem("zoomix-selected-package", id);
    window.dispatchEvent(new CustomEvent("zoomix:package-select", { detail: id }));
    document
      .getElementById("contact-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="packages-section"
      className="zoomix-section bg-[#0A0A0A] text-white"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex items-center gap-4 mb-12">
          <span className="w-2 h-2 bg-[#BBFF00]" />
          <span className="zoomix-label">03. {isArabic ? "الباقات" : "PACKAGES"}</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <h2
            className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.05em]"} text-5xl md:text-7xl font-black leading-[0.95]`}
          >
            {isArabic ? "اختار نقطة البداية." : "Choose your starting point."}
          </h2>
          <p className="max-w-md text-white/60 leading-7">
            {isArabic
              ? "كل باقة لها نطاق واضح ومخرجات جاهزة للاستخدام."
              : "Every package has a clear scope and ready-to-use deliverables."}
          </p>
        </div>

        <div className="relative mb-10 grid grid-cols-3 gap-3" aria-label={journeyLabel}>
          <div className="zoomix-journey-line hidden sm:block" aria-hidden="true" />
          {ZOOMIX_PACKAGES.map((pkg, index) => (
            <a
              key={pkg.id}
              href={`#package-${pkg.id}`}
              className="group relative z-10 flex flex-col items-center gap-2 text-center"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#BBFF00] bg-[#0A0A0A] font-mono text-[10px] text-[#BBFF00] transition-colors group-hover:bg-[#BBFF00] group-hover:text-[#0A0A0A]">
                0{index + 1}
              </span>
              <span
                className={`${isArabic ? "font-arabic" : "font-display"} text-sm font-bold text-white/75 group-hover:text-[#BBFF00]`}
              >
                {pkg.name[language]}
              </span>
            </a>
          ))}
        </div>
        <div
          className="mb-8 grid gap-2 sm:grid-cols-3"
          aria-label={isArabic ? "مقارنة سريعة" : "Quick comparison"}
        >
          {ZOOMIX_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="border border-white/10 px-4 py-3 text-sm">
              <strong className="text-white">{pkg.name[language]}</strong>
              <span className="mt-1 block text-white/55">{pkg.fit[language]}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5 items-stretch">
          {ZOOMIX_PACKAGES.map((pkg) => (
            <article
              key={pkg.id}
              id={`package-${pkg.id}`}
              className={`flex flex-col border p-6 md:p-7 ${pkg.featured ? "border-[#BBFF00] bg-white/[0.04]" : "border-white/15"}`}
            >
              {pkg.featured && (
                <span className="self-start bg-[#BBFF00] text-[#0A0A0A] px-3 py-1 font-mono text-[10px] tracking-[0.14em] mb-5">
                  {isArabic ? "المقترحة" : "RECOMMENDED"}
                </span>
              )}
              <h3
                className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.02em]"} text-2xl font-black`}
              >
                {pkg.name[language]}
              </h3>
              <p className="mt-4 text-white/60 leading-7 min-h-[5.5rem]">
                {pkg.description[language]}
              </p>
              <p className="mt-5 font-mono text-3xl text-[#BBFF00]">
                {pkg.price}{" "}
                <span className="text-sm text-white/60">{isArabic ? "جنيه" : "EGP"}</span>
              </p>
              <p className="mt-4 text-sm text-white/70 leading-6">{pkg.fit[language]}</p>
              <div className="my-7 h-px bg-white/15" />
              <ul className="hidden flex-1 space-y-3 lg:block">
                {pkg.outputs[language].map((output) => (
                  <li
                    key={output}
                    className="flex items-start gap-3 text-sm text-white/75 leading-6"
                  >
                    <Check size={16} className="text-[#BBFF00] shrink-0 mt-1" />
                    {output}
                  </li>
                ))}
              </ul>
              <details className="mt-6 lg:hidden">
                <summary className="cursor-pointer border-y border-white/15 py-3 text-sm font-bold text-white">
                  {isArabic ? "تفاصيل الباقة" : "Package details"}
                </summary>
                <ul className="space-y-3 pt-4">
                  {pkg.outputs[language].map((output) => (
                    <li
                      key={output}
                      className="flex items-start gap-3 text-sm leading-6 text-white/75"
                    >
                      <Check size={16} className="mt-1 shrink-0 text-[#BBFF00]" />
                      {output}
                    </li>
                  ))}
                </ul>
              </details>
              <div className="mt-8 pt-5 border-t border-white/15 text-sm">
                <p className="text-white/70">
                  <strong className="text-white">{isArabic ? "المدة:" : "Duration:"}</strong>{" "}
                  {pkg.duration[language]}
                </p>
                <p className="mt-2 text-white/45 leading-6">{pkg.exclusions[language]}</p>
              </div>
              <button
                type="button"
                onClick={() => selectPackage(pkg.id)}
                className={`mt-7 zoomix-button w-full ${pkg.featured ? "bg-[#BBFF00] text-[#0A0A0A]" : "border-white/35 text-white"}`}
              >
                {isArabic ? "اختار الباقة" : "Choose package"} <ActionArrow size={18} />
              </button>
            </article>
          ))}
        </div>
        <p className="mt-8 font-mono text-xs text-white/45">
          {isArabic
            ? "الدفع: 60% مقدم و40% قبل التسليم. المعدات والتنقل والطباعة ومصاريف الإنتاج منفصلة عند الحاجة."
            : "Payment: 60% upfront and 40% before delivery. Equipment, transport, printing and production expenses are separate when needed."}
        </p>
      </div>
    </section>
  );
});

export default PackagesSection;
