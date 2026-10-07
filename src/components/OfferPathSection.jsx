import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, ArrowUpLeft, ArrowUpRight, Check } from "lucide-react";
import { useLanguage } from "../i18n";
import {
  ZOOMIX_CONTENT_PACKAGES,
  ZOOMIX_EVENT_PACKAGES,
  ZOOMIX_ONE_OFF_SERVICES,
  ZOOMIX_PARTNER_PACKAGES,
} from "../data/zoomixOfferings";
import { ZOOMIX_PACKAGES as ZOOMIX_START_PACKAGES } from "../data/zoomixPackages";
import { trackEvent } from "../utils/analytics";

const copy = {
  ar: {
    eyebrow: "ZOOMIX / نحدد الخطوة الجاية",
    title: "اختار طريقتك.",
    intro: "ممكن نرشح لك بسرعة، أو تستكشف المسارات بنفسك.",
    steps: ["مكانك دلوقتي", "اللي ناقصك", "النتيجة اللي عاوزها"],
    back: "السؤال السابق",
    reset: "ابدأ من جديد",
    choose: "كمّل تفاصيل مشروعك",
    recommended: "ترشيحنا لمشروعك",
    alternatives: "خيارات للمقارنة فقط",
    alternativesIntro: "لو احتياجك أبسط أو أوسع من الترشيح الحالي",
    comparisonMarker: "اختياري / مقارنة",
    priceLabel: "السعر",
    monthly: "جنيه شهريًا",
    direct: "التكاليف المباشرة مثل المعدات والانتقالات تتحدد حسب التنفيذ.",
    oneOffNote: "الخدمة المنفصلة تبدأ من السعر الموضح، والطلبات الأكبر تأخذ عرضًا مخصصًا.",
    questions: {
      stage: "إنت فين دلوقتي؟",
      need: "إيه الجزء اللي محتاج يتحرك؟",
      goal: "عاوز توصل لإيه؟",
    },
    routeSignal: "المسار بيتبني مع كل اختيار",
    routeLabels: ["نحدد المكان", "نحدد الاحتياج", "نثبت المسار"],
    routeHint: "اختياراتك بتحدد الاتجاه، لكنها مش بتقفل عليك باقي الحلول.",
    finderName: "زومكس / خطوتك الجاية",
    routeMapEyebrow: "ZOOMIX / خطوتك الجاية",
    routeMapTitle: "شوف طريقك قبل ما تختار.",
    routeMapIntro: "اختار بين 4 طرق. كل محطة بتوضح إمتى تناسبك وإيه اللي هتخرج بيه.",
    routeMapSystemNote: "المسارات دي طريقة اختيار العميل؛ أما تنفيذ المشروع فبيتحرك من Build إلى Show إلى Launch.",
    modeLabel: "طريقة التصفح",
    quickStart: "اختيار سريع — 3 أسئلة",
    exploreRoutes: "استكشف المسارات",
    quickPrompt: "خلّينا نحدد خطوتك في 3 أسئلة.",
    quickDescription: "جاوب على 3 أسئلة، وZoomix ترشح لك المسار والباقة الأنسب.",
    routeMapBack: "ارجع لاستكشاف الطرق",
    routeMapReason: "المسار ده مناسب لو",
    routeMapOutputs: "هتخرج منه بـ",
    routeDetailsLabel: "الطريق ده هيمشي إزاي",
    routePackagesLabel: "الباقات داخل المسار",
    routePackagesIntro: "بعد ما فهمت الطريق، دي تفاصيل كل اختيار فعليًا: المخرجات، المدة، والسعر.",
    packageIncludes: "تشمل",
    packageTiming: "المدة / الجدول",
    scheduleAfterBrief: "الجدول يتحدد بعد مراجعة تفاصيل المشروع.",
    monthlyTiming: "اشتراك شهري",
    packageNotIncluded: "غير شامل",
    packageNote: "ملاحظة السعر",
    choosePackage: "اختار الباقة",
    alternativeDetails: "تفاصيل الباقة البديلة",
    chooseAlternative: "اختارها بدل الترشيح",
    closeDetails: "إغلاق التفاصيل",
    featuredPackage: "الاختيار الأشهر",
    hideRouteDetails: "اقفل التفاصيل",
    routeMapChoose: "شوف باقات المسار",
    routeMapBrowse: "شوف كل باقات المسار",
    routeMap: [
      { value: "start", code: "START", title: "البداية", description: "لما تكون لسه بتبدأ أو محتاج ترتب أساس البراند.", reason: "محتاج هوية واتجاه واضح قبل ما تبدأ الظهور.", outputs: ["هوية مرتبة", "حضور بداية", "مخرجات جاهزة للاستخدام"], details: ["نرتب الأساس والاتجاه", "نبني حضورًا قابلًا للاستخدام", "نجهزك للانطلاقة"] },
      { value: "show", code: "SHOW", title: "الظهور", description: "لما البراند يكون جاهز ويحتاج مادة تخليه يظهر بشكل أقوى.", reason: "الأساس موجود، لكن محتاج محتوى أو تغطية تحكي الشغل.", outputs: ["محتوى مخطط", "صور وفيديو أفقي", "مادة جاهزة للنشر"], details: ["نحدد نوع المادة المطلوبة", "ننتج المحتوى أو التغطية", "نسلم مخرجات جاهزة للنشر"] },
      { value: "continue", code: "CONTINUE", title: "الاستمرار", description: "لما تحتاج شريكًا يحافظ على الاتجاه ويطوره كل شهر.", reason: "عاوز حضور ثابت وحد يكمّل معاك بدل حلول متقطعة.", outputs: ["اتجاه مستمر", "إنتاج شهري", "تطوير تدريجي للبراند"], details: ["نثبت الاتجاه والأولويات", "نخطط الإنتاج الشهري", "نراجع ونطور مع كل دورة"] },
      { value: "one-thing", code: "ONE THING", title: "خدمة واحدة", description: "لما تكون عارف الجزء المحدد اللي محتاج يتحل من غير باقة كاملة.", reason: "محتاج مخرج واضح ومحدد، مش رحلة كاملة.", outputs: ["خدمة محددة", "نطاق واضح", "تسعير مباشر"], details: ["نحدد الطلب والمخرج المطلوب", "نثبت النطاق والتسليم", "ننفذ الجزء المحدد مباشرة"] },
    ],
    stages: [
      { value: "start", label: "لسه ببدأ", description: "محتاج أرتب الأساس قبل ما أظهر." },
      { value: "show", label: "البراند جاهز", description: "محتاج محتوى أو تغطية تخلي الشغل يظهر." },
      { value: "continue", label: "شغال وعاوز أستمر", description: "محتاج شريك يحافظ على الاتجاه ويطوره." },
      { value: "one-thing", label: "محتاج حاجة محددة", description: "عاوز أحل جزء واحد من غير باقة كاملة." },
    ],
    needs: {
      start: [
        { value: "foundation", label: "الأساس", description: "هوية وبداية مرتبة." },
        { value: "presence", label: "الحضور", description: "تجهيز البراند للظهور واستقبال العملاء." },
        { value: "launch", label: "الانطلاقة", description: "هوية وحضور ومحتوى حقيقي من أول يوم." },
      ],
      show: [
        { value: "content", label: "محتوى مخطط", description: "أفكار وإنتاج ومخرجات جاهزة للنشر." },
        { value: "events", label: "تغطية إيفنت", description: "صور وفيديو أفقي يحكي الحدث." },
      ],
      continue: [
        { value: "monthly", label: "شراكة شهرية", description: "حضور ثابت واتجاه محتوى مستمر." },
      ],
      "one-thing": [
        { value: "identity", label: "هوية أو اتجاه", description: "Logo Direction أو Mini Identity أو Brand Guide." },
        { value: "digital", label: "حضور رقمي", description: "Landing Page أو تجهيز رقمي محدد." },
        { value: "content", label: "محتوى", description: "بوست أو Story أو خطة محتوى أو مونتاج." },
        { value: "print", label: "مطبوعات", description: "Business Card أو Flyer أو Menu." },
      ],
    },
    goals: {
      foundation: [{ value: "start-foundation", label: "أبدأ صح", description: "أحتاج نظامًا واضحًا أقدر أبني عليه." }],
      presence: [{ value: "start-presence", label: "أظهر بشكل مرتب", description: "أحتاج تجهيز البراند للحضور واستقبال العملاء." }],
      launch: [{ value: "start-launch", label: "أطلق المشروع", description: "أريد أن أكون جاهزًا للاستخدام من أول يوم." }],
      content: [
        { value: "content-start", label: "أبدأ بمحتوى مركز", description: "أحتاج بداية واضحة بكمية إنتاج مناسبة." },
        { value: "content-build", label: "أبني حضور أقوى", description: "أحتاج تنوعًا واتجاهًا أوضح للمحتوى." },
        { value: "content-campaign", label: "أجهز حملة أو إطلاق", description: "أحتاج إنتاجًا متكاملًا لحملة محددة." },
      ],
      events: [
        { value: "event-capture", label: "أوثق الأساسيات", description: "أحتاج اللحظات الرئيسية والصور الأساسية." },
        { value: "event-story", label: "أحكي قصة الحدث", description: "أحتاج تفاصيل أكثر ومادة أوضح بعد الحدث." },
        { value: "event-signature", label: "أغطي كل شيء", description: "أحتاج تصويرًا متزامنًا للصور والفيديو." },
      ],
      monthly: [
        { value: "partner-essentials", label: "أحافظ على الظهور", description: "حضور منتظم ومخرجات أساسية كل شهر." },
        { value: "partner-growth", label: "أطور الحضور", description: "اتجاه محتوى أقوى وإنتاج أكثر انتظامًا." },
        { value: "partner-full", label: "أبني شراكة كاملة", description: "توجيه مستمر وتطوير أوسع للبراند." },
      ],
      identity: [{ value: "one-off", label: "أحل الجزء المحدد", description: "خدمة واحدة واضحة بدون باقة كاملة." }],
      digital: [{ value: "one-off", label: "أحل الجزء المحدد", description: "خدمة واحدة واضحة بدون باقة كاملة." }],
      content: [{ value: "one-off", label: "أحل الجزء المحدد", description: "خدمة واحدة واضحة بدون باقة كاملة." }],
      print: [{ value: "one-off", label: "أحل الجزء المحدد", description: "خدمة واحدة واضحة بدون باقة كاملة." }],
      default: [{ value: "one-off", label: "أحل الجزء المحدد", description: "خدمة واحدة واضحة بدون باقة كاملة." }],
    },
  },
  en: {
    eyebrow: "ZOOMIX / FIND YOUR NEXT MOVE",
    title: "Choose your way in.",
    intro: "Get a quick recommendation or explore the routes yourself.",
    steps: ["Where you are", "What is missing", "What you want next"],
    back: "Previous question",
    reset: "Start over",
    choose: "Continue with your project details",
    recommended: "OUR RECOMMENDATION FOR YOUR PROJECT",
    alternatives: "OPTIONS FOR COMPARISON ONLY",
    alternativesIntro: "If your needs are simpler or broader than this recommendation.",
    comparisonMarker: "OPTIONAL / COMPARE",
    priceLabel: "Price",
    monthly: " / month",
    direct: "Direct costs such as equipment and transport depend on the production.",
    oneOffNote: "One-off services start at the listed price; larger requirements receive a custom quote.",
    questions: {
      stage: "Where is your project now?",
      need: "What needs to move next?",
      goal: "What do you want to reach?",
    },
    routeSignal: "Your route is taking shape",
    routeLabels: ["Locate the project", "Name the need", "Lock the route"],
    routeHint: "Your answers shape the direction without closing off other options.",
    finderName: "ZOOMIX / NEXT MOVE",
    routeMapEyebrow: "ZOOMIX / NEXT MOVE",
    routeMapTitle: "See your route before you choose.",
    routeMapIntro: "Choose between four routes. Each stop shows when it fits and what you will leave with.",
    routeMapSystemNote: "These are client routes; the work itself moves from Build to Show to Launch.",
    modeLabel: "Browse mode",
    quickStart: "Quick match — 3 questions",
    exploreRoutes: "Explore the routes",
    quickPrompt: "Find your next move in 3 questions.",
    quickDescription: "Answer three questions and Zoomix will match you with the right route, service or package.",
    routeMapBack: "Back to route map",
    routeMapReason: "This route fits when",
    routeMapOutputs: "You leave with",
    routeDetailsLabel: "How this route moves",
    routePackagesLabel: "Packages inside this route",
    routePackagesIntro: "Once the route is clear, compare the real options: deliverables, timeline and price.",
    packageIncludes: "Includes",
    packageTiming: "Timeline / schedule",
    scheduleAfterBrief: "The schedule is confirmed after reviewing the project details.",
    monthlyTiming: "Monthly partnership",
    packageNotIncluded: "Not included",
    packageNote: "Price note",
    choosePackage: "Choose this package",
    alternativeDetails: "Alternative package details",
    chooseAlternative: "Choose it instead of the recommendation",
    closeDetails: "Close details",
    featuredPackage: "Most popular fit",
    hideRouteDetails: "Hide details",
    routeMapChoose: "See route packages",
    routeMapBrowse: "See all route packages",
    routeMap: [
      { value: "start", code: "START", title: "START", description: "For a business starting out or organizing its foundation.", reason: "You need a clear identity and direction before showing up.", outputs: ["Organized identity", "A starting presence", "Ready-to-use foundations"], details: ["Organize the foundation and direction", "Build a usable starting presence", "Prepare the project for launch"] },
      { value: "show", code: "SHOW", title: "SHOW", description: "For a ready brand that needs work that makes it show up stronger.", reason: "The foundation is there, but the work needs content or coverage.", outputs: ["Planned content", "Landscape photo and video", "Publish-ready material"], details: ["Define the material you need", "Produce the content or coverage", "Deliver publish-ready outputs"] },
      { value: "continue", code: "CONTINUE", title: "CONTINUE", description: "For a brand that needs a partner to maintain and develop the direction monthly.", reason: "You need consistent presence instead of disconnected one-off fixes.", outputs: ["Ongoing direction", "Monthly production", "Steady brand development"], details: ["Set the direction and priorities", "Plan the monthly production", "Review and develop each cycle"] },
      { value: "one-thing", code: "ONE THING", title: "ONE THING", description: "For when you know the specific piece you need without a full package.", reason: "You need one clear output, not a complete route.", outputs: ["One defined service", "Clear scope", "Direct pricing"], details: ["Define the request and output", "Lock the scope and handoff", "Deliver the specific piece directly"] },
    ],
    stages: [
      { value: "start", label: "I am starting", description: "I need to organize the foundation before showing up." },
      { value: "show", label: "The brand is ready", description: "I need content or coverage that makes the work visible." },
      { value: "continue", label: "I want to keep going", description: "I need a partner to maintain and develop the direction." },
      { value: "one-thing", label: "I need one specific thing", description: "I want to solve one defined piece without a full package." },
    ],
    needs: {
      start: [
        { value: "foundation", label: "The foundation", description: "A clear identity and organized start." },
        { value: "presence", label: "The presence", description: "Get the brand ready to show up and welcome customers." },
        { value: "launch", label: "The launch", description: "Identity, presence and real content from day one." },
      ],
      show: [
        { value: "content", label: "Planned content", description: "Ideas, production and publish-ready outputs." },
        { value: "events", label: "Event coverage", description: "Landscape photos and video that tell the event story." },
      ],
      continue: [
        { value: "monthly", label: "Monthly partnership", description: "Consistent presence and an ongoing content direction." },
      ],
      "one-thing": [
        { value: "identity", label: "Identity or direction", description: "Logo Direction, Mini Identity or Brand Guide." },
        { value: "digital", label: "Digital presence", description: "A Landing Page or one defined digital need." },
        { value: "content", label: "Content", description: "A post, Story, content plan or edit." },
        { value: "print", label: "Print", description: "A business card, flyer or menu." },
      ],
    },
    goals: {
      foundation: [{ value: "start-foundation", label: "Start right", description: "I need a clear system I can build on." }],
      presence: [{ value: "start-presence", label: "Show up clearly", description: "I need the brand ready to meet its customers." }],
      launch: [{ value: "start-launch", label: "Launch the project", description: "I want to be ready to use everything from day one." }],
      content: [
        { value: "content-start", label: "Start with focused content", description: "I need a clear start with the right production size." },
        { value: "content-build", label: "Build a stronger presence", description: "I need more variety and a clearer content direction." },
        { value: "content-campaign", label: "Prepare a campaign or launch", description: "I need a complete production setup for a defined campaign." },
      ],
      events: [
        { value: "event-capture", label: "Capture the essentials", description: "I need the key moments and essential photos." },
        { value: "event-story", label: "Tell the event story", description: "I need more detail and a clearer post-event story." },
        { value: "event-signature", label: "Cover everything", description: "I need parallel photo and video coverage." },
      ],
      monthly: [
        { value: "partner-essentials", label: "Keep showing up", description: "Regular presence and essential monthly outputs." },
        { value: "partner-growth", label: "Develop the presence", description: "Stronger direction and more consistent production." },
        { value: "partner-full", label: "Build a full partnership", description: "Ongoing direction and broader brand development." },
      ],
      identity: [{ value: "one-off", label: "Solve the specific piece", description: "One clear service without a full package." }],
      digital: [{ value: "one-off", label: "Solve the specific piece", description: "One clear service without a full package." }],
      content: [{ value: "one-off", label: "Solve the specific piece", description: "One clear service without a full package." }],
      print: [{ value: "one-off", label: "Solve the specific piece", description: "One clear service without a full package." }],
      default: [{ value: "one-off", label: "Solve the specific piece", description: "One clear service without a full package." }],
    },
  },
};

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function saveRoute(route, packageId = "", language = "ar") {
  const selection = { route, packageId, source: "route-finder", savedAt: new Date().toISOString() };
  window.localStorage.setItem("zoomix-project-route", JSON.stringify(selection));
  window.dispatchEvent(new CustomEvent("zoomix:route-select", { detail: selection }));
  trackEvent("route_finder_recommendation", { route, package_id: packageId, language });
}

function getRecommendation(stage, need, goal) {
  if (stage === "start") {
    const packageId = goal === "start-launch" || need === "launch" ? "launch-content" : goal === "start-presence" || need === "presence" ? "launch" : "start";
    return { kind: "start", route: "start", packageId, packages: ZOOMIX_START_PACKAGES };
  }
  if (stage === "show") {
    return {
      kind: need === "events" ? "events" : "content",
      route: need === "events" ? "events" : "content",
      packageId: goal,
      packages: need === "events" ? ZOOMIX_EVENT_PACKAGES : ZOOMIX_CONTENT_PACKAGES,
    };
  }
  if (stage === "continue") {
    return { kind: "partner", route: "partner", packageId: goal, packages: ZOOMIX_PARTNER_PACKAGES };
  }
  const oneOffMap = { identity: "logo-identity", content: "social-post", digital: "landing-page", print: "print-design" };
  return { kind: "one-off", route: "one-off", packageId: oneOffMap[need] || "logo-identity", packages: ZOOMIX_ONE_OFF_SERVICES };
}

function getOfferName(offer, language) {
  return offer.name?.[language] || offer.name;
}

function getOfferPrice(offer, language, text, kind) {
  if (kind === "one-off") return offer.price;
  if (kind === "partner") return `${offer.price} ${text.monthly}`;
  return `${offer.price} ${language === "ar" ? "جنيه" : "EGP"}`;
}

function getOfferTiming(offer, language, text, kind) {
  if (offer?.duration?.[language]) return offer.duration[language];
  if (kind === "partner") return text.monthlyTiming;
  return text.scheduleAfterBrief;
}

function getRoutePackageGroups(route, language) {
  if (route === "start") {
    return [{
      key: "start",
      route: "start",
      kind: "start",
      label: language === "ar" ? "باقات التأسيس" : "FOUNDATION PACKAGES",
      packages: ZOOMIX_START_PACKAGES,
    }];
  }
  if (route === "show") {
    return [
      {
        key: "content",
        route: "content",
        kind: "content",
        label: language === "ar" ? "صناعة المحتوى" : "CONTENT PRODUCTION",
        packages: ZOOMIX_CONTENT_PACKAGES,
      },
      {
        key: "events",
        route: "events",
        kind: "events",
        label: language === "ar" ? "تغطية الإيفنتات" : "EVENT COVERAGE",
        packages: ZOOMIX_EVENT_PACKAGES,
      },
    ];
  }
  if (route === "continue") {
    return [{
      key: "partner",
      route: "partner",
      kind: "partner",
      label: language === "ar" ? "باقات الشراكة الشهرية" : "MONTHLY PARTNERSHIP",
      packages: ZOOMIX_PARTNER_PACKAGES,
    }];
  }
  if (route === "one-thing") {
    return [{
      key: "one-off",
      route: "one-off",
      kind: "one-off",
      label: language === "ar" ? "الخدمات المنفصلة" : "ONE-OFF SERVICES",
      packages: ZOOMIX_ONE_OFF_SERVICES[language] || [],
    }];
  }
  return [];
}

const ROUTE_DRAFT_KEY = "zoomix-route-finder-draft";

const OfferPathSection = memo(function OfferPathSection({ standalone = false, returnTo = "" } = {}) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === "ar";
  const ActionArrow = isArabic ? ArrowUpLeft : ArrowUpRight;
  const text = copy[language];
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ stage: "", need: "", goal: "" });
  const [mode, setMode] = useState(standalone ? "quiz" : "explore");
  const [selectedRoute, setSelectedRoute] = useState("start");
  const [expandedRoute, setExpandedRoute] = useState("");
  const [expandedAlternativeId, setExpandedAlternativeId] = useState("");
  const alternativeTouchStartY = useRef(null);
  const routeRefs = useRef({});
  const quickMatchRef = useRef(null);
  const [quickMatchVisible, setQuickMatchVisible] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    try {
      const draft = JSON.parse(window.sessionStorage.getItem(ROUTE_DRAFT_KEY) || "null");
      if (draft?.answers) setAnswers((current) => ({ ...current, ...draft.answers }));
      if (draft?.step >= 1 && draft.step <= 3) setStep(draft.step);
    } catch {
      // Ignore malformed draft state and start clean.
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    window.sessionStorage.setItem(ROUTE_DRAFT_KEY, JSON.stringify({ answers, step, mode }));
  }, [answers, step, mode, draftReady]);

  useEffect(() => {
    setExpandedAlternativeId("");
  }, [answers.stage, answers.need, answers.goal, language]);

  useEffect(() => {
    if (!expandedAlternativeId) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setExpandedAlternativeId("");
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [expandedAlternativeId]);

  useEffect(() => {
    if (mode !== "explore") return undefined;
    const nodes = Object.values(routeRefs.current).filter(Boolean);
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.dataset.route) setSelectedRoute(visible.target.dataset.route);
      },
      { rootMargin: "-22% 0px -54% 0px", threshold: [0.2, 0.45, 0.7] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [mode, language]);

  useEffect(() => {
    const node = quickMatchRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setQuickMatchVisible(true);
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [mode]);

  const recommendation = useMemo(
    () => getRecommendation(answers.stage, answers.need, answers.goal),
    [answers.stage, answers.need, answers.goal],
  );
  const currentOptions = step === 1 ? text.stages : step === 2 ? text.needs[answers.stage] || [] : text.goals[answers.need] || text.goals.default;
  const selectedValue = step === 1 ? answers.stage : step === 2 ? answers.need : answers.goal;

  const chooseAnswer = (value) => {
    trackEvent("route_finder_answer", { step, answer: value });
    if (step === 1) setAnswers({ stage: value, need: "", goal: "" });
    if (step === 2) setAnswers((current) => ({ ...current, need: value, goal: "" }));
    if (step === 3) {
      setAnswers((current) => ({ ...current, goal: value }));
      const nextRecommendation = getRecommendation(answers.stage, answers.need, value);
      saveRoute(nextRecommendation.route, nextRecommendation.packageId || "", language);
    }
    if (step < 3) setStep((current) => current + 1);
  };

  const reset = () => {
    setAnswers({ stage: "", need: "", goal: "" });
    setStep(1);
    setMode("quiz");
    window.sessionStorage.removeItem(ROUTE_DRAFT_KEY);
  };

  const chooseOffer = (route, id) => {
    saveRoute(route, id, language);
    if (returnTo) {
      window.location.assign(`${returnTo}?route=${encodeURIComponent(route)}&offerId=${encodeURIComponent(id)}`);
      return;
    }
    if (standalone) {
      navigate("/#contact-section");
      return;
    }
    scrollToSection("contact-section");
  };

  const primaryOffer = recommendation.kind === "one-off"
    ? recommendation.packages[language].find((item) => item.id === recommendation.packageId)
    : recommendation.packages.find((item) => item.id === (recommendation.packageId || recommendation.packages[1]?.id)) || recommendation.packages[0];
  const primaryOutputs = primaryOffer?.outputs?.[language] || [];
  const primaryTiming = getOfferTiming(primaryOffer, language, text, recommendation.kind);
  const primaryBoundary = primaryOffer?.exclusions?.[language] || primaryOffer?.priceNote?.[language] || text.direct;
  const alternatives = recommendation.kind === "one-off" ? [] : recommendation.packages.filter((item) => item.id !== primaryOffer?.id);
  const expandedAlternative = alternatives.find((item) => item.id === expandedAlternativeId);
  const answerSummary = [
    text.stages.find((item) => item.value === answers.stage)?.label,
    (text.needs[answers.stage] || []).find((item) => item.value === answers.need)?.label,
    (text.goals[answers.need] || text.goals.default).find((item) => item.value === answers.goal)?.label,
  ].filter(Boolean);
  const currentQuestion = step === 1 ? text.questions.stage : step === 2 ? text.questions.need : text.questions.goal;
  const selectedRouteData = text.routeMap.find((route) => route.value === selectedRoute) || text.routeMap[0];

  const scrollToRouteStory = (route) => {
    setSelectedRoute(route);
    document.getElementById(`route-story-${route}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const revealRouteDetails = (route) => {
    setSelectedRoute(route);
    setExpandedRoute((current) => current === route ? "" : route);
    window.requestAnimationFrame(() => {
      const node = document.getElementById(`route-story-${route}`);
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      node?.focus({ preventScroll: true });
    });
  };

  const openRouteDetails = (route) => {
    setSelectedRoute(route);
    setExpandedRoute(route);
    window.requestAnimationFrame(() => {
      const node = document.getElementById(`route-story-${route}`);
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      node?.focus({ preventScroll: true });
    });
  };

  const toggleAlternativeDetails = (offerId) => {
    const nextId = expandedAlternativeId === offerId ? "" : offerId;
    setExpandedAlternativeId(nextId);
    if (nextId) {
      window.requestAnimationFrame(() => {
        document.getElementById(`alternative-details-${nextId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  };

  const handleAlternativeTouchStart = (event) => {
    alternativeTouchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleAlternativeTouchEnd = (event) => {
    const startY = alternativeTouchStartY.current;
    const endY = event.changedTouches[0]?.clientY;
    alternativeTouchStartY.current = null;
    if (startY !== null && endY !== undefined && endY - startY > 80) setExpandedAlternativeId("");
  };

  const startQuickMatch = () => {
    setMode("quiz");
    window.requestAnimationFrame(() => scrollToSection("next-move-quick-match"));
  };

  const startMatch = (route) => {
    trackEvent("route_finder_start", { route });
    setSelectedRoute(route);
    setAnswers({ stage: route, need: "", goal: "" });
    setStep(2);
    setMode("quiz");
    window.requestAnimationFrame(() => scrollToSection("next-move-quick-match"));
  };

  return (
    <section id="offer-path-section" className={`zoomix-section scroll-mt-28 bg-[#F5F4EF] pb-0 text-[#0A0A0A] ${standalone ? "route-finder-page-section pt-10 md:pt-16" : "pt-24 md:pt-32"}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-12 flex items-center gap-4">
          <span className="h-2 w-2 bg-[#BBFF00]" aria-hidden="true" />
          <span className="zoomix-label">{text.eyebrow}</span>
          <div className="h-px flex-1 bg-black/15" />
        </div>

        <div className="mb-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <h2 className={`${isArabic ? "font-arabic tracking-normal" : "font-display tracking-[-0.05em]"} text-5xl font-black leading-[0.95] md:text-7xl`}>{text.title}</h2>
          <p className="max-w-xl text-lg leading-8 text-black/65 md:text-xl">{text.intro}</p>
        </div>

        <div id="route-mode-chooser" className="mb-8 flex flex-col justify-between gap-5 border-y border-black/15 bg-white/35 px-5 py-5 md:flex-row md:items-center md:px-7">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">{text.finderName} / MODE</span>
            <p className="mt-2 text-sm font-bold text-black/70">{text.modeLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={text.modeLabel}>
            <button type="button" onClick={startQuickMatch} aria-pressed={mode === "quiz"} className={`zoomix-button quick-match-primary gap-3 ${mode === "quiz" ? "bg-[#BBFF00] text-black shadow-[0_10px_24px_rgba(187,255,0,0.16)]" : "border-black/25 text-black hover:border-black hover:bg-white"}`}>
              <span className="quick-match-badge">{isArabic ? "الأسرع" : "FASTEST"}</span>
              <span>{text.quickStart}</span>
              <span className="quick-match-pulse-dot" aria-hidden="true" />
              <ActionArrow className="quick-match-arrow" size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => { setMode("explore"); window.requestAnimationFrame(() => scrollToSection("route-map-experience")); }} aria-pressed={mode === "explore"} className={`zoomix-button ${mode === "explore" ? "bg-[#0A0A0A] text-white" : "border-black/25 text-black hover:border-black hover:bg-white"}`}>
              {text.exploreRoutes}
            </button>
          </div>
        </div>

        {mode === "explore" && <div id="route-map-experience" className="route-map-experience mb-14 border-y border-black/15 py-8 md:py-12">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">{text.routeMapEyebrow}</span>
              <h3 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.04em]"} route-map-title mt-4 text-4xl font-black leading-none md:text-6xl`}><span className="route-title-mark">{text.routeMapTitle}</span></h3>
            </div>
            <div className="max-w-lg">
              <p className="text-sm leading-6 text-black/60 md:text-base">{text.routeMapIntro}</p>
              <p className="mt-4 border-s-2 border-[#BBFF00] ps-3 font-mono text-[10px] uppercase leading-5 tracking-[0.12em] text-black/45">{text.routeMapSystemNote}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <aside className="route-map-rail relative lg:sticky lg:top-28 lg:self-start">
              <div className="route-map-rail-card bg-[#0A0A0A] p-6 text-white md:p-8">
                <div className="mb-10 flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#BBFF00]">{text.finderName} / {selectedRouteData.code}</span>
                  <span className="route-map-live-dot h-2 w-2 rounded-full bg-[#BBFF00]" aria-hidden="true" />
                </div>
                <div className="relative space-y-2" role="tablist" aria-label={isArabic ? "استكشف مسارات العمل" : "Explore work routes"}>
                  <span className="route-map-rail-line absolute bottom-5 start-[0.3rem] top-5 w-px bg-white/15" aria-hidden="true" />
                  {text.routeMap.map((route, index) => {
                    const active = route.value === selectedRoute;
                    return (
                      <button key={route.value} type="button" onClick={() => scrollToRouteStory(route.value)} className={`route-map-rail-item relative flex w-full items-center gap-4 p-3 text-start transition-colors ${active ? "text-white" : "text-white/40 hover:text-white/75"}`} role="tab" aria-selected={active} aria-controls={`route-story-${route.value}`} id={`route-tab-${route.value}`}>
                        <span className={`relative z-10 h-2 w-2 shrink-0 rounded-full border ${active ? "border-[#BBFF00] bg-[#BBFF00] shadow-[0_0_14px_rgba(187,255,0,0.8)]" : "border-white/35 bg-[#0A0A0A]"}`} />
                        <span>
                          <span className="block font-mono text-[10px] tracking-[0.16em]">0{index + 1} / {route.code}</span>
                          <span className="mt-1 block text-lg font-black">{route.title}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-10 border-t border-white/15 pt-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{text.routeMapReason}</span>
                  <p className="mt-3 text-lg font-bold leading-7 text-white/85">{selectedRouteData.reason}</p>
                  <button type="button" onClick={() => openRouteDetails(selectedRouteData.value)} className="zoomix-button mt-6 w-full bg-[#BBFF00] text-black">{text.routeMapChoose}<span aria-hidden="true">↗</span></button>
                </div>
              </div>
            </aside>

            <div className="route-map-stories space-y-5">
              {text.routeMap.map((route, index) => {
                const active = route.value === selectedRoute;
                const packageGroups = getRoutePackageGroups(route.value, language);
                return (
                  <article key={route.value} id={`route-story-${route.value}`} ref={(node) => { routeRefs.current[route.value] = node; }} data-route={route.value} role="tabpanel" aria-labelledby={`route-tab-${route.value}`} tabIndex="-1" className={`route-map-story relative min-h-[28rem] overflow-hidden border p-6 transition-all duration-500 md:min-h-[34rem] md:p-10 ${active ? "border-[#0A0A0A] bg-white" : "border-black/15 bg-white/40"}`}>
                    <div className="route-map-story-number absolute -end-5 -top-7 font-mono text-[11rem] font-bold leading-none text-black/[0.04]">0{index + 1}</div>
                    <div className="relative z-10 flex h-full flex-col justify-between gap-12">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">0{index + 1} / {route.code}</span>
                          <h4 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.04em]"} mt-5 text-4xl font-black md:text-6xl`}>{route.title}</h4>
                        </div>
                        <span className={`route-map-story-dot mt-2 h-3 w-3 shrink-0 rounded-full ${active ? "bg-[#BBFF00] shadow-[0_0_22px_rgba(187,255,0,0.9)]" : "bg-black/15"}`} />
                      </div>
                      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
                        <div>
                          <p className="max-w-lg text-2xl font-black leading-tight md:text-4xl">{route.description}</p>
                          <div className="mt-7 flex flex-wrap items-center gap-4">
                            <button type="button" onClick={() => standalone ? revealRouteDetails(route.value) : scrollToSection(`offer-${route.value}`)} aria-expanded={standalone ? expandedRoute === route.value : undefined} className="border-b border-black/30 pb-1 text-sm font-bold text-black/55 hover:border-black hover:text-black">{standalone ? (expandedRoute === route.value ? text.hideRouteDetails : (isArabic ? "شوف تفاصيل الطريق" : "See route details")) : route.value === "one-thing" ? (isArabic ? "شوف الخدمات المنفصلة" : "See one-off services") : text.routeMapBrowse}</button>
                          </div>
                        </div>
                        <div className="border-s-2 border-[#BBFF00] ps-5">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{text.routeMapOutputs}</span>
                          <ul className="mt-4 space-y-2 text-sm font-bold leading-6 text-black/70">
                            {route.outputs.map((output) => <li key={output} className="flex gap-2"><span className="text-[#7aa600]">+</span>{output}</li>)}
                          </ul>
                        </div>
                      </div>
                      {standalone && expandedRoute === route.value && (
                        <div className="mt-8 border-t border-black/15 pt-6">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{text.routeDetailsLabel}</span>
                          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                            {route.details.map((detail, detailIndex) => (
                              <li key={detail} className="border border-black/15 bg-[#F5F4EF] p-4">
                                <span className="font-mono text-xs text-[#789900]">0{detailIndex + 1}</span>
                                <span className="mt-3 block text-sm font-bold leading-6 text-black/75">{detail}</span>
                              </li>
                            ))}
                          </ol>

                          <div className="mt-8 border-t border-black/15 pt-6">
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                              <div>
                                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{text.routePackagesLabel}</span>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">{text.routePackagesIntro}</p>
                              </div>
                              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#789900]">{route.code} / OPTIONS</span>
                            </div>

                            <div className="mt-5 space-y-6">
                              {packageGroups.map((group) => (
                                <section key={group.key} aria-labelledby={`route-package-group-${route.value}-${group.key}`}>
                                  <h5 id={`route-package-group-${route.value}-${group.key}`} className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">{group.label}</h5>
                                  <div className="mt-3 grid gap-3 lg:grid-cols-3">
                                    {group.packages.map((offer) => {
                                      const outputs = offer.outputs?.[language] || [];
                                      const offerName = getOfferName(offer, language);
                                      return (
                                        <article key={offer.id} className={`flex h-full flex-col border p-4 transition-colors ${offer.featured ? "border-[#789900] bg-[#F3F9DE]" : "border-black/15 bg-[#F5F4EF]"}`}>
                                          <div className="flex items-start justify-between gap-3">
                                            <h6 className="text-lg font-black leading-tight">{offerName}</h6>
                                            {offer.featured && <span className="shrink-0 bg-[#BBFF00] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-black">{text.featuredPackage}</span>}
                                          </div>
                                          {(offer.tagline?.[language] || offer.description?.[language]) && <p className="mt-2 text-xs leading-5 text-black/60">{offer.tagline?.[language] || offer.description?.[language]}</p>}

                                          <div className="mt-4 border-y border-black/10 py-3">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">{text.priceLabel}</span>
                                            <p className="mt-1 font-mono text-xl font-bold text-[#6e8e00]" dir="ltr" style={{ unicodeBidi: "isolate" }}>{getOfferPrice(offer, language, text, group.kind)}</p>
                                          </div>

                                          {outputs.length > 0 && (
                                            <div className="mt-4">
                                              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">{text.packageIncludes}</span>
                                              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-black/70">
                                                {outputs.map((output) => <li key={output} className="flex gap-2"><span className="text-[#789900]">+</span><span>{output}</span></li>)}
                                              </ul>
                                            </div>
                                          )}

                                          <p className="mt-4 border-t border-black/10 pt-3 text-xs leading-5 text-black/65"><span className="font-bold">{text.packageTiming}:</span> {getOfferTiming(offer, language, text, group.kind)}</p>
                                          {(offer.exclusions?.[language] || offer.priceNote?.[language]) && (
                                            <p className="mt-2 text-xs leading-5 text-black/50"><span className="font-bold">{offer.exclusions?.[language] ? text.packageNotIncluded : text.packageNote}:</span> {offer.exclusions?.[language] || offer.priceNote?.[language]}</p>
                                          )}

                                          <button type="button" onClick={() => chooseOffer(group.route, offer.id)} className="zoomix-button mt-5 w-full bg-[#0A0A0A] text-white transition-colors hover:bg-[#BBFF00] hover:text-black">
                                            {text.choosePackage}<span aria-hidden="true">↗</span>
                                          </button>
                                        </article>
                                      );
                                    })}
                                  </div>
                                </section>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>}

        {mode === "quiz" && <div id="next-move-quick-match" ref={quickMatchRef} data-active="true" className={`next-move-cta mb-6 scroll-mt-28 ${quickMatchVisible ? "is-visible" : ""}`}>
          <div className="next-move-cta-line" aria-hidden="true" />
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">{text.finderName} / QUICK MATCH</span>
              <p className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.03em]"} mt-3 text-2xl font-black md:text-4xl`}>{text.quickPrompt}</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-black/60">{text.quickDescription}</p>
            </div>
            <button type="button" onClick={() => { setMode("explore"); window.requestAnimationFrame(() => scrollToSection("route-map-experience")); }} className="next-move-cta-button group inline-flex shrink-0 items-center gap-3 bg-[#BBFF00] px-5 py-3 text-sm font-black text-black">
              <span>{text.routeMapBack}</span>
              <span className="next-move-cta-arrow text-lg" aria-hidden="true">↗</span>
            </button>
          </div>
        </div>}

        {mode === "quiz" && <>
        <div className="route-progress mb-8 grid grid-cols-3 gap-2 md:gap-5" aria-label={isArabic ? "خطوات اختيار المسار" : "Route selection steps"}>
          {text.steps.map((label, index) => {
            const number = index + 1;
            const active = number === step;
            const complete = number < step;
            return (
              <button key={label} type="button" onClick={() => number <= step && setStep(number)} disabled={number > step} className={`route-progress-step relative border-t-2 pt-4 text-start transition-colors ${active || complete ? "border-[#BBFF00]" : "border-black/15"} ${number > step ? "cursor-not-allowed opacity-45" : ""}`} aria-current={active ? "step" : undefined}>
                <span className={`font-mono text-xs ${active || complete ? "text-black" : "text-black/40"}`}>0{number}</span>
                <span className="mt-2 block text-sm font-bold md:text-base">{label}</span>
                <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-black/35">{text.routeLabels[index]}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="route-finder-aside relative overflow-hidden bg-[#0A0A0A] p-6 text-white md:p-8" data-step={step}>
            <div className="route-finder-orbit absolute -end-16 -top-20 h-64 w-64 rounded-full border-[28px] border-white/[0.06]" aria-hidden="true" />
            <div className="route-finder-orbit route-finder-orbit--inner absolute -end-2 top-10 h-36 w-36 rounded-full border border-[#BBFF00]/20" aria-hidden="true" />
            <div className="relative z-10 flex h-full min-h-[310px] flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#BBFF00]">{text.finderName}</span>
                  <span className="font-mono text-[10px] text-white/35">FIT 0{step}/03</span>
                </div>
                <div key={`question-${step}`} className="route-question-change">
                  <p className="mt-6 max-w-sm text-3xl font-black leading-tight md:text-4xl">{currentQuestion}</p>
                  <p className="mt-4 max-w-xs text-xs leading-5 text-white/45">{text.routeHint}</p>
                </div>
                <div className="mt-8 flex max-w-sm gap-1" aria-hidden="true">
                  {[1, 2, 3].map((number) => <span key={number} className={`h-1 flex-1 ${number <= step ? "bg-[#BBFF00]" : "bg-white/15"}`} />)}
                </div>
              </div>
              <div className="mt-10">
                <div className="mb-4 flex flex-wrap gap-2" aria-live="polite">
                  {answerSummary.length > 0 ? answerSummary.map((item, index) => <span key={`${item}-${index}`} className="route-answer-chip border border-white/15 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/60">{item}</span>) : <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">{text.routeSignal}</span>}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <span className="font-mono text-7xl font-bold leading-none text-white/10">0{step}</span>
                  <div className="route-signal-dot h-2 w-2 rounded-full bg-[#BBFF00] shadow-[0_0_18px_rgba(187,255,0,0.8)]" />
                </div>
              </div>
            </div>
          </aside>

          <div className="route-options-panel border border-black/15 bg-white/45 p-5 md:p-8">
            <div key={`options-${step}`} className="grid gap-3 sm:grid-cols-2">
              {currentOptions.map((option, index) => {
                const selected = selectedValue === option.value;
                return (
                  <button key={option.value} type="button" onClick={() => chooseAnswer(option.value)} aria-pressed={selected} className={`route-option-card min-h-[126px] border p-5 text-start transition-all ${selected ? "border-[#0A0A0A] bg-[#BBFF00]" : "border-black/15 hover:border-black/50 hover:bg-white"}`}>
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3"><span className="font-mono text-[10px] text-black/35">0{index + 1}</span><span className="text-xl font-black">{option.label}</span></span>
                      <span className="font-mono text-xs text-black/45" aria-hidden="true">{selected ? <Check className="route-option-check text-black" size={17} strokeWidth={2.5} /> : "+"}</span>
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-black/60">{option.description}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/15 pt-5">
              <div className="flex gap-2">
                {step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)} className="px-3 py-2 text-sm font-bold text-black/60 hover:text-black">{text.back}</button>}
                <button type="button" onClick={reset} className="px-3 py-2 text-sm font-bold text-black/45 hover:text-black">{text.reset}</button>
              </div>
              {step < 3 && <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{text.routeLabels[step]} →</span>}
            </div>
          </div>
        </div>

        {step === 3 && answers.goal && (
          <>
          <div className="zoomix-result-card mt-5 border border-[#0A0A0A] bg-[#0A0A0A] p-5 text-white md:p-8">
            <div className="mb-7 flex flex-col justify-between gap-3 border-b border-white/15 pb-5 md:flex-row md:items-end">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                  {answerSummary.map((item, index) => (
                    <span key={`${item}-${index}`} className="flex items-center gap-2">
                      {index > 0 && <span className="text-[#BBFF00]" aria-hidden="true">/</span>}
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#BBFF00]">{text.recommended}</span>
                <h3 className="mt-3 text-3xl font-black md:text-5xl">{getOfferName(primaryOffer, language)}</h3>
              </div>
              <span className="font-mono text-xl text-[#BBFF00]" dir="ltr" style={{ unicodeBidi: "isolate" }}>{getOfferPrice(primaryOffer, language, text, recommendation.kind)}</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{text.packageIncludes}</span>
                {primaryOutputs.length > 0 ? (
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/70 sm:grid-cols-2">
                    {primaryOutputs.map((output) => <li key={output} className="flex gap-2"><span className="text-[#BBFF00]">+</span><span>{output}</span></li>)}
                  </ul>
                ) : (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">{text.oneOffNote}</p>
                )}
              </div>
              <div className="border-s border-white/15 ps-5">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{text.packageTiming}</span>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/80">{primaryTiming}</p>
                </div>
                <div className="mt-5 border-t border-white/15 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{primaryOffer?.exclusions?.[language] ? text.packageNotIncluded : text.packageNote}</span>
                  <p className="mt-2 text-xs leading-5 text-white/45">{recommendation.kind === "one-off" ? text.oneOffNote : primaryBoundary}</p>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <span className="primary-cta-badge">{isArabic ? "الخطوة الجاية" : "NEXT STEP"}</span>
              <button type="button" onClick={() => chooseOffer(recommendation.route, primaryOffer.id)} className="zoomix-button group result-primary-cta bg-[#BBFF00] text-black transition-transform hover:-translate-y-0.5">
                {text.choose}<ActionArrow className="transition-transform duration-200 group-hover:-translate-y-0.5" size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

            {recommendation.kind !== "one-off" && alternatives.length > 0 && (
              <div className="mt-6 bg-[#F5F4EF] px-5 py-5 text-[#0A0A0A] md:px-7 md:py-6">
                <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-4 md:flex-row md:items-end">
                  <div className="border-s-2 border-[#BBFF00] ps-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">{text.alternatives}</p>
                    <p className="mt-2 text-sm leading-6 text-black/55">{text.alternativesIntro}</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/35">{text.comparisonMarker}</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {alternatives.map((offer, index) => (
                    <button key={offer.id} type="button" onClick={() => toggleAlternativeDetails(offer.id)} aria-expanded={expandedAlternativeId === offer.id} aria-controls={`alternative-details-${offer.id}`} className={`min-h-[122px] border p-4 text-start transition-all hover:-translate-y-0.5 md:p-5 ${expandedAlternativeId === offer.id ? "border-[#789900] bg-[#EDF7C8]" : "border-black/15 bg-white/80 hover:border-black/45"}`}>
                      <span className="flex items-start justify-between gap-4">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="font-mono text-[10px] text-[#789900]">{String(index + 1).padStart(2, "0")}</span>
                          <span className="text-sm font-black text-black/85">{getOfferName(offer, language)}</span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-black/55" dir="ltr" style={{ unicodeBidi: "isolate" }}>{getOfferPrice(offer, language, text, recommendation.kind)}</span>
                      </span>
                      {(offer.tagline?.[language] || offer.description?.[language]) && <span className="mt-3 block text-[11px] leading-5 text-black/50">{offer.tagline?.[language] || offer.description?.[language]}</span>}
                      <span className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                        <span className="text-[10px] text-black/40">{expandedAlternativeId === offer.id ? text.hideRouteDetails : (isArabic ? "شوف التفاصيل" : "See details")}</span>
                        <span className="text-sm text-[#789900]" aria-hidden="true">↗</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recommendation.kind === "one-off" && (
              <div className="mt-6 bg-[#F5F4EF] px-5 py-5 text-[#0A0A0A] md:px-7 md:py-6">
                <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-4 md:flex-row md:items-end">
                  <div className="border-s-2 border-[#BBFF00] ps-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">{text.alternatives}</p>
                    <p className="mt-2 text-sm leading-6 text-black/55">{text.alternativesIntro}</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/35">{text.comparisonMarker}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendation.packages[language].filter((offer) => offer.id !== primaryOffer?.id).map((offer, index) => (
                    <button key={offer.id} type="button" onClick={() => toggleAlternativeDetails(offer.id)} aria-expanded={expandedAlternativeId === offer.id} aria-controls={`alternative-details-${offer.id}`} className={`min-h-[122px] border p-4 text-start transition-all hover:-translate-y-0.5 ${expandedAlternativeId === offer.id ? "border-[#789900] bg-[#EDF7C8]" : "border-black/15 bg-white/80 hover:border-black/45"}`}>
                      <span className="flex items-start justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="font-mono text-[10px] text-[#789900]">{String(index + 1).padStart(2, "0")}</span>
                          <span className="text-sm font-black text-black/85">{offer.name}</span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-black/55" dir="ltr" style={{ unicodeBidi: "isolate" }}>{offer.price}</span>
                      </span>
                      {offer.description && <span className="mt-3 block text-[11px] leading-5 text-black/50">{offer.description}</span>}
                      <span className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                        <span className="text-[10px] text-black/40">{expandedAlternativeId === offer.id ? text.hideRouteDetails : (isArabic ? "شوف التفاصيل" : "See details")}</span>
                        <span className="text-sm text-[#789900]" aria-hidden="true">↗</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {expandedAlternative && (
              <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-[2px] md:items-center md:p-6" role="dialog" aria-modal="true" aria-labelledby={`alternative-dialog-title-${expandedAlternative.id}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setExpandedAlternativeId(""); }}>
                <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[22px] border border-white/15 bg-[#0A0A0A] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:max-h-[88vh] md:rounded-none">
                  <div className="relative flex shrink-0 items-start justify-between gap-5 border-b border-white/15 px-5 py-5 md:px-7 md:py-6" onTouchStart={handleAlternativeTouchStart} onTouchEnd={handleAlternativeTouchEnd}>
                    <span className="absolute left-1/2 top-2 h-1 w-12 -translate-x-1/2 rounded-full bg-white/25 md:hidden" aria-hidden="true" />
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#BBFF00]">{text.alternativeDetails}</span>
                      <h4 id={`alternative-dialog-title-${expandedAlternative.id}`} className="mt-2 text-2xl font-black md:text-3xl">{getOfferName(expandedAlternative, language)}</h4>
                    </div>
                    <button type="button" onClick={() => setExpandedAlternativeId("")} aria-label={text.closeDetails} className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 text-2xl leading-none text-white/75 transition-colors hover:border-[#BBFF00] hover:text-[#BBFF00]">×</button>
                  </div>

                  <div className="overflow-y-auto overscroll-contain px-5 py-5 md:px-7 md:py-6">
                    <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/15 pb-5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{text.priceLabel}</span>
                      <span className="font-mono text-xl text-[#BBFF00]" dir="ltr" style={{ unicodeBidi: "isolate" }}>{getOfferPrice(expandedAlternative, language, text, recommendation.kind)}</span>
                    </div>
                    <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                      <div>
                        {expandedAlternative.outputs?.[language]?.length > 0 ? (
                          <>
                            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{text.packageIncludes}</span>
                            <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/70 sm:grid-cols-2">
                              {expandedAlternative.outputs[language].map((output) => <li key={output} className="flex gap-2"><span className="text-[#BBFF00]">+</span><span>{output}</span></li>)}
                            </ul>
                          </>
                        ) : (
                          <p className="text-sm leading-6 text-white/65">{text.oneOffNote}</p>
                        )}
                      </div>
                      <div className="border-s border-white/15 ps-5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{text.packageTiming}</span>
                        <p className="mt-2 text-sm font-bold leading-6 text-white/80">{getOfferTiming(expandedAlternative, language, text, recommendation.kind)}</p>
                        <div className="mt-5 border-t border-white/15 pt-4">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{expandedAlternative.exclusions?.[language] ? text.packageNotIncluded : text.packageNote}</span>
                          <p className="mt-2 text-xs leading-5 text-white/45">{recommendation.kind === "one-off" ? text.oneOffNote : expandedAlternative.exclusions?.[language] || expandedAlternative.priceNote?.[language] || text.direct}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-white/15 bg-[#0A0A0A] px-5 py-4 md:px-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={() => chooseOffer(recommendation.route, expandedAlternative.id)} className="zoomix-button bg-[#BBFF00] text-black transition-transform hover:-translate-y-0.5">
                        <ArrowLeftRight size={18} aria-hidden="true" />{text.chooseAlternative}
                      </button>
                      <button type="button" onClick={() => setExpandedAlternativeId("")} className="zoomix-button border-white/25 text-white/80 transition-colors hover:border-white hover:text-white">
                        {isArabic ? "رجوع" : "Back"}<span aria-hidden="true">↩</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </>}
      </div>
    </section>
  );
});

export default OfferPathSection;
