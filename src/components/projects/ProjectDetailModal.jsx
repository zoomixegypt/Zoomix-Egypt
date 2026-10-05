import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Gsap, GsapPresence } from "../../utils/gsapAnimate";
import ProjectDetailRouter from "./ProjectDetailRouter";

export default function ProjectDetailModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const handleClose = () => {
    navigate(location.state?.backgroundLocation ? -1 : "/");
  };

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onEscape = (event) => {
      if (event.key === "Escape") {
        navigate(location.state?.backgroundLocation ? -1 : "/");
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onEscape);
    const focusTimer = window.setTimeout(() => {
      const firstFocusable = dialogRef.current?.querySelector(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", onEscape);
      if (previousFocusRef.current instanceof HTMLElement) previousFocusRef.current.focus();
    };
  }, [location.state, navigate]);

  return (
    <GsapPresence>
      <div className="fixed inset-0 z-[9998] flex items-center justify-center p-0 md:p-6 lg:p-10">
        <Gsap.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        <Gsap.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          data-lenis-prevent
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-dialog-title"
          tabIndex={-1}
          className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] max-w-6xl bg-[#F5F4EF] shadow-2xl md:rounded-lg overflow-y-auto overscroll-contain flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <ProjectDetailRouter mode="modal" />
        </Gsap.div>
      </div>
    </GsapPresence>
  );
}
