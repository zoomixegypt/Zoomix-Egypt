import{i as e,n as t,t as n}from"./jsx-runtime-bAis_ILe.js";import{p as r}from"./index-CV78h9kU.js";var i=e(t(),1),a=n(),o=3e3,s=850,c=110,l=[{n:`01`,ar:`نبني الأساس`,en:`BUILD`},{n:`02`,ar:`نظهر المشروع`,en:`SHOW`},{n:`03`,ar:`نجهز الانطلاق`,en:`LAUNCH`}];function u(){let[e,t]=(0,i.useState)(0),[n,u]=(0,i.useState)(!1),[d,f]=(0,i.useState)(0),[p,m]=(0,i.useState)(``),[h]=(0,i.useState)(()=>typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches);(0,i.useEffect)(()=>{if(h){t(100),u(!0);return}let e=0,n=performance.now(),r=i=>{let a=Math.min(1,(i-n)/o);t(Math.round((1-(1-a)**3)*100)),a<1?e=requestAnimationFrame(r):u(!0)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[d,h]),(0,i.useEffect)(()=>{let e=!1;return fetch(`/zoomix-logo.svg`,{cache:`force-cache`}).then(e=>e.text()).then(t=>{if(e)return;let n=new DOMParser().parseFromString(t,`image/svg+xml`).querySelector(`svg`);if(!n)return;n.removeAttribute(`width`),n.removeAttribute(`height`);let r=Array.from(n.querySelectorAll(`rect`)).find(e=>(e.getAttribute(`class`)||``).includes(`st1`)&&Number(e.getAttribute(`y`))>0),i=n;if(r){let e=r.parentElement;for(;e&&e.parentElement!==n;)e=e.parentElement;e&&(i=e)}Array.from(i.children).forEach((e,t)=>{e.setAttribute(`class`,`${e.getAttribute(`class`)||``} splash3-letter`.trim()),e.style.animationDelay=`${s+t*c}ms`}),m(new XMLSerializer().serializeToString(n))}).catch(()=>{}),()=>{e=!0}},[d]);let g=()=>{m(``),t(0),u(!1),f(e=>e+1)},_=n?-1:Math.min(2,Math.floor(e/100*3));return(0,a.jsxs)(`main`,{className:`splash3`,dir:`rtl`,children:[(0,a.jsx)(`style`,{children:`
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
      `}),(0,a.jsxs)(`div`,{className:`splash3-inner`,children:[(0,a.jsx)(`p`,{className:`splash3-kicker`,dir:`ltr`,children:`HOW WE WORK`}),(0,a.jsx)(`div`,{className:`splash3-phases`,children:l.map((e,t)=>(0,a.jsxs)(`div`,{className:`splash3-phase${t===_?` is-active`:``}${n||t<_?` is-done`:``}`,children:[(0,a.jsx)(`span`,{className:`num`,dir:`ltr`,children:e.n}),(0,a.jsx)(`span`,{className:`name`,children:e.ar}),(0,a.jsx)(`span`,{className:`en`,dir:`ltr`,children:e.en})]},e.n))}),(0,a.jsxs)(`p`,{className:`splash3-meta`,dir:`ltr`,children:[String(e).padStart(3,`0`),`%`]}),(0,a.jsx)(`div`,{className:`splash3-logo`,dir:`ltr`,children:p?(0,a.jsx)(`span`,{className:`splash3-logoart`,dangerouslySetInnerHTML:{__html:p}}):(0,a.jsx)(r,{variant:`dark`,width:320,height:107})}),n&&(0,a.jsx)(`p`,{className:`splash3-ready`,children:`READY ✓`})]},d),(0,a.jsx)(`button`,{type:`button`,className:`splash3-replay`,onClick:g,children:`إعادة ⟳`})]})}export{u as default};