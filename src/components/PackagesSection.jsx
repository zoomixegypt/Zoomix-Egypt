import { memo } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { useLanguage } from "../i18n";
import { ZOOMIX_PACKAGES } from "../data/zoomixPackages";

const PackagesSection = memo(function PackagesSection() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

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
            className={`${isArabic ? "font-arabic" : "font-display"} text-5xl md:text-7xl font-black leading-[0.95] tracking-[-0.05em]`}
          >
            {isArabic ? "اختار نقطة البداية." : "Choose your starting point."}
          </h2>
          <p className="max-w-md text-white/60 leading-7">
            {isArabic
              ? "كل باقة لها نطاق واضح ومخرجات جاهزة للاستخدام."
              : "Every package has a clear scope and ready-to-use deliverables."}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 items-stretch">
          {ZOOMIX_PACKAGES.map((pkg) => (
            <article
              key={pkg.id}
              className={`flex flex-col border p-6 md:p-7 ${pkg.featured ? "border-[#BBFF00] bg-white/[0.04]" : "border-white/15"}`}
            >
              {pkg.featured && (
                <span className="self-start bg-[#BBFF00] text-[#0A0A0A] px-3 py-1 font-mono text-[10px] tracking-[0.14em] mb-5">
                  {isArabic ? "المقترحة" : "RECOMMENDED"}
                </span>
              )}
              <h3 className={`${isArabic ? "font-arabic" : "font-display"} text-2xl font-black`}>
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
              <ul className="space-y-3 flex-1">
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
                {isArabic ? "اختار الباقة" : "Choose package"} <ArrowUpRight size={18} />
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
