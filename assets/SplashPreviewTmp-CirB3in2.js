import{i as e,n as t,t as n}from"./jsx-runtime-bAis_ILe.js";import{p as r}from"./index-B-e9G8c4.js";var i=e(t(),1),a=n(),o=2800,s=550,c=120,l=[`الهوية`,`المحتوى`,`الحضور الرقمي`];function u(){let[e,t]=(0,i.useState)(0),[n,u]=(0,i.useState)(!1),[d,f]=(0,i.useState)(0),[p,m]=(0,i.useState)(``),h=(0,i.useRef)(null),[g]=(0,i.useState)(()=>typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches);return(0,i.useEffect)(()=>{if(g){t(100),u(!0);return}let e=0,n=performance.now(),r=i=>{let a=Math.min(1,(i-n)/o);t(Math.round((1-(1-a)**3)*100)),a<1?e=requestAnimationFrame(r):u(!0)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[d,g]),(0,i.useEffect)(()=>{let e=!1;return fetch(`/zoomix-logo.svg`,{cache:`force-cache`}).then(e=>e.text()).then(t=>{if(e)return;let n=new DOMParser().parseFromString(t,`image/svg+xml`).querySelector(`svg`);if(!n)return;n.removeAttribute(`width`),n.removeAttribute(`height`);let r=Array.from(n.querySelectorAll(`rect`)).find(e=>(e.getAttribute(`class`)||``).includes(`st1`)&&Number(e.getAttribute(`y`))>0),i=n;if(r){let e=r.parentElement;for(;e&&e.parentElement!==n;)e=e.parentElement;e&&(i=e)}Array.from(i.children).forEach((e,t)=>{e.setAttribute(`class`,`${e.getAttribute(`class`)||``} splash-letter`.trim()),e.style.animationDelay=`${s+t*c}ms`}),m(new XMLSerializer().serializeToString(n))}).catch(()=>{}),()=>{e=!0}},[d]),(0,a.jsxs)(`main`,{className:`splash-tmp`,dir:`rtl`,children:[(0,a.jsx)(`style`,{children:`
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
      `}),(0,a.jsxs)(`div`,{className:`splash-tmp-inner`,children:[(0,a.jsxs)(`div`,{className:`splash-route`,"aria-hidden":`true`,children:[(0,a.jsx)(`div`,{className:`splash-route-line`}),(0,a.jsx)(`div`,{className:`splash-route-nodes`,children:l.map((e,t)=>(0,a.jsxs)(`span`,{className:`splash-route-node`,style:{animationDelay:`${500+t*330}ms`},children:[(0,a.jsx)(`span`,{className:`splash-route-dot`}),(0,a.jsx)(`span`,{className:`splash-route-label`,children:e})]},e))})]}),(0,a.jsxs)(`p`,{className:`splash-tmp-pct`,dir:`ltr`,children:[String(e).padStart(3,`0`),`%`]}),(0,a.jsxs)(`div`,{className:`splash-tmp-logo`,ref:h,dir:`ltr`,children:[p?(0,a.jsx)(`span`,{className:`splash-tmp-logoart`,dangerouslySetInnerHTML:{__html:p}}):(0,a.jsx)(r,{variant:`dark`,width:320,height:107}),(0,a.jsx)(`span`,{className:`splash-tmp-sweep`,"aria-hidden":`true`})]}),(0,a.jsx)(`p`,{className:`splash-promise-1`,children:`ركز في مشروعك.`}),(0,a.jsx)(`p`,{className:`splash-promise-2`,children:`Zoomix ترتب الصورة.`}),n&&(0,a.jsx)(`p`,{className:`splash-tmp-ready`,children:`READY ✓`})]},d),(0,a.jsx)(`button`,{type:`button`,className:`splash-tmp-replay`,onClick:()=>{m(``),t(0),u(!1),f(e=>e+1)},children:`إعادة ⟳`})]})}export{u as default};