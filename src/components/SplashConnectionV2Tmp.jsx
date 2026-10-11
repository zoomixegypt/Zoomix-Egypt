import { useCallback, useEffect, useRef, useState } from "react";
import ZoomixLogo from "./ZoomixLogo";
import { useLanguage } from "../i18n";

// Shared by the preview route and the real homepage intro.
// The production version is intentionally short: it should establish the
// brand transition without making a returning visitor wait for the website.
const DURATION_MS = 1500;
const LETTER_BASE_MS = 350;
const LETTER_STAGGER_MS = 90;
const AFTER_LOGO_HOLD_MS = 1000;
const EXIT_TRANSITION_MS = 700;

const STOPS = {
  ar: ["الهوية", "المحتوى", "الحضور الرقمي"],
  en: ["IDENTITY", "CONTENT", "DIGITAL PRESENCE"],
};

const PROMISE = {
  ar: { first: "ركز في مشروعك.", second: "Zoomix ترتب الصورة." },
  en: { first: "Focus on your project.", second: "Zoomix brings it into focus." },
};

export default function SplashConnectionV2Tmp({ onComplete = null, preview = true }) {
  const { language } = useLanguage();
  const isArabic = language !== "en";
  const locale = isArabic ? "ar" : "en";
  const stopLabels = STOPS[locale];
  const promise = PROMISE[locale];
  const isLive = Boolean(onComplete);
  const [progress, setProgress] = useState(0);
  const [progressComplete, setProgressComplete] = useState(false);
  const [logoComplete, setLogoComplete] = useState(false);
  const [exited, setExited] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [logoSvg, setLogoSvg] = useState("");
  const [logoReady, setLogoReady] = useState(false);
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const finishedRef = useRef(false);
  const callbackTimerRef = useRef(0);
  const logoLetterCountRef = useRef(0);
  const completedLogoLettersRef = useRef(0);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setExited(true);
    if (onComplete) {
      callbackTimerRef.current = window.setTimeout(onComplete, EXIT_TRANSITION_MS);
    }
  }, [onComplete]);

  useEffect(() => {
    if (reduceMotion) {
      setProgress(100);
      finish();
      return;
    }
    // Gate the whole timeline on logo readiness so a slow fetch can never
    // let the wipe outrun the letter assembly. The fallback <img> renders
    // instantly, so waiting only affects the animated path.
    if (!logoReady) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION_MS);
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setProgressComplete(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(callbackTimerRef.current);
    };
  }, [replayKey, reduceMotion, logoReady, finish]);

  // The upward wipe starts only after the route is complete, the logo has
  // finished assembling, and the completed lockup has had a full second to
  // register before the page is revealed underneath it.
  useEffect(() => {
    if (reduceMotion || !progressComplete || !logoComplete) return undefined;
    const holdTimer = window.setTimeout(finish, AFTER_LOGO_HOLD_MS);
    return () => window.clearTimeout(holdTimer);
  }, [finish, logoComplete, progressComplete, reduceMotion]);

  // Inline the official logo so its letter groups can stagger in.
  // Artwork is untouched — only opacity/transform/filter are animated.
  useEffect(() => {
    let cancelled = false;
    const logoTimeout = window.setTimeout(() => {
      if (!cancelled) setLogoReady(true);
    }, 800);
    fetch("/zoomix-logo.svg", { cache: "force-cache" })
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) {
          setLogoReady(true);
          return;
        }
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        const stripe = Array.from(svg.querySelectorAll("rect")).find(
          (el) =>
            (el.getAttribute("class") || "").includes("st1") &&
            Number(el.getAttribute("y")) > 0,
        );
        let wordmark = svg;
        if (stripe) {
          let node = stripe.parentElement;
          while (node && node.parentElement !== svg) node = node.parentElement;
          if (node) wordmark = node;
        }
        const letters = Array.from(wordmark.children);
        logoLetterCountRef.current = letters.length;
        completedLogoLettersRef.current = 0;
        if (letters.length === 0) setLogoComplete(true);
        letters.forEach((child, i) => {
          child.setAttribute("class", `${child.getAttribute("class") || ""} cv2-letter`.trim());
          child.style.animationDelay = `${LETTER_BASE_MS + i * LETTER_STAGGER_MS}ms`;
        });
        setLogoSvg(new XMLSerializer().serializeToString(svg));
        setLogoReady(true);
      })
      .catch(() => {
        // Fallback <img> is already on screen — release the timeline.
        setLogoReady(true);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(logoTimeout);
    };
  }, [replayKey]);

  // If the inline artwork is unavailable, the official fallback logo is
  // already visible and counts as complete instead of blocking the intro.
  useEffect(() => {
    if (logoReady && !logoSvg) setLogoComplete(true);
  }, [logoReady, logoSvg]);

  const handleLogoAnimationEnd = useCallback((event) => {
    if (event.animationName !== "cv2-letter-in") return;
    if (!event.target?.classList?.contains("cv2-letter")) return;
    completedLogoLettersRef.current += 1;
    if (completedLogoLettersRef.current >= logoLetterCountRef.current) {
      setLogoComplete(true);
    }
  }, []);

  const replay = () => {
    finishedRef.current = false;
    window.clearTimeout(callbackTimerRef.current);
    setLogoSvg("");
    setLogoReady(false);
    setProgress(0);
    setProgressComplete(false);
    setLogoComplete(false);
    logoLetterCountRef.current = 0;
    completedLogoLettersRef.current = 0;
    setExited(false);
    setReplayKey((k) => k + 1);
  };

  const skip = () => {
    if (!isLive) return replay();
    finish();
  };

  // Line tip position (0..1) drives node arrival — pulse fires on arrival, not on a timer.
  const tip = progress / 100;
  const litCount = tip >= 1 ? 3 : tip >= 0.52 ? 2 : tip >= 0.06 ? 1 : 0;
  const phaseNumber = progress >= 100 ? 3 : progress >= 52 ? 2 : 1;
  const phaseLabel = `${String(phaseNumber).padStart(2, "0")} / 03`;

  return (
    <main
      className={`${exited ? "cv2 is-exited" : "cv2"}${isLive ? " cv2-live" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
      aria-busy={!exited}
      aria-label={isLive ? (isArabic ? "تهيئة موقع زومكس" : "Preparing the Zoomix website") : undefined}
    >
      <style>{`
        .cv2 {
          min-height: 100dvh;
          background: #0A0A0A;
          color: #F5F4EF;
          position: relative;
          overflow: hidden;
        }
        .cv2-live {
          position: fixed;
          inset: 0;
          z-index: 1000;
          width: 100%;
        }
        .cv2-live .cv2-hero { display: none; }
        /* ——— hero mock underneath (revealed by the wipe) ——— */
        .cv2-hero {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #0A0A0A;
        }
        .cv2-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .cv2-hero-inner { position: relative; text-align: center; max-width: 620px; }
        .cv2-hero-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.28em;
          color: #BBFF00;
        }
        .cv2-hero-title {
          margin-top: 1rem;
          font-family: 'Cairo', sans-serif;
          font-weight: 900;
          font-size: clamp(30px, 7vw, 56px);
          line-height: 1.5;
          color: #fff;
        }
        .cv2-hero-title em { font-style: normal; color: #BBFF00; }
        .cv2-hero-cta { margin-top: 1.75rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .cv2-hero-cta .solid { background: #BBFF00; color: #0A0A0A; font-weight: 800; padding: 0.9rem 1.8rem; }
        .cv2-hero-cta .ghost { border: 1px solid rgba(255,255,255,0.3); color: #fff; font-weight: 700; padding: 0.9rem 1.8rem; }
        .cv2-hero-note {
          margin-top: 1.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.4);
        }
        .cv2-hero .rise { opacity: 0; }
        .cv2.is-exited .cv2-hero .rise { animation: cv2-rise 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .cv2.is-exited .cv2-hero .rise.d1 { animation-delay: 0.05s; }
        .cv2.is-exited .cv2-hero .rise.d2 { animation-delay: 0.15s; }
        .cv2.is-exited .cv2-hero .rise.d3 { animation-delay: 0.28s; }
        .cv2.is-exited .cv2-hero .rise.d4 { animation-delay: 0.42s; }
        /* ——— splash overlay (wipes away) ——— */
        .cv2-splash {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .cv2-splash::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .cv2.is-exited .cv2-splash {
          animation: cv2-wipe 0.9s cubic-bezier(0.7,0,0.3,1) both;
          pointer-events: none;
        }
        .cv2-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 440px;
          width: 100%;
        }
        .cv2.is-exited .cv2-inner { animation: cv2-inner-up 0.9s cubic-bezier(0.7,0,0.3,1) both; }
        /* route line: real stroke draw driven by progress */
        .cv2-route { position: relative; width: min(320px, 72vw); }
        .cv2-route svg { display: block; width: 100%; height: auto; overflow: visible; }
        .cv2-route-track { stroke: rgba(255,255,255,0.14); stroke-width: 2; }
        .cv2-route-draw { stroke: #BBFF00; stroke-width: 2; }
        .cv2-route-nodes { position: relative; display: flex; justify-content: space-between; margin-top: -9px; }
        .cv2-node { display: flex; flex-direction: column; align-items: center; gap: 0.65rem; width: 33.333%; }
        .cv2-dot {
          width: 10px; height: 10px; border-radius: 999px;
          background: rgba(255,255,255,0.18);
          margin-top: -8px;
          transition: background-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }
        .cv2-node.is-lit .cv2-dot {
          background: #BBFF00;
          box-shadow: 0 0 0 5px #0A0A0A, 0 0 16px rgba(187,255,0,0.8);
        }
        .cv2-node.is-lit .cv2-dot::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 999px;
          border: 1px solid #BBFF00;
          animation: cv2-ping 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .cv2-label {
          font-family: 'Cairo', sans-serif;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          color: rgba(245,244,239,0.35);
          transition: color 0.25s ease;
        }
        .cv2-node.is-lit .cv2-label { color: rgba(245,244,239,0.85); }
        .cv2-pct {
          margin-top: 1.1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(187,255,0,0.85);
          font-variant-numeric: tabular-nums;
        }
        .cv2-logo { position: relative; width: min(230px, 58vw); overflow: hidden; margin-top: 2rem; }
        .cv2-logoart { display: block; }
        .cv2-logoart svg { display: block; width: 100%; height: auto; }
        .cv2-logoart .cv2-letter {
          opacity: 0;
          animation: cv2-letter-in 0.65s cubic-bezier(0.16,1,0.3,1) both;
        }
        .cv2-sweep {
          position: absolute;
          top: -10%;
          bottom: -10%;
          left: 0;
          width: 28%;
          background: linear-gradient(100deg, transparent, rgba(187,255,0,0.35) 45%, rgba(255,255,255,0.5) 50%, rgba(187,255,0,0.35) 55%, transparent);
          filter: blur(1px);
          transform: translateX(-130%) skewX(-8deg);
          animation: cv2-sweep 0.95s cubic-bezier(0.4,0,0.2,1) 760ms both;
          pointer-events: none;
        }
        .cv2-promise { margin-top: 1.5rem; }
        .cv2-promise p {
          font-family: 'Cairo', sans-serif;
          font-weight: 800;
          font-size: clamp(19px, 5vw, 24px);
          line-height: 1.7;
        }
        .cv2-promise .w { color: #fff; animation: cv2-fade-up 0.6s ease-out 980ms both; }
        .cv2-promise .l { color: #BBFF00; animation: cv2-fade-up 0.6s ease-out 1120ms both; }
        .cv2-replay {
          position: absolute;
          bottom: 1.5rem;
          inset-inline: 0;
          margin-inline: auto;
          width: fit-content;
          border: 1px solid rgba(255,255,255,0.25);
          background: transparent;
          color: rgba(255,255,255,0.75);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          padding: 0.7rem 1.4rem;
          cursor: pointer;
          min-height: 44px;
          z-index: 3;
        }
        .cv2-replay:hover { border-color: #BBFF00; color: #BBFF00; }
        .cv2-skip {
          position: absolute;
          bottom: 1.5rem;
          inset-inline-end: 1.5rem;
          min-height: 44px;
          padding: 0.7rem 1rem;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(10,10,10,0.45);
          color: rgba(255,255,255,0.7);
          font-family: 'Cairo', sans-serif;
          font-size: 13px;
          cursor: pointer;
          z-index: 3;
        }
        .cv2-skip:hover, .cv2-skip:focus-visible { border-color: #BBFF00; color: #BBFF00; outline: none; }
        @keyframes cv2-ping {
          from { transform: scale(0.6); opacity: 1; }
          to { transform: scale(2.1); opacity: 0; }
        }
        @keyframes cv2-letter-in {
          from { opacity: 0; transform: translateY(16px); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes cv2-sweep {
          from { transform: translateX(-130%) skewX(-8deg); opacity: 0; }
          15% { opacity: 1; }
          to { transform: translateX(480%) skewX(-8deg); opacity: 0; }
        }
        @keyframes cv2-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cv2-rise {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cv2-wipe {
          to { transform: translateY(-100%); }
        }
        @keyframes cv2-inner-up {
          to { transform: translateY(-60px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cv2-sweep { display: none; }
          .cv2.is-exited .cv2-splash, .cv2.is-exited .cv2-inner,
          .cv2.is-exited .cv2-hero .rise { animation: none !important; }
          .cv2.is-exited .cv2-splash { display: none; }
          .cv2.is-exited .cv2-hero .rise { opacity: 1; }
        }
      `}</style>

      {/* The preview keeps a mock hero; the live version reveals the real Home hero underneath. */}
      {preview && <div className="cv2-hero" aria-hidden={!exited}>
        <div className="cv2-hero-inner">
          <p className="cv2-hero-eyebrow rise d1" dir="ltr">CAIRO, EGYPT — CREATIVE PARTNER</p>
          <h1 className={`cv2-hero-title rise d2${isArabic ? " is-ar" : ""}`}>
            {isArabic ? (
              <>خلي مشروعك <em>يظهر</em><br />بالشكل اللي يستحقه.</>
            ) : (
              <>Make your business <em>show up</em><br />the way it deserves.</>
            )}
          </h1>
          <div className="cv2-hero-cta rise d3">
            <span className="solid">{isArabic ? "ابدأ مشروعك" : "Start a project"}</span>
            <span className="ghost">{isArabic ? "شوف أعمالنا" : "View our work"}</span>
          </div>
          <p className="cv2-hero-note rise d4" dir="ltr">PREVIEW — HANDOFF MOCK</p>
        </div>
      </div>}

      {/* splash overlay */}
      <div className="cv2-splash">
        {logoReady || reduceMotion ? (
        <div className="cv2-inner" key={replayKey}>
          <div className="cv2-route">
            <svg viewBox="0 0 320 8" dir="ltr" aria-hidden="true">
              <line x1="312" y1="4" x2="8" y2="4" className="cv2-route-track" />
              <line
                x1="312" y1="4" x2="8" y2="4"
                className="cv2-route-draw"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 - tip * 100}
              />
            </svg>
            <div className="cv2-route-nodes">
              {stopLabels.map((stop, i) => (
                <span key={stop} className={`cv2-node${i < litCount ? " is-lit" : ""}`}>
                  <span className="cv2-dot" />
                  <span className="cv2-label">{stop}</span>
                </span>
              ))}
            </div>
          </div>
          <p className="cv2-pct" dir="ltr">{phaseLabel}</p>
          <div className="cv2-logo" dir="ltr">
            {logoSvg ? (
              <span
                className="cv2-logoart"
                onAnimationEnd={handleLogoAnimationEnd}
                dangerouslySetInnerHTML={{ __html: logoSvg }}
              />
            ) : (
              <ZoomixLogo variant="dark" width={320} height={107} />
            )}
            <span className="cv2-sweep" aria-hidden="true" />
          </div>
          <div className="cv2-promise">
            <p className="w">{promise.first}</p>
            <p className="l">{promise.second}</p>
          </div>
        </div>
        ) : (
        <div className="cv2-inner">
          <div className="cv2-logo" dir="ltr">
            <ZoomixLogo variant="dark" width={320} height={107} />
          </div>
        </div>
        )}
      </div>

      {preview && <button type="button" className="cv2-replay" onClick={replay}>
        {isArabic ? "إعادة ⟳" : "Replay ⟳"}
      </button>}
      {isLive && <button type="button" className="cv2-skip" onClick={skip}>
        {isArabic ? "تخطّي" : "Skip"} <span aria-hidden="true">↗</span>
      </button>}
    </main>
  );
}
