import { ArrowUpLeft, ArrowUpRight, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n";
import { ZOOMIX_PROJECTS } from "../data/zoomixProjects";
import ImageWithFallback from "../components/ImageWithFallback";
import ProjectSeo from "../components/ProjectSeo";

function SystemCard({ number, eyebrow, title, children, className = "" }) {
  return (
    <article className={`min-h-[220px] border border-black/15 bg-white/45 p-5 md:p-7 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#BBFF00] px-2 font-mono text-xs font-bold text-black">
          {number}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">
          {eyebrow}
        </span>
      </div>
      <h3 className="mt-10 text-2xl font-black leading-tight md:text-3xl">{title}</h3>
      <div className="mt-4 text-sm leading-6 text-black/60">{children}</div>
    </article>
  );
}

function ProjectSystem({ project, language, text }) {
  const services = project.services[language];
  const deliverables = project.deliverables[language];
  const title = project.title[language];

  return (
    <section id="case-study-system" className="border-t border-black/15 px-6 py-12 md:px-10 md:py-16 lg:px-16">
      <div className="mb-8 max-w-3xl">
        <p className="zoomix-label mb-4">
          {language === "ar" ? "النظام وراء المشروع" : "THE SYSTEM BEHIND THE PROJECT"}
        </p>
        <h2 className="text-3xl font-black leading-tight md:text-5xl">
          {language === "ar" ? "الفكرة مش صورة واحدة." : "A project is more than one image."}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/60 md:text-lg">
          {language === "ar"
            ? "كل مشروع هنا بيتعرض كاتجاه بصري متكامل: احتياج واضح، قرار بصري، ومخرجات تقدر تكمل استخدامها."
            : "Each project is presented as a connected visual direction: a clear need, a visual decision and outputs ready to keep using."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SystemCard
          number="01"
          eyebrow={language === "ar" ? "الاتجاه" : "DIRECTION"}
          title={language === "ar" ? "من الاحتياج إلى قرار بصري." : "From need to visual decision."}
        >
          <p>{text("direction")}</p>
          <div className="mt-6 h-2 w-full bg-[#0A0A0A]">
            <div className="h-full w-2/3 bg-[#BBFF00]" />
          </div>
        </SystemCard>

        <SystemCard
          number="02"
          eyebrow={language === "ar" ? "المكونات" : "COMPONENTS"}
          title={language === "ar" ? "نظام يشتغل عبر أكثر من نقطة." : "A system that works across touchpoints."}
        >
          <ul className="space-y-2">
            {services.map((service) => (
              <li key={service} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#BBFF00]" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </SystemCard>

        <SystemCard
          number="03"
          eyebrow={language === "ar" ? "المخرجات" : "OUTPUTS"}
          title={language === "ar" ? "مخرجات جاهزة للاستخدام." : "Outputs ready to use."}
        >
          <ul className="space-y-2">
            {deliverables.slice(0, 4).map((deliverable) => (
              <li key={deliverable} className="border-b border-black/10 pb-2 last:border-0">
                {deliverable}
              </li>
            ))}
          </ul>
        </SystemCard>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[190px] overflow-hidden bg-[#0A0A0A] p-6 text-white md:p-8">
          <div className="absolute -end-10 -top-16 h-52 w-52 rounded-full border-[22px] border-[#BBFF00]/20" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#BBFF00]">
              {language === "ar" ? "قاعدة بصرية" : "VISUAL RULE"}
            </span>
            <p className="max-w-md text-2xl font-black leading-tight md:text-3xl">
              {language === "ar" ? "كل تفصيلة لها مكان في الصورة الكبيرة." : "Every detail has a place in the bigger picture."}
            </p>
          </div>
        </div>
        <div className="flex min-h-[190px] flex-col justify-between border border-black/15 bg-[#BBFF00] p-6 md:p-8">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/60">
            {language === "ar" ? "المشروع" : "PROJECT"}
          </span>
          <div>
            <p className="text-3xl font-black leading-none md:text-4xl">{title}</p>
            <p className="mt-3 text-sm text-black/65">{project.category[language]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ZoomixCaseStudy() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const project = ZOOMIX_PROJECTS[slug];

  if (!project)
    return (
      <div className="p-10" dir={language === "ar" ? "rtl" : "ltr"}>
        {language === "ar" ? "المشروع غير موجود." : "Project not found."}
      </div>
    );

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
      <nav
        aria-label={language === "ar" ? "مراحل دراسة الحالة" : "Case study stages"}
        className="sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-black/15 bg-[#F5F4EF]/95 px-5 py-3 backdrop-blur-xs md:px-8"
      >
        {[
          ["case-study-need", language === "ar" ? "01 الاحتياج" : "01 NEED"],
          ["case-study-direction", language === "ar" ? "02 الاتجاه" : "02 DIRECTION"],
          ["case-study-system", language === "ar" ? "03 النظام" : "03 SYSTEM"],
          ["case-study-outputs", language === "ar" ? "04 المخرجات" : "04 OUTPUTS"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="shrink-0 border border-black/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-black/55 transition-colors hover:border-black hover:bg-[#BBFF00] hover:text-black">
            {label}
          </a>
        ))}
      </nav>
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
                sizes="(min-width: 1024px) 36vw, 100vw"
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
            <section id={`case-study-${field}`} key={field} className="border-t border-black/20 pt-5 scroll-mt-16">
              <span className="font-mono text-xs text-black/45">{number}</span>
              <h2 className="mt-5 text-2xl font-black">{heading}</h2>
              <p className="mt-4 text-lg leading-8 text-black/65">{text(field)}</p>
            </section>
          ))}
          <section id="case-study-services" className="border-t border-black/20 pt-5 scroll-mt-16">
            <h2 className="text-2xl font-black">{language === "ar" ? "الخدمات" : "Services"}</h2>
            <ul className="mt-5 grid sm:grid-cols-2 gap-3">
              {project.services[language].map((item) => (
                <li key={item} className="border border-black/15 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section id="case-study-deliverables" className="border-t border-black/20 pt-5 scroll-mt-16">
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
          <div className="flex flex-wrap gap-3">
            <a href="/route-finder" className="zoomix-button bg-[#BBFF00] text-black">
              {language === "ar" ? "حدد خطوتك الجاية" : "Find your next move"} <ActionArrow size={18} />
            </a>
            <a href="/#contact-section" onClick={close} className="zoomix-button border-black/20 bg-[#0A0A0A] text-white">
              {language === "ar" ? "ابدأ مشروعك" : "Start a project"} <ActionArrow size={18} />
            </a>
          </div>
        </div>
      </div>
      <ProjectSystem project={project} language={language} text={text} />
      <section id="case-study-outputs" className="border-t border-black/15 px-6 py-12 md:px-10 md:py-16 lg:px-16 scroll-mt-16">
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
                sizes="(min-width: 768px) 50vw, 100vw"
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
          {gallery.length === 1 && (
            <>
              <div className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[#0A0A0A] p-6 text-white md:row-span-2 md:p-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#BBFF00]">
                  {language === "ar" ? "تطبيقات النظام" : "SYSTEM APPLICATIONS"}
                </span>
                <div>
                  <p className="text-4xl font-black leading-none md:text-6xl">
                    {language === "ar" ? "من فكرة" : "ONE IDEA"}
                  </p>
                  <p className="mt-2 text-4xl font-black leading-none text-[#BBFF00] md:text-6xl">
                    {language === "ar" ? "لعالم كامل" : "A FULL WORLD"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {['bg-[#BBFF00]', 'bg-white', 'bg-[#A5A5A5]', 'bg-[#0A0A0A]'].map((color) => (
                    <span key={color} className={`h-8 w-8 border border-white/20 ${color}`} />
                  ))}
                </div>
              </div>
              <div className="flex min-h-[260px] flex-col justify-between border border-black/15 bg-white p-6 md:p-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">
                  {language === "ar" ? "ملاحظة" : "NOTE"}
                </span>
                <p className="max-w-sm text-2xl font-black leading-tight md:text-3xl">
                  {language === "ar"
                    ? "المشروع الأصلي يتعرض كتصور بصري واضح، وليس كنتيجة عميل مدّعاة."
                    : "An original concept is shown as a clear visual exploration, not as a claimed client result."}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
                  {project.isSelfInitiated ? "ZOOMIX / SELF INITIATED" : "ZOOMIX / CONCEPT"}
                </span>
              </div>
            </>
          )}
        </div>
      </section>
    </article>
  );
}
