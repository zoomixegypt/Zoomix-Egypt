import{i as e,n as t,t as n}from"./jsx-runtime-bAis_ILe.js";import{p as r}from"./index-B-e9G8c4.js";var i=e(t(),1),a=n(),o=3e3,s=850,c=110;function l(){let[e,t]=(0,i.useState)(0),[n,l]=(0,i.useState)(!1),[u,d]=(0,i.useState)(0),[f,p]=(0,i.useState)(``),[m]=(0,i.useState)(()=>typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches);return(0,i.useEffect)(()=>{if(m){t(100),l(!0);return}let e=0,n=performance.now(),r=i=>{let a=Math.min(1,(i-n)/o);t(Math.round((1-(1-a)**3)*100)),a<1?e=requestAnimationFrame(r):l(!0)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[u,m]),(0,i.useEffect)(()=>{let e=!1;return fetch(`/zoomix-logo.svg`,{cache:`force-cache`}).then(e=>e.text()).then(t=>{if(e)return;let n=new DOMParser().parseFromString(t,`image/svg+xml`).querySelector(`svg`);if(!n)return;n.removeAttribute(`width`),n.removeAttribute(`height`);let r=Array.from(n.querySelectorAll(`rect`)).find(e=>(e.getAttribute(`class`)||``).includes(`st1`)&&Number(e.getAttribute(`y`))>0),i=n;if(r){let e=r.parentElement;for(;e&&e.parentElement!==n;)e=e.parentElement;e&&(i=e)}Array.from(i.children).forEach((e,t)=>{e.setAttribute(`class`,`${e.getAttribute(`class`)||``} splash2-letter`.trim()),e.style.animationDelay=`${s+t*c}ms`}),p(new XMLSerializer().serializeToString(n))}).catch(()=>{}),()=>{e=!0}},[u]),(0,a.jsxs)(`main`,{className:`splash2`,dir:`rtl`,children:[(0,a.jsx)(`style`,{children:`
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
      `}),(0,a.jsxs)(`div`,{className:`splash2-inner`,children:[(0,a.jsx)(`p`,{className:`splash2-line1`,children:`ركز في مشروعك.`}),(0,a.jsx)(`div`,{className:`splash2-rule`,"aria-hidden":`true`}),(0,a.jsxs)(`p`,{className:`splash2-line2`,children:[(0,a.jsx)(`span`,{className:`lat`,dir:`ltr`,children:`Zoomix`}),` ترتب الصورة.`]}),(0,a.jsx)(`div`,{className:`splash2-logo`,dir:`ltr`,children:f?(0,a.jsx)(`span`,{className:`splash2-logoart`,dangerouslySetInnerHTML:{__html:f}}):(0,a.jsx)(r,{variant:`dark`,width:320,height:107})}),(0,a.jsxs)(`p`,{className:`splash2-meta`,dir:`ltr`,children:[String(e).padStart(3,`0`),`%`]}),n&&(0,a.jsx)(`p`,{className:`splash2-ready`,children:`READY ✓`})]},u),(0,a.jsx)(`button`,{type:`button`,className:`splash2-replay`,onClick:()=>{p(``),t(0),l(!1),d(e=>e+1)},children:`إعادة ⟳`})]})}export{l as default};