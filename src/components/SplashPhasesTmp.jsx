import { useEffect, useState } from "react";
import ZoomixLogo from "./ZoomixLogo";

// TEMP PREVIEW ONLY — splash concept #3 ("the method as the loader"), not wired into the site yet.
const DURATION_MS = 3000;
const LETTER_BASE_MS = 850;
const LETTER_STAGGER_MS = 110;

const PHASES = [
  { n: "01", ar: "نبني الأساس", en: "BUILD" },
  { n: "02", ar: "نظهر المشروع", en: "SHOW" },
  { n: "03", ar: "نجهز الانطلاق", en: "LAUNCH" },
];

export default function SplashPhasesTmp() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [logoSvg, setLogoSvg] = useState("");
  const [reduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (reduceMotion) {
      setProgress(100);
      setDone(true);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION_MS);
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [replayKey, reduceMotion]);

  // Inline the official logo so its letter groups can stagger in.
  // Artwork is untouched — only opacity/transform/filter are animated.
  useEffect(() => {
    let cancelled = false;
    fetch("/zoomix-logo.svg", { cache: "force-cache" })
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return;
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
        Array.from(wordmark.children).forEach((child, i) => {
          child.setAttribute("class", `${child.getAttribute("class") || ""} splash3-letter`.trim());
          child.style.animationDelay = `${LETTER_BASE_MS + i * LETTER_STAGGER_MS}ms`;
        });
        setLogoSvg(new XMLSerializer().serializeToString(svg));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [replayKey]);

  const replay = () => {
    setLogoSvg("");
    setProgress(0);
    setDone(false);
    setReplayKey((k) => k + 1);
  };

  // Which phase is currently lit (0,1,2) — or all settled when done.
  const activePhase = done ? -1 : Math.min(2, Math.floor((progress / 100) * 3));

  return (
    <main className="splash3" dir="rtl">
      <style>{`
        .splash3 {
          min-height: 100dvh;
          background: #0A0A0A;
          color: #F5F4EF;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .splash3::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .splash3-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 440px;
          width: 100%;
        }
        .splash3-kicker {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.28em;
          color: rgba(245,244,239,0.55);
          animation: splash3-fadein 0.7s ease-out 200ms both;
        }
        .splash3-phases {
          margin-top: 1.5rem;
          width: min(320px, 74vw);
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .splash3-phase {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          border: 1px solid rgba(255,255,255,0.12);
          padding: 0.85rem 1rem;
          opacity: 0.38;
          transition: opacity 0.4s ease, border-color 0.4s ease, background-color 0.4s ease;
        }
        .splash3-phase .num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          color: rgba(245,244,239,0.6);
          font-variant-numeric: tabular-nums;
        }
        .splash3-phase .name {
          font-family: 'Cairo', sans-serif;
          font-weight: 800;
          font-size: 17px;
          line-height: 1.6;
          color: #fff;
        }
        .splash3-phase .en {
          margin-inline-start: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(245,244,239,0.45);
        }
        .splash3-phase.is-active {
          opacity: 1;
          border-color: #BBFF00;
          background: rgba(187,255,0,0.07);
          box-shadow: 0 0 24px rgba(187,255,0,0.12);
        }
        .splash3-phase.is-active .num { color: #BBFF00; }
        .splash3-phase.is-active .en { color: #BBFF00; }
        .splash3-phase.is-done { opacity: 0.85; border-color: rgba(255,255,255,0.2); }
        .splash3-phase.is-done .num { color: #BBFF00; }
        .splash3-meta {
          margin-top: 1.3rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(187,255,0,0.85);
          font-variant-numeric: tabular-nums;
          animation: splash3-fadein 0.6s ease-out 400ms both;
        }
        .splash3-logo {
          position: relative;
          width: min(200px, 52vw);
          overflow: hidden;
          margin-top: 1.75rem;
          opacity: 0;
          animation: splash3-fadein 0.4s ease-out 800ms both;
        }
        .splash3-logoart { display: block; }
        .splash3-logoart svg { display: block; width: 100%; height: auto; }
        .splash3-logoart .splash3-letter {
          opacity: 0;
          animation: splash3-letter-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .splash3-ready {
          margin-top: 1.2rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #fff;
          animation: splash3-fadein 0.5s ease-out both;
        }
        .splash3-replay {
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
        }
        .splash3-replay:hover { border-color: #BBFF00; color: #BBFF00; }
        @keyframes splash3-letter-in {
          from { opacity: 0; transform: translateY(14px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes splash3-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash3-kicker, .splash3-meta, .splash3-logo,
          .splash3-logoart .splash3-letter, .splash3-ready {
            animation-duration: 0.01ms !important; animation-delay: 0ms !important;
          }
          .splash3-phase { opacity: 1; transition: none; }
        }
      `}</style>
      <div className="splash3-inner" key={replayKey}>
        <p className="splash3-kicker" dir="ltr">HOW WE WORK</p>
        <div className="splash3-phases">
          {PHASES.map((phase, i) => (
            <div
              key={phase.n}
              className={`splash3-phase${i === activePhase ? " is-active" : ""}${done || i < activePhase ? " is-done" : ""}`}
            >
              <span className="num" dir="ltr">{phase.n}</span>
              <span className="name">{phase.ar}</span>
              <span className="en" dir="ltr">{phase.en}</span>
            </div>
          ))}
        </div>
        <p className="splash3-meta" dir="ltr">{String(progress).padStart(3, "0")}%</p>
        <div className="splash3-logo" dir="ltr">
          {logoSvg ? (
            <span
              className="splash3-logoart"
              dangerouslySetInnerHTML={{ __html: logoSvg }}
            />
          ) : (
            <ZoomixLogo variant="dark" width={320} height={107} />
          )}
        </div>
        {done && <p className="splash3-ready">READY ✓</p>}
      </div>
      <button type="button" className="splash3-replay" onClick={replay}>
        إعادة ⟳
      </button>
    </main>
  );
}
