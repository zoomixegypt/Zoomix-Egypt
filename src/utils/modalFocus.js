import { useEffect, useRef } from "react";

// Handles both immediately rendered dialogs and lazy-loaded content.
export function useModalFocus(active, ref, onClose) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    const trigger = document.activeElement;
    const elements = () =>
      Array.from(
        container.querySelectorAll(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ),
      ).filter((el) => el.getClientRects().length && !el.closest("[inert]"));
    container.focus();
    const focusContent = () => {
      if (document.activeElement === container) elements()[0]?.focus();
    };
    focusContent();
    const observer = new MutationObserver(focusContent);
    observer.observe(container, { childList: true, subtree: true });
    const keydown = (event) => {
      if (event.key === "Escape" && close.current) {
        event.preventDefault();
        close.current();
      }
      if (event.key !== "Tab") return;
      const list = elements();
      const outside = !container.contains(document.activeElement);
      if (!list.length) {
        event.preventDefault();
        container.focus();
        return;
      }
      if (
        outside ||
        document.activeElement === container ||
        (event.shiftKey && document.activeElement === list[0]) ||
        (!event.shiftKey && document.activeElement === list.at(-1))
      ) {
        event.preventDefault();
        (event.shiftKey ? list.at(-1) : list[0]).focus();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", keydown);
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [active, ref]);
}
