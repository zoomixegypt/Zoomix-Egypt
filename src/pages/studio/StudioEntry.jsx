import { useEffect, useState } from "react";
import CommercialStudioPrototype from "../CommercialStudioPrototype";
import { studioRequest } from "./api";
import "../commercialStudioPrototype.css";
import "./studioLayout.css";
import { confirmLeave } from "./unsaved";

export default function StudioEntry({ allowDemo = false }) {
  const [state, setState] = useState("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState("checking");
    studioRequest("/api/studio/session", { signal: controller.signal })
      .then(() => {
        if (!controller.signal.aborted) {
          setState("authenticated");
          setError("");
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setState(error.status === 401 ? "login" : "error");
          setError(error.status === 401 ? "" : error.message);
        }
      });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    const expire = () => {
      setState((current) => (current === "demo" ? current : "login"));
      setPassword("");
      setError("انتهت الجلسة. سجّل الدخول مجددًا.");
    };
    window.addEventListener("studio-session-expired", expire);
    return () => window.removeEventListener("studio-session-expired", expire);
  }, []);
  useEffect(() => {
    if (state !== "authenticated") return;
    const controller = new AbortController();
    const verify = () =>
      studioRequest("/api/studio/session", { signal: controller.signal }).catch(() => {});
    const timer = window.setInterval(verify, 60000);
    const onVisible = () => {
      if (document.visibilityState === "visible") verify();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [state]);
  const login = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await studioRequest("/api/studio/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setPassword("");
      setState("authenticated");
    } catch (error) {
      setError(error.status === 401 ? "كلمة المرور غير صحيحة. Incorrect password." : error.message);
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    if (!confirmLeave()) return;
    setBusy(true);
    setError("");
    try {
      await studioRequest("/api/studio/logout", { method: "POST" });
      setState("login");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };
  if (state === "authenticated" || state === "demo")
    return (
      <>
        <div className="csp-session-strip" dir="rtl">
          <span>
            {state === "demo" ? "تجربة محلية — لا تعدّل قاعدة البيانات" : "جلسة إدارة آمنة"}{" "}
            {error && <span role="alert">{error}</span>}
          </span>
          <button
            disabled={busy}
            onClick={
              state === "demo"
                ? () => {
                    setError("");
                    setState("checking");
                    setAttempt((value) => value + 1);
                  }
                : logout
            }
          >
            {busy ? "جارٍ التنفيذ…" : state === "demo" ? "العودة للدخول" : "تسجيل الخروج"}
          </button>
        </div>
        <CommercialStudioPrototype key={state} demo={state === "demo"} />
      </>
    );
  return (
    <main className="csp-root csp-auth" dir="rtl">
      <section className="csp-auth-card">
        <p>ZOOMIX / STUDIO</p>
        <h1>دخول الاستوديو</h1>
        <p>إدارة الأسعار والعروض والطلبات.</p>
        {state === "checking" ? (
          <p role="status">جارٍ التحقق من الجلسة…</p>
        ) : (
          <>
            <form onSubmit={login}>
              <label htmlFor="studio-password">كلمة المرور</label>
              <input
                id="studio-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
              />
              <button className="csp-button csp-button--primary" disabled={busy}>
                {busy ? "جارٍ الدخول…" : "دخول"}
              </button>
            </form>
            {error && <p role="alert">{error}</p>}
            <button
              className="csp-button"
              onClick={() => setAttempt((value) => value + 1)}
              disabled={busy}
            >
              إعادة التحقق من الاتصال
            </button>
            {allowDemo && (
              <button
                className="csp-button"
                disabled={busy}
                onClick={() => {
                  setError("");
                  setState("demo");
                }}
              >
                فتح النموذج التجريبي بدون اتصال
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
