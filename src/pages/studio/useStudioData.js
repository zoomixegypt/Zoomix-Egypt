import { useEffect, useRef, useState } from "react";
import { readDrafts, writeDraft } from "./drafts";
import { studioRequest } from "./api";
import { PROTOTYPE_CATALOG, PROTOTYPE_PROMOTIONS } from "../../data/commercialStudioPrototype";

export function useStudioData(demo) {
  const localState = () => {
    try {
      return readDrafts()["demo-data"] || {};
    } catch {
      return {};
    }
  };
  const [catalog, setCatalog] = useState(() =>
    demo ? localState().catalog || PROTOTYPE_CATALOG : [],
  );
  const [promotions, setPromotions] = useState(() =>
    demo
      ? (localState().promotions || PROTOTYPE_PROMOTIONS).map((item) => ({
          ...PROTOTYPE_PROMOTIONS.find((seed) => seed.id === item.id),
          ...item,
        }))
      : [],
  );
  const [quotes, setQuotes] = useState(null);
  const [requests, setRequests] = useState(null);
  const [projects, setProjects] = useState(null);
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const loaded = useRef(false);
  const [refreshError, setRefreshError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  useEffect(() => {
    if (!demo) return;
    try {
      writeDraft("demo-data", { catalog, promotions });
      setLastUpdated(new Date().toISOString());
      setRefreshError("");
    } catch {
      setRefreshError(
        "التعديلات المحلية مؤقتة: تعذر حفظها على الجهاز. Local changes are temporary: device storage failed.",
      );
    }
  }, [demo, catalog, promotions]);
  useEffect(() => {
    if (demo) return;
    const refresh = () => {
      if (document.visibilityState === "visible") setAttempt((value) => value + 1);
    };
    const timer = setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [demo]);
  useEffect(() => {
    if (demo) return;
    const controller = new AbortController();
    setLoading(!loaded.current);
    setError("");
    const resources = [
      ["catalog", "items", setCatalog],
      ["promotions", "promotions", setPromotions],
      ["quotes", "quotes", setQuotes],
      ["requests", "requests", setRequests],
      ["projects", "projects", setProjects],
      ["payments", "payments", setPayments],
    ];
    Promise.all(
      resources.map(async ([path, key, setter]) => {
        const payload = await studioRequest(`/api/studio/${path}`, { signal: controller.signal });
        if (!Array.isArray(payload[key])) throw new Error("استجابة بيانات Studio غير صالحة.");
        return [setter, payload[key]];
      }),
    )
      .then((rows) => {
        if (!controller.signal.aborted) {
          rows.forEach(([setter, rows]) => setter(rows));
          loaded.current = true;
          setLastUpdated(new Date().toISOString());
          setRefreshError("");
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          if (loaded.current) setRefreshError(error.message);
          else setError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [demo, attempt]);
  return {
    catalog,
    setCatalog: demo
      ? (update) => {
          const next = typeof update === "function" ? update(catalog) : update;
          writeDraft("demo-data", { catalog: next, promotions });
          setCatalog(next);
        }
      : setCatalog,
    promotions,
    setPromotions: demo
      ? (update) => {
          const next = typeof update === "function" ? update(promotions) : update;
          writeDraft("demo-data", { catalog, promotions: next });
          setPromotions(next);
        }
      : setPromotions,
    quotes,
    setQuotes,
    requests,
    projects,
    payments,
    setPayments,
    storageMode: demo ? "local" : "cloud",
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
    refreshError,
    lastUpdated,
  };
}
