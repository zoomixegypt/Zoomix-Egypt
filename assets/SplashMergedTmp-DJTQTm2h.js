import{i as e,n as t,t as n}from"./jsx-runtime-bAis_ILe.js";import{p as r}from"./index-CV78h9kU.js";var i=e(t(),1),a=n(),o=3400,s=1e3,c=110,l=700,u=[{n:`01`,ar:`نبني الأساس`,en:`BUILD`,note:`بنجهز الهوية والاتجاه…`},{n:`02`,ar:`نظهر المشروع`,en:`SHOW`,note:`بنظهر المحتوى والتصوير…`},{n:`03`,ar:`نجهز الانطلاق`,en:`LAUNCH`,note:`بنجهز الانطلاق والحضور الرقمي…`}];function d(){let[e,t]=(0,i.useState)(0),[n,d]=(0,i.useState)(!1),[f,p]=(0,i.useState)(!1),[m,h]=(0,i.useState)(0),[g,_]=(0,i.useState)(``),[v]=(0,i.useState)(()=>typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches);(0,i.useEffect)(()=>{if(v){t(100),d(!0),p(!0);return}let e=0,n=0,r=performance.now(),i=a=>{let s=Math.min(1,(a-r)/o);t(Math.round((1-(1-s)**3)*100)),s<1?e=requestAnimationFrame(i):(d(!0),n=window.setTimeout(()=>p(!0),l))};return e=requestAnimationFrame(i),()=>{cancelAnimationFrame(e),window.clearTimeout(n)}},[m,v]),(0,i.useEffect)(()=>{let e=!1;return fetch(`/zoomix-logo.svg`,{cache:`force-cache`}).then(e=>e.text()).then(t=>{if(e)return;let n=new DOMParser().parseFromString(t,`image/svg+xml`).querySelector(`svg`);if(!n)return;n.removeAttribute(`width`),n.removeAttribute(`height`);let r=Array.from(n.querySelectorAll(`rect`)).find(e=>(e.getAttribute(`class`)||``).includes(`st1`)&&Number(e.getAttribute(`y`))>0),i=n;if(r){let e=r.parentElement;for(;e&&e.parentElement!==n;)e=e.parentElement;e&&(i=e)}Array.from(i.children).forEach((e,t)=>{e.setAttribute(`class`,`${e.getAttribute(`class`)||``} mg-letter`.trim()),e.style.animationDelay=`${s+t*c}ms`}),_(new XMLSerializer().serializeToString(n))}).catch(()=>{}),()=>{e=!0}},[m]);let y=()=>{_(``),t(0),d(!1),p(!1),h(e=>e+1)},b=e/100,x=n?-1:Math.min(2,Math.floor(b*3)),S=n||b>=.67?3:b>=.34?2:+(b>=.03),C=n?u[2]:u[x],w=n?2:x;return(0,a.jsxs)(`main`,{className:f?`mg is-exited`:`mg`,dir:`rtl`,children:[(0,a.jsx)(`style`,{children:`
        .mg {
          min-height: 100dvh;
          background: #0A0A0A;
          color: #F5F4EF;
          position: relative;
          overflow: hidden;
        }
        /* ——— hero mock underneath ——— */
        .mg-hero {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #0A0A0A;
        }
        .mg-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .mg-hero-inner { position: relative; text-align: center; max-width: 620px; }
        .mg-hero-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.28em;
          color: #BBFF00;
        }
        .mg-hero-title {
          margin-top: 1rem;
          font-family: 'Cairo', sans-serif;
          font-weight: 900;
          font-size: clamp(30px, 7vw, 56px);
          line-height: 1.5;
          color: #fff;
        }
        .mg-hero-title em { font-style: normal; color: #BBFF00; }
        .mg-hero-cta { margin-top: 1.75rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .mg-hero-cta .solid { background: #BBFF00; color: #0A0A0A; font-weight: 800; padding: 0.9rem 1.8rem; }
        .mg-hero-cta .ghost { border: 1px solid rgba(255,255,255,0.3); color: #fff; font-weight: 700; padding: 0.9rem 1.8rem; }
        .mg-hero-note {
          margin-top: 1.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.4);
        }
        .mg-hero .rise { opacity: 0; }
        .mg.is-exited .mg-hero .rise { animation: mg-rise 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .mg.is-exited .mg-hero .rise.d1 { animation-delay: 0.05s; }
        .mg.is-exited .mg-hero .rise.d2 { animation-delay: 0.15s; }
        .mg.is-exited .mg-hero .rise.d3 { animation-delay: 0.28s; }
        .mg.is-exited .mg-hero .rise.d4 { animation-delay: 0.42s; }
        /* ——— splash overlay ——— */
        .mg-splash {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .mg-splash::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          pointer-events: none;
        }
        .mg.is-exited .mg-splash {
          animation: mg-wipe 0.9s cubic-bezier(0.7,0,0.3,1) both;
          pointer-events: none;
        }
        .mg-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 440px;
          width: 100%;
        }
        .mg.is-exited .mg-inner { animation: mg-inner-up 0.9s cubic-bezier(0.7,0,0.3,1) both; }
        .mg-kicker {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.26em;
          color: rgba(245,244,239,0.55);
        }
        .mg-bignum {
          margin-top: 0.4rem;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: clamp(44px, 11vw, 72px);
          line-height: 1;
          color: #BBFF00;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 30px rgba(187,255,0,0.35);
        }
        .mg-bignum.flip { animation: mg-flip 0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .mg-route { position: relative; width: min(300px, 70vw); margin-top: 1rem; }
        .mg-route svg { display: block; width: 100%; height: auto; overflow: visible; }
        .mg-route-track { stroke: rgba(255,255,255,0.14); stroke-width: 2; }
        .mg-route-draw { stroke: #BBFF00; stroke-width: 2; }
        .mg-route-nodes { position: relative; display: flex; justify-content: space-between; margin-top: -9px; }
        .mg-node { display: flex; flex-direction: column; align-items: center; gap: 0.55rem; width: 33.333%; }
        .mg-dot {
          width: 10px; height: 10px; border-radius: 999px;
          background: rgba(255,255,255,0.18);
          transition: background-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }
        .mg-node.is-lit .mg-dot {
          background: #BBFF00;
          box-shadow: 0 0 0 5px #0A0A0A, 0 0 16px rgba(187,255,0,0.8);
        }
        .mg-node.is-lit .mg-dot::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 999px;
          border: 1px solid #BBFF00;
          animation: mg-ping 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .mg-nodelabel {
          font-family: 'Cairo', sans-serif;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          color: rgba(245,244,239,0.35);
          transition: color 0.25s ease;
        }
        .mg-node.is-lit .mg-nodelabel { color: rgba(245,244,239,0.85); }
        .mg-note {
          margin-top: 0.9rem;
          font-family: 'Cairo', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: rgba(245,244,239,0.6);
          min-height: 1.7em;
        }
        .mg-meta {
          margin-top: 0.4rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: rgba(187,255,0,0.85);
          font-variant-numeric: tabular-nums;
        }
        .mg-logo {
          position: relative;
          width: min(180px, 48vw);
          overflow: hidden;
          margin-top: 1.25rem;
          opacity: 0;
          animation: mg-fadein 0.4s ease-out 950ms both;
        }
        .mg-logoart { display: block; }
        .mg-logoart svg { display: block; width: 100%; height: auto; }
        .mg-logoart .mg-letter {
          opacity: 0;
          animation: mg-letter-in 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .mg-promise { margin-top: 1.1rem; }
        .mg-promise p {
          font-family: 'Cairo', sans-serif;
          font-weight: 800;
          font-size: clamp(18px, 4.8vw, 23px);
          line-height: 1.7;
        }
        .mg-promise .w { color: #fff; animation: mg-fade-up 0.6s ease-out 2350ms both; }
        .mg-promise .l { color: #BBFF00; animation: mg-fade-up 0.6s ease-out 2520ms both; }
        .mg-ready {
          margin-top: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          color: #fff;
          animation: mg-fadein 0.5s ease-out both;
        }
        .mg-replay {
          position: absolute;
          bottom: 1.25rem;
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
        .mg-replay:hover { border-color: #BBFF00; color: #BBFF00; }
        @keyframes mg-flip {
          from { opacity: 0; transform: translateY(18px) scale(0.94); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes mg-ping {
          from { transform: scale(0.6); opacity: 1; }
          to { transform: scale(2.1); opacity: 0; }
        }
        @keyframes mg-letter-in {
          from { opacity: 0; transform: translateY(14px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes mg-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mg-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mg-rise {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mg-wipe {
          to { transform: translateY(-100%); }
        }
        @keyframes mg-inner-up {
          to { transform: translateY(-60px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mg.is-exited .mg-splash, .mg.is-exited .mg-inner,
          .mg.is-exited .mg-hero .rise { animation: none !important; }
          .mg.is-exited .mg-splash { display: none; }
          .mg.is-exited .mg-hero .rise { opacity: 1; }
          .mg-bignum.flip, .mg-logoart .mg-letter,
          .mg-node.is-lit .mg-dot::after { animation: none !important; }
          .mg-logoart .mg-letter { opacity: 1; }
        }
      `}),(0,a.jsx)(`div`,{className:`mg-hero`,"aria-hidden":!f,children:(0,a.jsxs)(`div`,{className:`mg-hero-inner`,children:[(0,a.jsx)(`p`,{className:`mg-hero-eyebrow rise d1`,dir:`ltr`,children:`CAIRO, EGYPT — CREATIVE PARTNER`}),(0,a.jsxs)(`h1`,{className:`mg-hero-title rise d2`,children:[`خلي مشروعك `,(0,a.jsx)(`em`,{children:`يظهر`}),(0,a.jsx)(`br`,{}),`بالشكل اللي يستحقه.`]}),(0,a.jsxs)(`div`,{className:`mg-hero-cta rise d3`,children:[(0,a.jsx)(`span`,{className:`solid`,children:`ابدأ مشروعك`}),(0,a.jsx)(`span`,{className:`ghost`,children:`شوف أعمالنا`})]}),(0,a.jsx)(`p`,{className:`mg-hero-note rise d4`,dir:`ltr`,children:`PREVIEW — HANDOFF MOCK`})]})}),(0,a.jsx)(`div`,{className:`mg-splash`,children:(0,a.jsxs)(`div`,{className:`mg-inner`,children:[(0,a.jsx)(`p`,{className:`mg-kicker`,dir:`ltr`,children:`ZOOMIX — ONE CLEAR DIRECTION`}),(0,a.jsx)(`p`,{className:`mg-bignum flip`,dir:`ltr`,children:C.n},`n-${w}`),(0,a.jsxs)(`div`,{className:`mg-route`,children:[(0,a.jsxs)(`svg`,{viewBox:`0 0 320 8`,dir:`ltr`,"aria-hidden":`true`,children:[(0,a.jsx)(`line`,{x1:`312`,y1:`4`,x2:`8`,y2:`4`,className:`mg-route-track`}),(0,a.jsx)(`line`,{x1:`312`,y1:`4`,x2:`8`,y2:`4`,className:`mg-route-draw`,pathLength:100,strokeDasharray:100,strokeDashoffset:100-b*100})]}),(0,a.jsx)(`div`,{className:`mg-route-nodes`,children:u.map((e,t)=>(0,a.jsxs)(`span`,{className:`mg-node${t<S?` is-lit`:``}`,children:[(0,a.jsx)(`span`,{className:`mg-dot`}),(0,a.jsx)(`span`,{className:`mg-nodelabel`,children:e.ar})]},e.n))})]}),(0,a.jsx)(`p`,{className:`mg-note`,children:C.note},`note-${w}`),(0,a.jsxs)(`p`,{className:`mg-meta`,dir:`ltr`,children:[String(e).padStart(3,`0`),`%`]}),(0,a.jsx)(`div`,{className:`mg-logo`,dir:`ltr`,children:g?(0,a.jsx)(`span`,{className:`mg-logoart`,dangerouslySetInnerHTML:{__html:g}}):(0,a.jsx)(r,{variant:`dark`,width:320,height:107})}),(0,a.jsxs)(`div`,{className:`mg-promise`,children:[(0,a.jsx)(`p`,{className:`w`,children:`ركز في مشروعك.`}),(0,a.jsx)(`p`,{className:`l`,children:`Zoomix ترتب الصورة.`})]}),n&&(0,a.jsx)(`p`,{className:`mg-ready`,children:`READY ✓`})]},m)}),(0,a.jsx)(`button`,{type:`button`,className:`mg-replay`,onClick:y,children:`إعادة ⟳`})]})}export{d as default};