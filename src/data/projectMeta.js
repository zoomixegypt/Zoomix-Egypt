export const PROJECT_META = [
  {
    id: 1,
    isConcept: true,
    slug: "content-system",
    titleAr: "نظام المحتوى",
    titleEn: "Content System",
    categoryAr: "محتوى / إخراج فني",
    categoryEn: "SOCIAL / ART DIRECTION",
    servicesAr: "اتجاه فني · تصميم محتوى · قوالب سوشيال",
    servicesEn: "Art direction · Content design · Social templates",
    color: "bg-[#BBFF00]",
    img: "/social-master.svg",
  },
  {
    id: 2,
    isConcept: true,
    slug: "story-system",
    titleAr: "قصص تفاعلية",
    titleEn: "Story System",
    categoryAr: "قصص / محتوى",
    categoryEn: "STORIES / CONTENT",
    servicesAr: "استراتيجية قصص · تصميم شرائح · نظام تفاعل",
    servicesEn: "Story strategy · Slide design · Interaction system",
    color: "bg-[#A5A5A5]",
    img: "/story-master.svg",
  },
  {
    id: 3,
    isConcept: true,
    slug: "reel-system",
    titleAr: "فيديو قصير",
    titleEn: "Reel System",
    categoryAr: "حركة / ريلز",
    categoryEn: "MOTION / REELS",
    servicesAr: "اتجاه حركة · مونتاج قصير · قوالب Reels",
    servicesEn: "Motion direction · Short-form editing · Reel templates",
    color: "bg-[#A5A5A5]",
    img: "/reel-master.svg",
  },
  {
    id: 4,
    isConcept: true,
    isSelfInitiated: true,
    slug: "mirsa-brand-world",
    titleAr: "مِرسى",
    titleEn: "MIRSA",
    categoryAr: "هوية / محتوى / إطلاق",
    categoryEn: "IDENTITY / CONTENT / LAUNCH",
    servicesAr: "هوية بصرية · تصوير منتجات · نظام محتوى",
    servicesEn: "Visual identity · Product photography · Content system",
    color: "bg-[#F28A3D]",
    img: "/mirsa-brand-world.png",
  },
];

export function getProjectMeta(language = "ar") {
  return PROJECT_META.map((project) => ({
    ...project,
    title: language === "en" ? project.titleEn : project.titleAr,
    category: language === "en" ? project.categoryEn : project.categoryAr,
    services: language === "en" ? project.servicesEn : project.servicesAr,
  }));
}

export const PROJECT_META_BY_SLUG = PROJECT_META.reduce((accumulator, item) => {
  accumulator[item.slug] = item;
  return accumulator;
}, {});
