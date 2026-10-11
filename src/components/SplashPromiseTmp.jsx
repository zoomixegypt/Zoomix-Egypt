import { useEffect, useState } from "react";
import ZoomixLogo from "./ZoomixLogo";

// TEMP PREVIEW ONLY — splash concept #2 ("the promise"), not wired into the site yet.
const DURATION_MS = 3000;
const LETTER_BASE_MS = 850;
const LETTER_STAGGER_MS = 110;

export default function SplashPromiseTmp() {
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
          child.setAttribute("class", `${child.getAttribute("class") || ""} splash2-letter`.trim());
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
    <main className="splash2" dir="rtl">
      <style>{`
        .splash2 {
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
        .splash2::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .splash2-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 560px;
          width: 100%;
        }
        /* ——— Beat 1: focus on your business ——— */
        .splash2-line1 {
          font-family: 'Cairo', sans-serif;
          font-weight: 900;
          font-size: clamp(34px, 9vw, 64px);
          line-height: 1.5;
          color: #fff;
          animation: splash2-rise 0.9s cubic-bezier(0.16,1,0.3,1) 350ms both;
        }
        .splash2-rule {
          margin-top: 1.4rem;
          height: 2px;
          width: min(220px, 55vw);
          background: #BBFF00;
          animation: splash2-draw 0.8s cubic-bezier(0.16,1,0.3,1) 1000ms both;
        }
        /* ——— Beat 2: Zoomix organizes the picture ——— */
        .splash2-line2 {
          margin-top: 1.4rem;
          font-family: 'Cairo', sans-serif;
          font-weight: 900;
          font-size: clamp(34px, 9vw, 64px);
          line-height: 1.5;
          color: #BBFF00;
          animation: splash2-rise 0.9s cubic-bezier(0.16,1,0.3,1) 1500ms both;
        }
        .splash2-line2 .lat {
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: -0.01em;
        }
        /* ——— Beat 3: logo assembles ——— */
        .splash2-logo {
          position: relative;
          width: min(190px, 48vw);
          overflow: hidden;
          margin-top: 2rem;
          opacity: 0;
          animation: splash2-fadein 0.4s ease-out 800ms both;
        }
        .splash2-logoart { display: block; }
        .splash2-logoart svg { display: block; width: 100%; height: auto; }
        .splash2-logoart .splash2-letter {
          opacity: 0;
          animation: splash2-letter-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .splash2-meta {
          margin-top: 1.6rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(187,255,0,0.85);
          font-variant-numeric: tabular-nums;
          animation: splash2-fadein 0.6s ease-out 1900ms both;
        }
        .splash2-ready {
          margin-top: 1.1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #fff;
          animation: splash2-fadein 0.5s ease-out both;
        }
        .splash2-replay {
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
        .splash2-replay:hover { border-color: #BBFF00; color: #BBFF00; }
        @keyframes splash2-rise {
          from { opacity: 0; transform: translateY(26px); filter: blur(7px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes splash2-draw {
          from { transform: scaleX(0); opacity: 0; }
          10% { opacity: 1; }
          to { transform: scaleX(1); opacity: 1; }
        }
        @keyframes splash2-letter-in {
          from { opacity: 0; transform: translateY(14px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes splash2-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .splash2-line1, .splash2-rule, .splash2-line2, .splash2-logo,
          .splash2-logoart .splash2-letter, .splash2-meta, .splash2-ready {
            animation-duration: 0.01ms !important; animation-delay: 0ms !important;
          }
        }
      `}</style>
      <div className="splash2-inner" key={replayKey}>
        <p className="splash2-line1">ركز في مشروعك.</p>
        <div className="splash2-rule" aria-hidden="true" />
        <p className="splash2-line2">
          <span className="lat" dir="ltr">Zoomix</span> ترتب الصورة.
        </p>
        <div className="splash2-logo" dir="ltr">
          {logoSvg ? (
            <span
              className="splash2-logoart"
              dangerouslySetInnerHTML={{ __html: logoSvg }}
            />
          ) : (
            <ZoomixLogo variant="dark" width={320} height={107} />
          )}
        </div>
        <p className="splash2-meta" dir="ltr">{String(progress).padStart(3, "0")}%</p>
        {done && <p className="splash2-ready">READY ✓</p>}
      </div>
      <button type="button" className="splash2-replay" onClick={replay}>
        إعادة ⟳
      </button>
    </main>
  );
}
