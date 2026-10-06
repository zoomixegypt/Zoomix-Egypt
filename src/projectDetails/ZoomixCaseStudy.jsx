import { ArrowUpLeft, ArrowUpRight, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n";
import { ZOOMIX_PROJECTS } from "../data/zoomixProjects";
import ImageWithFallback from "../components/ImageWithFallback";
import ProjectSeo from "../components/ProjectSeo";

export default function ZoomixCaseStudy() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const project = ZOOMIX_PROJECTS[slug];

  if (!project) return <div className="p-10">Project not found.</div>;

  const text = (field) => project[field][language];
  const gallery = project.gallery?.length ? project.gallery : [project.image];
  const close = () => navigate("/");
  const ActionArrow = language === "ar" ? ArrowUpLeft : ArrowUpRight;

  return (
    <article className="bg-[#F5F4EF] text-[#0A0A0A]" dir={language === "ar" ? "rtl" : "ltr"}>
      <ProjectSeo project={{ ...project, slug }} />
      <div className="flex items-center justify-between gap-4 p-5 md:p-8 border-b border-black/15">
        <span className="font-mono text-xs tracking-[0.16em] text-black/50">
          ZOOMIX / CASE STUDY
        </span>
        <div className="flex items-center gap-2">
          <nav
            aria-label={language === "ar" ? "مسار التنقل" : "Breadcrumb"}
            className="hidden md:flex items-center gap-2 text-xs text-black/45"
          >
            <a href="/" onClick={close} className="hover:text-black transition-colors">
              {language === "ar" ? "الرئيسية" : "Home"}
            </a>
            <span aria-hidden="true">/</span>
            <span>{project.title[language]}</span>
          </nav>
          <button
            type="button"
            onClick={close}
            className="hidden sm:inline-flex zoomix-button min-h-10 border-black/20 px-3 py-2 text-xs"
          >
            {language === "ar" ? "العودة للأعمال" : "Back to work"}
          </button>
          <button
            type="button"
            onClick={close}
            aria-label={language === "ar" ? "إغلاق المشروع" : "Close project"}
            className="w-10 h-10 border border-black/20 flex items-center justify-center hover:bg-[#BBFF00] transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 p-6 md:p-10 lg:p-16">
        <div>
          <p className="zoomix-label mb-6">{project.category[language]}</p>
          <h1
            id="project-dialog-title"
            className={`${language === "ar" ? "font-arabic tracking-normal" : "font-display tracking-[-0.05em]"} text-5xl md:text-7xl font-black leading-[0.95]`}
          >
            {project.title[language]}
          </h1>
          <p className="mt-8 text-xl leading-8 text-black/65">{text("overview")}</p>
          <div className="mt-10 aspect-[4/5] overflow-hidden bg-[#0A0A0A]">
            <ImageWithFallback
              src={project.image}
              alt={project.title[language]}
              width="1080"
              height="1350"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
              fallbackClassName="w-full h-full aspect-[4/5]"
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
            {project.isSelfInitiated
              ? language === "ar"
                ? "ZOOMIX SELF-INITIATED PROJECT — مشروع أصلي للتجربة، بدون عميل أو نتائج تجارية مدّعاة."
                : "ZOOMIX SELF-INITIATED PROJECT — Original concept, with no client or claimed commercial results."
              : language === "ar"
                ? "ZOOMIX CONCEPT PROJECT — لا توجد نتيجة موثقة."
                : "ZOOMIX CONCEPT PROJECT — No documented result claimed."}
          </p>
          <a
            href="#contact-section"
            onClick={close}
            className="zoomix-button bg-[#0A0A0A] text-white"
          >
            {language === "ar" ? "ابدأ مشروعك" : "Start a project"} <ActionArrow size={18} />
          </a>
        </div>
      </div>
      <section className="border-t border-black/15 px-6 py-12 md:px-10 md:py-16 lg:px-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="zoomix-label mb-4">
              {language === "ar" ? "النظام البصري" : "THE VISUAL SYSTEM"}
            </p>
            <h2 className="text-3xl font-black md:text-5xl">
              {language === "ar" ? "الصورة كاملة." : "The full picture."}
            </h2>
          </div>
          <span className="hidden font-mono text-xs text-black/45 sm:block">
            {String(gallery.length).padStart(2, "0")}{" "}
            {language === "ar" ? "مخرجات بصرية" : "VISUAL OUTPUTS"}
          </span>
        </div>
        <div className="grid auto-rows-[minmax(180px,24vw)] gap-4 md:grid-cols-2">
          {gallery.map((image, index) => (
            <div
              key={image}
              className={`${index === 0 ? "md:row-span-2" : ""} group relative overflow-hidden bg-[#0A0A0A]`}
            >
              <ImageWithFallback
                src={image}
                alt={`${project.title[language]} ${index + 1}`}
                width="1600"
                height="1000"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                fallbackClassName="h-full w-full"
              />
              <span className="absolute bottom-3 start-3 bg-black/70 px-2 py-1 font-mono text-[10px] text-white/70">
                0{index + 1}
              </span>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
