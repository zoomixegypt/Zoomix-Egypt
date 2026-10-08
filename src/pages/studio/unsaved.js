import { useEffect, useRef } from "react";
const editors = new Set();
export function confirmLeave() {
  return (
    editors.size === 0 ||
    window.confirm(
      "توجد تغييرات لم تُحفظ في قاعدة البيانات. هل تريد المغادرة؟\nThere are unsaved changes. Leave this editor?",
    )
  );
}
export function useUnsavedChanges(dirty) {
  const id = useRef(Symbol("editor"));
  useEffect(() => {
    if (!dirty) return;
    const token = id.current;
    editors.add(token);
    const beforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      editors.delete(token);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [dirty]);
}
