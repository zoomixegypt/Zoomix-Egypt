import { useEffect, useState, useRef, lazy, Suspense, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cursor from "../components/Cursor";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import useLenis from "../hooks/useLenis";
import useScrollToGallery from "../hooks/useScrollToGallery";
import SectionSkeleton from "../components/SectionSkeleton";
import HomeSeo from "../components/HomeSeo";
import SplashConnectionV2Tmp from "../components/SplashConnectionV2Tmp";
import { trackEvent } from "../utils/analytics";

const MarqueeBanner = lazy(() => import("../components/MarqueeBanner"));
const Footer = lazy(() => import("../components/Footer"));
const ServicesSection = lazy(() => import("../components/ServicesSection"));
const RouteFinderEntry = lazy(() => import("../components/RouteFinderEntry"));
const PackagesSection = lazy(() => import("../components/PackagesSection"));
const ProcessSection = lazy(() => import("../components/ProcessSection"));
const ProjectBriefSection = lazy(() => import("../components/ProjectBriefSection"));

const ProjectGallery = lazy(() => import("../components/ProjectGallery"));
const SelectedWorkReferences = lazy(() => import("../components/SelectedWorkReferences"));
const NoiseOverlay = lazy(() => import("../components/NoiseOverlay"));

const SPLASH_SESSION_KEY = "zoomix-splash-v2-seen";

function shouldShowSiteSplash() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("splash") === "1") return true;
  if (params.get("splash") === "0") return false;
  try {
    return window.sessionStorage.getItem(SPLASH_SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const galleryRef = useRef(null);

  /* Refactored Loading & Scroll Logic */
  const [isLoading] = useState(false);
  const [isScrollLocked] = useState(false);
  const [enableNoiseOverlay, setEnableNoiseOverlay] = useState(false);
  const [showSiteSplash, setShowSiteSplash] = useState(false);

  // Initialize Lenis with scroll lock state
  useLenis(isScrollLocked);

  useScrollToGallery(galleryRef, isLoading);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setEnableNoiseOverlay(isFinePointer && !reduceMotion);
    }
  }, []);

  useEffect(() => {
    if (shouldShowSiteSplash()) setShowSiteSplash(true);
  }, []);

  useEffect(() => {
    if (!showSiteSplash) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showSiteSplash]);

  // Manage body overflow based on scroll lock
  useEffect(() => {
    if (isScrollLocked) {
      document.body.style.overflow = "hidden";
      // Safety check: ensure strict scroll reset
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = "";
    }
  }, [isScrollLocked]);

  const handleOpenProject = useCallback(
    (project) => {
      if (!project?.slug) return;
      trackEvent("open_project", { project_slug: project.slug, source_section: "gallery" });
      navigate(`/projects/${project.slug}`, {
        state: { backgroundLocation: location },
      });
    },
    [navigate, location],
  );

  const handleSplashComplete = useCallback(() => {
    try {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    } catch {
      // The intro remains non-blocking if storage is unavailable.
    }
    setShowSiteSplash(false);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        {typeof document !== "undefined" && document.documentElement.lang === "en"
          ? "Skip to content"
          : "تخطي إلى المحتوى"}
      </a>
      <main
        id="main-content"
        className="bg-[#F5F4EF] text-black selection:bg-[#BBFF00] selection:text-black relative"
      >
        <HomeSeo />
        {enableNoiseOverlay && (
          <Suspense fallback={null}>
            <NoiseOverlay />
          </Suspense>
        )}
        <Cursor />
        <Navbar />
        <HeroSection isRevealed={true} />
        <Suspense fallback={<SectionSkeleton tone="dark" className="min-h-20" />}>
          <MarqueeBanner />
        </Suspense>
        <Suspense fallback={<SectionSkeleton className="min-h-[40vh]" />}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton className="min-h-[40vh]" />}>
          <RouteFinderEntry />
        </Suspense>
        <div className="route-to-work-transition" aria-label="Transition to the work gallery">
          <div className="route-to-work-transition__inner">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">SHOW THE WORK</span>
            <span className="route-to-work-transition__signal" aria-hidden="true">→</span>
          </div>
        </div>
        <div id="project-section" ref={galleryRef} className="overflow-anchor-none bg-neutral-900" style={{ overflowAnchor: "none" }}>
          <Suspense fallback={<SectionSkeleton tone="dark" className="min-h-screen" />}>
            <ProjectGallery onOpenProject={handleOpenProject} />
          </Suspense>
        </div>

        <Suspense fallback={<SectionSkeleton tone="dark" className="min-h-[40vh]" />}>
          <PackagesSection />
          <ProcessSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton tone="dark" className="min-h-[60vh]" />}>
          <ProjectBriefSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton tone="dark" className="min-h-[40vh]" />}>
          <SelectedWorkReferences />
          <Footer />
        </Suspense>
      </main>
      {showSiteSplash && (
        <SplashConnectionV2Tmp onComplete={handleSplashComplete} preview={false} />
      )}
    </>
  );
}
