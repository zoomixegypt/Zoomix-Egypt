import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Check, Download, FileJson, LogOut, Mail, MessageCircle, Phone, RefreshCw, Save, Search, X } from "lucide-react";
import { useLanguage } from "../i18n";

const STATUS_OPTIONS = [
  { value: "new", ar: "جديد", en: "New" },
  { value: "contacted", ar: "تم التواصل", en: "Contacted" },
  { value: "in-progress", ar: "قيد التنفيذ", en: "In progress" },
  { value: "won", ar: "تم الاتفاق", en: "Won" },
  { value: "archived", ar: "مؤرشف", en: "Archived" },
];

const CONTACT_LABELS = {
  whatsapp: { ar: "واتساب", en: "WhatsApp" },
  call: { ar: "مكالمة", en: "Phone call" },
  email: { ar: "إيميل", en: "Email" },
};

function text(value, language) {
  if (value === null || value === undefined || value === "") return "—";
  return typeof value === "object" ? value[language] || value.en || value.ar || "—" : String(value);
}

function requestSignature(requests) {
  return requests
    .map((request) => [request.id, request.reference_code, request.status, request.updated_at || request.updatedAt, request.created_at || request.createdAt].join(":"))
    .join("|");
}

export default function Studio() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [insights, setInsights] = useState(null);
  const [liveNotice, setLiveNotice] = useState("");
  const liveSignatureRef = useRef(null);
  const liveNoticeTimeoutRef = useRef(null);

  const label = (ar, en) => (isArabic ? ar : en);

  const loadRequests = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/studio/requests", { cache: "no-store" });
      if (response.status === 401) {
        setNeedsLogin(true);
        setRequests([]);
        return;
      }
      const result = await response.json().catch(() => ({}));
      if (response.status === 503) setNeedsLogin(true);
      if (!response.ok) throw new Error(result.error || label("تعذر تحميل الطلبات.", "Could not load requests."));
      setNeedsLogin(false);
      const nextRequests = result.requests || [];
      liveSignatureRef.current = requestSignature(nextRequests);
      setRequests(nextRequests);
      setSelected((current) => (current ? nextRequests.find((item) => item.id === current.id) || current : nextRequests[0] || null));
      const insightsResponse = await fetch("/api/studio/insights");
      if (insightsResponse.ok) setInsights(await insightsResponse.json());
    } catch (loadError) {
      if (!silent) setError(loadError.message || label("تعذر الاتصال بالاستوديو.", "Could not connect to Studio."));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    const pollForUpdates = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch("/api/studio/requests", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json().catch(() => ({}));
        const nextRequests = Array.isArray(result.requests) ? result.requests : [];
        const nextSignature = requestSignature(nextRequests);
        if (liveSignatureRef.current === null) {
          liveSignatureRef.current = nextSignature;
          return;
        }
        if (nextSignature !== liveSignatureRef.current) {
          await loadRequests({ silent: true });
          setLiveNotice(label("طلب جديد أو تحديث وصل — تم تحديث الاستوديو.", "A new request or update arrived — Studio was refreshed."));
          window.clearTimeout(liveNoticeTimeoutRef.current);
          liveNoticeTimeoutRef.current = window.setTimeout(() => setLiveNotice(""), 5000);
        }
      } catch {
        // Background refresh is best-effort; the manual refresh button remains available.
      }
    };

    const interval = window.setInterval(pollForUpdates, 30000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(liveNoticeTimeoutRef.current);
    };
  }, [language]);

  useEffect(() => {
    setNotesDraft(selected?.notes || "");
  }, [selected?.id, selected?.notes]);

  const login = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setError("");
    try {
      const response = await fetch("/api/studio/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || label("كلمة المرور غير صحيحة.", "Incorrect password."));
      setPassword("");
      await loadRequests();
    } catch (loginError) {
      setError(loginError.message || label("تعذر الدخول.", "Could not sign in."));
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/studio/logout", { method: "POST" }).catch(() => {});
    setNeedsLogin(true);
    setRequests([]);
    setSelected(null);
  };

  const updateStatus = async (id, status) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/studio/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || label("تعذر تحديث الحالة.", "Could not update status."));
      setRequests((current) => current.map((item) => (item.id === id ? result.request : item)));
      setSelected(result.request);
    } catch (saveError) {
      setError(saveError.message || label("تعذر تحديث الطلب.", "Could not update request."));
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/studio/requests/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || label("تعذر حفظ الملاحظة.", "Could not save the note."));
      setRequests((current) => current.map((item) => (item.id === selected.id ? result.request : item)));
      setSelected(result.request);
    } catch (saveError) {
      setError(saveError.message || label("تعذر حفظ الملاحظة.", "Could not save the note."));
    } finally {
      setSaving(false);
    }
  };

  const exportRequests = () => {
    const query = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
    window.open(`/api/studio/export.csv${query}`, "_blank", "noopener,noreferrer");
  };

  const backupStudio = () => {
    window.open("/api/studio/backup.json", "_blank", "noopener,noreferrer");
  };

  const phoneValue = String(selected?.phone || "").trim();
  const whatsappNumber = phoneValue.replace(/[^\d]/g, "");
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/^00/, "")}` : "";
  const emailHref = selected?.email ? `mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`${selected.reference_code} — ZOOMIX`)}` : "";

  const visibleRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = filter === "all" || request.status === filter;
      const haystack = [request.reference_code, request.name, request.project, request.service, request.route, request.email, request.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [filter, requests, search]);

  const counts = useMemo(() => ({
    total: requests.length,
    new: requests.filter((request) => request.status === "new").length,
    contacted: requests.filter((request) => request.status === "contacted").length,
    inProgress: requests.filter((request) => request.status === "in-progress").length,
    won: requests.filter((request) => request.status === "won").length,
  }), [requests]);

  if (needsLogin) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] px-6 py-10 text-white md:px-12" dir={isArabic ? "rtl" : "ltr"}>
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[720px] flex-col justify-between">
          <header className="flex items-center justify-between border-b border-white/15 pb-5">
            <span className="font-mono text-xs tracking-[0.2em] text-[#BBFF00]">ZOOMIX / STUDIO</span>
            <a href="/" className="font-mono text-[10px] tracking-[0.16em] text-white/45 hover:text-white">{label("العودة للموقع", "BACK TO SITE")}</a>
          </header>
          <section className="border-y border-white/15 py-14">
            <p className="font-mono text-xs tracking-[0.18em] text-white/45">PRIVATE WORKSPACE / 01</p>
            <h1 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.06em]"} mt-5 text-6xl font-black leading-[0.9] md:text-8xl`}>
              {label("استوديو", "STUDIO")}
              <span className="block text-[#BBFF00]">{label("زومكس.", "CONTROL.")}</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-white/55">
              {label("مساحة خاصة لمتابعة البريفات والخطوات الجاية.", "A private space for briefs and next moves.")}
            </p>
            <form onSubmit={login} className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={label("كلمة مرور الاستوديو", "Studio password")}
                className="min-h-12 min-w-0 flex-1 border border-white/20 bg-white/5 px-4 text-white outline-none placeholder:text-white/35 focus:border-[#BBFF00]"
                required
                autoComplete="current-password"
              />
              <button type="submit" className="zoomix-button min-h-12 bg-[#BBFF00] text-[#0A0A0A]" disabled={loginLoading}>
                {loginLoading ? label("جارٍ الدخول", "Signing in") : label("دخول الاستوديو", "Enter Studio")}
              </button>
            </form>
            {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
          </section>
          <footer className="flex justify-between pt-5 font-mono text-[10px] tracking-[0.16em] text-white/35">
            <span>ZOOMIX — CREATIVE PARTNER</span>
            <span>CAIRO / EGYPT</span>
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F4EF] text-[#0A0A0A]" dir={isArabic ? "rtl" : "ltr"}>
      <header className="border-b border-black/15 bg-[#0A0A0A] px-6 py-5 text-white md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-[#BBFF00]">ZOOMIX / STUDIO</p>
            <p className="mt-2 text-sm text-white/55">{label("متابعة العملاء والخطوات الجاية", "Lead control and next moves")}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={loadRequests} className="flex h-10 w-10 items-center justify-center border border-white/20 text-white/70 transition-colors hover:border-[#BBFF00] hover:text-[#BBFF00]" aria-label={label("تحديث", "Refresh")}>
              <RefreshCw size={16} />
            </button>
            <button type="button" onClick={exportRequests} className="hidden items-center gap-2 border border-white/20 px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:border-[#BBFF00] hover:text-[#BBFF00] sm:flex">
              <Download size={15} />
              {label("تصدير", "Export")}
            </button>
            <button type="button" onClick={backupStudio} className="hidden items-center gap-2 border border-white/20 px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:border-[#BBFF00] hover:text-[#BBFF00] sm:flex">
              <FileJson size={15} />
              {label("نسخة احتياطية", "Backup")}
            </button>
            <button type="button" onClick={logout} className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:border-[#BBFF00] hover:text-[#BBFF00]">
              <LogOut size={15} />
              {label("خروج", "Log out")}
            </button>
          </div>
        </div>
      </header>

      {liveNotice && (
        <div className="mx-auto max-w-[1400px] px-6 pt-4 md:px-12" aria-live="polite" role="status">
          <div className="inline-flex items-center gap-2 border border-[#BBFF00]/50 bg-[#BBFF00]/10 px-4 py-2 text-xs font-bold text-[#0A0A0A]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#BBFF00]" />
            {liveNotice}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-12 md:py-12">
        <div className="flex flex-col justify-between gap-6 border-b border-black/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-black/45">PRIVATE WORKSPACE / 02</p>
            <h1 className={`${isArabic ? "font-arabic" : "font-display tracking-[-0.06em]"} mt-4 text-5xl font-black leading-[0.92] md:text-8xl`}>
              {label("الصورة كاملة.", "THE FULL PICTURE.")}
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-black/55">{label("كل بريف هو بداية خطوة جديدة. رتب، تابع، وخد القرار من مكان واحد.", "Every brief is the beginning of a next move. Organize, follow up, and decide from one place.")}</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [label("كل الطلبات", "ALL REQUESTS"), counts.total],
            [label("جديد", "NEW"), counts.new],
            [label("تم التواصل", "CONTACTED"), counts.contacted],
            [label("قيد التنفيذ", "IN PROGRESS"), counts.inProgress],
            [label("تم الاتفاق", "WON"), counts.won],
          ].map(([title, value]) => (
            <div key={title} className="border border-black/15 bg-white p-5">
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-black/45">{title}</p>
              <p className="mt-6 text-4xl font-black">{value}</p>
            </div>
          ))}
        </div>

        {insights && (
          <section className="mt-6 border border-black/15 bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} />
                <div>
                  <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-black/45">ZOOMIX / SIGNALS</p>
                  <h2 className="mt-1 text-xl font-black">{label("الصورة من جوه الطلبات", "The signal inside the requests")}</h2>
                </div>
              </div>
              <p className="text-xs text-black/45">{label("ملخص تشغيلي بدون بيانات حساسة.", "Operational summary — no sensitive data.")}</p>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                [label("المسارات", "PATHS"), insights.routes],
                [label("الاحتياجات", "NEEDS"), insights.services],
                [label("مصادر الوصول", "SOURCES"), insights.sources],
                [label("تفاعل الموقع", "SITE ACTIONS"), insights.events],
              ].map(([title, items]) => (
                <div key={title}>
                  <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-black/45">{title}</p>
                  <div className="mt-3 space-y-2">
                    {(items || []).slice(0, 5).map((item) => (
                      <div key={`${title}-${item.key}`} className="flex items-center justify-between gap-3 border-b border-black/10 pb-2 text-sm">
                        <span className="truncate">{item.key}</span>
                        <span className="font-mono font-bold text-[#5e7c00]">{item.count}</span>
                      </div>
                    ))}
                    {!items?.length && <p className="text-sm text-black/40">{label("لسه مفيش بيانات", "No data yet")}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-col gap-3 border-y border-black/15 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setFilter("all")} className={`border px-3 py-2 font-mono text-[10px] tracking-[0.12em] ${filter === "all" ? "border-black bg-black text-[#BBFF00]" : "border-black/20 bg-white"}`}>{label("الكل", "ALL")}</button>
            {STATUS_OPTIONS.map((status) => (
              <button key={status.value} type="button" onClick={() => setFilter(status.value)} className={`border px-3 py-2 font-mono text-[10px] tracking-[0.12em] ${filter === status.value ? "border-black bg-black text-[#BBFF00]" : "border-black/20 bg-white"}`}>
                {status[language]}
              </button>
            ))}
          </div>
          <label className="flex min-w-0 items-center gap-2 border border-black/20 bg-white px-3 py-2 md:w-72">
            <Search size={16} className="shrink-0 text-black/45" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={label("ابحث في الطلبات", "Search requests")} />
          </label>
        </div>

        {error && <div className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</div>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="min-w-0">
            {loading ? (
              <div className="border border-black/15 bg-white p-8 text-sm text-black/55">{label("جارٍ تحميل الطلبات...", "Loading requests...")}</div>
            ) : visibleRequests.length === 0 ? (
              <div className="border border-black/15 bg-white p-8">
                <p className="font-mono text-[10px] tracking-[0.16em] text-black/45">NO SIGNAL YET</p>
                <p className="mt-4 text-xl font-black">{label("مفيش طلبات مطابقة.", "No matching requests yet.")}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleRequests.map((request) => {
                  const active = selected?.id === request.id;
                  const status = STATUS_OPTIONS.find((item) => item.value === request.status);
                  return (
                    <button key={request.id} type="button" onClick={() => setSelected(request)} className={`text-start border p-5 transition-all ${active ? "border-black bg-black text-white shadow-[5px_5px_0_#BBFF00]" : "border-black/15 bg-white hover:border-black/60"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <span className={`font-mono text-[10px] tracking-[0.12em] ${active ? "text-[#BBFF00]" : "text-[#5e7c00]"}`}>{request.reference_code}</span>
                        <span className={`font-mono text-[10px] tracking-[0.08em] ${active ? "text-white/55" : "text-black/45"}`}>{status?.[language] || request.status}</span>
                      </div>
                      <p className="mt-7 text-2xl font-black leading-tight">{text(request.name, language)}</p>
                      <p className={`mt-2 text-sm ${active ? "text-white/55" : "text-black/55"}`}>{text(request.project || request.activity, language)}</p>
                      <div className={`mt-8 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.08em] ${active ? "text-white/45" : "text-black/45"}`}>
                        <span>{text(request.route, language)}</span>
                        <span>{CONTACT_LABELS[request.contact_preference]?.[language] || request.contact_preference}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="border border-black/15 bg-[#0A0A0A] p-6 text-white lg:sticky lg:top-6 lg:self-start">
            {!selected ? (
              <div className="flex min-h-64 flex-col justify-between">
                <span className="font-mono text-[10px] tracking-[0.16em] text-white/45">SELECT A BRIEF</span>
                <p className="text-3xl font-black leading-tight">{label("اختار بريف علشان تشوف التفاصيل.", "Choose a brief to see the details.")}</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-5">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.14em] text-[#BBFF00]">{selected.reference_code}</p>
                    <h2 className="mt-3 text-3xl font-black">{text(selected.name, language)}</h2>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="text-white/45 hover:text-white" aria-label={label("إغلاق", "Close")}><X size={18} /></button>
                </div>
                <div className="mt-5 grid gap-4 text-sm">
                  {[
                    [label("المشروع", "Project"), selected.project],
                    [label("الخدمة", "Service"), selected.service],
                    [label("المسار", "Path"), selected.route],
                    [label("التواصل", "Contact"), CONTACT_LABELS[selected.contact_preference]?.[language] || selected.contact_preference],
                    [label("الهاتف", "Phone"), selected.phone],
                    [label("الإيميل", "Email"), selected.email],
                    [label("الميزانية", "Budget"), selected.budget],
                    [label("التوقيت", "Timeline"), selected.launch_timeline],
                  ].map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="text-white/45">{key}</span>
                      <span className="text-end font-bold">{text(value, language)}</span>
                    </div>
                  ))}
                </div>
                {(phoneValue || selected.email) && (
                  <div className="mt-6 flex flex-wrap gap-2 border-y border-white/15 py-4">
                    {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#BBFF00] px-3 py-2 text-xs font-bold text-[#BBFF00] transition-colors hover:bg-[#BBFF00] hover:text-[#0A0A0A]"><MessageCircle size={14} /> WhatsApp</a>}
                    {phoneValue && <a href={`tel:${encodeURIComponent(phoneValue)}`} className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 text-xs font-bold text-white/75 transition-colors hover:border-white hover:text-white"><Phone size={14} /> {label("اتصال", "Call")}</a>}
                    {emailHref && <a href={emailHref} className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 text-xs font-bold text-white/75 transition-colors hover:border-white hover:text-white"><Mail size={14} /> Email</a>}
                  </div>
                )}
                <div className="mt-6">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-white/45">{label("الوصف", "DESCRIPTION")}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/70">{text(selected.description, language)}</p>
                </div>
                <div className="mt-7 border-t border-white/15 pt-5">
                  <label className="block font-mono text-[10px] tracking-[0.14em] text-white/45">{label("الحالة", "STATUS")}</label>
                  <select value={selected.status} onChange={(event) => updateStatus(selected.id, event.target.value)} disabled={saving} className="mt-3 w-full border border-white/20 bg-white/5 px-3 py-3 text-white outline-none focus:border-[#BBFF00]">
                    {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value} className="bg-[#0A0A0A]">{status[language]}</option>)}
                  </select>
                </div>
                <div className="mt-6 border-t border-white/15 pt-5">
                  <label htmlFor="studio-notes" className="font-mono text-[10px] tracking-[0.14em] text-white/45">{label("ملاحظة داخلية", "INTERNAL NOTE")}</label>
                  <textarea
                    id="studio-notes"
                    value={notesDraft}
                    onChange={(event) => setNotesDraft(event.target.value)}
                    rows={4}
                    maxLength={4000}
                    placeholder={label("اكتب الخطوة الجاية أو آخر تواصل...", "Write the next move or last contact...")}
                    className="mt-3 w-full resize-y border border-white/20 bg-white/5 px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-[#BBFF00]"
                  />
                  <button type="button" onClick={saveNotes} disabled={saving} className="mt-3 inline-flex items-center gap-2 border border-[#BBFF00] px-4 py-2 text-xs font-bold text-[#BBFF00] transition-colors hover:bg-[#BBFF00] hover:text-[#0A0A0A] disabled:opacity-50">
                    <Save size={14} />
                    {saving ? label("جارٍ الحفظ", "Saving") : label("حفظ الملاحظة", "Save note")}
                  </button>
                </div>
                <p className="mt-5 flex items-center gap-2 font-mono text-[10px] tracking-[0.08em] text-white/40">
                  <Check size={14} className="text-[#BBFF00]" />
                  {new Date(selected.created_at).toLocaleString(isArabic ? "ar-EG" : "en-US")}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
