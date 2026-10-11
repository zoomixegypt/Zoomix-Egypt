import { useEffect, useState } from "react";
import CommercialStudioPrototype from "../CommercialStudioPrototype";
import ZoomixLogo from "../../components/ZoomixLogo";
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
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-10 text-white md:px-12" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[720px] flex-col justify-between">
        <header className="flex items-center justify-between border-b border-white/15 pb-5">
          <ZoomixLogo variant="dark" className="h-auto w-28 md:w-32" width={180} height={60} />
          <a href="/" className="font-mono text-[10px] tracking-[0.16em] text-white/45 transition-colors hover:text-white">العودة للموقع</a>
        </header>
        <section className="border-y border-white/15 py-14">
          <p className="font-mono text-xs tracking-[0.18em] text-white/45">PRIVATE WORKSPACE / 01</p>
          <h1 className="font-arabic mt-5 text-[12vw] font-black leading-[1.12] sm:text-5xl md:text-8xl">
            دخول
            <span className="block text-[#BBFF00]">الاستوديو.</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-7 text-white/55">
            إدارة الأسعار والعروض والطلبات.
          </p>
          {state === "checking" ? (
            <p role="status" className="mt-10 text-sm text-white/55">جارٍ التحقق من الجلسة…</p>
          ) : (
            <>
              <form onSubmit={login} className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <label htmlFor="studio-password" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">كلمة المرور</label>
                  <input
                    id="studio-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={busy}
                    className="min-h-12 w-full border border-white/20 bg-white/5 px-4 text-white outline-hidden placeholder:text-white/35 focus:border-[#BBFF00] disabled:opacity-50"
                  />
                </div>
                <button type="submit" className="zoomix-button min-h-12 w-full bg-[#BBFF00] text-[#0A0A0A] sm:w-auto sm:self-end" disabled={busy}>
                  {busy ? "جارٍ الدخول…" : "دخول"}
                </button>
              </form>
              {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
              <div className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setAttempt((value) => value + 1)}
                  disabled={busy}
                  className="zoomix-button border-white/25 text-white/80 transition-colors hover:border-white hover:text-white"
                >
                  إعادة التحقق من الاتصال
                </button>
                {allowDemo && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setError("");
                      setState("demo");
                    }}
                    className="zoomix-button border-white/25 text-white/80 transition-colors hover:border-white hover:text-white"
                  >
                    فتح النموذج التجريبي بدون اتصال
                  </button>
                )}
              </div>
            </>
          )}
        </section>
        <footer className="flex justify-between pt-5 font-mono text-[10px] tracking-[0.16em] text-white/35">
          <span>ZOOMIX — CREATIVE PARTNER</span>
          <span>CAIRO / EGYPT</span>
        </footer>
      </div>
    </main>
  );
}
