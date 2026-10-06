import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../i18n";
import { Gsap } from "../utils/gsapAnimate";

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
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-24 items-start">
          <div>
            <p className="zoomix-label mb-6">{t("services", "eyebrow")}</p>
            <h2
              className={`${language === "ar" ? "font-arabic tracking-normal" : "font-display tracking-[-0.045em]"} lg:sticky lg:top-28 text-4xl md:text-6xl font-black leading-[1.05] max-w-xl`}
            >
              {t("services", "problem")}
            </h2>
          </div>

          <div>
            <p className="mb-14 max-w-2xl text-xl leading-[1.65] text-black/75 md:text-2xl">
              {t("services", "intro")}
            </p>
            <p className="-mt-8 mb-10 max-w-2xl text-base leading-7 text-black/60 md:text-lg">
              {t("services", "partnerIntro")}
            </p>
            <div id="services-section" className="mb-6 flex items-center gap-3 border-s border-[#BBFF00] ps-3 font-mono text-[10px] tracking-[0.16em] text-black/45">
              <span>{t("services", "systemLabel")}</span>
            </div>
            <div className="connection-line services-connection-line mb-12" aria-hidden="true" />
            <div className="grid md:grid-cols-3 gap-8">
              {serviceKeys.map(([number, titleKey, textKey], index) => (
                <Gsap.article
                  key={number}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.65, delay: index * 0.08, ease: "easeOut" }}
                  className="border-t border-black/20 pt-5"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#BBFF00] font-mono text-[10px] font-bold tracking-[0.08em] text-black">
                    {number}
                  </span>
                  <h3
                    className={`${language === "ar" ? "font-arabic" : "font-display"} mt-8 text-2xl font-black leading-tight`}
                  >
                    {t("services", titleKey)}
                  </h3>
                  <p className="mt-4 leading-7 text-black/70">{t("services", textKey)}</p>
                  <ArrowUpRight className="mt-8 text-[#0A0A0A]" size={22} aria-hidden="true" />
                </Gsap.article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 md:mt-36 pt-10 border-t border-black/20 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
          <h2
            className={`${language === "ar" ? "font-arabic tracking-normal" : "font-display tracking-[-0.05em]"} text-4xl md:text-6xl font-black leading-none`}
          >
            {t("services", "why")}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {whyItems.map((item, index) => (
              <Gsap.li
                key={item}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.06, ease: "easeOut" }}
                className="flex items-start gap-4 border-b border-black/15 pb-5 text-lg"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#BBFF00] font-mono text-[9px] font-bold text-black">
                  0{index + 1}
                </span>
                <span>{item}</span>
              </Gsap.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});

export default ServicesSection;
