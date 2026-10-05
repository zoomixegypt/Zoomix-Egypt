import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../i18n";

const serviceKeys = [
  ["01", "build", "buildText"],
  ["02", "show", "showText"],
  ["03", "launch", "launchText"],
];

const ServicesSection = memo(function ServicesSection() {
  const { language, t } = useLanguage();
  const whyItems = t("services", "whyItems");

  return (
    <section
      id="about-section"
      className="zoomix-section bg-[#F5F4EF] text-[#0A0A0A]"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div id="services-section" className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-24 items-start">
          <div>
            <p className="zoomix-label mb-6">{t("services", "eyebrow")}</p>
            <h2 className="font-arabic lg:sticky lg:top-28 text-4xl md:text-6xl font-black leading-[1.05] tracking-[-0.045em] max-w-xl">
              {t("services", "problem")}
            </h2>
          </div>

          <div>
            <p className="text-xl md:text-2xl text-black/65 leading-[1.65] max-w-2xl mb-14">
              {t("services", "intro")}
            </p>
            <div className="connection-line mb-12" aria-hidden="true" />
            <div className="grid md:grid-cols-3 gap-8">
              {serviceKeys.map(([number, titleKey, textKey]) => (
                <article key={number} className="border-t border-black/20 pt-5">
                  <span className="font-mono text-xs text-black/45 tracking-[0.16em]">
                    {number}
                  </span>
                  <h3
                    className={`${language === "ar" ? "font-arabic" : "font-display"} mt-8 text-2xl font-black leading-tight`}
                  >
                    {t("services", titleKey)}
                  </h3>
                  <p className="mt-4 text-black/60 leading-7">{t("services", textKey)}</p>
                  <ArrowUpRight className="mt-8 text-[#0A0A0A]" size={22} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 md:mt-36 pt-10 border-t border-black/20 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
          <h2
            className={`${language === "ar" ? "font-arabic" : "font-display"} text-4xl md:text-6xl font-black tracking-[-0.05em] leading-none`}
          >
            {t("services", "why")}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {whyItems.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-4 border-b border-black/15 pb-5 text-lg"
              >
                <span className="font-mono text-xs text-[#5f7f00] pt-1">0{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});

export default ServicesSection;
