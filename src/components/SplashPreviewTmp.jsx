import { useEffect, useRef, useState } from "react";
import ZoomixLogo from "./ZoomixLogo";

// TEMP PREVIEW ONLY — splash/intro concept ("connection line" idea), not wired into the site yet.
const DURATION_MS = 2800;
const LETTER_BASE_MS = 550;
const LETTER_STAGGER_MS = 120;

const ROUTE_STOPS = ["الهوية", "المحتوى", "الحضور الرقمي"];

export default function SplashPreviewTmp() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [logoSvg, setLogoSvg] = useState("");
  const logoBoxRef = useRef(null);
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
        // Visible wordmark = the top-level group holding the lime stripe
        // that sits inside the viewBox (positive y).
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
          child.setAttribute("class", `${child.getAttribute("class") || ""} splash-letter`.trim());
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

  return (
    <main className="splash-tmp" dir="rtl">
      <style>{`
        .splash-tmp {
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
        .splash-tmp::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .splash-tmp-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 440px;
          width: 100%;
        }
        /* ——— Phase 1: connection line + stops ——— */
        .splash-route {
          position: relative;
          width: min(320px, 72vw);
          padding-top: 2px;
        }
        .splash-route-line {
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          height: 2px;
          background: #BBFF00;
          transform-origin: right center;
          animation: splash-route-draw 1.05s cubic-bezier(0.16,1,0.3,1) 300ms both;
        }
        .splash-route-nodes {
          position: relative;
          display: flex;
          justify-content: space-between;
        }
        .splash-route-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.65rem;
          opacity: 0;
          animation: splash-fade-up 0.5s ease-out both;
        }
        .splash-route-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #BBFF00;
          box-shadow: 0 0 0 5px #0A0A0A, 0 0 16px rgba(187,255,0,0.8);
        }
        .splash-route-label {
          font-family: 'Cairo', sans-serif;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          color: rgba(245,244,239,0.75);
        }
        .splash-tmp-pct {
          margin-top: 1.1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(187,255,0,0.85);
          font-variant-numeric: tabular-nums;
        }
        /* ——— Phase 2: logo assembles ——— */
        .splash-tmp-logo {
          position: relative;
          width: min(240px, 60vw);
          overflow: hidden;
          margin-top: 2.25rem;
        }
        .splash-tmp-logoart { display: block; }
        .splash-tmp-logoart svg { display: block; width: 100%; height: auto; }
        .splash-tmp-logoart .splash-letter {
          opacity: 0;
          animation: splash-letter-in 0.65s cubic-bezier(0.16,1,0.3,1) both;
        }
        .splash-tmp-sweep {
          position: absolute;
          top: -10%;
          bottom: -10%;
          left: 0;
          width: 28%;
          background: linear-gradient(100deg, transparent, rgba(187,255,0,0.35) 45%, rgba(255,255,255,0.5) 50%, rgba(187,255,0,0.35) 55%, transparent);
          filter: blur(1px);
          transform: translateX(-130%) skewX(-8deg);
          animation: splash-sweep 1.1s cubic-bezier(0.4,0,0.2,1) 1150ms both;
          pointer-events: none;
        }
        /* ——— Phase 3: brand promise ——— */
        .splash-promise-1 {
          margin-top: 1.75rem;
          font-family: 'Cairo', sans-serif;
          font-weight: 800;
          font-size: clamp(20px, 5.4vw, 26px);
          line-height: 1.7;
          color: #fff;
          animation: splash-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 2050ms both;
        }
        .splash-promise-2 {
          margin-top: 0.15rem;
          font-family: 'Cairo', sans-serif;
          font-weight: 800;
          font-size: clamp(20px, 5.4vw, 26px);
          line-height: 1.7;
          color: #BBFF00;
          animation: splash-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 2250ms both;
        }
        .splash-tmp-ready {
          margin-top: 1.4rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #fff;
          animation: splash-fade-up 0.5s ease-out both;
        }
        .splash-tmp-replay {
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
        .splash-tmp-replay:hover { border-color: #BBFF00; color: #BBFF00; }
        @keyframes splash-route-draw {
          from { transform: scaleX(0); opacity: 0; }
          10% { opacity: 1; }
          to { transform: scaleX(1); opacity: 1; }
        }
        @keyframes splash-letter-in {
          from { opacity: 0; transform: translateY(16px); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes splash-sweep {
          from { transform: translateX(-130%) skewX(-8deg); opacity: 0; }
          15% { opacity: 1; }
          to { transform: translateX(480%) skewX(-8deg); opacity: 0; }
        }
        @keyframes splash-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-route-line, .splash-route-node, .splash-tmp-logoart .splash-letter,
          .splash-tmp-sweep, .splash-promise-1, .splash-promise-2, .splash-tmp-ready {
            animation-duration: 0.01ms !important; animation-delay: 0ms !important;
          }
        }
      `}</style>
      <div className="splash-tmp-inner" key={replayKey}>
        <div className="splash-route" aria-hidden="true">
          <div className="splash-route-line" />
          <div className="splash-route-nodes">
            {ROUTE_STOPS.map((stop, i) => (
              <span
                key={stop}
                className="splash-route-node"
                style={{ animationDelay: `${500 + i * 330}ms` }}
              >
                <span className="splash-route-dot" />
                <span className="splash-route-label">{stop}</span>
              </span>
            ))}
          </div>
        </div>
        <p className="splash-tmp-pct" dir="ltr">{String(progress).padStart(3, "0")}%</p>
        <div className="splash-tmp-logo" ref={logoBoxRef} dir="ltr">
          {logoSvg ? (
            <span
              className="splash-tmp-logoart"
              dangerouslySetInnerHTML={{ __html: logoSvg }}
            />
          ) : (
            <ZoomixLogo variant="dark" width={320} height={107} />
          )}
          <span className="splash-tmp-sweep" aria-hidden="true" />
        </div>
        <p className="splash-promise-1">ركز في مشروعك.</p>
        <p className="splash-promise-2">Zoomix ترتب الصورة.</p>
        {done && <p className="splash-tmp-ready">READY ✓</p>}
      </div>
      <button type="button" className="splash-tmp-replay" onClick={replay}>
        إعادة ⟳
      </button>
    </main>
  );
}
