import { useState } from "react";
import { studioRequest } from "./api";
export default function CatalogHistory({ id, language, onRestored }) {
  const ar = language === "ar";
  const [rows, setRows] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = async () => {
    setBusy(true);
    setError("");
    try {
      setRows(
        (await studioRequest(`/api/studio/catalog/${encodeURIComponent(id)}/history`)).versions,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="csp-operation-panel">
      <button type="button" className="csp-button" onClick={load} disabled={busy}>
        {ar ? "عرض إصدارات الأسعار" : "Price version history"}
      </button>
      <p role="status">{error}</p>
      {rows?.map((row) => (
        <article key={row.id} className="csp-operation-row">
          <strong>
            V{row.version_number} · {row.change_type} ·{" "}
            {new Date(row.created_at).toLocaleString("en-GB")}
          </strong>
          <p>{row.snapshot.price ?? row.snapshot.price_minor / 100} EGP</p>
          <button
            type="button"
            className="csp-button"
            disabled={busy}
            onClick={async () => {
              if (
                !window.confirm(
                  ar
                    ? "استعادة هذا الإصدار كمسودة فقط؟ السعر المنشور لن يتغير قبل النشر."
                    : "Restore as draft? Published pricing remains unchanged until publishing.",
                )
              )
                return;
              setBusy(true);
              try {
                const data = await studioRequest(
                  `/api/studio/catalog/${encodeURIComponent(id)}/history`,
                  { method: "POST", body: JSON.stringify({ version: row.version_number }) },
                );
                onRestored(data.item);
                setError(ar ? "تمت الاستعادة كمسودة" : "Restored as draft");
                await load();
              } catch (e) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {ar ? "استعادة كمسودة" : "Restore as draft"}
          </button>
        </article>
      ))}
    </section>
  );
}
