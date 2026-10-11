import { useEffect, useState } from "react";
import ZoomixLogo from "./ZoomixLogo";

// TEMP PREVIEW ONLY — splash idea #3 v2 (phases on one connection line), not wired into the site yet.
// Upgrades vs v1: single continuous stroke-drawn line, phases as nodes on it,
// big kinetic number flipping per phase, microcopy locked to the same progress value,
// staged exit with curtain wipe into a hero mock.
const DURATION_MS = 3000;
const LETTER_BASE_MS = 900;
const LETTER_STAGGER_MS = 110;
const EXIT_HOLD_MS = 700;

const PHASES = [
  { n: "01", ar: "نبني الأساس", en: "BUILD", note: "بنجهز الهوية والاتجاه…" },
  { n: "02", ar: "نظهر المشروع", en: "SHOW", note: "بنظهر المحتوى والتصوير…" },
  { n: "03", ar: "نجهز الانطلاق", en: "LAUNCH", note: "بنجهز الانطلاق والحضور الرقمي…" },
];

export default function SplashPhasesV2Tmp() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [exited, setExited] = useState(false);
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
      setExited(true);
      return;
    }
    let raf = 0;
    let exitTimer = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION_MS);
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        exitTimer = window.setTimeout(() => setExited(true), EXIT_HOLD_MS);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
    };
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
          child.setAttribute("class", `${child.getAttribute("class") || ""} pv2-letter`.trim());
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
    setExited(false);
    setReplayKey((k) => k + 1);
  };

  // Single shared progress value drives EVERYTHING in lockstep:
  // line tip, lit nodes, big number, microcopy, percentage.
  const tip = progress / 100;
  const activePhase = done ? -1 : Math.min(2, Math.floor(tip * 3));
  const litCount = done ? 3 : tip >= 0.67 ? 3 : tip >= 0.34 ? 2 : tip >= 0.03 ? 1 : 0;
  const shownPhase = done ? PHASES[2] : PHASES[activePhase];
  const shownIndex = done ? 2 : activePhase;

  return (
    <main className={exited ? "pv2 is-exited" : "pv2"} dir="rtl">
      <style>{`
        .pv2 {
          min-height: 100dvh;
          background: #0A0A0A;
          color: #F5F4EF;
          position: relative;
          overflow: hidden;
        }
        /* ——— hero mock underneath ——— */
        .pv2-hero {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #0A0A0A;
        }
        .pv2-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .pv2-hero-inner { position: relative; text-align: center; max-width: 620px; }
        .pv2-hero-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.28em;
          color: #BBFF00;
        }
        .pv2-hero-title {
          margin-top: 1rem;
          font-family: 'Cairo', sans-serif;
          font-weight: 900;
          font-size: clamp(30px, 7vw, 56px);
          line-height: 1.5;
          color: #fff;
        }
        .pv2-hero-title em { font-style: normal; color: #BBFF00; }
        .pv2-hero-cta { margin-top: 1.75rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .pv2-hero-cta .solid { background: #BBFF00; color: #0A0A0A; font-weight: 800; padding: 0.9rem 1.8rem; }
        .pv2-hero-cta .ghost { border: 1px solid rgba(255,255,255,0.3); color: #fff; font-weight: 700; padding: 0.9rem 1.8rem; }
        .pv2-hero-note {
          margin-top: 1.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.4);
        }
        .pv2-hero .rise { opacity: 0; }
        .pv2.is-exited .pv2-hero .rise { animation: pv2-rise 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .pv2.is-exited .pv2-hero .rise.d1 { animation-delay: 0.05s; }
        .pv2.is-exited .pv2-hero .rise.d2 { animation-delay: 0.15s; }
        .pv2.is-exited .pv2-hero .rise.d3 { animation-delay: 0.28s; }
        .pv2.is-exited .pv2-hero .rise.d4 { animation-delay: 0.42s; }
        /* ——— splash overlay ——— */
        .pv2-splash {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .pv2-splash::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .pv2.is-exited .pv2-splash {
          animation: pv2-wipe 0.9s cubic-bezier(0.7,0,0.3,1) both;
          pointer-events: none;
        }
        .pv2-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 440px;
          width: 100%;
        }
        .pv2.is-exited .pv2-inner { animation: pv2-inner-up 0.9s cubic-bezier(0.7,0,0.3,1) both; }
        .pv2-kicker {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.28em;
          color: rgba(245,244,239,0.55);
        }
        /* big kinetic number */
        .pv2-bignum {
          margin-top: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: clamp(56px, 15vw, 96px);
          line-height: 1;
          color: #BBFF00;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 34px rgba(187,255,0,0.35);
        }
        .pv2-bignum.flip { animation: pv2-flip 0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .pv2-phasename {
          margin-top: 0.5rem;
          font-family: 'Cairo', sans-serif;
          font-weight: 800;
          font-size: clamp(20px, 5.4vw, 28px);
          line-height: 1.7;
          color: #fff;
          min-height: 2.2em;
        }
        .pv2-phasename .en {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(245,244,239,0.5);
        }
        /* one continuous line with the phases as nodes on it */
        .pv2-route { position: relative; width: min(320px, 72vw); margin-top: 1.4rem; }
        .pv2-route svg { display: block; width: 100%; height: auto; overflow: visible; }
        .pv2-route-track { stroke: rgba(255,255,255,0.14); stroke-width: 2; }
        .pv2-route-draw { stroke: #BBFF00; stroke-width: 2; }
        .pv2-route-nodes { position: relative; display: flex; justify-content: space-between; margin-top: -9px; }
        .pv2-node { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; width: 33.333%; }
        .pv2-dot {
          width: 10px; height: 10px; border-radius: 999px;
          background: rgba(255,255,255,0.18);
          transition: background-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }
        .pv2-node.is-lit .pv2-dot {
          background: #BBFF00;
          box-shadow: 0 0 0 5px #0A0A0A, 0 0 16px rgba(187,255,0,0.8);
        }
        .pv2-node.is-lit .pv2-dot::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 999px;
          border: 1px solid #BBFF00;
          animation: pv2-ping 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .pv2-nodelabel {
          font-family: 'Cairo', sans-serif;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          color: rgba(245,244,239,0.35);
          transition: color 0.25s ease;
        }
        .pv2-node.is-lit .pv2-nodelabel { color: rgba(245,244,239,0.85); }
        /* microcopy locked to the same progress value */
        .pv2-note {
          margin-top: 1.1rem;
          font-family: 'Cairo', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: rgba(245,244,239,0.6);
          min-height: 1.8em;
        }
        .pv2-meta {
          margin-top: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(187,255,0,0.85);
          font-variant-numeric: tabular-nums;
        }
        .pv2-logo {
          position: relative;
          width: min(200px, 52vw);
          overflow: hidden;
          margin-top: 1.5rem;
          opacity: 0;
          animation: pv2-fadein 0.4s ease-out 850ms both;
        }
        .pv2-logoart { display: block; }
        .pv2-logoart svg { display: block; width: 100%; height: auto; }
        .pv2-logoart .pv2-letter {
          opacity: 0;
          animation: pv2-letter-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .pv2-ready {
          margin-top: 1.1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #fff;
          animation: pv2-fadein 0.5s ease-out both;
        }
        .pv2-replay {
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
        .pv2-replay:hover { border-color: #BBFF00; color: #BBFF00; }
        @keyframes pv2-flip {
          from { opacity: 0; transform: translateY(18px) scale(0.94); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes pv2-ping {
          from { transform: scale(0.6); opacity: 1; }
          to { transform: scale(2.1); opacity: 0; }
        }
        @keyframes pv2-letter-in {
          from { opacity: 0; transform: translateY(14px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes pv2-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pv2-rise {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pv2-wipe {
          to { transform: translateY(-100%); }
        }
        @keyframes pv2-inner-up {
          to { transform: translateY(-60px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pv2.is-exited .pv2-splash, .pv2.is-exited .pv2-inner,
          .pv2.is-exited .pv2-hero .rise { animation: none !important; }
          .pv2.is-exited .pv2-splash { display: none; }
          .pv2.is-exited .pv2-hero .rise { opacity: 1; }
          .pv2-bignum.flip, .pv2-logoart .pv2-letter,
          .pv2-node.is-lit .pv2-dot::after { animation: none !important; }
          .pv2-logoart .pv2-letter { opacity: 1; }
        }
      `}</style>

      {/* hero mock underneath */}
      <div className="pv2-hero" aria-hidden={!exited}>
        <div className="pv2-hero-inner">
          <p className="pv2-hero-eyebrow rise d1" dir="ltr">CAIRO, EGYPT — CREATIVE PARTNER</p>
          <h1 className="pv2-hero-title rise d2">
            خلي مشروعك <em>يظهر</em>
            <br />
            بالشكل اللي يستحقه.
          </h1>
          <div className="pv2-hero-cta rise d3">
            <span className="solid">ابدأ مشروعك</span>
            <span className="ghost">شوف أعمالنا</span>
          </div>
          <p className="pv2-hero-note rise d4" dir="ltr">PREVIEW — HANDOFF MOCK</p>
        </div>
      </div>

      {/* splash overlay */}
      <div className="pv2-splash">
        <div className="pv2-inner" key={replayKey}>
          <p className="pv2-kicker" dir="ltr">HOW WE WORK</p>
          <p className="pv2-bignum flip" dir="ltr" key={`n-${shownIndex}`}>{shownPhase.n}</p>
          <p className="pv2-phasename">
            {shownPhase.ar}{" "}
            <span className="en" dir="ltr">{shownPhase.en}</span>
          </p>
          <div className="pv2-route">
            <svg viewBox="0 0 320 8" dir="ltr" aria-hidden="true">
              <line x1="312" y1="4" x2="8" y2="4" className="pv2-route-track" />
              <line
                x1="312" y1="4" x2="8" y2="4"
                className="pv2-route-draw"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 - tip * 100}
              />
            </svg>
            <div className="pv2-route-nodes">
              {PHASES.map((phase, i) => (
                <span key={phase.n} className={`pv2-node${i < litCount ? " is-lit" : ""}`}>
                  <span className="pv2-dot" />
                  <span className="pv2-nodelabel">{phase.ar}</span>
                </span>
              ))}
            </div>
          </div>
          <p className="pv2-note" key={`note-${shownIndex}`}>{shownPhase.note}</p>
          <p className="pv2-meta" dir="ltr">{String(progress).padStart(3, "0")}%</p>
          <div className="pv2-logo" dir="ltr">
            {logoSvg ? (
              <span
                className="pv2-logoart"
                dangerouslySetInnerHTML={{ __html: logoSvg }}
              />
            ) : (
              <ZoomixLogo variant="dark" width={320} height={107} />
            )}
          </div>
          {done && <p className="pv2-ready">READY ✓</p>}
        </div>
      </div>

      <button type="button" className="pv2-replay" onClick={replay}>
        إعادة ⟳
      </button>
    </main>
  );
}
