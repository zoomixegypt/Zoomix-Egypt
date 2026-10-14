import{i as e,n as t,t as n}from"./jsx-runtime-bAis_ILe.js";import{p as r}from"./index-B-e9G8c4.js";var i=e(t(),1),a=n(),o=3e3,s=900,c=110,l=700,u=[{n:`01`,ar:`نبني الأساس`,en:`BUILD`,note:`بنجهز الهوية والاتجاه…`},{n:`02`,ar:`نظهر المشروع`,en:`SHOW`,note:`بنظهر المحتوى والتصوير…`},{n:`03`,ar:`نجهز الانطلاق`,en:`LAUNCH`,note:`بنجهز الانطلاق والحضور الرقمي…`}];function d(){let[e,t]=(0,i.useState)(0),[n,d]=(0,i.useState)(!1),[f,p]=(0,i.useState)(!1),[m,h]=(0,i.useState)(0),[g,_]=(0,i.useState)(``),[v]=(0,i.useState)(()=>typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches);(0,i.useEffect)(()=>{if(v){t(100),d(!0),p(!0);return}let e=0,n=0,r=performance.now(),i=a=>{let s=Math.min(1,(a-r)/o);t(Math.round((1-(1-s)**3)*100)),s<1?e=requestAnimationFrame(i):(d(!0),n=window.setTimeout(()=>p(!0),l))};return e=requestAnimationFrame(i),()=>{cancelAnimationFrame(e),window.clearTimeout(n)}},[m,v]),(0,i.useEffect)(()=>{let e=!1;return fetch(`/zoomix-logo.svg`,{cache:`force-cache`}).then(e=>e.text()).then(t=>{if(e)return;let n=new DOMParser().parseFromString(t,`image/svg+xml`).querySelector(`svg`);if(!n)return;n.removeAttribute(`width`),n.removeAttribute(`height`);let r=Array.from(n.querySelectorAll(`rect`)).find(e=>(e.getAttribute(`class`)||``).includes(`st1`)&&Number(e.getAttribute(`y`))>0),i=n;if(r){let e=r.parentElement;for(;e&&e.parentElement!==n;)e=e.parentElement;e&&(i=e)}Array.from(i.children).forEach((e,t)=>{e.setAttribute(`class`,`${e.getAttribute(`class`)||``} pv2-letter`.trim()),e.style.animationDelay=`${s+t*c}ms`}),_(new XMLSerializer().serializeToString(n))}).catch(()=>{}),()=>{e=!0}},[m]);let y=()=>{_(``),t(0),d(!1),p(!1),h(e=>e+1)},b=e/100,x=n?-1:Math.min(2,Math.floor(b*3)),S=n||b>=.67?3:b>=.34?2:+(b>=.03),C=n?u[2]:u[x],w=n?2:x;return(0,a.jsxs)(`main`,{className:f?`pv2 is-exited`:`pv2`,dir:`rtl`,children:[(0,a.jsx)(`style`,{children:`
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
      `}),(0,a.jsx)(`div`,{className:`pv2-hero`,"aria-hidden":!f,children:(0,a.jsxs)(`div`,{className:`pv2-hero-inner`,children:[(0,a.jsx)(`p`,{className:`pv2-hero-eyebrow rise d1`,dir:`ltr`,children:`CAIRO, EGYPT — CREATIVE PARTNER`}),(0,a.jsxs)(`h1`,{className:`pv2-hero-title rise d2`,children:[`خلي مشروعك `,(0,a.jsx)(`em`,{children:`يظهر`}),(0,a.jsx)(`br`,{}),`بالشكل اللي يستحقه.`]}),(0,a.jsxs)(`div`,{className:`pv2-hero-cta rise d3`,children:[(0,a.jsx)(`span`,{className:`solid`,children:`ابدأ مشروعك`}),(0,a.jsx)(`span`,{className:`ghost`,children:`شوف أعمالنا`})]}),(0,a.jsx)(`p`,{className:`pv2-hero-note rise d4`,dir:`ltr`,children:`PREVIEW — HANDOFF MOCK`})]})}),(0,a.jsx)(`div`,{className:`pv2-splash`,children:(0,a.jsxs)(`div`,{className:`pv2-inner`,children:[(0,a.jsx)(`p`,{className:`pv2-kicker`,dir:`ltr`,children:`HOW WE WORK`}),(0,a.jsx)(`p`,{className:`pv2-bignum flip`,dir:`ltr`,children:C.n},`n-${w}`),(0,a.jsxs)(`p`,{className:`pv2-phasename`,children:[C.ar,` `,(0,a.jsx)(`span`,{className:`en`,dir:`ltr`,children:C.en})]}),(0,a.jsxs)(`div`,{className:`pv2-route`,children:[(0,a.jsxs)(`svg`,{viewBox:`0 0 320 8`,dir:`ltr`,"aria-hidden":`true`,children:[(0,a.jsx)(`line`,{x1:`312`,y1:`4`,x2:`8`,y2:`4`,className:`pv2-route-track`}),(0,a.jsx)(`line`,{x1:`312`,y1:`4`,x2:`8`,y2:`4`,className:`pv2-route-draw`,pathLength:100,strokeDasharray:100,strokeDashoffset:100-b*100})]}),(0,a.jsx)(`div`,{className:`pv2-route-nodes`,children:u.map((e,t)=>(0,a.jsxs)(`span`,{className:`pv2-node${t<S?` is-lit`:``}`,children:[(0,a.jsx)(`span`,{className:`pv2-dot`}),(0,a.jsx)(`span`,{className:`pv2-nodelabel`,children:e.ar})]},e.n))})]}),(0,a.jsx)(`p`,{className:`pv2-note`,children:C.note},`note-${w}`),(0,a.jsxs)(`p`,{className:`pv2-meta`,dir:`ltr`,children:[String(e).padStart(3,`0`),`%`]}),(0,a.jsx)(`div`,{className:`pv2-logo`,dir:`ltr`,children:g?(0,a.jsx)(`span`,{className:`pv2-logoart`,dangerouslySetInnerHTML:{__html:g}}):(0,a.jsx)(r,{variant:`dark`,width:320,height:107})}),n&&(0,a.jsx)(`p`,{className:`pv2-ready`,children:`READY ✓`})]},m)}),(0,a.jsx)(`button`,{type:`button`,className:`pv2-replay`,onClick:y,children:`إعادة ⟳`})]})}export{d as default};