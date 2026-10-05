import { ArrowUpRight, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n";
import { ZOOMIX_PROJECTS } from "../data/zoomixProjects";

export default function ZoomixCaseStudy() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const project = ZOOMIX_PROJECTS[slug];

  if (!project) return <div className="p-10">Project not found.</div>;

  const text = (field) => project[field][language];
  const close = () => navigate("/");

  return (
    <article className="bg-[#F5F4EF] text-[#0A0A0A]" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between p-5 md:p-8 border-b border-black/15">
        <span className="font-mono text-xs tracking-[0.16em] text-black/50">
          ZOOMIX / CASE STUDY
        </span>
        <button
          type="button"
          onClick={close}
          aria-label={language === "ar" ? "إغلاق المشروع" : "Close project"}
          className="w-10 h-10 border border-black/20 flex items-center justify-center hover:bg-[#BBFF00] transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 p-6 md:p-10 lg:p-16">
        <div>
          <p className="zoomix-label mb-6">{project.category[language]}</p>
          <h1
            className={`${language === "ar" ? "font-arabic" : "font-display"} text-5xl md:text-7xl font-black leading-[0.95] tracking-[-0.05em]`}
          >
            {project.title[language]}
          </h1>
          <p className="mt-8 text-xl leading-8 text-black/65">{text("overview")}</p>
          <div className="mt-10 aspect-[4/5] overflow-hidden bg-[#0A0A0A]">
            <img
              src={project.image}
              alt={project.title[language]}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-12 lg:pt-16">
          {[
            ["01", language === "ar" ? "الاحتياج" : "The need", "need"],
            ["02", language === "ar" ? "اتجاه Zoomix" : "Zoomix direction", "direction"],
          ].map(([number, heading, field]) => (
            <section key={field} className="border-t border-black/20 pt-5">
              <span className="font-mono text-xs text-black/45">{number}</span>
              <h2 className="mt-5 text-2xl font-black">{heading}</h2>
              <p className="mt-4 text-lg leading-8 text-black/65">{text(field)}</p>
            </section>
          ))}
          <section className="border-t border-black/20 pt-5">
            <h2 className="text-2xl font-black">{language === "ar" ? "الخدمات" : "Services"}</h2>
            <ul className="mt-5 grid sm:grid-cols-2 gap-3">
              {project.services[language].map((item) => (
                <li key={item} className="border border-black/15 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="border-t border-black/20 pt-5">
            <h2 className="text-2xl font-black">
              {language === "ar" ? "المخرجات" : "Deliverables"}
            </h2>
            <ul className="mt-5 space-y-3">
              {project.deliverables[language].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#BBFF00]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <p className="font-mono text-xs text-black/45 border-t border-black/20 pt-5">
            {language === "ar"
              ? "ZOOMIX CONCEPT PROJECT — لا توجد نتيجة موثقة."
              : "ZOOMIX CONCEPT PROJECT — No documented result claimed."}
          </p>
          <a
            href="#contact-section"
            onClick={close}
            className="zoomix-button bg-[#0A0A0A] text-white"
          >
            {language === "ar" ? "ابدأ مشروعك" : "Start a project"} <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </article>
  );
}
